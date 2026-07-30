<?php
// Diagnostic tool retired. Kept as an inert stub because the GoDaddy deploy
// (cp -R) never deletes files from the server — replacing the body with this
// stub is how we disable it. Safe to delete the file on the server directly.
header('Content-Type: application/json');
http_response_code(410);
echo json_encode(array('error' => 'disabled'));
