const EVENTS_API = "https://jsonplaceholder.typicode.com/posts"; // mock API

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector('input[placeholder="Search events..."]');
  const eventList = document.querySelector(".grid");
  const form = document.querySelector("form");

  // Toast container setup
  const toastContainer = document.createElement("div");
  toastContainer.className = "fixed bottom-4 right-4 space-y-2 z-50";
  document.body.appendChild(toastContainer);

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `px-4 py-2 rounded shadow text-white ${
      type === "error" ? "bg-red-500" : "bg-green-500"
    } animate-fadeIn`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
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
      eventList.innerHTML = "<p>No events found.</p>";
      return;
    }
    events.forEach(event => {
      const div = document.createElement("div");
      div.className =
        "border p-4 rounded shadow hover:shadow-lg transition duration-300 transform hover:-translate-y-1 bg-white";
      div.innerHTML = `
        <h2 class="font-bold text-lg mb-2">${event.title}</h2>
        <p class="text-sm text-gray-600 mb-1">Date: ${new Date().toLocaleDateString()}</p>
        <p class="text-sm text-gray-600 mb-2">Location: Online</p>
        <a href="event-detail.html?id=${event.id}" class="text-blue-500 underline">View Details</a>
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
      e.preventDefault();
      const title = form.querySelector('input[type="text"]').value.trim();
      const desc = form.querySelector("textarea").value.trim();
      const date = form.querySelector('input[type="date"]').value;
      const time = form.querySelector('input[type="time"]').value;

      if (!title || !desc || !date || !time) {
        showToast("Please fill in all required fields!", "error");
        return;
      }

      // Simulate adding event
      const newEvent = {
        title,
        desc,
        date,
        time,
        id: Date.now(),
      };
      displayEvents([{ ...newEvent }, ...Array.from(eventList.children).map(div => ({
        title: div.querySelector("h2").innerText,
        id: div.querySelector("a").href.split("=")[1],
      }))]);
      showToast("Event created successfully!");
      form.reset();
    });
  }

  // 4. INITIAL LOAD
  if (eventList) {
    fetchEvents();
  }
});
