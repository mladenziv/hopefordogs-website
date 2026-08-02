<?php
// ========================================
// OCR (Anthropic Claude vision) — TEMPLATE
// ========================================
// This is a template. The real config.php is NOT in git (see .gitignore).
//
// To set up on the server:
//   1. In cPanel File Manager, go to public_html/api/ocr/
//   2. Copy this file to config.php (or create config.php)
//   3. Paste your Anthropic API key below
//
// Get a key: https://console.anthropic.com
//   - Sign up, then Billing → add a small prepaid credit (a few $ lasts a long time)
//   - API Keys → Create Key → copy the key (starts with sk-ant-)
// The key is charged per image (~a cent or two); there is no monthly subscription.
// ========================================

define('ANTHROPIC_API_KEY', 'sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'); // <-- your Anthropic API key

// Vision model (optional — this default is fine).
define('OCR_MODEL', 'claude-haiku-4-5-20251001');
