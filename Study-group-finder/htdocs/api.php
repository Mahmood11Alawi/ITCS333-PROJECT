<?php
session_start();
header('Content-Type: application/json');

require_once 'config.php';
require_once 'DatabaseHelper.php';

$db = new DatabaseHelper(
    $config['host'],
    $config['dbname'],
    $config['username'],
    $config['password'],
    $config['options']
);


$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch ($action) {
    
    case 'register': handleRegister($db); break;
    case 'login': handleLogin($db); break;
    case 'logout': handleLogout(); break;
    
   
    case 'create_group': handleCreateGroup($db); break;
    case 'get_groups': handleGetGroups($db); break;
    case 'join_group': handleJoinGroup($db); break;
    case 'leave_group': handleLeaveGroup($db); break;
    case 'get_group_members': handleGetGroupMembers($db); break;
    case 'update_group': handleUpdateGroup($db); break;
    case 'delete_group': handleDeleteGroup($db); break;
    
   
    case 'add_comment': handleAddComment($db); break;
    case 'get_comments': handleGetComments($db); break;
     case 'update_comment': handleUpdateComment($db); break;
    case 'delete_comment': handleDeleteComment($db); break;
    
    default: 
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
        break;
}


function handleRegister($db) {
    $data = getJsonInput();
    $required = ['username', 'password', 'email'];
    
    if (!validateInput($data, $required)) {
        return;
    }

    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT); // Hash the password

    try {
        $userId = $db->createUser($data['username'], $hashedPassword, $data['email']);
        $_SESSION['user_id'] = $userId;
        echo json_encode(['status' => 'success', 'message' => 'User registered successfully', 'user_id' => $userId]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Registration failed: ' . $e->getMessage()]);
    }
}

function handleLogin($db) {
    $data = getJsonInput();
    $required = ['username', 'password'];

    if (!validateInput($data, $required)) {
        return;
    }

    $user = $db->getUserByUsername($data['username']);
    if ($user && password_verify($data['password'], $user['password'])) { // Verify the password
        $_SESSION['user_id'] = $user['id'];
        echo json_encode(['status' => 'success', 'message' => 'Logged in successfully', 'user_id' => $user['id']]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid credentials']);
    }
}

function handleLogout() {
    session_destroy();
    echo json_encode(['status' => 'success', 'message' => 'Logged out successfully']);
}



function handleCreateGroup($db) {
    $data = getJsonInput();
    $required = ['name', 'subject', 'meeting_time', 'location', 'description'];
    
    if (!validateInput($data, $required)) {
        return;
    }

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
        return;
    }

    try {
        $groupId = $db->createGroup($_SESSION['user_id'], $data['name'], $data['subject'], $data['meeting_time'], $data['location'], $data['description']);
        echo json_encode(['status' => 'success', 'message' => 'Group created successfully', 'group_id' => $groupId]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to create group: ' . $e->getMessage()]);
    }
}

function handleGetGroups($db) {
    $search = $_GET['search'] ?? '';
    $subject = $_GET['subject'] ?? '';
    $page = $_GET['page'] ?? 1;
    $limit = $_GET['limit'] ?? 10;

    $groups = $db->getStudyGroups($search, $subject, $page, $limit);
    $totalGroups = $db->getTotalStudyGroups($search, $subject);
    $totalPages = ceil($totalGroups / $limit);

    echo json_encode([
        'status' => 'success',
        'groups' => $groups,
        'pagination' => [
            'currentPage' => (int)$page,
            'totalPages' => (int)$totalPages,
            'totalItems' => (int)$totalGroups,
            'pageSize' => (int)$limit
        ]
    ]);
}

function handleGetGroupById($db) {
    if (!isset($_GET['group_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing group ID']);
        return;
    }

    $group = $db->getStudyGroupById($_GET['group_id']);
    if ($group) {
        echo json_encode(['status' => 'success', 'group' => $group]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Group not found']);
    }
}

function handleUpdateGroup($db) {
    $data = getJsonInput();
    $required = ['group_id', 'name', 'subject', 'meeting_time', 'location', 'description'];
    
    if (!validateInput($data, $required)) {
        return;
    }

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
        return;
    }

     $group = $db->getStudyGroupById($data['group_id']);
    if (!$group) {
        echo json_encode(['status' => 'error', 'message' => 'Group not found']);
        return;
    }

    if ($group['creator_id'] != $_SESSION['user_id']) {
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: You are not the group creator']);
        return;
    }

    try {
        $db->updateStudyGroup($data['group_id'], $data['name'], $data['subject'], $data['meeting_time'], $data['location'], $data['description']);
        echo json_encode(['status' => 'success', 'message' => 'Group updated successfully']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to update group: ' . $e->getMessage()]);
    }
}

function handleDeleteGroup($db) {
     if (!isset($_GET['group_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing group ID']);
        return;
    }

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
        return;
    }
    $group = $db->getStudyGroupById($_GET['group_id']);
    if (!$group) {
        echo json_encode(['status' => 'error', 'message' => 'Group not found']);
        return;
    }
     if ($group['creator_id'] != $_SESSION['user_id']) {
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: You are not the group creator']);
        return;
    }

    try {
        $db->deleteStudyGroup($_GET['group_id']);
        echo json_encode(['status' => 'success', 'message' => 'Group deleted successfully']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete group: ' . $e->getMessage()]);
    }
}


function handleJoinGroup($db) {
    $data = getJsonInput();
    $required = ['group_id'];
    
    if (!validateInput($data, $required)) {
        return;
    }

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
        return;
    }

    try {
        $result = $db->joinStudyGroup($_SESSION['user_id'], $data['group_id']);
        if ($result) {
            echo json_encode(['status' => 'success', 'message' => 'Joined group successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to join group: Already a member']);
        }
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to join group: ' . $e->getMessage()]);
    }
}

function handleLeaveGroup($db) {
    $data = getJsonInput();
    $required = ['group_id'];
    
     if (!validateInput($data, $required)) {
        return;
    }

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
        return;
    }

    try {
        $result = $db->leaveStudyGroup($_SESSION['user_id'], $data['group_id']);
        if ($result) {
            echo json_encode(['status' => 'success', 'message' => 'Left group successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to leave group']);
        }
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to leave group: ' . $e->getMessage()]);
    }
}

