<?php
/**
 * Database Helper Class for Course Notes
 * 
 * This class provides methods for database operations
 * using PDO for MySQL connections for the Course Notes application.
 */
class CourseNotesDatabaseHelper {
    private $host;
    private $dbName;
    private $username;
    private $password;
    private $pdo;

    /**
     * Constructor
     * 
     * @param string $host Database host
     * @param string $dbName Database name
     * @param string $username Database username
     * @param string $password Database password
     */
    public function __construct($host, $dbName, $username, $password) {
        $this->host = $host;
        $this->dbName = $dbName;
        $this->username = $username;
        $this->password = $password;
    }

    /**
     * Get PDO connection
     * 
     * @return PDO The PDO connection object
     * @throws PDOException If connection fails
     */
    public function getPDO() {
        if (!$this->pdo) {
            // Create initial connection to MySQL server
            $this->pdo = new PDO("mysql:host={$this->host};charset=utf8mb4", 
                                $this->username, 
                                $this->password);

            // Set error mode to exceptions
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Create database if it doesn't exist
            $this->pdo->exec("CREATE DATABASE IF NOT EXISTS `{$this->dbName}`");
            $this->pdo->exec("USE `{$this->dbName}`");
        }

        return $this->pdo;
    }

    /**
     * Execute a query
     * 
     * @param string $sql SQL query to execute
     * @return PDOStatement The result of the query
     * @throws PDOException If query fails
     */
    public function query($sql) {
        return $this->getPDO()->query($sql);
    }

    /**
     * Prepare a statement
     * 
     * @param string $sql SQL statement to prepare
     * @return PDOStatement The prepared statement
     * @throws PDOException If preparation fails
     */
    public function prepare($sql) {
        return $this->getPDO()->prepare($sql);
    }

    /**
     * Execute a SQL statement directly
     * 
     * @param string $sql SQL statement to execute
     * @return int Number of affected rows
     * @throws PDOException If execution fails
     */
    public function exec($sql) {
        return $this->getPDO()->exec($sql);
    }

    /**
     * Create course_notes table if it doesn't exist
     * 
     * @return bool True if successful
     * @throws PDOException If creation fails
     */
    public function createCourseNotesTable() {
        $sql = "CREATE TABLE IF NOT EXISTS `course_notes` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `title` VARCHAR(255) NOT NULL,
            `description` TEXT NOT NULL,
            `category` VARCHAR(50) NOT NULL,
            `file_path` VARCHAR(255),
            `file_type` ENUM('pdf', 'link') NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

        $this->exec($sql);
        return true;
    }

    /**
     * Insert a new course note
     * 
     * @param string $title The title of the course note
     * @param string $description The description of the course note
     * @param string $category The category of the course note
     * @param string $filePath The file path or URL of the note resource
     * @param string $fileType The type of the file (pdf or link)
     * @return bool True if successful
     * @throws PDOException If insertion fails
     */
    public function insertCourseNote($title, $description, $category, $filePath, $fileType) {
        // Make sure the course_notes table exists
        $this->createCourseNotesTable();

        // Prepare and execute the insert statement
        $stmt = $this->prepare("INSERT INTO `course_notes` (`title`, `description`, `category`, `file_path`, `file_type`) VALUES (?, ?, ?, ?, ?)");
        return $stmt->execute([$title, $description, $category, $filePath, $fileType]);
    }

