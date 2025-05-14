// script.js - Campus Club Activities functionality

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

// API Endpoints
const API_BASE_URL = 'https://f023b77e-ddd3-4b2a-83b2-04e0be6c5df2-00-3sfdt77xdn4hi.sisko.replit.dev/';
const CREATE_CLUB_ENDPOINT = `${API_BASE_URL}/create_club.php`;
const GET_CLUBS_ENDPOINT = `${API_BASE_URL}/get_clubs.php`;
const JOIN_CLUB_ENDPOINT = `${API_BASE_URL}/join_club.php`;

// Global variables
let allClubs = [];
let filteredClubs = [];
let currentPage = 1;
const clubsPerPage = 6;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchClubData();
    setupEventListeners();
    setupPopup();
});

// Show/hide loading
function showLoading() {
    if (loadingSpinner) loadingSpinner.classList.remove('hidden');
}
function hideLoading() {
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
}

// Fetch clubs
async function fetchClubData() {
    showLoading();
    try {
        const response = await fetch(GET_CLUBS_ENDPOINT);
        const data = await response.json();

        if (data.success) {
            allClubs = data.data;
            filteredClubs = [...allClubs];
            renderClubCards();
            updatePagination();
            populateClubDropdown();
        } else {
            throw new Error(data.message || 'Fetch failed');
        }
    } catch (err) {
        console.error('Error loading clubs:', err);
        useDummyData();
    } finally {
        hideLoading();
    }
}

function useDummyData() {
    allClubs = [
        {
            id: 1,
            name: "Tech Club",
            description: "Innovate with us",
            category: "Technology",
            members: 100,
            image: "./images/default-club-bg.jpg",
            founded: "2022-01-01"
        }
    ];
    filteredClubs = [...allClubs];
    renderClubCards();
    updatePagination();
    populateClubDropdown();
}

// Populate select in Join form
function populateClubDropdown() {
    clubSelect.innerHTML = '<option value="">-- Select a Club --</option>';
    allClubs.forEach(club => {
        const option = document.createElement('option');
        option.value = club.id;
        option.textContent = club.name;
        clubSelect.appendChild(option);
    });
}

// Event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', debounce(() => {
        filterClubs();
        currentPage = 1;
        renderClubCards();
        updatePagination();
    }, 300));

    sortSelect.addEventListener('change', () => {
        sortClubs();
        renderClubCards();
    });

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

    if (rsvpButton) {
        rsvpButton.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Thanks for RSVPing!');
        });
    }
}

function setupPopup() {
    joinButton.addEventListener('click', showJoinClubPopup);
    closePopupBtn.addEventListener('click', hideJoinClubPopup);
    cancelJoinBtn.addEventListener('click', hideJoinClubPopup);
    joinClubPopup.addEventListener('click', e => {
        if (e.target === joinClubPopup) hideJoinClubPopup();
    });
    joinClubForm.addEventListener('submit', handleJoinClubSubmission);

    createClubButton.addEventListener('click', showCreateClubPopup);
    closeCreatePopupBtn.addEventListener('click', hideCreateClubPopup);
    cancelCreateClubBtn.addEventListener('click', hideCreateClubPopup);
    createClubPopup.addEventListener('click', e => {
        if (e.target === createClubPopup) hideCreateClubPopup();
    });
    createClubForm.addEventListener('submit', handleCreateClubSubmission);
}

// Join club popup
function showJoinClubPopup() {
    joinClubPopup.classList.remove('hidden');
    joinClubPopup.classList.add('flex');
    document.body.style.overflow = 'hidden';
}
function hideJoinClubPopup() {
    joinClubPopup.classList.add('hidden');
    joinClubPopup.classList.remove('flex');
    document.body.style.overflow = '';
    resetFormErrors();
}
function resetFormErrors() {
    const errors = document.querySelectorAll('#join-club-form .text-red-600');
    errors.forEach(e => e.classList.add('hidden'));
}

async function handleJoinClubSubmission(e) {
    e.preventDefault();
    resetFormErrors();

    const fullName = document.getElementById('full-name').value.trim();
    const studentId = document.getElementById('student-id').value.trim();
    const email = document.getElementById('email').value.trim();
    const clubId = clubSelect.value;
    const message = document.getElementById('message').value.trim();

    let isValid = true;
    if (!fullName) document.getElementById('name-error').classList.remove('hidden'), isValid = false;
    if (!studentId || !/^\d+$/.test(studentId)) document.getElementById('id-error').classList.remove('hidden'), isValid = false;
    if (!email || !email.endsWith('@edu.uob.bh')) document.getElementById('email-error').classList.remove('hidden'), isValid = false;
    if (!clubId) document.getElementById('club-error').classList.remove('hidden'), isValid = false;

    if (!isValid) return;

    try {
        showLoading();
        const res = await fetch(JOIN_CLUB_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ club_id: clubId, full_name: fullName, student_id: studentId, email, message })
        });
        const data = await res.json();
        if (data.success) {
            alert(`You joined ${clubSelect.options[clubSelect.selectedIndex].text}!`);
            allClubs.find(c => c.id == clubId).members += 1;
            hideJoinClubPopup();
            joinClubForm.reset();
            renderClubCards();
        } else throw new Error(data.message);
    } catch (err) {
        console.error('Join error:', err);
        alert('Failed to join club.');
    } finally {
        hideLoading();
    }
}

