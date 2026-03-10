# Project Notes

## Deployment

This site is deployed from GitHub (via cPanel auto-deploy to GoDaddy). Local file changes are NOT visible until committed and pushed to `main`. Always commit and push after making changes so they can be tested on the live site.

## Development Rules

- **Copy before innovating**: When adding a feature that's basically the same as something that already works (e.g. Facebook fetch for stories = same as dogs), copy the working code first and adapt it minimally. Don't rewrite or "improve" the patterns — GoDaddy's PHP has strict PCRE limits and things that look fine can crash on large input. Get it working first with proven code, then iterate.
- The beheer app is a compiled React bundle — all JS changes are search-and-replace edits on the minified `beheer/assets/index-D72IbPDC.js`.
