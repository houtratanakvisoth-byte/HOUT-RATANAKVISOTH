import { supabase, isSupabaseConfigured } from './supabase.js';

// ==============================================================================
// LOCAL STORAGE MOCK DATA (Active only when Supabase credentials are not yet set)
// Allows immediate UI testing and preview without blank screens.
// ==============================================================================
const LOCAL_STORAGE_KEY = 'mrsoth_blog_mock_db_v1';

const getInitialMockData = () => ({
  categories: [
    { id: 'cat-1', name: 'Web Development', slug: 'web-development', description: 'Modern web architecture and full-stack patterns.', created_at: new Date().toISOString() },
    { id: 'cat-2', name: 'JavaScript & TypeScript', slug: 'javascript-typescript', description: 'Deep dives into modern JS and TS systems.', created_at: new Date().toISOString() },
    { id: 'cat-3', name: 'React & Frontend', slug: 'react-frontend', description: 'Component patterns, hooks, and responsive UI.', created_at: new Date().toISOString() },
    { id: 'cat-4', name: 'Backend & Databases', slug: 'backend-database', description: 'PostgreSQL, APIs, and data modeling.', created_at: new Date().toISOString() },
    { id: 'cat-5', name: 'Cloudflare & DevOps', slug: 'cloudflare-devops', description: 'Workers, R2 object storage, and edge computing.', created_at: new Date().toISOString() },
    { id: 'cat-6', name: 'Work Notes & Real Problems', slug: 'work-notes', description: 'Practical debugging and production postmortems.', created_at: new Date().toISOString() }
  ],
  tags: [
    { id: 'tag-1', name: 'React', slug: 'react' },
    { id: 'tag-2', name: 'TailwindCSS', slug: 'tailwindcss' },
    { id: 'tag-3', name: 'Supabase', slug: 'supabase' },
    { id: 'tag-4', name: 'Cloudflare', slug: 'cloudflare' },
    { id: 'tag-5', name: 'PostgreSQL', slug: 'postgresql' },
    { id: 'tag-6', name: 'JavaScript', slug: 'javascript' }
  ],
  posts: [
    {
      id: 'post-1',
      author_id: 'admin-1',
      category_id: 'cat-1',
      title: 'Building a Full-Stack Edge Tech Blog with React, Supabase, and Cloudflare R2',
      slug: 'building-full-stack-edge-tech-blog',
      excerpt: 'How I designed my personal tech blog to achieve sub-millisecond static page delivery, secure Row Level Security in PostgreSQL, and zero-egress asset hosting on Cloudflare R2.',
      content: `## Why I Rebuilt My Blog

Every software engineer reaches a point where Medium, Substack, or generic templates no longer satisfy their technical curiosity. I wanted full ownership of my data, bulletproof **Row Level Security (RLS)** in PostgreSQL, and lightning-fast media storage without outrageous AWS S3 egress bills.

### The Stack

1. **Frontend**: React 18 + Vite with Tailwind CSS
2. **Database & Auth**: Supabase PostgreSQL + Auth
3. **Storage**: Cloudflare R2 for images and PDFs
4. **Serving**: Cloudflare Workers serving static assets and proxying uploads

\`\`\`javascript
// Example: Safe script execution for AdSense injection
export function injectAdScript(container, scriptCode) {
  const scriptEl = document.createElement('script');
  scriptEl.type = 'text/javascript';
  scriptEl.text = scriptCode;
  container.appendChild(scriptEl);
}
\`\`\`

### Practical Production Lessons
Handling dark mode via \`[data-theme="dark"]\` on the root element avoids CSS specificity bugs common with nested utility classes. In the next section, we look at configuring RLS security policies.`,
      content_format: 'markdown',
      cover_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      status: 'published',
      is_featured: true,
      views: 342,
      reading_time: 4,
      published_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'post-2',
      author_id: 'admin-1',
      category_id: 'cat-6',
      title: 'Debugging High Connection Latency in Supabase PostgreSQL Connection Pooling',
      slug: 'debugging-high-connection-latency-supabase',
      excerpt: 'A deep dive into diagnosing socket timeouts and query spikes when combining serverless edge runtimes with direct database connections.',
      content: `## The Symptom

During load testing of our API endpoints, we noticed p99 response times climbing from 45ms to over 2.3 seconds.

### Root Cause Analysis

When edge functions spin up concurrently, each worker opens its own TCP connection to the PostgreSQL port (5432). Without PgBouncer or Supabase's transaction pooler (port 6543), connection handshakes exhaust maximum client limits.

\`\`\`sql
-- Diagnostic query to inspect active database connections
SELECT count(*), state 
FROM pg_stat_activity 
GROUP BY state;
\`\`\`

### The Solution

Always switch edge runtimes to the session or transaction pooler port, and enforce prepared statement caching wisely.`,
      content_format: 'markdown',
      cover_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      status: 'published',
      is_featured: false,
      views: 189,
      reading_time: 3,
      published_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'post-3',
      author_id: 'admin-1',
      category_id: 'cat-3',
      title: 'Mastering Dynamic Ad Injections in React Without Triggering Re-renders',
      slug: 'mastering-dynamic-ad-injections-in-react',
      excerpt: 'Why document.createElement is mandatory for script ads and how to safely insert marketing slots without breaking the virtual DOM.',
      content: `## The Problem With innerHTML

When inserting third-party ads (like Google AdSense or affiliate scripts), simply passing HTML to \`dangerouslySetInnerHTML\` does **not** evaluate \`<script>\` tags. The HTML5 specification explicitly forbids script execution from string parsing for security reasons.

### The Correct React Approach

To render ad tags dynamically, create the script node manually using \`document.createElement('script')\` inside a \`useEffect\` hook and append it to an isolated container ref.`,
      content_format: 'markdown',
      cover_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      status: 'published',
      is_featured: false,
      views: 215,
      reading_time: 5,
      published_at: new Date(Date.now() - 86400000 * 9).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 9).toISOString()
    }
  ],
  post_tags: [
    { post_id: 'post-1', tag_id: 'tag-1' },
    { post_id: 'post-1', tag_id: 'tag-3' },
    { post_id: 'post-1', tag_id: 'tag-4' },
    { post_id: 'post-2', tag_id: 'tag-5' },
    { post_id: 'post-3', tag_id: 'tag-1' },
    { post_id: 'post-3', tag_id: 'tag-6' }
  ],
  comments: [
    {
      id: 'comm-1',
      post_id: 'post-1',
      parent_id: null,
      author_name: 'Dara Kim',
      author_email: 'dara@example.com',
      content: 'Great breakdown on Cloudflare R2! How do you handle image caching headers on the worker?',
      is_approved: true,
      created_at: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ],
  ads: [
    {
      id: 'ad-1',
      name: 'Cloudflare Developer Platform',
      slot: 'header',
      ad_type: 'image',
      image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80',
      link_url: 'https://developers.cloudflare.com',
      script_code: '',
      width: 728,
      height: 90,
      position: 1,
      is_active: true,
      starts_at: null,
      ends_at: null,
      impressions: 412,
      clicks: 18
    },
    {
      id: 'ad-2',
      name: 'Supabase Database',
      slot: 'sidebar_top',
      ad_type: 'image',
      image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      link_url: 'https://supabase.com',
      script_code: '',
      width: 300,
      height: 250,
      position: 1,
      is_active: true,
      starts_at: null,
      ends_at: null,
      impressions: 280,
      clicks: 12
    }
  ],
  media: [
    {
      id: 'med-1',
      uploaded_by: 'admin-1',
      object_key: 'uploads/demo-cover.jpg',
      public_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      file_name: 'demo-cover.jpg',
      mime_type: 'image/jpeg',
      size_bytes: 145000,
      alt_text: 'Code on screen',
      created_at: new Date().toISOString()
    }
  ],
  cv_sections: [
    { id: 'cv-sec-1', key: 'summary', title: 'Professional Summary', icon: 'User', position: 1, is_visible: true },
    { id: 'cv-sec-2', key: 'experience', title: 'Work Experience', icon: 'Briefcase', position: 2, is_visible: true },
    { id: 'cv-sec-3', key: 'skills', title: 'Technical Skills', icon: 'Code', position: 3, is_visible: true },
    { id: 'cv-sec-4', key: 'education', title: 'Education', icon: 'GraduationCap', position: 4, is_visible: true }
  ],
  cv_items: [
    { id: 'cv-itm-1', section_id: 'cv-sec-1', label: 'Summary', value: 'Software Engineer specializing in modern JavaScript, React, PostgreSQL, Cloudflare edge tooling, and scalable web architectures.', subtitle: '', url: '', position: 1 },
    { id: 'cv-itm-2', section_id: 'cv-sec-2', label: 'Senior Software Engineer', value: '2023 - Present', subtitle: 'Tech Solutions Inc. — Designing high-scale web platforms and cloud infrastructure.', url: '', position: 1 },
    { id: 'cv-itm-3', section_id: 'cv-sec-2', label: 'Full Stack Developer', value: '2021 - 2023', subtitle: 'Digital Agency Labs — Built custom web portals, API services, and client dashboards.', url: '', position: 2 },
    { id: 'cv-itm-4', section_id: 'cv-sec-3', label: 'Frontend', value: 'React, Vite, Tailwind CSS, JavaScript ESNext, Responsive Design', subtitle: '', url: '', position: 1 },
    { id: 'cv-itm-5', section_id: 'cv-sec-3', label: 'Backend & Cloud', value: 'PostgreSQL, Supabase, Cloudflare Workers, Cloudflare R2, REST APIs', subtitle: '', url: '', position: 2 },
    { id: 'cv-itm-6', section_id: 'cv-sec-4', label: 'B.S. Computer Science', value: '2017 - 2021', subtitle: 'University of Technology — Specialized in Distributed Systems and Software Architecture', url: '', position: 1 }
  ],
  site_settings: {
    general: {
      site_title: 'Mr.Soth Blog',
      tagline: 'Personal technology blog on web development, coding & real-world problems',
      author_name: 'Mr. Soth',
      author_title: 'Senior Software Engineer',
      author_bio: 'Full-stack developer building robust web applications. Writing about JavaScript, React, PostgreSQL, Cloudflare, and practical lessons from production systems.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      cv_pdf_url: '',
      github_url: 'https://github.com',
      linkedin_url: 'https://linkedin.com',
      twitter_url: 'https://twitter.com',
      contact_email: 'contact@mrsoth.dev'
    }
  },
  subscribers: [
    { id: 'sub-1', email: 'reader@example.com', is_active: true, created_at: new Date().toISOString() }
  ],
  contact_messages: [
    {
      id: 'msg-1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      subject: 'Consulting Inquiry',
      message: 'Hi Mr. Soth, loved your article on PostgreSQL connection poolers! Are you open to freelance advisory work?',
      is_read: false,
      created_at: new Date().toISOString()
    }
  ]
});

