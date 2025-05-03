const EVENTS_API = "https://6816567f32debfe95dbe28c5.mockapi.io/uob"; // Your API endpoint

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector('input[placeholder="Search events..."]');
  const eventList = document.querySelector(".grid");
  const form = document.querySelector("form");
  const detailContainer = document.querySelector("#event-detail");

  // 1. Fetch and display events
  async function fetchEvents() {
    try {
      if (eventList) eventList.innerHTML = "<p>Loading events...</p>"; // Show loading message
      const response = await fetch(EVENTS_API); // Make the API request

      if (!response.ok) {
        console.error("Failed to fetch events:", response.status, response.statusText); // Log error status
        throw new Error("Failed to load events");
      }

      const data = await response.json();
      console.log("Fetched events:", data); // Debugging line

      if (eventList) displayEvents(data.slice(0, 10)); // Display only the first 6 events

      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");

      if (id && detailContainer) {
        const event = data.find(e => e.id == id);
        displayEventDetail(event);
      }
    } catch (error) {
      const msg = `<p style="color:red;">Error loading events: ${error.message}</p>`;
      console.error("Error:", error); // Log error message
      if (eventList) eventList.innerHTML = msg;
      if (detailContainer) detailContainer.innerHTML = msg;
    }
  }

  function displayEvents(events = []) {
    eventList.innerHTML = ""; // Clear previous events

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
      <img src="${event.image}" alt="${event.title}" style="width:100%; max-height:300px; object-fit:cover; border-radius:10px;" />
      <p><strong>Date:</strong> ${event.date}</p>
      <p><strong>Time:</strong> ${event.time}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p><strong>Description:</strong> ${event.description}</p>
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
      try {
        const response = await fetch(EVENTS_API);
        const events = await response.json();
        const keyword = searchInput.value.toLowerCase();
        const filtered = events.filter(ev => ev.title.toLowerCase().includes(keyword));
        displayEvents(filtered.slice(0, 6));
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    });
  }

  // 3. FORM SUBMISSION (CREATE EVENT)
  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const title = form.querySelector('input[type="text"]').value.trim();
      const description = form.querySelector('textarea').value.trim();
      const date = form.querySelector('input[type="date"]').value;
      const time = form.querySelector('input[type="time"]').value;
      const location = "Online"; // Change this as per your needs
      const image = `https://source.unsplash.com/featured/?technology,${Math.floor(Math.random() * 1000)}`;

      if (!title || !description || !date || !time) {
        alert("Please fill in all required fields!");
        return;
      }

      const newEvent = { title, description, date, time, location, image };

      try {
        const res = await fetch(EVENTS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEvent)
        });

        if (!res.ok) throw new Error("Failed to create event");

        const saved = await res.json();
        console.log("Event posted:", saved);

        const eventCard = document.createElement("div");
        eventCard.className = "border p-4 rounded shadow animate-fadeIn bg-white mt-4";
        eventCard.innerHTML = `
          <h2 class="font-bold text-lg">${saved.title}</h2>
          <p>Date: ${saved.date} ${saved.time}</p>
          <p>Location: ${saved.location}</p>
          <p>${saved.description}</p>
          <span class="text-green-500 font-semibold">Event created successfully!</span>
        `;
        form.insertAdjacentElement("afterend", eventCard);
        form.reset();
      } catch (err) {
        console.error("Error creating event:", err);
        alert("Error creating event: " + err.message);
      }
    });
  }

  // 4. INITIALIZE EVENTS
  fetchEvents();
});
