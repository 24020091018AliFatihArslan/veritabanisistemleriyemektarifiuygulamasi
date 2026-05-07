<?php
// ============================================================
//  YEMEK TARİFİ - PHP Backend (MySQL)
//  config.php - Veritabanı Bağlantısı
// ============================================================
define('DB_HOST', 'localhost');
define('DB_NAME', 'yemek_tarifi');
define('DB_USER', 'root');
define('DB_PASS', 'a1a23456');
define('DB_CHARSET', 'utf8mb4');

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    }
    return $pdo;
}
