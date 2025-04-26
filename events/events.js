
const EVENTS_API = "https://jsonplaceholder.typicode.com/posts"; // mock API

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector('input[placeholder="Search events..."]');
  const eventList = document.querySelector(".grid");
  const form = document.querySelector("form");

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
    events.forEach(event => {
      const div = document.createElement("div");
      div.className = "border p-4 rounded shadow animate-fadeIn bg-white";
      div.innerHTML = `
        <h2 class="font-bold text-lg">${event.title}</h2>
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <p>Location: Online</p>
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

  // 3. FORM VALIDATION + INTERACTIVE FEEDBACK
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
        title: title,
        description: desc,
        date: date,
        time: time
      };

      // Add to UI instantly
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

  // 4. INITIAL LOAD
  if (eventList) {
    fetchEvents();
  }
});
