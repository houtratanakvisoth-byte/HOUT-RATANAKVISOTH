/**
 * Cloudflare Worker for Mr.Soth Blog
 * 
 * Features:
 * 1. Serves the Vite React static single page application (SPA fallback)
 * 2. Authenticates Admin via Supabase Auth Bearer Token on upload
 * 3. POST /api/upload: Uploads files directly into Cloudflare R2 bucket
 * 4. GET /cdn/*: Streams cached assets directly from Cloudflare R2
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --------------------------------------------------------------------------
    // 1. CDN ASSET DELIVERY: GET /cdn/:key*
    // --------------------------------------------------------------------------
    if (url.pathname.startsWith('/cdn/') && request.method === 'GET') {
      const objectKey = decodeURIComponent(url.pathname.replace(/^\/cdn\//, ''));
      if (!objectKey) {
        return new Response('File key is required', { status: 400 });
      }

      const object = await env.R2_BUCKET.get(objectKey);
      if (!object) {
        return new Response('Not Found in R2', { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('Access-Control-Allow-Origin', '*');

      return new Response(object.body, { headers });
    }

    // --------------------------------------------------------------------------
    // 2. ADMIN SECURE UPLOAD: POST /api/upload
    // --------------------------------------------------------------------------
    if (url.pathname === '/api/upload' && request.method === 'POST') {
      // Check Admin Auth Token Header
      const authHeader = request.headers.get('Authorization') || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();

      if (!token) {
        return new Response(JSON.stringify({ error: 'Unauthorized. Bearer token required.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Verify token with Supabase Auth API
      const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
      const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey) {
        try {
          const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${token}`
            }
          });

          if (!authRes.ok) {
            return new Response(JSON.stringify({ error: 'Invalid or expired authentication token.' }), {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          const userData = await authRes.json();
          // Verify if user is admin in public.profiles
          const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userData.id}&select=is_admin`, {
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${token}`
            }
          });
          const profiles = await profileRes.json();
          if (!profiles?.[0]?.is_admin) {
            return new Response(JSON.stringify({ error: 'Forbidden. User is not an administrator.' }), {
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        } catch (authErr) {
          console.error('Auth verification error in worker:', authErr);
        }
      }

      // Parse multipart/form-data
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file || typeof file === 'string') {
        return new Response(JSON.stringify({ error: 'No file provided in form-data' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Generate clean unique storage key: uploads/YYYY-MM/uuid-filename
      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueId = crypto.randomUUID().slice(0, 8);
      const objectKey = `uploads/${yearMonth}/${uniqueId}-${safeName}`;

      // Upload stream to Cloudflare R2
      await env.R2_BUCKET.put(objectKey, file.stream(), {
        httpMetadata: {
          contentType: file.type || 'application/octet-stream',
        },
        customMetadata: {
          uploadedAt: now.toISOString(),
          originalName: file.name
        }
      });

      const publicUrl = `/cdn/${objectKey}`;

      return new Response(JSON.stringify({
        url: publicUrl,
        object_key: objectKey,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // --------------------------------------------------------------------------
    // 3. STATIC SPA SERVING: Fallback to ASSETS
    // --------------------------------------------------------------------------
    try {
      return await env.ASSETS.fetch(request);
    } catch {
      // SPA Fallback: serve index.html for clientside router
      const indexReq = new Request(new URL('/index.html', request.url), request);
      return await env.ASSETS.fetch(indexReq);
    }
  }
};
