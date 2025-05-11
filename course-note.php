<?php
include 'config.php';

$title = $_POST['title'];
$description = $_POST['description'];
$category = $_POST['category'];
$type = $_POST['type'];
$file_path = '';

// Handle link
if ($type === 'link') {
  $file_path = $_POST['file_path_link'];
}

// Handle PDF upload
if ($type === 'pdf' && isset($_FILES['file_path_pdf'])) {
  $uploadDir = 'uploads/';
  $filename = basename($_FILES['file_path_pdf']['name']);
  $targetFile = $uploadDir . time() . "_" . $filename;

  if (move_uploaded_file($_FILES['file_path_pdf']['tmp_name'], $targetFile)) {
    $file_path = $targetFile;
  } else {
    die("Failed to upload file.");
  }
}
$stmt = $conn->prepare("INSERT INTO notes (title, description, category, type, file_path) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $title, $description, $category, $type, $file_path);

if ($stmt->execute()) {
  echo "Note added successfully! <a href='index.php'>Go back</a>";
} else {
  echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>
