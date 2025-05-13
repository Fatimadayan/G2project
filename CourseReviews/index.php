<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'databaseHelper.php';

$db = new DatabaseHelper('localhost', getenv("db_name"), getenv("db_user"), getenv("db_pass"));

$method = $_SERVER['REQUEST_METHOD'];

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

try {
    if ($method === 'GET') {
        if (empty($_GET) || (!isset($_GET['action']) && !isset($_GET['id']))) {
            $courses = $db->getAllCourses();
            respond($courses);
        }

        $action = isset($_GET['action']) ? filter_var($_GET['action'], FILTER_SANITIZE_SPECIAL_CHARS) : null;
        $id = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;

        if ($action === 'courses') {
            if (isset($id) && $id !== false) {
                $course = $db->getCourse($id);
                $course ? respond($course) : respond(['error' => 'Course not found'], 404);
            } else {
                $page = isset($_GET['page']) ? filter_var($_GET['page'], FILTER_VALIDATE_INT) : null;
                $limit = isset($_GET['limit']) ? filter_var($_GET['limit'], FILTER_VALIDATE_INT) : null;

                $courses = $db->getAllCourses($page, $limit);
                $totalCourses = $db->getCourseCount();
                $jsonData = $courses;

                if ($page !== null && $limit !== null) {
                    $jsonData = [
                        "courses" => $courses,
                        "pagination" => [
                            "currentPage" => $page,
                            "itemsPerPage" => $limit,
                            "totalItems" => $totalCourses,
                            "totalPages" => ceil($totalCourses / $limit)
                        ]
                    ];
                }
                respond($jsonData);
            }
        } elseif ($action === 'comments') {
            if (isset($id) && $id !== false) {
                $comments = $db->getComments($id);
                respond($comments);
            } else {
                respond(['error' => 'Missing or invalid course ID'], 400);
            }
        } else {
            
            if (isset($id) && $id !== false) {
                $course = $db->getCourse($id);
                $course ? respond($course) : respond(['error' => 'Course not found'], 404);
            } else {
                respond(['error' => 'Invalid action'], 400);
            }
        }
    } elseif ($method === 'POST') {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $data = $_POST;
        }

        $action = isset($data['action']) ? filter_var($data['action'], FILTER_SANITIZE_SPECIAL_CHARS) : null;
        
        if ($action === 'courses') {
            if (isset($data['title'], $data['description'])) {
                if ($db->createCourse($data)) {
                    respond(['message' => 'Course created successfully'], 201);
                } else {
                    respond(['error' => 'Failed to create course. Please check your input data.'], 400);
                }
            } else {
                respond(['error' => 'Missing required fields'], 400);
            }
        } elseif ($action === 'comments') {
            $course_id = isset($data['course_id']) ? filter_var($data['course_id'], FILTER_VALIDATE_INT) : null;
            $name = isset($data['name']) ? trim($data['name']) : '';
            $text = isset($data['text']) ? trim($data['text']) : '';
            if ($course_id !== false && $course_id > 0 && !empty($name) && !empty($text)) {
                $commentId = $db->addComment($course_id, $name, $text);
                if ($commentId) {
                    $newComment = [
                        'id' => $commentId,
                        'course_id' => $course_id,
                        'name' => $name,
                        'text' => $text,
                        'date' => date('Y-m-d H:i:s')
                    ];
                    respond(['message' => 'Comment added', 'comment' => $newComment], 201);
                } else {
                    respond(['error' => 'Failed to add comment'], 400);
                }
            } else {
                respond(['error' => 'Missing or invalid required fields'], 400);
            }
        } else {
            respond(['error' => 'Invalid action'], 400);
        }
    } elseif ($method === 'PUT') {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            parse_str(file_get_contents('php://input'), $data);
        }
        
        $action = isset($data['action']) ? filter_var($data['action'], FILTER_SANITIZE_SPECIAL_CHARS) : null;
        
        if ($action === 'courses') {
            $id = isset($data['id']) ? filter_var($data['id'], FILTER_VALIDATE_INT) : null;
            if ($id !== false && $id > 0 && isset($data['title'], $data['description'])) {
                if ($db->updateCourse($id, $data)) {
                    respond(['message' => 'Course updated']);
                } else {
                    respond(['error' => 'Failed to update course or course not found'], 400);
                }
            } else {
                respond(['error' => 'Missing or invalid required fields'], 400);
            }
        } elseif ($action === 'comments') {
            $comment_id = isset($data['comment_id']) ? filter_var($data['comment_id'], FILTER_VALIDATE_INT) : null;
            $text = isset($data['text']) ? trim($data['text']) : '';
            
            if ($comment_id !== false && $comment_id > 0 && !empty($text)) {
                if ($db->updateComment($comment_id, $text)) {
                    respond(['message' => 'Comment updated']);
                } else {
                    respond(['error' => 'Failed to update comment or comment not found'], 400);
                }
            } else {
                respond(['error' => 'Missing or invalid required fields'], 400);
            }
        } else {
            respond(['error' => 'Invalid action'], 400);
        }
    } elseif ($method === 'DELETE') {
        $action = isset($_GET['action']) ? filter_var($_GET['action'], FILTER_SANITIZE_SPECIAL_CHARS) : null;
        
        if ($action === 'courses') {
            $id = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;
            if ($id !== false && $id > 0) {
                if ($db->deleteCourse($id)) {
                    respond(['message' => 'Course deleted']);
                } else {
                    respond(['error' => 'Failed to delete course or course not found'], 400);
                }
            } else {
                respond(['error' => 'Missing or invalid ID'], 400);
            }
        } elseif ($action === 'comments') {
            $id = isset($_GET['comment_id']) ? filter_var($_GET['comment_id'], FILTER_VALIDATE_INT) : null;
            if ($id !== false && $id > 0) {
                if ($db->deleteComment($id)) {
                    respond(['message' => 'Comment deleted']);
                } else {
                    respond(['error' => 'Failed to delete comment or comment not found'], 400);
                }
            } else {
                respond(['error' => 'Missing or invalid comment ID'], 400);
            }
        } else {
            respond(['error' => 'Invalid action'], 400);
        }
    } else {
        respond(['error' => 'Invalid HTTP method'], 405);
    }
} catch (Exception $e) {
    respond(['error' => $e->getMessage()], 500);
}
?>