function getMockStore() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialMockData();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialMockData();
  }
}

function saveMockStore(data) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving mock database store:', e);
  }
}

// ==============================================================================
// 1. POSTS API
// ==============================================================================

export async function getPosts({
  page = 1,
  limit = 10,
  categorySlug = null,
  tagSlug = null,
  search = '',
  status = 'published'
} = {}) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    let filtered = store.posts.filter((p) => (status === 'all' ? true : p.status === status));

    if (categorySlug) {
      const cat = store.categories.find((c) => c.slug === categorySlug);
      if (cat) {
        filtered = filtered.filter((p) => p.category_id === cat.id);
      } else {
        filtered = [];
      }
    }

    if (tagSlug) {
      const tag = store.tags.find((t) => t.slug === tagSlug);
      if (tag) {
        const postIdsWithTag = new Set(
          store.post_tags.filter((pt) => pt.tag_id === tag.id).map((pt) => pt.post_id)
        );
        filtered = filtered.filter((p) => postIdsWithTag.has(p.id));
      } else {
        filtered = [];
      }
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(term))
      );
    }

    filtered.sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit).map((post) => {
      const category = store.categories.find((c) => c.id === post.category_id) || null;
      const postTagIds = store.post_tags.filter((pt) => pt.post_id === post.id).map((pt) => pt.tag_id);
      const tags = store.tags.filter((t) => postTagIds.includes(t.id));
      return { ...post, category, tags };
    });

    return { posts: paginated, total, totalPages: Math.ceil(total / limit) || 1 };
  }

  // Supabase Implementation
  let query = supabase
    .from('posts')
    .select(`
      id, author_id, category_id, title, slug, excerpt, content, content_format,
      cover_url, status, is_featured, views, reading_time, published_at,
      created_at, updated_at,
      category:categories(id, name, slug),
      post_tags(tag:tags(id, name, slug))
    `, { count: 'exact' });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (search.trim()) {
    query = query.ilike('title', `%${search.trim()}%`);
  }

  if (categorySlug) {
    const { data: catData } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();
    if (catData?.id) {
      query = query.eq('category_id', catData.id);
    }
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.order('published_at', { ascending: false, nullsFirst: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) {
    console.error('getPosts error:', error);
    throw error;
  }

  // Transform post_tags shape to flat array
  const formatted = (data || []).map((post) => ({
    ...post,
    tags: (post.post_tags || []).map((pt) => pt.tag).filter(Boolean)
  }));

  return {
    posts: formatted,
    total: count || 0,
    totalPages: Math.ceil((count || 0) / limit) || 1
  };
}

export async function getFeaturedPosts(limit = 3) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const featured = store.posts
      .filter((p) => p.status === 'published' && p.is_featured)
      .slice(0, limit)
      .map((post) => {
        const category = store.categories.find((c) => c.id === post.category_id) || null;
        return { ...post, category };
      });
    return featured;
  }

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, author_id, category_id, title, slug, excerpt, cover_url, status,
      is_featured, views, reading_time, published_at, created_at,
      category:categories(id, name, slug)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getPostBySlug(slug, shouldIncrementView = true) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const post = store.posts.find((p) => p.slug === slug);
    if (!post) return null;

    if (shouldIncrementView) {
      post.views = (post.views || 0) + 1;
      saveMockStore(store);
    }

    const category = store.categories.find((c) => c.id === post.category_id) || null;
    const postTagIds = store.post_tags.filter((pt) => pt.post_id === post.id).map((pt) => pt.tag_id);
    const tags = store.tags.filter((t) => postTagIds.includes(t.id));

    return { ...post, category, tags };
  }

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, author_id, category_id, title, slug, excerpt, content, content_format,
      cover_url, status, is_featured, views, reading_time, published_at,
      created_at, updated_at,
      category:categories(id, name, slug),
      author:profiles(id, full_name, avatar_url, bio),
      post_tags(tag:tags(id, name, slug))
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  if (shouldIncrementView && data.id) {
    incrementPostViews(data.id).catch((err) => console.warn('Could not increment view:', err));
  }

  return {
    ...data,
    tags: (data.post_tags || []).map((pt) => pt.tag).filter(Boolean)
  };
}

