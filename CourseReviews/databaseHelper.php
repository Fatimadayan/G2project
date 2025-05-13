<?php
class databaseHelper {
    private $host;
    private $dbName;
    private $username;
    private $password;
    private $pdo;

    public function __construct($host, $dbName, $username, $password) {
        $this->host = $host;
        $this->dbName = $dbName;
        $this->username = $username;
        $this->password = $password;
    }

    public function getPDO() {
        if (!$this->pdo) {
            $this->pdo = new PDO("mysql:host={$this->host};charset=utf8mb4", $this->username, $this->password);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->exec("CREATE DATABASE IF NOT EXISTS `{$this->dbName}`");
            $this->pdo->exec("USE `{$this->dbName}`");
        }
        return $this->pdo;
    }

    public function createAndPopulateCoursesTables() {
        $this->exec("CREATE TABLE IF NOT EXISTS courses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            rating FLOAT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $this->exec("CREATE TABLE IF NOT EXISTS comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            text TEXT NOT NULL,
            date DATETIME NOT NULL,
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $stmt = $this->query("SELECT COUNT(*) FROM `courses`");
        $count = $stmt->fetchColumn();
        if ($count == 0) {
            $sampleCourses = [
                [
                    'id' => 1,
                    'title' => 'ITCS333: Internet Software Development',
                    'description' => 'This course offers amazing detailed information on how to create stylish, interactive, and responsive webpages.',
                    'rating' => 4.5,
                    'comments' => [
                        [
                            'id' => 1,
                            'name' => 'Ahmed Ali',
                            'date' => '2025-04-17',
                            'text' => 'Great course! Learned a lot about web development.'
                        ],
                        [
                            'id' => 2,
                            'name' => 'Sara Hassan',
                            'date' => '2025-04-19',
                            'text' => 'The projects were challenging but very rewarding.'
                        ]
                    ]
                ],
                [
                    'id' => 2,
                    'title' => 'ITCS113: Introduction to Programming',
                    'description' => 'This course offers a comprehensive introduction to programming concepts.',
                    'rating' => 4.0,
                    'comments' => []
                ],
                [
                    'id' => 3,
                    'title' => 'ITCS214: Data Structures',
                    'description' => 'This course provides a specialized format for organizing, processing, retrieving, and storing data.',
                    'rating' => 4.2,
                    'comments' => [
                        [
                            'id' => 3,
                            'name' => 'Mohammed Khalid',
                            'date' => '2025-03-10',
                            'text' => 'One of the most useful courses for computer science students.'
                        ]
                    ]
                ],
                [
                    'id' => 4,
                    'title' => 'ITCS254: Discrete Structures I',
                    'description' => 'This course shows combinations, graphs, and logical statements.',
                    'rating' => 4.1,
                    'comments' => [
                        [
                            'id' => 4,
                            'name' => 'Fatima Youssef',
                            'date' => '2025-04-02',
                            'text' => 'Very theoretical but essential for understanding algorithms.'
                        ]
                    ]
                ],
                [
                    'id' => 5,
                    'title' => 'ITCS342: Design of Algorithms',
                    'description' => 'Describes a set of commands that must be followed for a computer to perform calculations.',
                    'rating' => 4.7,
                    'comments' => []
            ];

            $courseStmt = $this->prepare("INSERT INTO courses (
                id, title, description, rating
            ) VALUES (
                ?, ?, ?, ?
            )");

            $commentStmt = $this->prepare("INSERT INTO comments (
                id, course_id, name, text, date
            ) VALUES (
                ?, ?, ?, ?, ?
            )");

            foreach ($sampleCourses as $course) {
                $courseStmt->execute([
                    $course['id'],
                    $course['title'],
                    $course['description'],
                    $course['rating']
                ]);

                if (isset($course['comments']) && is_array($course['comments'])) {
                    foreach ($course['comments'] as $comment) {
                        $commentDate = date('Y-m-d H:i:s', strtotime($comment['date']));

                        $commentStmt->execute([
                            $comment['id'],
                            $course['id'],
                            $comment['name'],
                            $comment['text'],
                            $commentDate
                        ]);
                    }
                }
            }

            return $sampleCourses;
        }

        return [];
    }

    public function query($sql) {
        return $this->getPDO()->query($sql);
    }

    public function exec($sql) {
        return $this->getPDO()->exec($sql);
    }

    public function prepare($sql) {
        return $this->getPDO()->prepare($sql);
    }

    public function getAllCourses($page = null, $limit = null) {
        $this->createAndPopulateCoursesTables();
        
        $sql = "SELECT * FROM courses ORDER BY title ASC";
        
        if ($page !== null && $limit !== null) {
            $page = filter_var($page, FILTER_VALIDATE_INT);
            $limit = filter_var($limit, FILTER_VALIDATE_INT);
            
            // Ensure valid pagination parameters
            if ($page < 1) $page = 1;
            if ($limit < 1) $limit = 10;
            
            $offset = ($page - 1) * $limit;
            $sql .= " LIMIT $offset, $limit";
        }
        
        $stmt = $this->prepare($sql);
        $stmt->execute();
        $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return $courses;
    }

    public function getCourseCount() {
        $stmt = $this->prepare("SELECT COUNT(*) FROM courses");
        $stmt->execute();
        
        return (int)$stmt->fetchColumn();
    }

    public function getCourse($id) {
        $id = filter_var($id, FILTER_VALIDATE_INT);
        if (!$id) {
            return false;
        }
        
        $stmt = $this->prepare("SELECT * FROM courses WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createCourse($course) {
        $sanitizedCourse = $this->sanitizeCourseData($course);
        if (!$this->validateCourseData($sanitizedCourse)) {
            return false;
        }
        
        $stmt = $this->prepare("INSERT INTO courses (title, description, rating) VALUES (?, ?, ?)");
        return $stmt->execute([
            $sanitizedCourse['title'], 
            $sanitizedCourse['description'],
            $sanitizedCourse['rating'] ?? 0
        ]);
    }

    public function updateCourse($id, $course) {
        $id = filter_var($id, FILTER_VALIDATE_INT);
        if (!$id) {
            return false;
        }
        
        $checkStmt = $this->prepare("SELECT COUNT(*) FROM courses WHERE id = ?");
        $checkStmt->execute([$id]);
        $courseExists = (int)$checkStmt->fetchColumn() > 0;

        if (!$courseExists) {
            return false;
        }

        $sanitizedCourse = $this->sanitizeCourseData($course);
        if (!$this->validateCourseData($sanitizedCourse)) {
            return false;
        }

        $stmt = $this->prepare("UPDATE courses SET title=?, description=?, rating=? WHERE id=?");
        return $stmt->execute([
            $sanitizedCourse['title'], 
            $sanitizedCourse['description'],
            $sanitizedCourse['rating'] ?? 0,
            $id
        ]);
    }

    public function deleteCourse($id) {
        $id = filter_var($id, FILTER_VALIDATE_INT);
        if (!$id) {
            return false;
        }
        
        $checkStmt = $this->prepare("SELECT COUNT(*) FROM courses WHERE id = ?");
        $checkStmt->execute([$id]);
        $courseExists = (int)$checkStmt->fetchColumn() > 0;

        if (!$courseExists) {
            return false;
        }

        $commentStmt = $this->prepare("DELETE FROM comments WHERE course_id = ?");
        $commentStmt->execute([$id]);

        $courseStmt = $this->prepare("DELETE FROM courses WHERE id = ?");
        return $courseStmt->execute([$id]);
    }

    public function getComments($course_id) {
        $course_id = filter_var($course_id, FILTER_VALIDATE_INT);
        if (!$course_id) {
            return [];
        }
        
        $stmt = $this->prepare("SELECT * FROM comments WHERE course_id = ? ORDER BY date ASC");
        $stmt->execute([$course_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addComment($course_id, $name, $text) {
        $course_id = filter_var($course_id, FILTER_VALIDATE_INT);
        if (!$course_id) {
            return false;
        }
        
        $name = trim(htmlspecialchars($name));
        $text = trim(htmlspecialchars($text));
        
        if (empty($name) || empty($text) || strlen($name) > 100 || strlen($text) > 2000) {
            return false;
        }
        
        $checkStmt = $this->prepare("SELECT COUNT(*) FROM courses WHERE id = ?");
        $checkStmt->execute([$course_id]);
        $courseExists = (int)$checkStmt->fetchColumn() > 0;

        if (!$courseExists) {
            return false;
        }

        $stmt = $this->prepare("INSERT INTO comments (course_id, name, text, date) VALUES (?, ?, ?, NOW())");
        $result = $stmt->execute([$course_id, $name, $text]);
        
        if ($result) {
            return $this->getPDO()->lastInsertId();
        }
        
        return false;
    }
    
    public function getComment($comment_id) {
        $comment_id = filter_var($comment_id, FILTER_VALIDATE_INT);
        if (!$comment_id) {
            return false;
        }
        
        $stmt = $this->prepare("SELECT * FROM comments WHERE id = ?");
        $stmt->execute([$comment_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function updateComment($comment_id, $text) {
        $comment_id = filter_var($comment_id, FILTER_VALIDATE_INT);
        if (!$comment_id) {
            return false;
        }
        
        $text = trim(htmlspecialchars($text));
        
        if (empty($text) || strlen($text) > 2000) {
            return false;
        }
        
        $checkStmt = $this->prepare("SELECT COUNT(*) FROM comments WHERE id = ?");
        $checkStmt->execute([$comment_id]);
        $commentExists = (int)$checkStmt->fetchColumn() > 0;

        if (!$commentExists) {
            return false;
        }

        $stmt = $this->prepare("UPDATE comments SET text = ?, date = NOW() WHERE id = ?");
        return $stmt->execute([$text, $comment_id]);
    }
    
    public function deleteComment($comment_id) {
        $comment_id = filter_var($comment_id, FILTER_VALIDATE_INT);
        if (!$comment_id) {
            return false;
        }
        
        $checkStmt = $this->prepare("SELECT COUNT(*) FROM comments WHERE id = ?");
        $checkStmt->execute([$comment_id]);
        $commentExists = (int)$checkStmt->fetchColumn() > 0;

        if (!$commentExists) {
            return false;
        }

        $stmt = $this->prepare("DELETE FROM comments WHERE id = ?");
        return $stmt->execute([$comment_id]);
    }
    
    private function sanitizeCourseData($course) {
        $sanitized = [];
        
        $textFields = ['title', 'description'];
        foreach ($textFields as $field) {
            if (isset($course[$field])) {
                $sanitized[$field] = trim(htmlspecialchars($course[$field]));
            } else {
                $sanitized[$field] = null;
            }
        }
        
        if (isset($course['rating'])) {
            $sanitized['rating'] = filter_var($course['rating'], FILTER_VALIDATE_FLOAT);
            if ($sanitized['rating'] === false) {
                $sanitized['rating'] = 0;
            } else {
                $sanitized['rating'] = max(0, min(5, $sanitized['rating']));
            }
        } else {
            $sanitized['rating'] = 0;
        }
        
        return $sanitized;
    }
    
    private function validateCourseData($course) {
        $requiredFields = ['title', 'description'];
        foreach ($requiredFields as $field) {
            if (empty($course[$field])) {
                return false;
            }
        }
        
        return true;
    }
}