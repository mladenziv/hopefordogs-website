# Project Notes

## Deployment

This site is deployed from GitHub (via cPanel auto-deploy to GoDaddy). Local file changes are NOT visible until committed and pushed to `main`. Always commit and push after making changes so they can be tested on the live site.

## Development Rules

- **Copy before innovating**: When adding a feature that's basically the same as something that already works (e.g. Facebook fetch for stories = same as dogs), copy the working code first and adapt it minimally. Don't rewrite or "improve" the patterns — GoDaddy's PHP has strict PCRE limits and things that look fine can crash on large input. Get it working first with proven code, then iterate.
- **Trust what already works**: If something is already working elsewhere in the codebase (e.g. the dogs form pulls multiple photos from Facebook), don't assume it won't work for the new feature. Test the existing code path first before concluding there's a limitation. The API was already returning multiple images — the problem was broken PHP, not a Facebook limitation.
- **Verify before pushing**: Always test PHP changes locally against real data before committing. For API endpoints, fetch the actual HTML, run the extraction logic, and confirm valid JSON output. Never push and hope — verify it works first.
- The beheer app is a compiled React bundle — all JS changes are search-and-replace edits on the minified `beheer/assets/index-D72IbPDC.js`.
