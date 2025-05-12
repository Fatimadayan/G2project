const featuresSection = document.getElementById("features");
const loadingMessage = document.getElementById("loading-msg");

//fetch("campusNews.json")
//  .then((response) => {
//    if (!response.ok) {
//      throw new Error("Failed to fetch Campus News");
//    }
//    return response.json();
//  })
//  .then((data) => {
//    // Remove the loading message once data is ready
//    if (loadingMessage) {
//      loadingMessage.remove();
//    }
//
//    data.forEach((item) => {
//      const card = document.createElement("div");
//      card.className = "feature-card";
//      card.innerHTML = `
//        <h2>${item.title}</h2>
//        <p>${item.body}</p>
//        <a href="${item.url}" target="_blank">Read More →</a>`;
//      featuresSection.appendChild(card);
//    });
//  })
//  .catch((error) => {
//    if (loadingMessage) {
//      loadingMessage.textContent = error.message;
//     loadingMessage.style.color = "red";
//    }
//  });

fetch("https://3aa7faeb-f0f7-4ea7-98b7-1eb9cc448768-00-29unw5ntf5qlw.pike.replit.dev/get.php?module=campus_news")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch Campus News");
    }
    return response.json();
  })
  .then((data) => {
    // Remove the loading message once data is ready
    if (loadingMessage) {
      loadingMessage.remove();
    }

    data.forEach((item) => {
      const card = document.createElement("div");
      card.className = "feature-card";
      card.innerHTML = `
        <h2>${item.title}</h2>
        <p>${item.body}</p>
        <a href="${item.url}" target="_blank">Read More →</a>
      `;
      featuresSection.appendChild(card);
    });
  })
  .catch((error) => {
    if (loadingMessage) {
      loadingMessage.textContent = error.message;
      loadingMessage.style.color = "red";
    }
  });

