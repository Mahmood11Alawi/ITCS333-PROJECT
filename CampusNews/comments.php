<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = "127.0.0.1";
$user = getenv("db_user");
$pass = getenv("db_pass");
$db = getenv("db_name");

try {
    $conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Fetch comments for an article
        $article_id = $_GET['event_id'];
        $stmt = $conn->prepare("SELECT * FROM comments WHERE article_id = :article_id");
        $stmt->bindParam(':article_id', $article_id);
        $stmt->execute();
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($comments);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Insert a new comment
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['event_id']) || !isset($data['text'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required fields: event_id or text']);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO comments (article_id, text) VALUES (:article_id, :text)");
        $stmt->bindParam(':article_id', $data['event_id']);
        $stmt->bindParam(':text', $data['text']);

        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to insert the comment']);
        }
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo "Error: " . $e->getMessage();
}
?>