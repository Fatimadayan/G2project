// script.js - Campus Club Activities functionality with PHP backend integration

// DOM Elements
const loadingSpinner = document.getElementById('loading-spinner');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort');
const clubCardsContainer = document.querySelector('.grid');
const paginationButtons = document.querySelectorAll('.text-center button');
const pageInfo = document.querySelector('.text-center span');
const joinButton = document.getElementById('join-button');
const rsvpButton = document.querySelector('a[href="#"]');
const joinClubPopup = document.getElementById('join-club-popup');
const joinClubForm = document.getElementById('join-club-form');
const closePopupBtn = document.getElementById('close-popup');
const cancelJoinBtn = document.getElementById('cancel-join');
const clubSelect = document.getElementById('club-select');
const createClubPopup = document.getElementById('create-club-popup');
const createClubForm = document.getElementById('create-club-form');
const closeCreatePopupBtn = document.getElementById('close-create-popup');
const cancelCreateClubBtn = document.getElementById('cancel-create-club');
const createClubButton = document.getElementById('create-club-button');

// Global variables
let allClubs = [];
let filteredClubs = [];
let currentPage = 1;
const clubsPerPage = 6;
const baseUrl = 'https://f023b77e-ddd3-4b2a-83b2-04e0be6c5df2-00-3sfdt77xdn4hi.sisko.replit.dev/';

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchClubData();
    setupEventListeners();
    setupPopup();
});

// Fetch club data from PHP backend
async function fetchClubData() {
    showLoading();
    try {
        const params = new URLSearchParams({
            search: searchInput.value.trim(),
            sort: sortSelect.value,
            page: currentPage,
            per_page: clubsPerPage
        });

        const response = await fetch(`${baseUrl}read_clubs.php?${params}`);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        allClubs = data.data;
        filteredClubs = [...allClubs];

        renderClubCards();
        updatePagination(data.meta);
        updateClubDropdown(); // Update the join club dropdown
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load clubs. Using sample data instead.');
        useDummyData();
    } finally {
        hideLoading();
    }
}

// Fallback dummy data
function useDummyData() {
    allClubs = [
        {
            id: 1,
            name: "Tech Innovators Club",
            description: "A club for tech enthusiasts to innovate and collaborate on projects.",
            category: "Technology",
            members: 120,
            logo: "./images/tech%20innovators%20club.jpg",
            email: "tech@university.edu",
            website: "https://tech-club.university.edu",
            our_missions: "Promote tech innovation on campus",
            activities: "Weekly hackathons, tech talks",
            created_at: "2020-09-15"
        },
        {
            id: 2,
            name: "Art and Expression Society",
            description: "A space for artists to express and showcase their creativity.",
            category: "Arts",
            members: 85,
            logo: "./images/art%20and%20expression%20society.jpg",
            email: "art@university.edu",
            website: "https://art-club.university.edu",
            our_missions: "Foster artistic expression",
            activities: "Monthly exhibitions, workshops",
            created_at: "2019-03-22"
        },
        {
            id: 3,
            name: "Green Future Club",
            description: "Join us in promoting sustainability and environmental awareness.",
            category: "Environment",
            members: 150,
            logo: "./images/green%20future%20club.jpg",
            email: "green@university.edu",
            website: "https://green-club.university.edu",
            our_missions: "Make campus more sustainable",
            activities: "Tree planting, recycling programs",
            created_at: "2021-01-10"
        }
    ];

    filteredClubs = [...allClubs];
    renderClubCards();
    updatePagination();
    updateClubDropdown();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', () => {
        filterClubs();
        currentPage = 1;
        renderClubCards();
        updatePagination();
    });

    // Sort functionality
    sortSelect.addEventListener('change', () => {
        sortClubs();
        renderClubCards();
    });

    // Pagination buttons
    paginationButtons[0].addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchClubData();
        }
    });

    paginationButtons[1].addEventListener('click', () => {
        const totalPages = Math.ceil(filteredClubs.length / clubsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            fetchClubData();
        }
    });

    // RSVP button
    rsvpButton?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Thank you for your RSVP! You will receive confirmation details soon.');
    });
}

