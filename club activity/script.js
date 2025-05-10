// script.js - Campus Club Activities functionality

// DOM Elements
const loadingSpinner = document.getElementById('loading-spinner');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort');
const clubCardsContainer = document.querySelector('.grid');
const paginationButtons = document.querySelectorAll('.text-center button');
const pageInfo = document.querySelector('.text-center span');
const joinButton = document.querySelector('input[value="Join"]');
const rsvpButton = document.querySelector('a[href="#"]');

// Global variables
let allClubs = [];
let filteredClubs = [];
let currentPage = 1;
const clubsPerPage = 6;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchClubData();
    setupEventListeners();
});

// Fetch club data from API
async function fetchClubData() {
    showLoading();
    try {
        // Using a mock API endpoint - in a real app, replace with your actual API endpoint
        const response = await fetch('https://65f199d0034bdbecc763230a.mockapi.io/api/v1/clubs');
        
        if (!response.ok) {
            throw new Error('Failed to fetch club data');
        }
        
        allClubs = await response.json();
        filteredClubs = [...allClubs];
        
        renderClubCards();
        updatePagination();
    } catch (error) {
        console.error('Error fetching club data:', error);
        // Fallback to dummy data if API fails
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
            image: "./images/tech%20innovators%20club.jpg",
            founded: "2020-09-15"
        },
        {
            id: 2,
            name: "Art and Expression Society",
            description: "A space for artists to express and showcase their creativity.",
            category: "Arts",
            members: 85,
            image: "./images/art%20and%20expression%20society.jpg",
            founded: "2019-03-22"
        },
        {
            id: 3,
            name: "Green Future Club",
            description: "Join us in promoting sustainability and environmental awareness.",
            category: "Environment",
            members: 150,
            image: "./images/green%20future%20club.jpg",
            founded: "2021-01-10"
        },
        {
            id: 4,
            name: "Debate Society",
            description: "Sharpen your arguments and engage in intellectual discussions.",
            category: "Academics",
            members: 75,
            image: "./images/debate-society.jpg",
            founded: "2018-11-05"
        },
        {
            id: 5,
            name: "Music Enthusiasts",
            description: "For students who love to create and appreciate music.",
            category: "Arts",
            members: 110,
            image: "./images/music-enthusiasts.jpg",
            founded: "2020-02-18"
        },
        {
            id: 6,
            name: "Entrepreneurship Club",
            description: "Learn about startups and business development.",
            category: "Business",
            members: 90,
            image: "./images/entrepreneurship-club.jpg",
            founded: "2021-09-30"
        },
        {
            id: 7,
            name: "Robotics Club",
            description: "Build robots and compete in national competitions.",
            category: "Technology",
            members: 65,
            image: "./images/robotics-club.jpg",
            founded: "2022-01-15"
        },
        {
            id: 8,
            name: "Photography Club",
            description: "Capture moments and learn photography techniques.",
            category: "Arts",
            members: 95,
            image: "./images/photography-club.jpg",
            founded: "2019-08-12"
        },
        {
            id: 9,
            name: "Health & Wellness",
            description: "Promoting healthy lifestyles among students.",
            category: "Health",
            members: 130,
            image: "./images/health-wellness.jpg",
            founded: "2020-05-20"
        }
    ];
    
    filteredClubs = [...allClubs];
    renderClubCards();
    updatePagination();
}

// Set up event listeners
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
            renderClubCards();
            updatePagination();
        }
    });
    
    paginationButtons[1].addEventListener('click', () => {
        const totalPages = Math.ceil(filteredClubs.length / clubsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderClubCards();
            updatePagination();
        }
    });
    
    // Join button
    joinButton.addEventListener('click', () => {
        validateJoinForm();
    });
    
    // RSVP button
    rsvpButton.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Thank you for your RSVP! You will receive confirmation details soon.');
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
            filteredClubs.sort((a, b) => new Date(b.founded) - new Date(a.founded));
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
        clubCard.style.backgroundImage = `url('${club.image}')`;
        
        clubCard.innerHTML = `
            <h3 class="text-xl font-bold bg-lightBg bg-opacity-70 inline-block px-2 py-1 rounded text-black">${club.name}</h3>
            <p class="mt-4 bg-lightBg bg-opacity-80 p-2 rounded">${club.description}</p>
            <div class="mt-2 bg-lightBg bg-opacity-80 p-2 rounded">
                <span class="font-semibold">Category:</span> ${club.category} | 
                <span class="font-semibold">Members:</span> ${club.members}
            </div>
            <a href="clubs/club-details.html?id=${club.id}" class="mt-6 inline-block px-6 py-3 bg-primaryBg text-primaryText rounded-lg hover:bg-gray-100">Learn More</a>
        `;
        
        clubCardsContainer.appendChild(clubCard);
    });
}

// Update pagination info and button states
function updatePagination() {
    const totalPages = Math.ceil(filteredClubs.length / clubsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Disable previous button on first page
    paginationButtons[0].disabled = currentPage === 1;
    paginationButtons[0].classList.toggle('opacity-50', currentPage === 1);
    
    // Disable next button on last page
    paginationButtons[1].disabled = currentPage === totalPages;
    paginationButtons[1].classList.toggle('opacity-50', currentPage === totalPages);
}

// Validate join form (simplified for this example)
function validateJoinForm() {
    // In a real implementation, this would validate form inputs
    // For this example, we'll just confirm the action
    const confirmed = confirm('Are you sure you want to join a club? You will be redirected to the club selection page.');
    
    if (confirmed) {
        window.location.href = 'clubs/join-a-club.html';
    }
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