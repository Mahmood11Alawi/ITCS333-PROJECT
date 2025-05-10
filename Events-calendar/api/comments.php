<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($_GET['event_id']) || !isset($data['text'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }
        $stmt = $pdo->prepare("INSERT INTO comments (event_id, text) VALUES (?, ?)");
        $stmt->execute([$_GET['event_id'], $data['text']]);
        echo json_encode(['success' => true]);
        break;

      case 'DELETE':
          $data = json_decode(file_get_contents("php://input"), true);
          if (!isset($data['commentId'])) {
              http_response_code(400);
              echo json_encode(['error' => 'Comment ID required']);
              exit;
          }
          $stmt = $pdo->prepare("DELETE FROM comments WHERE id = ?");
          $stmt->execute([$data['commentId']]);
          echo json_encode(['success' => true]);
          break;
      

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
