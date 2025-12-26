# LinkedIn Viral Post Highlighter

A Firefox extension that highlights recent LinkedIn posts and detects viral content using engagement metrics.

## Why?

Skip the noise and jump directly into fresh, trending posts on your LinkedIn feed. Viral posts are color-coded so you can instantly spot high-engagement content.

## Features

- Highlights posts less than 24 hours old
- Detects viral posts using an engagement-based formula
- Color-coded highlighting based on viral level

## Color Legend

| Color | Meaning | Viral Score |
|-------|---------|-------------|
| Red | High Viral - Explosive growth | >= 30 |
| Orange | Medium Viral - Strong trending | >= 20 |
| Yellow | Low Viral - Notable engagement | >= 12 |
| Green | Recent - Under 24h, not viral | < 12 |

## How Viral Detection Works

The viral score is calculated using:

```
Score = (Likes + 3 x Comments) / max(H, 1)^1.25
```

- **Comments weighted 3x** - They require more effort and indicate deeper engagement
- **Age penalty (H^1.25)** - Older posts are penalized to prioritize fresh, rapidly-engaging content
- **Minimum 1 hour** - Posts under 1 hour are treated as 1 hour old to avoid inflated scores

### Examples

| Likes | Comments | Age | Score | Level |
|-------|----------|-----|-------|-------|
| 50 | 15 | 30min | 95.0 | High |
| 100 | 20 | 2h | 67.3 | High |
| 80 | 10 | 3h | 28.7 | Medium |
| 49 | 7 | 7h | 5.8 | Recent |

## Installation

1. Open Firefox and go to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Select the `manifest.json` file from this folder
5. Go to LinkedIn and start scrolling!

## How it works

- Scans your LinkedIn feed for post timestamps (e.g., "3h", "45m", "12h")
- Extracts engagement metrics (likes, comments) from each post
- Calculates viral score and applies color-coded highlighting
- Automatically detects new posts as you scroll

## Status

v2 - Viral Detection
