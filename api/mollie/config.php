<?php
// ========================================
// MOLLIE CONFIGURATION
// ========================================
// Fill in your Mollie API key below.
// You can find it in your Mollie Dashboard under:
// Developers > API keys
//
// Use the LIVE key for production payments.
// Use the TEST key for testing (test_ prefix).
// ========================================

define('MOLLIE_API_KEY', 'live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'); // <-- Replace with your Mollie API key

// Base URL of your website (used for redirect and webhook URLs)
define('SITE_URL', 'https://www.hopefordogseurope.com');

// Mollie API base URL
define('MOLLIE_API_URL', 'https://api.mollie.com/v2');
