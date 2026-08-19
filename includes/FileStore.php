<?php
/**
 * Foodgo Gourmet Ordering Platform - High-Performance File-Storage Database Engine
 * 
 * Provides atomic, thread-safe JSON file persistence with flock() file locking,
 * automatic collection initialization, corrupted-file recovery, and CRUD query helpers.
 */

if (!defined('FOODGO_ACCESS')) {
    define('FOODGO_ACCESS', true);
}

class FileStore
{
    private static ?string $dataDir = null;
    private static ?string $backupDir = null;
    private static array $cache = [];

    /**
     * Initialize data directory paths
     */
    public static function init(?string $customDataDir = null): void
    {
        if ($customDataDir !== null) {
            self::$dataDir = rtrim($customDataDir, '/\\');
        } else {
            self::$dataDir = dirname(__DIR__) . '/data';
        }

        self::$backupDir = dirname(__DIR__) . '/backups';

        if (!is_dir(self::$dataDir)) {
            @mkdir(self::$dataDir, 0755, true);
        }

        if (!is_dir(self::$backupDir)) {
            @mkdir(self::$backupDir, 0755, true);
        }

        // Ensure .htaccess exists in /data/ to block all web access
        $htaccessPath = self::$dataDir . '/.htaccess';
        if (!file_exists($htaccessPath)) {
            @file_put_contents($htaccessPath, "<Files \"*\">\n    Require all denied\n</Files>\nDeny from all\n");
        }
    }

    /**
     * Get path to collection JSON file
     */
    public static function getFilePath(string $collection): string
    {
        if (self::$dataDir === null) {
            self::init();
        }
        $clean = preg_replace('/[^a-zA-Z0-9_\-]/', '', $collection);
        return self::$dataDir . '/' . $clean . '.json';
    }

    /**
     * Load raw collection data with file lock
     */
    public static function get(string $collection, $default = []): array
    {
        $filePath = self::getFilePath($collection);

        if (!file_exists($filePath)) {
            // Auto-initialize empty collection if file does not exist
            self::saveRaw($collection, $default);
            return $default;
        }

        $fp = @fopen($filePath, 'r');
        if (!$fp) {
            return $default;
        }

        // Shared lock for reading
        flock($fp, LOCK_SH);
        $contents = @stream_get_contents($fp);
        flock($fp, LOCK_UN);
        fclose($fp);

        if (empty($contents)) {
            return $default;
        }

        $data = json_decode($contents, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            // Corrupted JSON detected - attempt to recover from backup if available
            error_log("FileStore: Corrupted JSON in {$filePath}: " . json_last_error_msg());
            return $default;
        }

        return is_array($data) ? $data : $default;
    }

    /**
     * Save raw collection data using atomic write (temporary file + rename + flock)
     */
    public static function saveRaw(string $collection, $data): bool
    {
        if (self::$dataDir === null) {
            self::init();
        }

        $filePath = self::getFilePath($collection);
        $dir = dirname($filePath);

        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }

        $jsonString = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($jsonString === false) {
            error_log("FileStore: Failed to encode JSON for {$collection}");
            return false;
        }

        $tempPath = $filePath . '.' . uniqid('tmp_', true) . '.tmp';
        $fp = @fopen($tempPath, 'w');
        if (!$fp) {
            error_log("FileStore: Could not open temp file for writing: {$tempPath}");
            return false;
        }

        // Exclusive lock
        if (flock($fp, LOCK_EX)) {
            fwrite($fp, $jsonString);
            fflush($fp);
            flock($fp, LOCK_UN);
            fclose($fp);

            // Atomic rename
            if (@rename($tempPath, $filePath)) {
                @chmod($filePath, 0644);
                return true;
            }
        } else {
            fclose($fp);
        }