function handleGetGroupMembers($db) {
     if (!isset($_GET['group_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing group ID']);
        return;
    }

    try {
        $members = $db->getGroupMembers($_GET['group_id']);
        echo json_encode(['status' => 'success', 'members' => $members]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to get group members: ' . $e->getMessage()]);
    }
}


function handleAddComment($db) {
    $data = getJsonInput();
    $required = ['group_id', 'text'];
    
    if (!validateInput($data, $required)) {
        return;
    }

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
        return;
    }

    try {
        $commentId = $db->addGroupComment($_SESSION['user_id'], $data['group_id'], $data['text']);
        echo json_encode([
            'status' => 'success',
            'comment_id' => $commentId
        ]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to add comment']);
    }
}

function handleGetComments($db) {
    if (!isset($_GET['group_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing group ID']);
        return;
    }

    try {
        $comments = $db->getGroupComments($_GET['group_id']);
        echo json_encode([
            'status' => 'success',
            'comments' => $comments
        ]);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to load comments']);
    }
}

function handleUpdateComment($db) {
    $data = getJsonInput();
    $required = ['comment_id', 'text'];
    
    if (!validateInput($data, $required)) {
        return;
    }

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
        return;
    }

    $comment = $db->getGroupCommentById($data['comment_id']);
     if (!$comment) {
        echo json_encode(['status' => 'error', 'message' => 'Comment not found']);
        return;
    }

    if ($comment['user_id'] != $_SESSION['user_id']) {
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized: You are not the comment creator']);
        return;
    }
    try {
        $db->updateGroupComment($data['comment_id'], $data['text']);
        echo json_encode(['status' => 'success', 'message' => 'Comment updated successfully']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to update comment: ' . $e->getMessage()]);
    }
}

function handleDeleteComment($db) {
    if (!isset($_GET['comment_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing comment ID']);
        return;
    }

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
        return;
    }
     $comment = $db->getGroupCommentById($_GET['comment_id']);
     if (!$comment) {
        echo json_encode(['status' => 'error', 'message' => 'Comment not found']);
        return;
    }

    if ($comment['user_id'] != $_SESSION['user_id']) {echo json_encode(['status' => 'error', 'message' => 'Unauthorized: You are not the comment creator']);
        return;
    }

    try {
        $db->deleteGroupComment($_GET['comment_id']);
        echo json_encode(['status' => 'success', 'message' => 'Comment deleted successfully']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete comment: ' . $e->getMessage()]);
    }
}


function getJsonInput() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function validateInput($data, $requiredFields) {
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            echo json_encode(['status' => 'error', 'message' => "Missing required field: $field"]);
            return false;
        }
    }
    return true;
}
