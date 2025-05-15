<?php
//  Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

//  Include database helper (uses SQLite)
require_once 'CourseNotesDatabaseHelper.php';
$dbHelper = new CourseNotesDatabaseHelper();

//  Read requested action
$action = $_GET['action'] ?? '';

// Function to get detailed error information
function getUploadErrorMessage($error_code) {
    switch ($error_code) {
        case UPLOAD_ERR_INI_SIZE:
            return "The uploaded file exceeds the upload_max_filesize directive in php.ini";
        case UPLOAD_ERR_FORM_SIZE:
            return "The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form";
        case UPLOAD_ERR_PARTIAL:
            return "The uploaded file was only partially uploaded";
        case UPLOAD_ERR_NO_FILE:
            return "No file was uploaded";
        case UPLOAD_ERR_NO_TMP_DIR:
            return "Missing a temporary folder";
        case UPLOAD_ERR_CANT_WRITE:
            return "Failed to write file to disk";
        case UPLOAD_ERR_EXTENSION:
            return "A PHP extension stopped the file upload";
        default:
            return "Unknown upload error";
    }
}

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
            $errors = [];
            $title = $_POST['title'] ?? '';
            $description = $_POST['description'] ?? '';
            $category = $_POST['category'] ?? '';
            $type = $_POST['type'] ?? '';
            $filePath = '';

            if (empty($title)) $errors[] = "Title is required";
            if (empty($description)) $errors[] = "Description is required";
            if (empty($category)) $errors[] = "Category is required";
            if (empty($type)) $errors[] = "Type is required";

            if (!empty($errors)) {
                throw new Exception(implode(", ", $errors));
            }

            if ($type === 'pdf') {
                // Detailed error checking for file uploads
                if (!isset($_FILES['file_path_pdf'])) {
                    throw new Exception('No PDF file was provided');
                }

                if ($_FILES['file_path_pdf']['error'] !== UPLOAD_ERR_OK) {
                    throw new Exception('File upload error: ' . getUploadErrorMessage($_FILES['file_path_pdf']['error']));
                }

                // Validate file is actually a PDF
                $finfo = new finfo(FILEINFO_MIME_TYPE);
                $mime = $finfo->file($_FILES['file_path_pdf']['tmp_name']);
                if ($mime !== 'application/pdf') {
                    throw new Exception('Uploaded file is not a PDF (detected: ' . $mime . ')');
                }

                // Create upload directory with error checking
                $uploadDir = __DIR__ . '/uploads/';
                if (!is_dir($uploadDir)) {
                    if (!mkdir($uploadDir, 0755, true)) {
                        throw new Exception('Failed to create upload directory. Check server permissions.');
                    }
                }

                // Check if directory is writable
                if (!is_writable($uploadDir)) {
                    throw new Exception('Upload directory is not writable. Check server permissions.');
                }

                // Generate safe filename and full path
                $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9_.-]/', '_', basename($_FILES['file_path_pdf']['name']));
                $filePathAbs = $uploadDir . $fileName;
                $filePathRel = 'uploads/' . $fileName;

                // Attempt to move the file with better error handling
                if (!move_uploaded_file($_FILES['file_path_pdf']['tmp_name'], $filePathAbs)) {
                    throw new Exception('Failed to move uploaded file. Check permissions and available disk space.');
                }

                // Verify file was actually created
                if (!file_exists($filePathAbs)) {
                    throw new Exception('File move reported success but file does not exist at target location.');
                }

                $filePath = $filePathRel;
                
            } elseif ($type === 'link') {
                $filePath = $_POST['file_path_link'] ?? '';
                if (!filter_var($filePath, FILTER_VALIDATE_URL)) {
                    throw new Exception('Invalid URL format');
                }
            } else {
                throw new Exception('Invalid file type. Must be "pdf" or "link".');
            }

            $saved = $dbHelper->insertCourseNote($title, $description, $category, $filePath, $type);
            
            if (!$saved) {
                throw new Exception('Database error: Failed to save course note');
            }
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Course note added successfully',
                'data' => [
                    'title' => $title,
                    'description' => $description,
                    'category' => $category,
                    'file_path' => $filePath,
                    'file_type' => $type
                ]
            ]);
            break;

        case 'view-note':
            $id = (int)($_GET['id'] ?? 0);
            if (!$id) {
                throw new Exception('Invalid ID');
            }

            $note = $dbHelper->getCourseNoteById($id);
            if (!$note) {
                throw new Exception('Note not found');
            }

            echo json_encode([
                'status' => 'success',
                'data' => $note
            ]);
            break;

        default:
            throw new Exception('Unknown action: ' . $action);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'debug_info' => [
            'action' => $action,
            'post_data' => $_POST,
            'files' => isset($_FILES) ? array_keys($_FILES) : 'No files'
        ]
    ]);
}
?>