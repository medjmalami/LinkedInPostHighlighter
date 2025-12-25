// manifest.json


// content.js
(function() {
  'use strict';

  function parseRelativeTime(timeText) {
    if (!timeText) return null;
    
    // Remove bullet point and spaces, get just the timestamp
    const text = timeText.replace(/•/g, '').trim().toLowerCase();
    const now = Date.now();
    
    // Match LinkedIn's exact format: number + single letter (1m, 3w, 2d, 5h, etc.)
    const match = text.match(/^(\d+)([smhdw])$/);
    
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    let milliseconds = 0;
    
    switch(unit) {
      case 's':
        milliseconds = value * 1000;
        break;
      case 'm':
        milliseconds = value * 60 * 1000;
        break;
      case 'h':
        milliseconds = value * 60 * 60 * 1000;
        break;
      case 'd':
        milliseconds = value * 24 * 60 * 60 * 1000;
        break;
      case 'w':
        milliseconds = value * 7 * 24 * 60 * 60 * 1000;
        break;
    }
    
    return now - milliseconds;
  }

  function isWithin24Hours(timestamp) {
    if (!timestamp) return false;
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return (now - timestamp) < twentyFourHours;
  }

  function highlightRecentPosts() {
    // Find all post containers - LinkedIn uses various selectors
    const postSelectors = [
      '.feed-shared-update-v2',
      '[data-urn*="urn:li:activity"]',
      'div[data-id]',
      '.feed-shared-update-v2__description-wrapper'
    ];
    
    let posts = [];
    postSelectors.forEach(selector => {
      const found = document.querySelectorAll(selector);
      posts.push(...found);
    });
    
    // Remove duplicates
    posts = [...new Set(posts)];
    
    console.log('[LinkedIn Highlighter] Found', posts.length, 'posts');
    
    posts.forEach((post, index) => {
      // Skip if already processed
      if (post.dataset.highlightProcessed) return;
      post.dataset.highlightProcessed = 'true';
      
      console.log(`[Post ${index}] Analyzing post...`);
      
      // Get ALL text content from the post and log first 100 chars
      const allText = post.textContent.substring(0, 200);
      console.log(`[Post ${index}] Preview:`, allText);
      
      let isRecent = false;
      
      // Search through ALL spans in the post
      const allSpans = post.querySelectorAll('span');
      console.log(`[Post ${index}] Found ${allSpans.length} span elements`);
      
      for (let span of allSpans) {
        const timeText = span.textContent.trim();
        
        // Look for timestamp pattern anywhere in the text
        // LinkedIn format: "3h •" or "2w • Edited •" or "6d •"
        const timestampMatch = timeText.match(/\b(\d+[smhdw])\s*•/);
        
        if (timestampMatch) {
          const timestamp = timestampMatch[1]; // e.g., "3h", "2w", "6d"
          console.log(`[Post ${index}] ✓ TIMESTAMP MATCH: "${timestamp}" (from: "${timeText}")`);
          
          const parsedTime = parseRelativeTime(timestamp);
          
          if (isWithin24Hours(parsedTime)) {
            console.log(`[Post ${index}] ✓✓ WITHIN 24 HOURS - HIGHLIGHTING!`);
            isRecent = true;
            break;
          } else {
            console.log(`[Post ${index}] Timestamp too old (${timestamp})`);
          }
        }
      }
      
      if (isRecent) {
        post.classList.add('linkedin-recent-post');
      }
    });
  }

  // Run initially
  highlightRecentPosts();

  // Run when scrolling (throttled)
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(highlightRecentPosts, 300);
  }, { passive: true });

  // Watch for new posts being added to DOM
  const observer = new MutationObserver(() => {
    highlightRecentPosts();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