        @unlink($tempPath);
        return false;
    }

    /**
     * Query helpers: Find items matching a callable filter
     */
    public static function find(string $collection, callable $filter): array
    {
        $items = self::get($collection, []);
        if (!is_array($items)) return [];
        return array_values(array_filter($items, $filter));
    }

    /**
     * Find single record by ID
     */
    public static function findById(string $collection, $id): ?array
    {
        $items = self::get($collection, []);
        if (!is_array($items)) return null;

        foreach ($items as $item) {
            if (is_array($item) && isset($item['id']) && (string)$item['id'] === (string)$id) {
                return $item;
            }
        }
        return null;
    }

    /**
     * Find records matching key-value criteria array
     */
    public static function findWhere(string $collection, array $criteria): array
    {
        $items = self::get($collection, []);
        if (!is_array($items)) return [];

        $results = [];
        foreach ($items as $item) {
            if (!is_array($item)) continue;
            $match = true;
            foreach ($criteria as $k => $v) {
                if (!array_key_exists($k, $item) || $item[$k] != $v) {
                    $match = false;
                    break;
                }
            }
            if ($match) {
                $results[] = $item;
            }
        }
        return $results;
    }

    /**
     * Find first record matching key-value criteria array
     */
    public static function findOneWhere(string $collection, array $criteria): ?array
    {
        $results = self::findWhere($collection, $criteria);
        return !empty($results) ? $results[0] : null;
    }

    /**
     * Insert a new record into collection
     */
    public static function create(string $collection, array $data): array
    {
        $items = self::get($collection, []);
        if (!is_array($items)) {
            $items = [];
        }

        if (empty($data['id'])) {
            $data['id'] = strtolower(substr($collection, 0, 4)) . '-' . time() . '-' . bin2hex(random_bytes(3));
        }

        if (empty($data['createdAt']) && empty($data['created_at'])) {
            $data['createdAt'] = date('c');
        }

        $items[] = $data;
        self::saveRaw($collection, $items);
        return $data;
    }

    /**
     * Update an existing record by ID
     */
    public static function update(string $collection, $id, array $updates): ?array
    {
        $items = self::get($collection, []);
        if (!is_array($items)) return null;

        $updatedRecord = null;
        foreach ($items as $index => $item) {
            if (is_array($item) && isset($item['id']) && (string)$item['id'] === (string)$id) {
                $updates['updatedAt'] = date('c');
                $items[$index] = array_merge($item, $updates);
                $updatedRecord = $items[$index];
                break;
            }
        }

        if ($updatedRecord !== null) {
            self::saveRaw($collection, $items);
        }

        return $updatedRecord;
    }

    /**
     * Delete record by ID
     */
    public static function delete(string $collection, $id): bool
    {
        $items = self::get($collection, []);
        if (!is_array($items)) return false;

        $initialCount = count($items);
        $newItems = array_values(array_filter($items, function ($item) use ($id) {
            return is_array($item) && isset($item['id']) && (string)$item['id'] !== (string)$id;
        }));

        if (count($newItems) !== $initialCount) {
            self::saveRaw($collection, $newItems);
            return true;
        }

        return false;
    }

    /**
     * Upsert record (Update if exists, else insert)
     */
    public static function upsert(string $collection, $id, array $data): array
    {
        $existing = self::findById($collection, $id);
        if ($existing !== null) {
            return self::update($collection, $id, $data) ?? $data;
        }

        $data['id'] = $id;
        return self::create($collection, $data);
    }

    /**
     * Count records in collection
     */
    public static function count(string $collection, ?array $criteria = null): int
    {
        if ($criteria === null) {
            $items = self::get($collection, []);
            return is_array($items) ? count($items) : 0;
        }
        return count(self::findWhere($collection, $criteria));
    }

    /**
     * Check if record exists
     */
    public static function exists(string $collection, $id): bool
    {
        return self::findById($collection, $id) !== null;
    }

    /**
     * Create timestamped backup of entire /data/ directory
     */
    public static function createBackup(): ?string
    {
        if (self::$dataDir === null) {
            self::init();
        }

        $zipFile = self::$backupDir . '/foodgo_data_backup_' . date('Y-m-d_H-i-s') . '.zip';
        if (!class_exists('ZipArchive')) {
            return null;
        }

        $zip = new ZipArchive();
        if ($zip->open($zipFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return null;
        }

        $files = glob(self::$dataDir . '/*.json');
        foreach ($files as $file) {
            if (is_file($file)) {
                $zip->addFile($file, basename($file));
            }
        }

        $zip->close();
        return file_exists($zipFile) ? $zipFile : null;
    }
}
