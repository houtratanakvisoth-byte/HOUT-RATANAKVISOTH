import React, { useEffect, useRef, useState } from 'react';
import { getActiveAdsBySlot, recordAdImpression, recordAdClick } from '../lib/api.js';

export default function AdSlot({ slot, className = '' }) {
  const [ads, setAds] = useState([]);
  const scriptContainerRef = useRef(null);
  const impressedIdsRef = useRef(new Set());

  useEffect(() => {
    let mounted = true;
    getActiveAdsBySlot(slot)
      .then((data) => {
        if (mounted && Array.isArray(data)) {
          setAds(data);
        }
      })
      .catch((err) => console.warn(`AdSlot ${slot} error:`, err));

    return () => {
      mounted = false;
    };
  }, [slot]);

  // Handle impressions & script ad execution
  useEffect(() => {
    if (!ads || ads.length === 0) return;

    ads.forEach((ad) => {
      if (!impressedIdsRef.current.has(ad.id)) {
        impressedIdsRef.current.add(ad.id);
        recordAdImpression(ad.id);
      }
    });

    const scriptAds = ads.filter((a) => a.ad_type === 'script' && a.script_code);
    if (scriptAds.length > 0 && scriptContainerRef.current) {
      const container = scriptContainerRef.current;
      container.innerHTML = '';

      scriptAds.forEach((ad) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'ad-script-item w-full flex justify-center my-2';

        // Parse HTML and extract any script elements
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = ad.script_code;

        // Append non-script nodes
        Array.from(tempDiv.childNodes).forEach((node) => {
          if (node.tagName !== 'SCRIPT') {
            wrapper.appendChild(node.cloneNode(true));
          }
        });

        // Create script tags via document.createElement('script') to ensure browser execution
        const scriptElements = tempDiv.querySelectorAll('script');
        if (scriptElements.length > 0) {
          scriptElements.forEach((s) => {
            const newScript = document.createElement('script');
            if (s.src) {
              newScript.src = s.src;
              newScript.async = true;
            }
            if (s.text) {
              newScript.text = s.text;
            }
            Array.from(s.attributes).forEach((attr) => {
              if (attr.name !== 'src') {
                newScript.setAttribute(attr.name, attr.value);
              }
            });
            wrapper.appendChild(newScript);
          });
        } else if (ad.script_code.trim().startsWith('<') === false) {
          // If it is raw JS code without <script> tag
          const rawScript = document.createElement('script');
          rawScript.type = 'text/javascript';
          rawScript.text = ad.script_code;
          wrapper.appendChild(rawScript);
        }

        container.appendChild(wrapper);
      });
    }
  }, [ads]);

  if (!ads || ads.length === 0) {
    return null;
  }

  const handleImageClick = (ad) => {
    if (ad.id) {
      recordAdClick(ad.id);
    }
  };

  return (
    <div className={`ad-slot-container my-4 w-full flex flex-col items-center justify-center ${className}`}>
      <span className="text-[10px] tracking-wider uppercase text-slate-400 mb-1 font-mono">
        Advertisement
      </span>

      {/* Image Ads */}
      {ads
        .filter((ad) => ad.ad_type === 'image' && ad.image_url)
        .map((ad) => (
          <a
            key={ad.id}
            href={ad.link_url || '#'}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => handleImageClick(ad)}
            className="block overflow-hidden rounded-lg border border-slate-200 hover:opacity-95 transition-opacity shadow-sm"
            style={{
              maxWidth: ad.width ? `${ad.width}px` : '100%',
              maxHeight: ad.height ? `${ad.height}px` : 'auto',
            }}
          >
            <img
              src={ad.image_url}
              alt={ad.name || 'Advertisement'}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </a>
        ))}

      {/* Script Ads Container */}
      <div ref={scriptContainerRef} className="w-full flex flex-col items-center justify-center" />
    </div>
  );
}
