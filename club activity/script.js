document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock API URL
  const clubContainer = document.querySelector('.club-cards');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort');
  const paginationControls = document.querySelector('.pagination-controls');
  const joinForm = document.querySelector('form');

  let clubs = [];
  let currentPage = 1;
  const itemsPerPage = 3;

  // Fetch data from API
  const fetchClubs = async () => {
    try {
      showLoading();
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch data');
      clubs = await response.json();
      console.log('Fetched clubs:', clubs); // Log raw data
      assignRandomData(); // Assign random data to clubs
      addAdditionalCard(); // Add the additional card
      console.log('Clubs with random data and additional card:', clubs); // Log processed data
      renderClubs();
    } catch (error) {
      showError(error.message);
    } finally {
      hideLoading();
    }
  };

  // Assign random dates and categories to clubs for sorting purposes
  const assignRandomData = () => {
    clubs = clubs.map((club) => ({
      ...club,
      date: new Date(Date.now() - Math.random() * 1e10).toISOString(), // Random date within a range
      category: ['Art', 'Technology', 'Environment'][Math.floor(Math.random() * 3)], // Random category
    }));
  };

  // Add an additional card for the second page
  const addAdditionalCard = () => {
    clubs.push({
      title: 'Science Explorers Club',
      body: 'A club for science enthusiasts to explore and experiment.',
      date: new Date(Date.now() - Math.random() * 1e10).toISOString(),
      category: 'Science',
    });
  };

  // Show loading spinner
  const showLoading = () => {
    document.getElementById('loading-spinner').classList.remove('hidden');
  };

  // Hide loading spinner
  const hideLoading = () => {
    document.getElementById('loading-spinner').classList.add('hidden');
  };

  // Show error message
  const showError = (message) => {
    clubContainer.innerHTML = `<p class='text-red-500'>${message}</p>`;
  };

  // Filter and sort clubs
  const filterAndSortClubs = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;

    let filtered = clubs.filter((club) => {
      const title = club.title.toLowerCase();
      return searchTerm
        .split(' ')
        .every(term => title.includes(term)); // Flexible word-based search
    });

    if (sortBy === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'category') {
      filtered.sort((a, b) => a.category.localeCompare(b.category));
    }

    return filtered;
  };

  // Ensure only two pages are available
  const paginateClubs = (filteredClubs) => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, 4); // Limit to 4 items (2 pages)
    return filteredClubs.slice(start, end);
  };

  // Ensure renderClubs handles empty pages correctly
  const renderClubs = () => {
    const filteredClubs = filterAndSortClubs();
    const paginatedClubs = paginateClubs(filteredClubs);

    if (filteredClubs.length === 0 || paginatedClubs.length === 0) {
      clubContainer.innerHTML = `<p class='text-gray-500'>No clubs found.</p>`;
    } else {
      clubContainer.innerHTML = paginatedClubs
        .map(
          (club) => `
          <div class="club-card">
            <h3>${club.title}</h3>
            <p>${club.body}</p>
          </div>`
        )
        .join('');
    }

    updatePaginationControls(filteredClubs.length);
  };

  // Fix pagination controls to handle edge cases
  const updatePaginationControls = (totalItems) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    currentPage = Math.min(currentPage, totalPages); // Ensure currentPage is within bounds

    paginationControls.querySelector('span').textContent = `Page ${currentPage} of ${totalPages}`;

    paginationControls.querySelector('button:first-child').disabled = currentPage === 1;
    paginationControls.querySelector('button:last-child').disabled = currentPage === totalPages;
  };

  // Handle pagination
  paginationControls.addEventListener('click', (e) => {
    if (e.target.closest('button')) {
      if (e.target.textContent.includes('Previous')) {
        currentPage--;
      } else if (e.target.textContent.includes('Next')) {
        currentPage++;
      }
      renderClubs();
    }
  });

  // Adjust search functionality to filter existing HTML elements
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();

    // Get all club cards
    const clubCards = document.querySelectorAll('.club-card');

    // Filter and display matching clubs
    clubCards.forEach((card) => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      if (title.includes(searchTerm)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });

    // Show all clubs if search is cleared
    if (!searchTerm) {
      clubCards.forEach((card) => {
        card.style.display = 'block';
      });
    }
  });

  // Handle sort
  sortSelect.addEventListener('change', () => {
    currentPage = 1;
    renderClubs();
  });

  // Form validation
  joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = joinForm.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach((input) => {
      const errorElement = input.nextElementSibling || document.createElement('span');
      if (!input.nextElementSibling) {
        errorElement.classList.add('text-red-500', 'text-sm');
        input.parentNode.insertBefore(errorElement, input.nextSibling);
      }

      if (!input.value.trim()) {
        isValid = false;
        errorElement.textContent = 'This field is required';
      } else {
        errorElement.textContent = '';
      }
    });

    if (isValid) {
      alert('Form submitted successfully!');
    }
  });

  // Initialize
  fetchClubs();
});