export async function getPostById(id) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const post = store.posts.find((p) => p.id === id);
    if (!post) return null;
    const postTagIds = store.post_tags.filter((pt) => pt.post_id === post.id).map((pt) => pt.tag_id);
    return { ...post, tag_ids: postTagIds };
  }

  const { data, error } = await supabase
    .from('posts')
    .select(`*, post_tags(tag_id)`)
    .eq('id', id)
    .single();

  if (error) throw error;
  return {
    ...data,
    tag_ids: (data.post_tags || []).map((pt) => pt.tag_id)
  };
}

export async function createPost(postData, tagIds = []) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const newPost = {
      id: `post-${Date.now()}`,
      author_id: postData.author_id || 'admin-1',
      category_id: postData.category_id || null,
      title: postData.title,
      slug: postData.slug,
      excerpt: postData.excerpt || '',
      content: postData.content || '',
      content_format: postData.content_format || 'markdown',
      cover_url: postData.cover_url || '',
      status: postData.status || 'draft',
      is_featured: Boolean(postData.is_featured),
      views: 0,
      reading_time: postData.reading_time || 1,
      published_at: postData.status === 'published' ? (postData.published_at || new Date().toISOString()) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.posts.unshift(newPost);
    if (Array.isArray(tagIds)) {
      tagIds.forEach((tId) => {
        store.post_tags.push({ post_id: newPost.id, tag_id: tId });
      });
    }
    saveMockStore(store);
    return newPost;
  }

  const { data: post, error } = await supabase
    .from('posts')
    .insert([postData])
    .select()
    .single();

  if (error) throw error;

  if (tagIds && tagIds.length > 0) {
    const relations = tagIds.map((tagId) => ({ post_id: post.id, tag_id: tagId }));
    const { error: tagError } = await supabase.from('post_tags').insert(relations);
    if (tagError) console.error('Failed to insert post tags:', tagError);
  }

  return post;
}

