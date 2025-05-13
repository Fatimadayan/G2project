document.addEventListener('DOMContentLoaded', () => {
    if (document.body.contains(document.getElementById('reviews-list'))) {
        handleReviewsPage();
    } else if (document.body.contains(document.getElementById('course-title')) && window.location.href.includes("ReviewDetails.html")) {
        handleDetailsPage();
    } else if (document.body.contains(document.getElementById('rating-form'))) {
        handleRatingSubmission();
    }
});

// API URL 
const API_URL = 'https://57e5913b-91fd-4c06-a71d-4b40722c3810-00-21exoncn8cqce.pike.replit.dev/index.php'; 

let courseData = [];
let currentUser = '';

if (localStorage.getItem('currentUser')) {
    currentUser = localStorage.getItem('currentUser');
}

function createCourseCard(course) {
    const article = document.createElement('article');
    article.className = `review-item course${course.id}`;
    article.setAttribute('data-course', `course${course.id}`);

    article.innerHTML = `
        <h2>${course.title}</h2>
        <a href="ReviewDetails.html?course=${course.id}" class="button">View Details</a>
    `;

    return article;
}

// Extract course data from the existing HTML
function extractCoursesFromHTML() {
    const courseElements = document.querySelectorAll('.review-item');
    const courses = [];

    courseElements.forEach(element => {
        const titleElement = element.querySelector('h2');
        const linkElement = element.querySelector('a');
        
        if (titleElement && linkElement) {
            const title = titleElement.textContent;
            const href = linkElement.getAttribute('href');
            const idMatch = href ? href.match(/course=(\d+)/) : null;
            const id = idMatch ? parseInt(idMatch[1]) : null;

            if (id && title) {
                courses.push({
                    id: id,
                    title: title,
                    description: "Description will be loaded when viewing details",
                    rating: 0
                });
            }
        }
    });

    return courses;
}

