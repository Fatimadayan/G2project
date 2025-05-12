<?php
require 'config.php';

$title = $_POST['title'] ?? '';
$description = $_POST['description'] ?? '';
$category = $_POST['category'] ?? '';
$type = $_POST['type'] ?? '';
$file_path = '';

// Validate required fields
if (!$title || !$description || !$category || !$type) {
  die("Missing required fields.");
}

// Handle link
if ($type === 'link') {
  $file_path = $_POST['file_path_link'] ?? '';
  if (!filter_var($file_path, FILTER_VALIDATE_URL)) {
    die("Invalid URL for link type.");
  }
}

// Handle PDF upload
if ($type === 'pdf' && isset($_FILES['file_path_pdf']) && $_FILES['file_path_pdf']['error'] === UPLOAD_ERR_OK) {
  $uploadDir = 'uploads/';
  $filename = basename($_FILES['file_path_pdf']['name']);
  $targetFile = $uploadDir . time() . "_" . $filename;

  $fileType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
  if ($fileType !== 'pdf') {
    die("Only PDF files are allowed.");
  }

  if (move_uploaded_file($_FILES['file_path_pdf']['tmp_name'], $targetFile)) {
    $file_path = $targetFile;
  } else {
    die("Failed to upload file.");
  }
} elseif ($type === 'pdf') {
  die("PDF file is required for type 'pdf'.");
}

try {
  $stmt = $pdo->prepare("INSERT INTO notes (title, description, category, type, file_path) VALUES (?, ?, ?, ?, ?)");
  $stmt->execute([$title, $description, $category, $type, $file_path]);

  echo "Note added successfully! <a href='index.php'>Go back</a>";
} catch (PDOException $e) {
  echo "Error: " . $e->getMessage();
}
?>
