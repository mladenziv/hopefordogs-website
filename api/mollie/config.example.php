<?php
// ========================================
// MOLLIE CONFIGURATION — TEMPLATE
// ========================================
// This is a template. The real config.php is NOT in git (see .gitignore).
//
// To set up on the server:
//   1. In cPanel File Manager, go to public_html/api/mollie/
//   2. Copy this file to config.php (or edit the existing config.php)
//   3. Replace the placeholder below with your LIVE Mollie API key
//
// Find your key in the Mollie Dashboard under: Developers > API keys
//   - LIVE key (live_...) for real payments
//   - TEST key (test_...) for testing
// ========================================

define('MOLLIE_API_KEY', 'live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'); // <-- Replace with your Mollie API key

// Base URL of your website. NOTE: redirect and webhook URLs are now
// auto-detected from the incoming request domain, so this value is only
// used as a fallback if the host can't be determined. No need to change
// it when moving between temp/staging/live domains.
define('SITE_URL', 'https://www.hopefordogseurope.com');

// Mollie API base URL
define('MOLLIE_API_URL', 'https://api.mollie.com/v2');
