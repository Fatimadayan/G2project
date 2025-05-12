const EVENTS_API = "https://3aa7faeb-f0f7-4ea7-98b7-1eb9cc448768-00-29unw5ntf5qlw.pike.replit.dev/get.php?module=eventhttps://3aa7faeb-f0f7-4ea7-98b7-1eb9cc448768-00-29unw5ntf5qlw.pike.replit.dev/s";

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector('input[placeholder="Search events..."]');
  const eventList = document.querySelector(".grid");
  const form = document.querySelector("form");
  const detailContainer = document.querySelector("#event-detail");

  // 1. Fetch and display events
  async function fetchEvents() {
    try {
      if (eventList) eventList.innerHTML = "<p>Loading events...</p>";

      const response = await fetch(EVENTS_API);
      if (!response.ok) throw new Error("Failed to load events");

      const data = await response.json();

      if (eventList) displayEvents(data.slice(0, 10));

      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");

      if (id && detailContainer) {
        const event = data.find(e => e.id == id);
        displayEventDetail(event);
      }
    } catch (error) {
      const msg = `<p style="color:red;">Error loading events: ${error.message}</p>`;
      if (eventList) eventList.innerHTML = msg;
      if (detailContainer) detailContainer.innerHTML = msg;
    }
  }


  function displayEvents(events = []) {
    eventList.innerHTML = "";

    if (events.length === 0) {
      eventList.innerHTML = "<p>No events found.</p>";
      return;
    }

    events.forEach(e => {
      const div = document.createElement("div");
      div.className = "event-card";
      div.innerHTML = `
        <img src="${e.image}" alt="Event Image" class="event-image">
        <div class="event-content">
          <div class="event-title">${e.title}</div>
          <p><strong>Description:</strong> ${e.description}</p>
          <a href="event-detail.html?id=${e.id}" class="event-button">View Details</a>
        </div>
      `;
      eventList.appendChild(div);
    });
  }

  function displayEventDetail(event) {
    if (!event) {
      detailContainer.innerHTML = "<p>Event not found.</p>";
      return;
    }
  
    detailContainer.innerHTML = `
      <h2>${event.title}</h2>
      <img src="${event.image}" alt="${event.title}" class="fullscreen-image" style="width:100%; max-height:300px; object-fit:cover; border-radius:10px; cursor: zoom-in;" />
      <p><strong>Date:</strong> ${event.date}</p>
      <p><strong>Time:</strong> ${event.time}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p><strong>Description:</strong> ${event.description}</p>
  
      <!-- Comment Section -->
      <section class="comment-section" style="margin-top: 2rem;">
        <h3>Comments</h3>
        <form id="comment-form">
          <textarea 
            class="comment-textarea" 
            placeholder="Leave a comment..." 
            required></textarea>
          <button type="submit" class="comment-btn">Post Comment</button>
        </form>
        <div id="comment-list" class="comment-list"></div>
      </section>
  
      <div style="margin-top: 1.5rem;">
        <button>Edit</button>
        <button class="secondary">Delete</button>
        <a href="event.html" class="secondary">Back to Events</a>
      </div>
  
      <!-- Fullscreen Modal HTML -->
      <div id="imageModal" class="image-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.9); justify-content:center; align-items:center; z-index:9999;">
        <img id="modalImage" style="max-width:90%; max-height:90%; border-radius:10px;" />
        <span id="closeModal" style="position:absolute; top:20px; right:30px; font-size:30px; color:white; cursor:pointer;">✕</span>
      </div>
    `;
  
    // Fullscreen Modal Functionality
    const img = document.querySelector(".fullscreen-image");
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeModal = document.getElementById("closeModal");
  
    img.addEventListener("click", () => {
      modal.style.display = "flex";
      modalImg.src = img.src;
    });
  
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });
  
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  
    //  COMMENT FORM HANDLING 
    const form = document.getElementById("comment-form");
    const commentList = document.getElementById("comment-list");
  
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const textarea = form.querySelector("textarea");
        const comment = textarea.value.trim();
        if (comment) {
          const div = document.createElement("div");
          div.className = "comment-bubble animate-fadeIn";
          div.textContent = comment;
          commentList.appendChild(div);
          textarea.value = "";
        }
      });
    }
  }
  
  
  // 4. Initialize events
  fetchEvents();
});