function handleReviewsPage() {
    const reviewsList = document.getElementById('reviews-list');
    const noData = document.getElementById('no-data');
    const loading = document.getElementById('loading');
    const searchInput = document.getElementById('search-input');
    const sortButton = document.getElementById('sort-button');
    const filterMode = document.getElementById('filter-mode');
    
    // Extract course data from HTML first
    const htmlCourses = extractCoursesFromHTML();
    if (htmlCourses.length > 0) {
        courseData = htmlCourses;
    }

    if (htmlCourses.length === 0) {
        loading.style.display = 'block';
    } else {
        loading.style.display = 'none';
    }

    // First try to load from API
    fetch(`${API_URL}?action=courses`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                courseData = data;
            } else if (data.courses && Array.isArray(data.courses)) {
                courseData = data.courses;
            } else {
                throw new Error('Invalid data format');
            }
            
            if (!searchInput.value.trim()) {
                displayCourses(courseData);
            }
            loading.style.display = 'none';
        })
        .catch(err => {
            console.error('Error loading from API:', err);
            
            // Fallback to local JSON
            fetch('reviews.json')
                .then(res => res.json())
                .then(data => {
                    courseData = data.courses;
                    
                    if (!searchInput.value.trim()) {
                        displayCourses(courseData);
                    }
                    loading.style.display = 'none';
                })
                .catch(err => {
                    console.error('Error loading local JSON:', err);
                    
                    // If HTML courses exist, use those
                    if (htmlCourses.length > 0) {
                        courseData = htmlCourses;
                        
                        if (!searchInput.value.trim()) {
                            displayCourses(courseData);
                        }
                    }
                    
                    loading.style.display = 'none';
                    
                    if (courseData.length === 0 && searchInput.value.trim()) {
                        noData.style.display = 'block';
                    }
                });
        });

    function displayCourses(courses) {
        // Clear existing content
        reviewsList.innerHTML = '';
        
        // Add courses to the page
        courses.forEach(course => {
            const card = createCourseCard(course);
            reviewsList.appendChild(card);
        });

        if (courses.length === 0 && searchInput.value.trim() !== '') {
            noData.style.display = 'block';
        } else {
            noData.style.display = 'none';
        }
        
        loading.style.display = 'none';
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase().trim();
            
            if (!term) {
                displayCourses(courseData);
                return;
            }
            
            const mode = filterMode.value; 
            const filteredCourses = courseData.filter(course => {
                const titleText = course.title.toLowerCase();
                
                if (mode === 'code') {
                    // Extract course code from title 
                    const codeMatch = titleText.match(/([a-z]+\d+):/i);
                    if (codeMatch && codeMatch[1]) {
                        return codeMatch[1].toLowerCase().includes(term);
                    }
                    return false;
                } else {
                    // Search in full title
                    return titleText.includes(term);
                }
            });
            
            displayCourses(filteredCourses);
        });
    }

    // Sort button functionality 
    if (sortButton) {
        sortButton.addEventListener('click', () => {
            // Show loading indicator
            loading.style.display = 'block';
            
            //setTimeout to give UI time to update
            setTimeout(() => {
                try {
                    const sortedCourses = [...courseData];
                    
                    sortedCourses.sort((a, b) => {
                        const aText = a.title.toLowerCase();
                        const bText = b.title.toLowerCase();
                        return aText.localeCompare(bText);
                    });
                    
                    // Display the sorted courses
                    displayCourses(sortedCourses);
                } catch (error) {
                    console.error('Error during sort:', error);
                } finally {
                    loading.style.display = 'none';
                }
            }, 300);
        });
    }
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function handleDetailsPage() {
    const courseId = getUrlParameter('course');
    
    if (!courseId) {
        document.getElementById('course-title').textContent = "Invalid course ID.";
        return;
    }

    // First try the API
    fetch(`${API_URL}?action=courses&id=${courseId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
        .then(course => {
            displayCourseDetails(course);
            loadComments(courseId);
        })
        .catch(err => {
            console.error('Error loading from API:', err);
            
            // Fallback to local JSON
            fetch('reviews.json')
                .then(res => res.json())
                .then(data => {
                    const course = data.courses.find(c => c.id === parseInt(courseId));
                    if (course) {
                        displayCourseDetails(course);
                        // Load comments after displaying course details
                        loadComments(courseId);
                    } else {
                        throw new Error('Course not found in local data');
                    }
                })
                .catch(err => {
                    console.error('Error:', err);
                    document.getElementById('course-title').textContent = "Failed to load course details.";
                });
        });
        
    // Set up comment form handling
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('comment-name').value;
            const text = document.getElementById('comment-text').value;
            
            if (name && text) {
                // Store current user name in localStorage
                localStorage.setItem('currentUser', name);
                currentUser = name;
                
                addComment(courseId, name, text);
                commentForm.reset();
            }
        });
    }
}

function displayCourseDetails(course) {
    document.getElementById('course-title').textContent = `Course: ${course.title}`;
    document.getElementById('course-description').textContent = `Description: ${course.description}`;
    document.getElementById('course-rating').textContent = `Rating: ${course.rating} / 5`;
}

function loadComments(courseId) {
    const commentsContainer = document.getElementById('comments-container');
    if (!commentsContainer) return;
    
    commentsContainer.innerHTML = '<p>Loading comments...</p>';
    
    // Try API first
    fetch(`${API_URL}?action=comments&id=${courseId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to load comments');
            }
            return res.json();
        })
        .then(comments => {
            commentsContainer.innerHTML = '';
            
            if (comments.length === 0) {
                commentsContainer.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
                return;
            }
            
            comments.forEach(comment => {
                const commentElement = createCommentElement(comment, courseId);
                commentsContainer.appendChild(commentElement);
            });
        })
        .catch(err => {
            console.error('Error loading comments from API:', err);
            
            // Fallback to localStorage
            const storedComments = JSON.parse(localStorage.getItem(`comments_${courseId}`)) || [];
            
            commentsContainer.innerHTML = '';
            
            if (storedComments.length === 0) {
                commentsContainer.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
                return;
            }
            
            storedComments.forEach(comment => {
                const commentElement = createCommentElement(comment, courseId);
                commentsContainer.appendChild(commentElement);
            });
        });
}

function addComment(courseId, name, text) {
    // Try API first
    fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'comments',
            course_id: courseId,
            name: name,
            text: text
        })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Failed to add comment');
        }
        return res.json();
    })
    .then(data => {
        console.log('Comment added successfully:', data);
        loadComments(courseId); // Reload comments
    })
    .catch(err => {
        console.error('Error adding comment to API:', err);
        
        // Fallback to localStorage
        const comment = {
            id: Date.now(),
            course_id: parseInt(courseId),
            name: name,
            text: text,
            date: new Date().toLocaleDateString()
        };
        
        let storedComments = JSON.parse(localStorage.getItem(`comments_${courseId}`)) || [];
        storedComments.push(comment);
        localStorage.setItem(`comments_${courseId}`, JSON.stringify(storedComments));
        
        loadComments(courseId); // Reload comments
    });
}