// Setup popup functionality
function setupPopup() {
    // Join club popup functionality
    joinButton.addEventListener('click', showJoinClubPopup);
    closePopupBtn.addEventListener('click', hideJoinClubPopup);
    cancelJoinBtn.addEventListener('click', hideJoinClubPopup);
    joinClubPopup.addEventListener('click', (e) => {
        if (e.target === joinClubPopup) {
            hideJoinClubPopup();
        }
    });
    joinClubForm.addEventListener('submit', handleJoinClubSubmission);

    // Create club popup functionality
    createClubButton.addEventListener('click', showCreateClubPopup);
    closeCreatePopupBtn.addEventListener('click', hideCreateClubPopup);
    cancelCreateClubBtn.addEventListener('click', hideCreateClubPopup);
    createClubPopup.addEventListener('click', (e) => {
        if (e.target === createClubPopup) {
            hideCreateClubPopup();
        }
    });
    createClubForm.addEventListener('submit', handleCreateClubSubmission);
}

// Show join club popup
function showJoinClubPopup() {
    joinClubPopup.classList.remove('hidden');
    joinClubPopup.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

// Hide join club popup
function hideJoinClubPopup() {
    joinClubPopup.classList.add('hidden');
    joinClubPopup.classList.remove('flex');
    document.body.style.overflow = '';
    resetFormErrors();
}

// Update the club dropdown in join form
function updateClubDropdown() {
    clubSelect.innerHTML = '<option value="">-- Select a Club --</option>';
    
    allClubs.forEach(club => {
        const option = document.createElement('option');
        option.value = club.id;
        option.textContent = club.name;
        clubSelect.appendChild(option);
    });
}

// Handle join club form submission
async function handleJoinClubSubmission(e) {
    e.preventDefault();

    // Reset previous errors
    resetFormErrors();

    // Get form values
    const fullName = document.getElementById('full-name').value.trim();
    const studentId = document.getElementById('student-id').value.trim();
    const email = document.getElementById('email').value.trim();
    const clubId = clubSelect.value;
    const message = document.getElementById('message').value.trim();

    // Validate inputs
    let isValid = true;

    if (!fullName) {
        document.getElementById('name-error').classList.remove('hidden');
        isValid = false;
    }

    if (!studentId || !/^\d+$/.test(studentId)) {
        document.getElementById('id-error').classList.remove('hidden');
        isValid = false;
    }

    if (!email || !email.endsWith('@edu.uob.bh')) {
        document.getElementById('email-error').classList.remove('hidden');
        isValid = false;
    }

    if (!clubId) {
        document.getElementById('club-error').classList.remove('hidden');
        isValid = false;
    }

    if (isValid) {
        showLoading();
        try {
            const response = await fetch(`${baseUrl}join_club.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    club_id: clubId,
                    student_id: studentId,
                    student_name: fullName,
                    student_email: email,
                    message: message
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to join club');

            // Get selected club name
            const selectedClub = allClubs.find(c => c.id == clubId)?.name || 'the club';

            alert(`Thank you, ${fullName}! You have successfully joined ${selectedClub}.`);
            hideJoinClubPopup();
            joinClubForm.reset();
            fetchClubData(); // Refresh to show updated member count
        } catch (error) {
            alert(error.message);
        } finally {
            hideLoading();
        }
    }
}

// Reset join form error messages
function resetFormErrors() {
    const errorMessages = document.querySelectorAll('#join-club-form .text-red-600');
    errorMessages.forEach(msg => {
        msg.classList.add('hidden');
    });
}

// Show create club popup
function showCreateClubPopup() {
    createClubPopup.classList.remove('hidden');
    createClubPopup.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

// Hide create club popup
function hideCreateClubPopup() {
    createClubPopup.classList.add('hidden');
    createClubPopup.classList.remove('flex');
    document.body.style.overflow = '';
    resetCreateFormErrors();
}

// Handle create club form submission
async function handleCreateClubSubmission(e) {
    e.preventDefault();
    resetCreateFormErrors();

    // Get form values
    const name = document.getElementById('club-name').value.trim();
    const category = document.getElementById('club-category').value;
    const description = document.getElementById('club-description').value.trim();
    const email = document.getElementById('club-email').value.trim();
    const website = document.getElementById('club-website').value.trim();
    const meetingDay = document.getElementById('club-meeting-day').value;
    const meetingTime = document.getElementById('club-meeting-time').value;
    const logoFile = document.getElementById('club-logo').files[0];

    // Validate inputs
    let isValid = true;

    if (!name) {
        document.getElementById('club-name-error').classList.remove('hidden');
        isValid = false;
    }

    if (!category) {
        document.getElementById('category-error').classList.remove('hidden');
        isValid = false;
    }

    if (!description) {
        document.getElementById('description-error').classList.remove('hidden');
        isValid = false;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('create-email-error').classList.remove('hidden');
        isValid = false;
    }

    if (isValid) {
        showLoading();
        try {
            // Prepare form data
            const formData = {
                name: name,
                category: category,
                email: email,
                website: website,
                description: description,
                our_missions: "To be added", // Default values
                activities: "To be added",   // Default values
                meeting_day: meetingDay,
                meeting_time: meetingTime
            };

            // Handle logo upload if provided
            if (logoFile) {
                const logoBase64 = await readFileAsBase64(logoFile);
                formData.logo = logoBase64;
            }

            // Send to server
            const response = await fetch(`${baseUrl}create_club.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to create club');

            alert(`Club "${name}" created successfully!`);
            hideCreateClubPopup();
            createClubForm.reset();
            fetchClubData(); // Refresh the list
        } catch (error) {
            alert(error.message);
        } finally {
            hideLoading();
        }
    }
}

// Helper function to read file as base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Reset create form error messages
function resetCreateFormErrors() {
    const errorMessages = document.querySelectorAll('#create-club-form .text-red-600');
    errorMessages.forEach(msg => {
        msg.classList.add('hidden');
    });
}

// Filter clubs based on search input
function filterClubs() {
    const searchTerm = searchInput.value.toLowerCase();

    if (searchTerm === '') {
        filteredClubs = [...allClubs];
    } else {
        filteredClubs = allClubs.filter(club => 
            club.name.toLowerCase().includes(searchTerm) || 
            club.description.toLowerCase().includes(searchTerm) ||
            club.category.toLowerCase().includes(searchTerm)
        );
    }
}

// Sort clubs based on selected option
function sortClubs() {
    const sortOption = sortSelect.value;

    switch (sortOption) {
        case 'name':
            filteredClubs.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'newest':
            filteredClubs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'category':
            filteredClubs.sort((a, b) => a.category.localeCompare(b.category));
            break;
        default:
            break;
    }
}

// Render club cards based on current page
function renderClubCards() {
    const startIndex = (currentPage - 1) * clubsPerPage;
    const endIndex = startIndex + clubsPerPage;
    const clubsToDisplay = filteredClubs.slice(startIndex, endIndex);

    clubCardsContainer.innerHTML = '';

    if (clubsToDisplay.length === 0) {
        clubCardsContainer.innerHTML = `
            <div class="col-span-3 text-center py-8">
                <p class="text-xl">No clubs found matching your search.</p>
            </div>
        `;
        return;
    }

    clubsToDisplay.forEach(club => {
        const clubCard = document.createElement('div');
        clubCard.className = 'bg-cover bg-center shadow-md p-6 rounded-[2rem] text-center hover:shadow-lg';
        
        // Use club logo if available, otherwise use default background
        const bgImage = club.logo ? `url('${club.logo}')` : `url('./images/default-club-bg.jpg')`;
        clubCard.style.backgroundImage = bgImage;

        clubCard.innerHTML = `
            <h3 class="text-xl font-bold bg-lightBg bg-opacity-70 inline-block px-2 py-1 rounded text-black">${club.name}</h3>
            <p class="mt-4 bg-lightBg bg-opacity-80 p-2 rounded">${club.description}</p>
            <div class="mt-2 bg-lightBg bg-opacity-80 p-2 rounded">
                <span class="font-semibold">Category:</span> ${club.category} | 
                <span class="font-semibold">Members:</span> ${club.members}
            </div>
            <a href="clubs-info.html?id=${club.id}" class="mt-6 inline-block px-6 py-3 bg-primaryBg text-primaryText rounded-lg hover:bg-gray-100">
                Learn More
            </a>
        `;

        clubCardsContainer.appendChild(clubCard);
    });
}

// Update pagination info and button states
function updatePagination(meta = null) {
    let totalPages, totalClubs;
    
    if (meta) {
        totalPages = meta.total_pages;
        totalClubs = meta.total;
    } else {
        totalPages = Math.ceil(filteredClubs.length / clubsPerPage);
        totalClubs = filteredClubs.length;
    }

    pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalClubs} clubs)`;

    // Disable previous button on first page
    paginationButtons[0].disabled = currentPage === 1;
    paginationButtons[0].classList.toggle('opacity-50', currentPage === 1);

    // Disable next button on last page
    paginationButtons[1].disabled = currentPage === totalPages;
    paginationButtons[1].classList.toggle('opacity-50', currentPage === totalPages);
}

// Loading state functions
function showLoading() {
    loadingSpinner.classList.remove('hidden');
    loadingSpinner.classList.add('flex');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
    loadingSpinner.classList.remove('flex');
}