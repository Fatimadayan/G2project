const featuresSection = document.getElementById("features");
const loadingMessage = document.getElementById("loading-msg");
const featuresContainer = document.querySelector('.features-container');
let newsData = []; // Store the news data globally

const API_BASE = "https://3aa7faeb-f0f7-4ea7-98b7-1eb9cc448768-00-29unw5ntf5qlw.pike.replit.dev";

// Function to delete news
async function deleteNews(id) {
    if (!confirm('Are you sure you want to delete this news?')) return;

    try {
        const response = await fetch(`${API_BASE}/delete.php`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ module: 'campus_news', id: id })
        });

        if (response.ok) {
            alert('News deleted successfully!');
            fetchNews(); // Refresh news list
        } else {
            const error = await response.json();
            alert('Error deleting news: ' + error.error);
        }
    } catch (error) {
        alert('' );
        window.location.reload();
    }
}




fetch(`${API_BASE}/get.php?module=campus_news`)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch Campus News");
    }
    return response.json();
  })
  .then((data) => {
    newsData = data;
    
    if (loadingMessage) {
      loadingMessage.remove();
    }

    renderCards(newsData);
  })
  .catch((error) => {
    if (loadingMessage) {
      loadingMessage.textContent = error.message;
      loadingMessage.style.color = "red";
    }
  });

// Function to render cards
function renderCards(cards) {
    featuresContainer.innerHTML = ''; // Clear existing cards
    
    if (cards.length === 0) {
        featuresContainer.innerHTML = '<p class="no-results">No matching news found</p>';
        return;
    }

    cards.forEach((item) => {
        const card = document.createElement("div");
        card.className = "feature-card";
        card.innerHTML = `
            <div class="card-header">
                <h2>${item.title}</h2>
                <button class="delete-btn" onclick="deleteNews(${item.id})" title="Delete News">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p>${item.body}</p>
            <a href="${item.url}" target="_blank">Read More →</a>
        `;
        featuresContainer.appendChild(card);
    });
}

// Search functionality
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredCards = newsData.filter(item => 
        item.title.toLowerCase().includes(searchTerm) || 
        item.body.toLowerCase().includes(searchTerm)
    );
    renderCards(filteredCards);
});

// Navigation scroll effect
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.classList.add('active');
    } else {
        header.classList.remove('active');
    }
    
    lastScroll = currentScroll;
});