export async function updatePost(id, postData, tagIds = null) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const index = store.posts.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Post not found');

    const updated = {
      ...store.posts[index],
      ...postData,
      updated_at: new Date().toISOString()
    };
    if (postData.status === 'published' && !updated.published_at) {
      updated.published_at = new Date().toISOString();
    }
    store.posts[index] = updated;

    if (tagIds !== null) {
      store.post_tags = store.post_tags.filter((pt) => pt.post_id !== id);
      tagIds.forEach((tId) => {
        store.post_tags.push({ post_id: id, tag_id: tId });
      });
    }

    saveMockStore(store);
    return updated;
  }

  const { data, error } = await supabase
    .from('posts')
    .update({ ...postData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (tagIds !== null) {
    await supabase.from('post_tags').delete().eq('post_id', id);
    if (tagIds.length > 0) {
      const relations = tagIds.map((tagId) => ({ post_id: id, tag_id: tagId }));
      await supabase.from('post_tags').insert(relations);
    }
  }

  return data;
}

export async function deletePost(id) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    store.posts = store.posts.filter((p) => p.id !== id);
    store.post_tags = store.post_tags.filter((pt) => pt.post_id !== id);
    store.comments = store.comments.filter((c) => c.post_id !== id);
    saveMockStore(store);
    return true;
  }

  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function incrementPostViews(postId) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const p = store.posts.find((item) => item.id === postId);
    if (p) {
      p.views = (p.views || 0) + 1;
      saveMockStore(store);
    }
    return;
  }

  const { error } = await supabase.rpc('increment_post_views', { p_post_id: postId });
  if (error) {
    // Fallback direct update
    await supabase
      .from('posts')
      .update({ views: supabase.raw('views + 1') })
      .eq('id', postId);
  }
}

