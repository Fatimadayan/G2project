const EVENTS_API = "https://jsonplaceholder.typicode.com/posts"; // mock API

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector('input[placeholder="Search events..."]');
  const eventList = document.querySelector(".grid");
  const form = document.querySelector("form");

  // Show toast notification
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.className = `fixed top-5 right-5 px-4 py-2 rounded shadow-lg text-white z-50 ${
      type === "success" ? "bg-green-600" : "bg-red-500"
    }`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // 1. FETCH & DISPLAY EVENTS
  async function fetchEvents() {
    try {
      eventList.innerHTML = "<p>Loading events...</p>";
      const response = await fetch(EVENTS_API);
      if (!response.ok) throw new Error("Failed to load events");
      const data = await response.json();
      displayEvents(data.slice(0, 6)); // Show only first 6 for now
    } catch (error) {
      eventList.innerHTML = `<p style="color:red;">Error loading events: ${error.message}</p>`;
    }
  }

  function displayEvents(events) {
    eventList.innerHTML = ""; // Clear existing
    if (events.length === 0) {
      eventList.innerHTML = `<p class="text-red-600 font-semibold">No events found.</p>`;
      return;
    }
    events.forEach(event => {
      const div = document.createElement("div");
      div.className = "border p-4 rounded shadow transition-all duration-300 hover:scale-105 bg-white";
      div.innerHTML = `
        <h2 class="font-bold text-lg">${event.title}</h2>
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <p>Location: Online</p>
        <a href="event-detail.html?id=${event.id}" class="text-blue-500 underline" title="Click for full details">View Details</a>
      `;
      eventList.appendChild(div);
    });
  }

  // 2. SEARCH FILTER
  if (searchInput) {
    searchInput.addEventListener("input", async () => {
      const response = await fetch(EVENTS_API);
      const events = await response.json();
      const keyword = searchInput.value.toLowerCase();
      const filtered = events.filter(ev => ev.title.toLowerCase().includes(keyword));
      displayEvents(filtered);
    });
  }

  // 3. FORM VALIDATION
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault(); // Prevent reload
      const title = form.querySelector('input[type="text"]').value.trim();
      const desc = form.querySelector('textarea').value.trim();
      const date = form.querySelector('input[type="date"]').value;
      const time = form.querySelector('input[type="time"]').value;

      if (!title || !desc || !date || !time) {
        showToast("Please fill in all required fields!", "error");
        return;
      }

      // Simulate event creation
      const newEvent = {
        id: Date.now(),
        title,
        desc,
        date,
        time
      };

      // Add to the top of the list for now (mocked behavior)
      const currentEvents = Array.from(eventList.children).map(div => ({
        title: div.querySelector("h2").textContent,
        id: div.querySelector("a").href.split("id=")[1]
      }));
      displayEvents([newEvent, ...currentEvents]);
      form.reset();
      showToast("Event created successfully 🎉");
    });
  }

  // 4. INITIAL LOAD
  if (eventList) {
    fetchEvents();
  }
});