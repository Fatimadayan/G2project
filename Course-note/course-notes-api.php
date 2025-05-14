<?php
//  CORS HEADERS - must be first!
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

//  Include the DB helper (SQLite version)
require_once 'CourseNotesDatabaseHelper.php';

//  Initialize DB helper using SQLite
$dbHelper = new CourseNotesDatabaseHelper();

//  Routing by action
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'ping':
            echo json_encode(['status' => 'success', 'message' => 'API is online']);
            break;

        case 'get-courses':
            $search = $_GET['search'] ?? '';
            $category = $_GET['category'] ?? '';
            $page = (int)($_GET['page'] ?? 1);
            $perPage = (int)($_GET['per_page'] ?? 5);
            $result = $dbHelper->getCourseNotes($search, $category, $page, $perPage);
            echo json_encode([
                'status' => 'success',
                'data' => $result['notes'],
                'pagination' => [
                    'total' => $result['total'],
                    'per_page' => $perPage,
                    'current_page' => $page,
                    'total_pages' => ceil($result['total'] / $perPage)
                ]
            ]);
            break;

        case 'add-course':
            $title = $_POST['title'] ?? '';
            $description = $_POST['description'] ?? '';
            $category = $_POST['category'] ?? '';
            $type = $_POST['type'] ?? '';
            $filePath = '';

            if ($type === 'pdf') {
                if (!isset($_FILES['file_path_pdf'])) {
                    throw new Exception('No PDF uploaded');
                }

                $uploadDir = __DIR__ . '/uploads/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
                $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9_.-]/', '_', basename($_FILES['file_path_pdf']['name']));
                $filePath = 'uploads/' . $fileName;
                if (!move_uploaded_file($_FILES['file_path_pdf']['tmp_name'], $uploadDir . $fileName)) {
                    throw new Exception('Failed to upload PDF');
                }
            } elseif ($type === 'link') {
                $filePath = $_POST['file_path_link'] ?? '';
                if (!filter_var($filePath, FILTER_VALIDATE_URL)) {
                    throw new Exception('Invalid link');
                }
            } else {
                throw new Exception('Invalid type');
            }

            $saved = $dbHelper->insertCourseNote($title, $description, $category, $filePath, $type);
            echo json_encode(['status' => $saved ? 'success' : 'error', 'message' => $saved ? 'Note added' : 'Save failed']);
            break;

        case 'view-note':
            $id = (int)($_GET['id'] ?? 0);
            if (!$id) throw new Exception('Invalid ID');
            $note = $dbHelper->getCourseNoteById($id);
            if (!$note) throw new Exception('Note not found');
            echo json_encode(['status' => 'success', 'data' => $note]);
            break;

        default:
            throw new Exception('Unknown action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