// ==============================================================================
// 2. CATEGORIES API
// ==============================================================================

export async function getCategories() {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    return store.categories;
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getCategoryBySlug(slug) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    return store.categories.find((c) => c.slug === slug) || null;
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createCategory({ name, slug, description = '' }) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const newCat = {
      id: `cat-${Date.now()}`,
      name,
      slug,
      description,
      created_at: new Date().toISOString()
    };
    store.categories.push(newCat);
    saveMockStore(store);
    return newCat;
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, slug, description }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(id, { name, slug, description = '' }) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const cat = store.categories.find((c) => c.id === id);
    if (!cat) throw new Error('Category not found');
    cat.name = name;
    cat.slug = slug;
    cat.description = description;
    saveMockStore(store);
    return cat;
  }

  const { data, error } = await supabase
    .from('categories')
    .update({ name, slug, description })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    store.categories = store.categories.filter((c) => c.id !== id);
    saveMockStore(store);
    return true;
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ==============================================================================
// 3. TAGS API
// ==============================================================================

export async function getTags() {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    return store.tags;
  }

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getTagBySlug(slug) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    return store.tags.find((t) => t.slug === slug) || null;
  }

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createTag({ name, slug }) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const newTag = { id: `tag-${Date.now()}`, name, slug };
    store.tags.push(newTag);
    saveMockStore(store);
    return newTag;
  }

  const { data, error } = await supabase
    .from('tags')
    .insert([{ name, slug }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTag(id) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    store.tags = store.tags.filter((t) => t.id !== id);
    store.post_tags = store.post_tags.filter((pt) => pt.tag_id !== id);
    saveMockStore(store);
    return true;
  }

  const { error } = await supabase.from('tags').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ==============================================================================
// 4. COMMENTS API
// ==============================================================================

export async function getCommentsByPostId(postId) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    return store.comments
      .filter((c) => c.post_id === postId && c.is_approved)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('is_approved', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createComment({ postId, parentId = null, authorName, authorEmail, content }) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const newComm = {
      id: `comm-${Date.now()}`,
      post_id: postId,
      parent_id: parentId,
      author_name: authorName,
      author_email: authorEmail,
      content,
      is_approved: false, // Hidden until admin approves
      created_at: new Date().toISOString()
    };
    store.comments.push(newComm);
    saveMockStore(store);
    return newComm;
  }

  const { data, error } = await supabase
    .from('comments')
    .insert([{
      post_id: postId,
      parent_id: parentId,
      author_name: authorName,
      author_email: authorEmail,
      content,
      is_approved: false // Enforced by RLS
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllCommentsAdmin({ filter = 'all' } = {}) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    let comments = [...store.comments];
    if (filter === 'pending') {
      comments = comments.filter((c) => !c.is_approved);
    } else if (filter === 'approved') {
      comments = comments.filter((c) => c.is_approved);
    }
    return comments.map((c) => {
      const post = store.posts.find((p) => p.id === c.post_id);
      return { ...c, post_title: post?.title || 'Unknown Post' };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  let query = supabase
    .from('comments')
    .select('*, post:posts(id, title)')
    .order('created_at', { ascending: false });

  if (filter === 'pending') {
    query = query.eq('is_approved', false);
  } else if (filter === 'approved') {
    query = query.eq('is_approved', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((c) => ({
    ...c,
    post_title: c.post?.title || 'Unknown Post'
  }));
}

export async function approveComment(id) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const comm = store.comments.find((c) => c.id === id);
    if (comm) {
      comm.is_approved = true;
      saveMockStore(store);
    }
    return true;
  }

  const { error } = await supabase
    .from('comments')
    .update({ is_approved: true })
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function deleteComment(id) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    store.comments = store.comments.filter((c) => c.id !== id);
    saveMockStore(store);
    return true;
  }

  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ==============================================================================
// 5. ADS API (Slots: header, sidebar_top, sidebar_bottom, in_article, below_post, footer)
// ==============================================================================

export async function getActiveAdsBySlot(slot) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const now = new Date();
    return store.ads.filter((ad) => {
      if (ad.slot !== slot || !ad.is_active) return false;
      if (ad.starts_at && new Date(ad.starts_at) > now) return false;
      if (ad.ends_at && new Date(ad.ends_at) < now) return false;
      return true;
    }).sort((a, b) => (a.position || 0) - (b.position || 0));
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('slot', slot)
    .eq('is_active', true)
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
    .order('position', { ascending: true });

  if (error) {
    console.warn(`Could not load ads for slot ${slot}:`, error);
    return [];
  }
  return data || [];
}

export async function getAllAdsAdmin() {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    return [...store.ads].sort((a, b) => (a.slot > b.slot ? 1 : -1));
  }

  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .order('slot', { ascending: true })
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createAd(adData) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const newAd = {
      id: `ad-${Date.now()}`,
      impressions: 0,
      clicks: 0,
      ...adData
    };
    store.ads.push(newAd);
    saveMockStore(store);
    return newAd;
  }

  const { data, error } = await supabase.from('ads').insert([adData]).select().single();
  if (error) throw error;
  return data;
}

export async function updateAd(id, adData) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const index = store.ads.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Ad not found');
    store.ads[index] = { ...store.ads[index], ...adData };
    saveMockStore(store);
    return store.ads[index];
  }

  const { data, error } = await supabase.from('ads').update(adData).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteAd(id) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    store.ads = store.ads.filter((a) => a.id !== id);
    saveMockStore(store);
    return true;
  }

  const { error } = await supabase.from('ads').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function recordAdImpression(id) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const ad = store.ads.find((a) => a.id === id);
    if (ad) {
      ad.impressions = (ad.impressions || 0) + 1;
      saveMockStore(store);
    }
    return;
  }

  const { error } = await supabase.rpc('increment_ad_impressions', { p_ad_id: id });
  if (error) {
    console.warn('Ad impression RPC failed:', error);
  }
}

