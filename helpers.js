// helpers.js - Pure utility functions for LinkedIn viral post detection

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
  // Use strict < to exclude posts that are exactly 24h (1d) old
  return (now - timestamp) < twentyFourHours;
}

function getHoursFromTimestamp(timestamp) {
  if (!timestamp) return null;
  const now = Date.now();
  const hours = (now - timestamp) / (1000 * 60 * 60);
  // Minimum 1 hour to avoid inflated scores for very fresh posts
  return Math.max(hours, 1);
}

function extractEngagementMetrics(post) {
  let likes = 0;
  let comments = 0;

  // Extract likes from reactions count span
  const reactionsSpan = post.querySelector('.social-details-social-counts__reactions-count');
  if (reactionsSpan) {
    const likesText = reactionsSpan.textContent.trim().replace(/,/g, '');
    likes = parseInt(likesText, 10) || 0;
  }

  // Extract comments from comments button
  const commentsButton = post.querySelector('.social-details-social-counts__comments button');
  if (commentsButton) {
    const commentsText = commentsButton.textContent;
    const match = commentsText.match(/(\d+)\s*comments?/i);
    if (match) {
      comments = parseInt(match[1], 10) || 0;
    }
  }

  return { likes, comments };
}

function calculateViralScore(likes, comments, hours) {
  // Formula: S_viral = (L + 3C) / max(H, 1)^1.25
  const totalEngagement = likes + (comments * 3);
  const agePenalty = Math.pow(hours, 1.25);
  return totalEngagement / agePenalty;
}

function getViralLevel(score) {
  if (score >= 30) return 'high';
  if (score >= 20) return 'medium';
  if (score >= 12) return 'low';
  return null;
}