function createCommentElement(comment, courseId) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    commentDiv.id = `comment-${comment.id}`;
    
    let displayDate = comment.date;
    if (typeof displayDate === 'string' && displayDate.includes('T')) {
        displayDate = new Date(displayDate).toLocaleDateString();
    }
    
    // Create comment content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'comment-content';
    contentDiv.innerHTML = `
        <div class="comment-header">
            <span class="comment-author">${comment.name}</span>
            <span class="comment-date">${displayDate}</span>
        </div>
        <div class="comment-text">${comment.text}</div>
    `;
    
    // Create edit form 
    const editFormDiv = document.createElement('div');
    editFormDiv.className = 'edit-form hidden';
    editFormDiv.innerHTML = `
        <textarea id="edit-text-${comment.id}">${comment.text}</textarea>
        <div>
            <button class="save-btn" data-id="${comment.id}">Save</button>
            <button class="cancel-btn" data-id="${comment.id}">Cancel</button>
        </div>
    `;
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'comment-actions';
    
    // Check if this comment belongs to the current user
    if (currentUser === comment.name) {
        actionsDiv.innerHTML = `
            <button class="edit-btn" data-id="${comment.id}">Edit</button>
            <button class="delete-btn" data-id="${comment.id}">Delete</button>
        `;
    }
    
    commentDiv.appendChild(contentDiv);
    commentDiv.appendChild(editFormDiv);
    commentDiv.appendChild(actionsDiv);
    
    // Add event listeners
    commentDiv.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const commentId = this.getAttribute('data-id');
            const commentEl = document.getElementById(`comment-${commentId}`);
            commentEl.querySelector('.comment-content').classList.add('hidden');
            commentEl.querySelector('.edit-form').classList.remove('hidden');
            commentEl.querySelector('.comment-actions').classList.add('hidden');
        });
    });
    
    commentDiv.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const commentId = this.getAttribute('data-id');
            const commentEl = document.getElementById(`comment-${commentId}`);
            commentEl.querySelector('.comment-content').classList.remove('hidden');
            commentEl.querySelector('.edit-form').classList.add('hidden');
            commentEl.querySelector('.comment-actions').classList.remove('hidden');
        });
    });
    
    commentDiv.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const commentId = parseInt(this.getAttribute('data-id'));
            const newText = document.getElementById(`edit-text-${commentId}`).value;
            
            if (newText.trim()) {
                updateComment(courseId, commentId, newText);
            }
        });
    });
    
    commentDiv.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this comment?')) {
                const commentId = parseInt(this.getAttribute('data-id'));
                deleteComment(courseId, commentId);
            }
        });
    });
    
    return commentDiv;
}

function updateComment(courseId, commentId, newText) {
    // Try API first
    fetch(`${API_URL}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'comments',
            comment_id: commentId,
            text: newText
        })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Failed to update comment');
        }
        return res.json();
    })
    .then(data => {
        console.log('Comment updated successfully:', data);
        loadComments(courseId); // Reload comments
    })
    .catch(err => {
        console.error('Error updating comment via API:', err);
        
        // Fallback to localStorage
        let storedComments = JSON.parse(localStorage.getItem(`comments_${courseId}`)) || [];
        
        const commentIndex = storedComments.findIndex(comment => comment.id === commentId);
        
        if (commentIndex !== -1) {
            storedComments[commentIndex].text = newText;
            storedComments[commentIndex].date = `${new Date().toLocaleDateString()} (edited)`;
            
            localStorage.setItem(`comments_${courseId}`, JSON.stringify(storedComments));
            
            loadComments(courseId);
        }
    });
}

function deleteComment(courseId, commentId) {
    // Try API first
    fetch(`${API_URL}?action=comments&comment_id=${commentId}`, {
        method: 'DELETE'
    })
    .then(res => {
        if (!res.ok) {
            throw new Error('Failed to delete comment');
        }
        return res.json();
    })
    .then(data => {
        console.log('Comment deleted successfully:', data);
        loadComments(courseId); // Reload comments
    })
    .catch(err => {
        console.error('Error deleting comment via API:', err);
        
        // Fallback to localStorage
        let storedComments = JSON.parse(localStorage.getItem(`comments_${courseId}`)) || [];
        
        // Filter out the comment to be deleted
        storedComments = storedComments.filter(comment => comment.id !== commentId);
        
        localStorage.setItem(`comments_${courseId}`, JSON.stringify(storedComments));
        
        loadComments(courseId);
    });
}

function handleRatingSubmission() {
    const form = document.getElementById('rating-form');
    const successMessage = document.getElementById('success-message');
    
    const nameInput = document.getElementById('name');
    if (nameInput && currentUser) {
        nameInput.value = currentUser;
    }
    
    if (form) {
        form.addEventListener('submit', function() {
            const nameInput = document.getElementById('name');
            if (nameInput && nameInput.value) {
                localStorage.setItem('currentUser', nameInput.value);
                currentUser = nameInput.value;
            }
        });
    }
}