export async function recordAdClick(id) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const ad = store.ads.find((a) => a.id === id);
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
      saveMockStore(store);
    }
    return;
  }

  const { error } = await supabase.rpc('increment_ad_clicks', { p_ad_id: id });
  if (error) {
    console.warn('Ad click RPC failed:', error);
  }
}

// ==============================================================================
// 6. CV SECTIONS & ITEMS API
// ==============================================================================

export async function getCvData() {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const visibleSections = store.cv_sections
      .filter((s) => s.is_visible)
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    return visibleSections.map((sec) => {
      const items = store.cv_items
        .filter((i) => i.section_id === sec.id)
        .sort((a, b) => (a.position || 0) - (b.position || 0));
      return { ...sec, items };
    });
  }

  const { data: sections, error: secError } = await supabase
    .from('cv_sections')
    .select('*')
    .eq('is_visible', true)
    .order('position', { ascending: true });

  if (secError) throw secError;

  const { data: items, error: itmError } = await supabase
    .from('cv_items')
    .select('*')
    .order('position', { ascending: true });

  if (itmError) throw itmError;

  return (sections || []).map((sec) => ({
    ...sec,
    items: (items || []).filter((item) => item.section_id === sec.id)
  }));
}

export async function getAllCvAdmin() {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const sections = [...store.cv_sections].sort((a, b) => (a.position || 0) - (b.position || 0));
    return sections.map((sec) => ({
      ...sec,
      items: store.cv_items
        .filter((i) => i.section_id === sec.id)
        .sort((a, b) => (a.position || 0) - (b.position || 0))
    }));
  }

  const { data: sections, error: secError } = await supabase
    .from('cv_sections')
    .select('*')
    .order('position', { ascending: true });

  if (secError) throw secError;

  const { data: items, error: itmError } = await supabase
    .from('cv_items')
    .select('*')
    .order('position', { ascending: true });

  if (itmError) throw itmError;

  return (sections || []).map((sec) => ({
    ...sec,
    items: (items || []).filter((item) => item.section_id === sec.id)
  }));
}