// Create club popup
function showCreateClubPopup() {
    createClubPopup.classList.remove('hidden');
    createClubPopup.classList.add('flex');
    document.body.style.overflow = 'hidden';
}
function hideCreateClubPopup() {
    createClubPopup.classList.add('hidden');
    createClubPopup.classList.remove('flex');
    document.body.style.overflow = '';
    resetCreateFormErrors();
}
function resetCreateFormErrors() {
    const errors = document.querySelectorAll('#create-club-form .text-red-600');
    errors.forEach(e => e.classList.add('hidden'));
}

async function handleCreateClubSubmission(e) {
    e.preventDefault();
    resetCreateFormErrors();

    const name = document.getElementById('club-name').value.trim();
    const category = document.getElementById('club-category').value;
    const description = document.getElementById('club-description').value.trim();
    const email = document.getElementById('club-email').value.trim();
    const website = document.getElementById('club-website').value.trim();
    const logo = document.getElementById('club-logo').files[0];

    let isValid = true;
    if (!name) document.getElementById('club-name-error').classList.remove('hidden'), isValid = false;
    if (!category) document.getElementById('category-error').classList.remove('hidden'), isValid = false;
    if (!description) document.getElementById('description-error').classList.remove('hidden'), isValid = false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) document.getElementById('create-email-error').classList.remove('hidden'), isValid = false;

    if (!isValid) return;

    try {
        showLoading();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
        formData.append('description', description);
        formData.append('mission', description);
        formData.append('activities', 'TBD');
        formData.append('email', email);
        formData.append('website', website);
        if (logo) formData.append('logo', logo);

        const res = await fetch(CREATE_CLUB_ENDPOINT, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
            allClubs.unshift(data.data);
            filteredClubs = [...allClubs];
            createClubForm.reset();
            hideCreateClubPopup();
            renderClubCards();
            populateClubDropdown();
            updatePagination();
            alert('Club created successfully!');
        } else throw new Error(data.message);
    } catch (err) {
        console.error('Create error:', err);
        alert('Failed to create club.');
    } finally {
        hideLoading();
    }
}

// Search + Sort + Render
function filterClubs() {
    const term = searchInput.value.toLowerCase();
    filteredClubs = allClubs.filter(c => (
        c.name?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term) ||
        c.category?.toLowerCase().includes(term)
    ));
}
function sortClubs() {
    const opt = sortSelect.value;
    if (opt === 'name') filteredClubs.sort((a, b) => a.name.localeCompare(b.name));
    if (opt === 'newest') filteredClubs.sort((a, b) => new Date(b.founded || b.created_at) - new Date(a.founded || a.created_at));
    if (opt === 'category') filteredClubs.sort((a, b) => a.category.localeCompare(b.category));
}
function renderClubCards() {
    clubCardsContainer.innerHTML = '';
    const start = (currentPage - 1) * clubsPerPage;
    const current = filteredClubs.slice(start, start + clubsPerPage);
    if (!current.length) {
        clubCardsContainer.innerHTML = `<div class="col-span-3 text-center py-8"><p>No clubs found.</p></div>`;
        return;
    }
    current.forEach(club => {
        const div = document.createElement('div');
        div.className = 'bg-cover bg-center shadow-md p-6 rounded-[2rem] text-center hover:shadow-lg';
        div.style.backgroundImage = `url('${club.image || club.logo_path || "./images/default-club-bg.jpg"}')`;
        div.innerHTML = `
            <h3 class="text-xl font-bold bg-lightBg bg-opacity-70 inline-block px-2 py-1 rounded text-black">${club.name}</h3>
            <p class="mt-4 bg-lightBg bg-opacity-80 p-2 rounded">${club.description}</p>
            <div class="mt-2 bg-lightBg bg-opacity-80 p-2 rounded">
                <span class="font-semibold">Category:</span> ${club.category || 'General'} |
                <span class="font-semibold">Members:</span> ${club.members || 0}
            </div>
            <a href="clubs/club-details.html?id=${club.id}" class="mt-6 inline-block px-6 py-3 bg-primaryBg text-primaryText rounded-lg hover:bg-gray-100">Learn More</a>
        `;
        clubCardsContainer.appendChild(div);
    });
}
function updatePagination() {
    const total = Math.ceil(filteredClubs.length / clubsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${total}`;
    paginationButtons[0].disabled = currentPage === 1;
    paginationButtons[1].disabled = currentPage === total;
}

// Debounce utility
function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}
