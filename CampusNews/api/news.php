<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Accept');
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database connection
$host = "127.0.0.1";
$user = getenv("db_user");
$pass = getenv("db_pass");
$db = getenv("db_name");

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Handle request method
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $id = $_GET['id'] ?? null;

        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM newscampus WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC) ?: ['error' => 'Article not found']);
        } else {
            $stmt = $pdo->query("SELECT * FROM newscampus ORDER BY date DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        $rawData = file_get_contents('php://input');
        $data = json_decode($rawData, true);

        error_log("Received Data: " . print_r($data, true));

        if (!$data || empty($data['title']) || empty($data['body']) || empty($data['date'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields: title, body, or date']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO newscampus (title, body, image, date) VALUES (:title, :body, :image, :date)");
            $stmt->bindValue(':title', $data['title'], PDO::PARAM_STR);
            $stmt->bindValue(':body', $data['body'], PDO::PARAM_STR);
            $stmt->bindValue(':image', !empty($data['image']) ? $data['image'] : 'images/default.jpg', PDO::PARAM_STR);
            $stmt->bindValue(':date', $data['date'], PDO::PARAM_STR);

            if ($stmt->execute()) {
                echo json_encode([
                    'id' => $pdo->lastInsertId(),
                    'message' => 'News created successfully'
                ]);
            } else {
                throw new Exception('Failed to insert data: ' . implode(', ', $stmt->errorInfo()));
            }
        } catch (Exception $e) {
            http_response_code(500);
            error_log('Database error: ' . $e->getMessage());
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$id || !$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request']);
            exit;
        }

        $fields = [];
        $params = [];

        foreach (['title', 'body', 'image', 'date'] as $field) {
            if (!empty($data[$field])) {
                $fields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }

        $params[] = $id;
        $stmt = $pdo->prepare("UPDATE newscampus SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);

        echo json_encode(['message' => 'News updated successfully']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM newscampus WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(['message' => 'News deleted successfully']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>