export async function createCvSection(sectionData) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const newSec = {
      id: `cv-sec-${Date.now()}`,
      is_visible: true,
      position: store.cv_sections.length + 1,
      ...sectionData
    };
    store.cv_sections.push(newSec);
    saveMockStore(store);
    return newSec;
  }

  const { data, error } = await supabase.from('cv_sections').insert([sectionData]).select().single();
  if (error) throw error;
  return data;
}

export async function updateCvSection(id, sectionData) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const index = store.cv_sections.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('CV Section not found');
    store.cv_sections[index] = { ...store.cv_sections[index], ...sectionData };
    saveMockStore(store);
    return store.cv_sections[index];
  }

  const { data, error } = await supabase.from('cv_sections').update(sectionData).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCvSection(id) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    store.cv_sections = store.cv_sections.filter((s) => s.id !== id);
    store.cv_items = store.cv_items.filter((i) => i.section_id !== id);
    saveMockStore(store);
    return true;
  }

  const { error } = await supabase.from('cv_sections').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function createCvItem(itemData) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const newItem = {
      id: `cv-itm-${Date.now()}`,
      position: 1,
      ...itemData
    };
    store.cv_items.push(newItem);
    saveMockStore(store);
    return newItem;
  }

  const { data, error } = await supabase.from('cv_items').insert([itemData]).select().single();
  if (error) throw error;
  return data;
}

export async function updateCvItem(id, itemData) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const index = store.cv_items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('CV Item not found');
    store.cv_items[index] = { ...store.cv_items[index], ...itemData };
    saveMockStore(store);
    return store.cv_items[index];
  }

  const { data, error } = await supabase.from('cv_items').update(itemData).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCvItem(id) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    store.cv_items = store.cv_items.filter((i) => i.id !== id);
    saveMockStore(store);
    return true;
  }

  const { error } = await supabase.from('cv_items').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ==============================================================================
// 7. SITE SETTINGS API
// ==============================================================================

export async function getSiteSettings(key = 'general') {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    return store.site_settings[key] || {};
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.warn('Could not read site_settings:', error);
    return {};
  }
  return data?.value || {};
}

export async function updateSiteSettings(key, value) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    store.site_settings[key] = { ...(store.site_settings[key] || {}), ...value };
    saveMockStore(store);
    return store.site_settings[key];
  }

  const { data, error } = await supabase
    .from('site_settings')
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data?.value || value;
}

// ==============================================================================
// 8. SUBSCRIBERS & CONTACT MESSAGES API
// ==============================================================================

export async function subscribeNewsletter(email) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const existing = store.subscribers.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (existing) return { message: 'Already subscribed!' };
    store.subscribers.push({
      id: `sub-${Date.now()}`,
      email,
      is_active: true,
      created_at: new Date().toISOString()
    });
    saveMockStore(store);
    return { success: true };
  }

  const { error } = await supabase.from('subscribers').insert([{ email }]);
  if (error) {
    if (error.code === '23505') {
      return { message: 'Already subscribed!' };
    }
    throw error;
  }
  return { success: true };
}

export async function getSubscribersAdmin() {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    return store.subscribers;
  }

  const { data, error } = await supabase
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteSubscriber(id) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    store.subscribers = store.subscribers.filter((s) => s.id !== id);
    saveMockStore(store);
    return true;
  }

  const { error } = await supabase.from('subscribers').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function submitContactMessage({ name, email, subject = '', message }) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    store.contact_messages.push({
      id: `msg-${Date.now()}`,
      name,
      email,
      subject,
      message,
      is_read: false,
      created_at: new Date().toISOString()
    });
    saveMockStore(store);
    return { success: true };
  }

  const { error } = await supabase.from('contact_messages').insert([{
    name,
    email,
    subject,
    message,
    is_read: false
  }]);

  if (error) throw error;
  return { success: true };
}

