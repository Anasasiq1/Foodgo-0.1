<?php
/**
 * Foodgo Gourmet Ordering Platform - Application Gateway (PHP)
 */

define('FOODGO_ACCESS', true);

$baseDir = __DIR__;
$lockFile = $baseDir . '/storage/installed.lock';
$configFile = $baseDir . '/config/config.php';

// If not installed yet, redirect immediately to installer
$isInstalled = file_exists($lockFile) || (file_exists($configFile) && @include($configFile)['installed'] === true);

if (!$isInstalled) {
    if (file_exists($baseDir . '/install.php')) {
        header('Location: install.php');
        exit;
    }
}

// Serve dist/index.html if built
$distHtml = $baseDir . '/dist/index.html';
if (file_exists($distHtml)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($distHtml);
    exit;
}

// Fallback if dist/index.html hasn't been built yet
$rawHtml = $baseDir . '/index.html';
if (file_exists($rawHtml)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($rawHtml);
    exit;
}

echo '<!DOCTYPE html><html><head><title>Foodgo</title></head><body style="font-family:sans-serif;padding:40px;text-align:center;"><h2>Foodgo Installed</h2><p>Please build the frontend assets or check your server configuration.</p></body></html>';
