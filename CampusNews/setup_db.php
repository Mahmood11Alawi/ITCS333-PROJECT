<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = "127.0.0.1";
$user = getenv("db_user");
$pass = getenv("db_pass");
$db = getenv("db_name");

try {
    $conn = new PDO("mysql:host=$host", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create database if not exists
    $conn->exec("CREATE DATABASE IF NOT EXISTS $db");
    $conn->exec("USE $db");

    // Drop existing tables if exist
    $conn->exec("DROP TABLE IF EXISTS newscampus");
    $conn->exec("DROP TABLE IF EXISTS comments");

    // Create newscampus table
    $sql = "CREATE TABLE newscampus (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        image VARCHAR(255) DEFAULT 'images/default.jpg',
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->exec($sql);

    // Create comments table
    $sqlComments = "CREATE TABLE comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES newscampus(id) ON DELETE CASCADE
    )";
    $conn->exec($sqlComments);

    echo "Database and tables created successfully";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
    
?>