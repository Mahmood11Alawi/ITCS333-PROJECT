<?php

require_once 'config.php';

class DatabaseHelper {
    private $host;
    private $dbName;
    private $username;
    private $password;
    private $options;
    private $pdo;

    public function __construct($host, $dbName, $username, $password, $options = []) {
        $this->host = $host;
        $this->dbName = $dbName;
        $this->username = $username;
        $this->password = $password;
        $this->options = $options;
    }

    public function getPDO() {
        if (!$this->pdo) {
            try {
                $dsn = "mysql:host={$this->host};dbname={$this->dbName};charset=utf8mb4";
                $this->pdo = new PDO($dsn, $this->username, $this->password, $this->options);
            } catch (PDOException $e) {
                if ($e->getCode() == 1049) {
                    $this->createDatabase();
                    $this->pdo = new PDO($dsn, $this->username, $this->password, $this->options);
                    $this->createTables();
                } else {
                    throw $e;
                }
            }
        }
        return $this->pdo;
    }

    private function createDatabase() {
        try {
            $pdo = new PDO("mysql:host={$this->host}", $this->username, $this->password);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS {$this->dbName}");
        } catch (PDOException $e) {
            throw new Exception("Failed to create database: " . $e->getMessage());
        }
    }

    private function createTables() {
        $pdo = $this->getPDO();
        try {
            // User table
            $pdo->exec("CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )");

            // Study groups table
            $pdo->exec("CREATE TABLE IF NOT EXISTS study_groups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                creator_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                meeting_time DATETIME NOT NULL,
                location VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
            )");

            // Group members table
            $pdo->exec("CREATE TABLE IF NOT EXISTS group_members (
                user_id INT NOT NULL,
                group_id INT NOT NULL,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, group_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE
            )");

             // Group comments table
            $pdo->exec("CREATE TABLE IF NOT EXISTS group_comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                group_id INT NOT NULL,
                text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE
            )");

        } catch (PDOException $e) {
            throw new Exception("Failed to create tables: " . $e->getMessage());
        }
    }

    public function prepare($sql) {
        return $this->getPDO()->prepare($sql);
    }

    // User functions
    public function createUser($username, $password, $email) {
        $stmt = $this->prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
        $stmt->execute([$username, $password, $email]);
        return $this->getPDO()->lastInsertId();
    }

    public function getUserByUsername($username) {
        $stmt = $this->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        return $stmt->fetch();
    }

     public function getUserById($id) {
        $stmt = $this->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    // Group functions
    public function createGroup($creatorId, $name, $subject, $meetingTime, $location, $description) {
        $stmt = $this->prepare("INSERT INTO study_groups (creator_id, name, subject, meeting_time, location, description) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$creatorId, $name, $subject, $meetingTime, $location, $description]);
        return $this->getPDO()->lastInsertId();
    }

    public function getStudyGroups($search = '', $subject = '', $page = 1, $limit = 10) {
        $sql = "SELECT sg.*, u.username, COUNT(DISTINCT gm.user_id) as members_count 
                FROM study_groups sg 
                LEFT JOIN users u ON sg.creator_id = u.id
                LEFT JOIN group_members gm ON sg.id = gm.group_id";
        $conditions = [];
        $params = [];

        if (!empty($search)) {
            $conditions[] = "(sg.name LIKE ? OR sg.description LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        if (!empty($subject)) {
            $conditions[] = "sg.subject = ?";
            $params[] = $subject;
        }

        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }

        $sql .= " GROUP BY sg.id ORDER BY sg.created_at DESC";

        // إضافة جملتي LIMIT و OFFSET لدعم Pagination
        $sql .= " LIMIT :limit OFFSET :offset";
        $params[':limit'] = $limit;
        $params[':offset'] = ($page - 1) * $limit;

        $stmt = $this->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getTotalStudyGroups($search = '', $subject = '') {
        $sql = "SELECT COUNT(*) FROM study_groups sg";
        $conditions = [];
        $params = [];

        if (!empty($search)) {
            $conditions[] = "(sg.name LIKE ? OR sg.description LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        if (!empty($subject)) {
            $conditions[] = "sg.subject = ?";
            $params[] = $subject;
        }

        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }

        $stmt = $this->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchColumn();
    }

    public function getStudyGroupById($groupId) {
        $stmt = $this->prepare("SELECT sg.*, u.username FROM study_groups sg LEFT JOIN users u ON sg.creator_id = u.id WHERE sg.id = ?");
        $stmt->execute([$groupId]);
        return $stmt->fetch();
    }

    public function updateStudyGroup($groupId, $name, $subject, $meetingTime, $location, $description) {
        $stmt = $this->prepare("UPDATE study_groups SET name = ?, subject = ?, meeting_time = ?, location = ?, description = ? WHERE id = ?");
        return $stmt->execute([$name, $subject, $meetingTime, $location, $description, $groupId]);
    }

    public function deleteStudyGroup($groupId) {
        $stmt = $this->prepare("DELETE FROM study_groups WHERE id = ?");
        return $stmt->execute([$groupId]);
    }

    public function joinStudyGroup($userId, $groupId) {
        $stmt = $this->prepare("SELECT 1 FROM group_members WHERE user_id = ? AND group_id = ?");
        $stmt->execute([$userId, $groupId]);

        if ($stmt->fetch()) {
            return false;
        }

        $stmt = $this->prepare("INSERT INTO group_members (user_id, group_id) VALUES (?, ?)");
        return $stmt->execute([$userId, $groupId]);
    }

     public function leaveStudyGroup($userId, $groupId) {
        $stmt = $this->prepare("DELETE FROM group_members WHERE user_id = ? AND group_id = ?");
        return $stmt->execute([$userId, $groupId]);
    }

    public function getGroupMembers($groupId) {
        $stmt = $this->prepare("SELECT u.* FROM users u JOIN group_members gm ON u.id = gm.user_id WHERE gm.group_id = ?");
        $stmt->execute([$groupId]);
        return $stmt->fetchAll();
    }

    // Comment Functions
    public function addGroupComment($userId, $groupId, $text) {
        $stmt = $this->prepare("INSERT INTO group_comments (user_id, group_id, text) VALUES (?, ?, ?)");
        $stmt->execute([$userId, $groupId, $text]);
        return $this->pdo->lastInsertId();
    }

    public function getGroupComments($groupId) {
        $stmt = $this->prepare("SELECT c.*, u.username 
                               FROM group_comments c 
                               JOIN users u ON c.user_id = u.id
                               WHERE c.group_id = ?
                               ORDER BY c.created_at ASC");
        $stmt->execute([$groupId]);
        return $stmt->fetchAll();
    }

     public function getGroupCommentById($commentId) {
        $stmt = $this->prepare("SELECT c.*, u.username FROM group_comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ?");
        $stmt->execute([$commentId]);
        return $stmt->fetch();
    }

    public function updateGroupComment($commentId, $text) {
        $stmt = $this->prepare("UPDATE group_comments SET text = ? WHERE id = ?");
        return $stmt->execute([$text, $commentId]);
    }

    public function deleteGroupComment($commentId) {
        $stmt = $this->prepare("DELETE FROM group_comments WHERE id = ?");
        return $stmt->execute([$commentId]);
    }
}