export async function getContactMessagesAdmin() {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    return [...store.contact_messages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function markContactMessageAsRead(id) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const msg = store.contact_messages.find((m) => m.id === id);
    if (msg) {
      msg.is_read = true;
      saveMockStore(store);
    }
    return true;
  }

  const { error } = await supabase
    .from('contact_messages')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function deleteContactMessage(id) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    store.contact_messages = store.contact_messages.filter((m) => m.id !== id);
    saveMockStore(store);
    return true;
  }

  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// ==============================================================================
// 9. MEDIA & FILE UPLOAD API (Proxied through Worker POST /api/upload)
// ==============================================================================

export async function getMediaAdmin() {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    return store.media;
  }

  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function recordMedia({ object_key, public_url, file_name, mime_type, size_bytes, alt_text = '' }) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    const newMedia = {
      id: `med-${Date.now()}`,
      uploaded_by: 'admin-1',
      object_key,
      public_url,
      file_name,
      mime_type,
      size_bytes,
      alt_text,
      created_at: new Date().toISOString()
    };
    store.media.unshift(newMedia);
    saveMockStore(store);
    return newMedia;
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('media')
    .insert([{
      uploaded_by: user?.id || null,
      object_key,
      public_url,
      file_name,
      mime_type,
      size_bytes,
      alt_text
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMedia(id, objectKey = null) {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    store.media = store.media.filter((m) => m.id !== id);
    saveMockStore(store);
    return true;
  }

  const { error } = await supabase.from('media').delete().eq('id', id);
  if (error) throw error;
  return true;
}

/**
 * Upload file through Cloudflare Worker POST /api/upload
 * Requires Admin Auth Token
 */
export async function uploadFile(file, altText = '') {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || '';

  const formData = new FormData();
  formData.append('file', file);
  if (altText) {
    formData.append('alt_text', altText);
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    // If worker is not running yet during development preview, fallback to client URL mock
    const errText = await response.text();
    console.warn('Worker upload returned non-200, creating local blob preview:', errText);
    const mockUrl = URL.createObjectURL(file);
    return await recordMedia({
      object_key: `uploads/${file.name}`,
      public_url: mockUrl,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      alt_text: altText || file.name
    });
  }

  const json = await response.json();
  // json: { url, object_key, file_name, mime_type, size_bytes }
  const recorded = await recordMedia({
    object_key: json.object_key,
    public_url: json.url,
    file_name: json.file_name || file.name,
    mime_type: json.mime_type || file.type,
    size_bytes: json.size_bytes || file.size,
    alt_text: altText || file.name
  });

  return recorded;
}

// ==============================================================================
// 10. DASHBOARD STATS API
// ==============================================================================

export async function getAdminDashboardStats() {
  if (!isSupabaseConfigured) {
    const store = getMockStore();
    return {
      totalPosts: store.posts.length,
      publishedPosts: store.posts.filter((p) => p.status === 'published').length,
      draftPosts: store.posts.filter((p) => p.status === 'draft').length,
      pendingComments: store.comments.filter((c) => !c.is_approved).length,
      activeAds: store.ads.filter((a) => a.is_active).length,
      totalSubscribers: store.subscribers.length,
      unreadMessages: store.contact_messages.filter((m) => !m.is_read).length,
      totalViews: store.posts.reduce((sum, p) => sum + (p.views || 0), 0)
    };
  }

  const [
    { count: totalPosts },
    { count: publishedPosts },
    { count: draftPosts },
    { count: pendingComments },
    { count: activeAds },
    { count: totalSubscribers },
    { count: unreadMessages }
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('ads').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('subscribers').select('*', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false)
  ]);

  return {
    totalPosts: totalPosts || 0,
    publishedPosts: publishedPosts || 0,
    draftPosts: draftPosts || 0,
    pendingComments: pendingComments || 0,
    activeAds: activeAds || 0,
    totalSubscribers: totalSubscribers || 0,
    unreadMessages: unreadMessages || 0
  };
}
