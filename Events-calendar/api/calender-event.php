<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Parse ID from query if provided
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare("SELECT e.*, c.id AS comment_id, c.text AS comment_text, c.created_at AS comment_created_at
                        FROM events e
                        LEFT JOIN comments c ON e.id = c.event_id
                        WHERE e.id = ?");
    $stmt->execute([$id]);
    $event = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($event) {
        // Group comments under the event
        $stmt_comments = $pdo->prepare("SELECT * FROM comments WHERE event_id = ?");
        $stmt_comments->execute([$id]);
        $event['comments'] = $stmt_comments->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($event);
    } else {
        echo json_encode(['error' => 'Event not found']);
    }
        } else {
            $stmt = $pdo->query("
                SELECT e.*, c.id AS comment_id, c.text AS comment_text, c.created_at AS comment_created_at
                FROM events e
                LEFT JOIN comments c ON e.id = c.event_id
                ORDER BY c.created_at DESC
            ");
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $eventsGrouped = [];
            foreach ($events as $event) {
                if (!isset($eventsGrouped[$event['id']])) {
                    $eventsGrouped[$event['id']] = [
                        'id' => $event['id'],
                        'title' => $event['title'],
                        'time' => $event['time'],
                        'date' => $event['date'],
                        'location' => $event['location'],
                        'organizer' => $event['organizer'],
                        'description' => $event['description'],
                        'category' => $event['category'],
                        'comments' => []
                    ];
                }
                if ($event['comment_id']) {
                    $eventsGrouped[$event['id']]['comments'][] = [
                        'id' => $event['comment_id'],
                        'text' => $event['comment_text'],
                        'created_at' => $event['comment_created_at']
                    ];
                }
            }

            echo json_encode(array_values($eventsGrouped));
        }
        break;


    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("INSERT INTO events (title, date, time, location,organizer, description, category) VALUES (?, ?, ?, ?, ?, ?,?)");
        $stmt->execute([
            $data['title'],
            $data['date'],
            $data['time'],
            $data['location'],
            $data['organizer'],
            $data['description'],
            $data['category']
        ]);
        echo json_encode(['id' => $pdo->lastInsertId()]);
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "ID required"]);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("UPDATE events SET title=?, date=?, time=?, location=?, organizer=?, description=?, category=? WHERE id=?");
        $stmt->execute([
            $data['title'],
            $data['date'],
            $data['time'],
            $data['location'],
            $data['organizer'],

            $data['description'],
            $data['category'],
            $id
        ]);
        echo json_encode(["success" => true]);
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "ID required"]);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method Not Allowed"]);
        break;
}
?>