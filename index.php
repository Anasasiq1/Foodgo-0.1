<?php
/**
 * Foodgo Gourmet Ordering Platform - Application Gateway (PHP)
 */

define('FOODGO_ACCESS', true);

$baseDir = __DIR__;
$lockFile = $baseDir . '/storage/installed.lock';
$configFile = $baseDir . '/config/config.php';

// Check installation state
$isInstalled = file_exists($lockFile) || (file_exists($configFile) && @include($configFile)['installed'] === true);

// If not installed yet, redirect directly to installer
if (!$isInstalled) {
    if (file_exists($baseDir . '/install.php')) {
        header('Location: install.php');
        exit;
    }
}

// Locate the production frontend entry point:
// Candidate 1: dist/index.html (when build output is kept in dist/)
// Candidate 2: index.html (when dist contents are flattened into website root)
$frontendCandidates = [
    $baseDir . '/dist/index.html',
    $baseDir . '/index.html'
];

foreach ($frontendCandidates as $candidate) {
    if (file_exists($candidate)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($candidate);
        exit;
    }
}

// Fallback message if frontend is not yet built
echo '<!DOCTYPE html><html><head><title>Foodgo</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="font-family:sans-serif;padding:40px;text-align:center;background:#F8F9FA;color:#322A2E;"><div style="max-width:500px;margin:auto;background:white;padding:30px;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.06);"><h2>Foodgo Gourmet Platform</h2><p style="color:#666;font-size:14px;">Foodgo is installed. Please build frontend assets with <code>npm run build</code> or ensure <code>index.html</code> is present in the document root.</p></div></body></html>';
