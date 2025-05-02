const EVENTS_API = "https://jsonplaceholder.typicode.com/posts"; // mock API

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector('input[placeholder="Search events..."]');
  const eventList = document.querySelector(".grid");
  const form = document.querySelector("form");
  const detailContainer = document.querySelector("#event-detail");

  // 1. FETCH & DISPLAY EVENTS
  async function fetchEvents() {
    try {
      if (eventList) eventList.innerHTML = "<p>Loading events...</p>";
      const response = await fetch(EVENTS_API);
      if (!response.ok) throw new Error("Failed to load events");
      const data = await response.json();

      // Show first 6 only
      if (eventList) displayEvents(data.slice(0, 6));

      // If on detail page
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      if (id && detailContainer) {
        const event = data.find(e => e.id == id);
        displayEventDetail(event);
      }
    } catch (error) {
      if (eventList) {
        eventList.innerHTML = `<p style="color:red;">Error loading events: ${error.message}</p>`;
      } else if (detailContainer) {
        detailContainer.innerHTML = `<p style="color:red;">Error loading event detail: ${error.message}</p>`;
      }
    }
  }

  function displayEvents() {
    eventList.innerHTML = ""; // Clear existing
  
    const titles = [
      "Tech Workshop",
      "Data Science Day",
      "AI Bootcamp",
      "Cybersecurity Summit",
      "Mobile App Hackathon",
      "Green Tech Forum"
    ];
  
    const descriptions = [
      "Learn web development basics with hands-on activities.",
      "Explore data science tools and real-world projects.",
      "Train with experts in artificial intelligence.",
      "Stay ahead with the latest in cybersecurity trends.",
      "Design and develop apps in a weekend sprint.",
      "Discover innovations in clean and green technology."
    ];
  
    for (let i = 0; i < titles.length; i++) {
      const div = document.createElement("div");
      div.className = "event-card";
      div.innerHTML = `
        <img src="https://source.unsplash.com/featured/?technology,${i}" alt="Event Image" class="event-image">
        <div class="event-content">
          <div class="event-title">${titles[i]}</div>
          <p><strong>Description:</strong> ${descriptions[i]}</p>
          <a href="event-detail.html?id=${i}" class="event-button">View Details</a>
        </div>
      `;
      eventList.appendChild(div);
    }
  }
  

  function displayEventDetail(event) {
    if (!event) {
      detailContainer.innerHTML = "<p>Event not found.</p>";
      return;
    }

    detailContainer.innerHTML = `
      <h2>${event.title}</h2>
      <img src="https://source.unsplash.com/featured/?technology,${event.id}" alt="${event.title}" style="width:100%; max-height:300px; object-fit:cover; border-radius:10px;" />
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Time:</strong> 3:00 PM</p>
      <p><strong>Location:</strong> Online</p>
      <p><strong>Description:</strong> ${event.body}</p>

      <section style="margin-top: 2rem;">
        <h3>Comments</h3>
        <p style="font-style: italic;">(Comment box UI only)</p>
      </section>

      <div style="margin-top: 1.5rem;">
        <button>Edit</button>
        <button class="secondary">Delete</button>
        <a href="event.html" class="secondary">Back to Events</a>
      </div>
    `;
  }

  // 2. SEARCH FILTER
  if (searchInput) {
    searchInput.addEventListener("input", async () => {
      const response = await fetch(EVENTS_API);
      const events = await response.json();
      const keyword = searchInput.value.toLowerCase();
      const filtered = events.filter(ev => ev.title.toLowerCase().includes(keyword));
      displayEvents(filtered.slice(0, 6));
    });
  }

  // 3. FORM VALIDATION
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const title = form.querySelector('input[type="text"]').value.trim();
      const desc = form.querySelector('textarea').value.trim();
      const date = form.querySelector('input[type="date"]').value;
      const time = form.querySelector('input[type="time"]').value;

      if (!title || !desc || !date || !time) {
        alert("Please fill in all required fields!");
        return;
      }

      const newEvent = {
        id: Date.now(),
        title,
        description: desc,
        date,
        time
      };

      const eventCard = document.createElement("div");
      eventCard.className = "border p-4 rounded shadow animate-fadeIn bg-white mt-4";
      eventCard.innerHTML = `
        <h2 class="font-bold text-lg">${newEvent.title}</h2>
        <p>Date: ${newEvent.date} ${newEvent.time}</p>
        <p>Location: Online</p>
        <p>${newEvent.description}</p>
        <span class="text-green-500 font-semibold">Event created successfully!</span>
      `;
      form.insertAdjacentElement("afterend", eventCard);
      form.reset();
    });
  }

  // 4. INITIALIZE
  fetchEvents();
});
