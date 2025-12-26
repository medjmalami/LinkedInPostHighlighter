// content.js - Main script for LinkedIn viral post highlighting
(function() {
  'use strict';

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
    
    posts.forEach((post) => {
      // Skip if already processed
      if (post.dataset.highlightProcessed) return;
      post.dataset.highlightProcessed = 'true';
      
      let parsedTime = null;
      
      // Search through ALL spans in the post to find timestamp
      const allSpans = post.querySelectorAll('span');
      
      for (let span of allSpans) {
        const timeText = span.textContent.trim();
        
        // Look for timestamp pattern anywhere in the text
        // LinkedIn format: "3h •" or "2w • Edited •" or "6d •"
        const timestampMatch = timeText.match(/\b(\d+[smhdw])\s*•/);
        
        if (timestampMatch) {
          const timestamp = timestampMatch[1]; // e.g., "3h", "2w", "6d"
          parsedTime = parseRelativeTime(timestamp);
          break;
        }
      }
      
      // Only process posts within 24 hours
      if (!isWithin24Hours(parsedTime)) return;
      
      // Extract engagement metrics
      const { likes, comments } = extractEngagementMetrics(post);
      
      // If we have engagement data, calculate viral score
      if (likes > 0 || comments > 0) {
        const hours = getHoursFromTimestamp(parsedTime);
        const viralScore = calculateViralScore(likes, comments, hours);
        const viralLevel = getViralLevel(viralScore);
        
        if (viralLevel) {
          // Apply viral styling (takes priority over recent)
          post.classList.add('linkedin-viral-post');
          post.classList.add(`linkedin-viral-${viralLevel}`);
          return;
        }
      }
      
      // Fallback: not viral or no engagement data, show as recent post
      post.classList.add('linkedin-recent-post');
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