    /**
     * Get course notes with optional search and filter
     * 
     * @param string $searchTerm Optional search term to filter notes
     * @param string $category Optional category to filter notes
     * @param int $page Optional page number for pagination
     * @param int $perPage Optional number of items per page
     * @return array Array of course note objects and total count
     * @throws PDOException If query fails
     */
    public function getCourseNotes($searchTerm = '', $category = '', $page = 1, $perPage = 5) {
        // Make sure the course_notes table exists and populate with sample data if empty
        $this->createCourseNotesTable();
        $this->populateSampleCourseNotes();

        // Calculate offset for pagination
        $offset = ($page - 1) * $perPage;

        // Build base SQL for counting total results
        $countSql = "SELECT COUNT(*) FROM `course_notes`";
        $params = [];

        // Build the SQL query based on search term and category
        $sql = "SELECT * FROM `course_notes`";

        // Add where clauses if needed
        $whereClause = "";

        if (!empty($searchTerm)) {
            $whereClause .= " `title` LIKE ? OR `description` LIKE ?";
            $params[] = "%$searchTerm%";
            $params[] = "%$searchTerm%";
        }

        if (!empty($category)) {
            if (!empty($whereClause)) {
                $whereClause = "($whereClause) AND `category` = ?";
            } else {
                $whereClause = " `category` = ?";
            }
            $params[] = $category;
        }

        // Finalize SQL with where clause if needed
        if (!empty($whereClause)) {
            $sql .= " WHERE $whereClause";
            $countSql .= " WHERE $whereClause";
        }

        // Add order and limit
        $sql .= " ORDER BY `created_at` DESC LIMIT ? OFFSET ?";
        $limitParams = $params;
        $limitParams[] = $perPage;
        $limitParams[] = $offset;

        // Execute count query
        $countStmt = $this->prepare($countSql);
        $countStmt->execute($params);
        $totalCount = $countStmt->fetchColumn();

        // Execute main query
        $stmt = $this->prepare($sql);
        $stmt->execute($limitParams);
        $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'total' => $totalCount,
            'notes' => $notes
        ];
    }

    /**
     * Get a single course note by ID
     * 
     * @param int $id The ID of the course note to retrieve
     * @return array|false The course note data or false if not found
     * @throws PDOException If query fails
     */
    public function getCourseNoteById($id) {
        $stmt = $this->prepare("SELECT * FROM `course_notes` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Populate the course_notes table with sample data if it's empty
     * 
     * @return array The sample notes that were inserted (if any)
     * @throws PDOException If insertion fails
     */
    public function populateSampleCourseNotes() {
        // Check if the table is empty
        $stmt = $this->query("SELECT COUNT(*) FROM `course_notes`");
        $count = $stmt->fetchColumn();

        // If table is empty, insert sample data
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
                // Added new course entries
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

            // Prepare insert statement
            $stmt = $this->prepare("INSERT INTO `course_notes` (`title`, `description`, `category`, `file_path`, `file_type`) VALUES (?, ?, ?, ?, ?)");

            // Insert each note
            foreach ($sampleNotes as $note) {
                $stmt->execute([
                    $note['title'],
                    $note['description'],
                    $note['category'],
                    $note['file_path'],
                    $note['file_type']
                ]);
            }

            return $sampleNotes;
        }

        return [];
    }

    /**
     * Delete a course note by ID
     * 
     * @param int $id The ID of the course note to delete
     * @return bool True if successful
     * @throws PDOException If deletion fails
     */
    public function deleteCourseNote($id) {
        $stmt = $this->prepare("DELETE FROM `course_notes` WHERE `id` = ?");
        return $stmt->execute([$id]);
    }

    /**
     * Update a course note
     * 
     * @param int $id The ID of the course note to update
     * @param array $data The data to update
     * @return bool True if successful
     * @throws PDOException If update fails
     */
    public function updateCourseNote($id, $data) {
        $allowedFields = ['title', 'description', 'category', 'file_path', 'file_type'];
        $setClause = [];
        $params = [];

        foreach ($data as $field => $value) {
            if (in_array($field, $allowedFields)) {
                $setClause[] = "`$field` = ?";
                $params[] = $value;
            }
        }

        if (empty($setClause)) {
            return false;
        }

        $sql = "UPDATE `course_notes` SET " . implode(', ', $setClause) . " WHERE `id` = ?";
        $params[] = $id;

        $stmt = $this->prepare($sql);
        return $stmt->execute($params);
    }
}
?>