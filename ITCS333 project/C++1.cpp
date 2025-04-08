/* Reset some default browser styles (optional but recommended) */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  /* Body and font settings */
  body {
    font-family: Arial, sans-serif;
    color: #333;
  }
  
  /* Header */
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #2a1d1a; /* Dark background color */
    padding: 0.5rem 2rem;
  }
  
  header .logo img {
    height: 50px; /* Adjust as needed */
  }
  
  header nav ul {
    list-style: none;
    display: flex;
    gap: 1.5rem;
  }
  
  header nav ul li a {
    text-decoration: none;
    color: #fff; /* White text on dark background */
    font-weight: 500;
  }
  
  header nav ul li a:hover {
    text-decoration: underline;
  }
  
  /* Hero Section */
  .hero {
    background-color: #2a1d1a; /* Same dark color as header or similar */
    text-align: center;
    padding: 4rem 1rem;
  }
  
  .hero h1 {
    color: #fff;
    font-size: 2rem;
    letter-spacing: 1px;
  }
  
  /* Club Cards Section */
  .club-cards {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    padding: 2rem 1rem;
    background-color: #fff;
  }
  
  .club-card {
    background-color: #f7f7f7;
    border: 1px solid #ccc;
    padding: 2rem;
    min-width: 200px;
    text-align: center;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    font-weight: 500;
    transition: transform 0.2s ease;
  }
  
  .club-card:hover {
    transform: translateY(-5px);
  }
  
  /* Join Us Section */
  .join-us {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4rem 1rem;
    background-color: #efefef;
    /* You can also make it an oval/ellipse container if desired */
    /* For example, with a large border-radius or shape */
    position: relative;
  }
  
  .join-us h2 {
    background-color: #ddd;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-size: 1.5rem;
    text-transform: uppercase;
    text-align: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  /* Upcoming Event Section */
  .upcoming-event {
    background: linear-gradient(180deg, #9fb9a3 0%, #809f88 100%);
    text-align: center;
    padding: 4rem 1rem;
    color: #fff;
  }
  
  .upcoming-event h2 {
    font-size: 1.8rem;
    text-transform: capitalize;
  }
  