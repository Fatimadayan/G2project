<?php
/**
 * Database Helper Class for Course Notes using SQLite (for Replit)
 */
    class CourseNotesDatabaseHelper {
    private $pdo;

    public function __construct() {
        //  Use SQLite file (works on Replit)
        $this->pdo = new PDO("sqlite:" . __DIR__ . "/course_notes.db");
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Create table and insert sample data if needed
        $this->createCourseNotesTable();
        $this->populateSampleCourseNotes(); // Optional: comment this after first run
    }

        public function getPDO() {
        return $this->pdo;
    }

        public function query($sql) {
        return $this->pdo->query($sql);
    }

        public function prepare($sql) {
        return $this->pdo->prepare($sql);
    }

        public function exec($sql) {
        return $this->pdo->exec($sql);
    }

        public function createCourseNotesTable() {
        // SQLite-compatible schema
        $sql = "CREATE TABLE IF NOT EXISTS course_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            file_path TEXT,
            file_type TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        $this->exec($sql);
     }

        public function insertCourseNote($title, $description, $category, $filePath, $fileType) {
        $this->createCourseNotesTable();
        $stmt = $this->prepare("INSERT INTO course_notes (title, description, category, file_path, file_type) VALUES (?, ?, ?, ?, ?)");
        return $stmt->execute([$title, $description, $category, $filePath, $fileType]);
    }

        public function getCourseNotes($searchTerm = '', $category = '', $page = 1, $perPage = 5) {
        $this->createCourseNotesTable();
        $this->populateSampleCourseNotes();

            $offset = ($page - 1) * $perPage;
        $sql = "SELECT * FROM course_notes";
        $countSql = "SELECT COUNT(*) FROM course_notes";
        $params = [];

            $whereClause = "";

        if (!empty($searchTerm)) {
            $whereClause .= " title LIKE ? OR description LIKE ?";
            $params[] = "%$searchTerm%";
            $params[] = "%$searchTerm%";
        }

        if (!empty($category)) {
            if (!empty($whereClause)) {
                $whereClause = "($whereClause) AND category = ?";
            } else {
                $whereClause = " category = ?";
            }
            $params[] = $category;
        }

            if (!empty($whereClause)) {
            $sql .= " WHERE $whereClause";
            $countSql .= " WHERE $whereClause";
        }

        $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $limitParams = $params;
        $limitParams[] = $perPage;
        $limitParams[] = $offset;
            $countStmt = $this->prepare($countSql);
        $countStmt->execute($params);
        $totalCount = $countStmt->fetchColumn();
         $stmt = $this->prepare($sql);
        $stmt->execute($limitParams);
        $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'total' => $totalCount,
            'notes' => $notes
        ];
    }

        public function getCourseNoteById($id) {
        $stmt = $this->prepare("SELECT * FROM course_notes WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

        public function populateSampleCourseNotes() {
        $stmt = $this->query("SELECT COUNT(*) FROM course_notes");
        $count = $stmt->fetchColumn();

            if ($count == 0) {
           // Sample course notes data
            $sampleNotes = [
                [
                    'title' => 'Introduction to Computer Science',
                    'description' => 'Basic concepts of computer science including algorithms, data structures, and computational thinking.',
                    'category' => 'CS',
                    'file_path' => 'https://example.com/intro-cs',
                    'file_type' => 'link'
                ],
                [
                    'title' => 'Network Fundamentals',
                    'description' => 'Overview of computer networking concepts including OSI model, TCP/IP, and routing principles.',
                    'category' => 'NE',
                    'file_path' => 'sample_files/network_basics.pdf',
                    'file_type' => 'pdf'
                ],
                [
                    'title' => 'Information Security Basics',
                    'description' => 'Introduction to information security principles, threat modeling, and basic security controls.',
                    'category' => 'IS',
                    'file_path' => 'https://example.com/security-basics',
                    'file_type' => 'link'
                ],
                [
                    'title' => 'Cybersecurity Essentials',
                    'description' => 'Overview of cybersecurity concepts, attack vectors, defense strategies, and common vulnerabilities.',
                    'category' => 'CY',
                    'file_path' => 'sample_files/cybersecurity.pdf',
                    'file_type' => 'pdf'
                ],
                [
                    'title' => 'Computer Engineering Principles',
                    'description' => 'Study of digital logic, computer architecture, and hardware/software integration.',
                    'category' => 'CE',
                    'file_path' => 'https://example.com/computer-engineering',
                    'file_type' => 'link'
                ],
                [
                    'title' => 'Advanced Data Structures',
                    'description' => 'Implementation and analysis of complex data structures including trees, graphs, and advanced algorithms.',
                    'category' => 'CS',
                    'file_path' => 'sample_files/advanced_ds.pdf',
                    'file_type' => 'pdf'
                ],
                [
                    'title' => 'Cloud Computing',
                    'description' => 'Introduction to cloud architectures, services, deployment models, and security considerations.',
                    'category' => 'NE',
                    'file_path' => 'https://example.com/cloud-computing',
                    'file_type' => 'link'
                ],
                [
                    'title' => 'Database Management Systems',
                    'description' => 'Database design, normalization, SQL, transaction processing, and modern database technologies.',
                    'category' => 'IS',
                    'file_path' => 'sample_files/dbms.pdf',
                    'file_type' => 'pdf'
                ],
                    [
                    'title' => 'IS103 - Intro to Programming',
                    'description' => 'Learn the basics of Python and how to write simple programs.',
                    'category' => 'IS',
                    'file_path' => 'https://example.com/is103',
                    'file_type' => 'link'
                ],
                [
                    'title' => 'NE101 - Networking Basics',
                    'description' => 'Introduction to networks, IP addressing, and data flow.',
                    'category' => 'NE',
                    'file_path' => 'https://example.com/ne101',
                    'file_type' => 'link'
                ],
                [
                    'title' => 'IS213 - Database Systems',
                    'description' => 'Understanding relational databases and SQL queries.',
                    'category' => 'IS',
                    'file_path' => 'https://example.com/is213',
                    'file_type' => 'link'
                ],
                [
                    'title' => 'CY110 - Cybersecurity Fundamentals',
                    'description' => 'Explore key principles in protecting digital systems.',
                    'category' => 'CY',
                    'file_path' => 'https://example.com/cy110',
                    'file_type' => 'link'
                ],
                [
                    'title' => 'CS342 - Digital Logic Design',
                    'description' => 'Basics of digital circuits and binary systems.',
                    'category' => 'CS',
                    'file_path' => 'https://example.com/cs342',
                    'file_type' => 'link'
                ],
                [
                    'title' => 'CS333 - Web Development',
                    'description' => 'Build modern websites using HTML, CSS, and JS.',
                    'category' => 'CS',
                    'file_path' => 'https://example.com/cs333',
                    'file_type' => 'link'
                ],
                [
                    'title' => 'NE231 - Advanced Networking',
                    'description' => 'Protocols, routing, and switching concepts.',
                    'category' => 'NE',
                    'file_path' => 'https://example.com/ne231',
                    'file_type' => 'link'
                ],
                [
                    'title' => 'IS310 - Systems Analysis',
                    'description' => 'How to analyze and design information systems.',
                    'category' => 'IS',
                    'file_path' => 'https://example.com/is310',
                    'file_type' => 'link'
                ],
                [
                    'title' => 'CY470 - Ethical Hacking',
                    'description' => 'Learn about penetration testing techniques.',
                    'category' => 'CY',
                    'file_path' => 'https://example.com/cy470',
                    'file_type' => 'link'
                ],
                [
                    'title' => 'CE250 - Embedded Systems',
                    'description' => 'Programming microcontrollers and embedded devices.',
                    'category' => 'CE',
                    'file_path' => 'https://example.com/ce250',
                    'file_type' => 'link'
                ],
                [
                    'title' => 'Other Course',
                    'description' => 'Miscellaneous notes that don\'t fit other categories.',
                    'category' => 'ANOTHER',
                    'file_path' => 'https://example.com/other',
                    'file_type' => 'link'
                ]
            ];

            $stmt = $this->prepare("INSERT INTO course_notes (title, description, category, file_path, file_type) VALUES (?, ?, ?, ?, ?)");
            foreach ($sampleNotes as $note) {
                $stmt->execute([
                    $note['title'],
                    $note['description'],
                    $note['category'],
                    $note['file_path'],
                    $note['file_type']
                ]);
         }
     }
    }

     public function deleteCourseNote($id) {
        $stmt = $this->prepare("DELETE FROM course_notes WHERE id = ?");
        return $stmt->execute([$id]);
    }

        public function updateCourseNote($id, $data) {
        $allowedFields = ['title', 'description', 'category', 'file_path', 'file_type'];
        $setClause = [];
        $params = [];

        foreach ($data as $field => $value) {
            if (in_array($field, $allowedFields)) {
                $setClause[] = "$field = ?";
                $params[] = $value;
            }
        }

        if (empty($setClause)) return false;

        $sql = "UPDATE course_notes SET " . implode(', ', $setClause) . " WHERE id = ?";
        $params[] = $id;

        $stmt = $this->prepare($sql);
        return $stmt->execute($params);
    }
}
?>



            

        