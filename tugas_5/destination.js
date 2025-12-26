// Destination tabs functionality
let currentDestination = 0;
let destinations = null;

// Fallback data if fetch fails (for file:// protocol)
const fallbackData = {
  destinations: [
    {
      name: "Moon",
      images: {
        png: "./assets/destination/image-moon.png",
        webp: "./assets/destination/image-moon.webp"
      },
      description: "See our planet as you've never seen it before. A perfect relaxing trip away to help regain perspective and come back refreshed. While you're there, take in some history by visiting the Luna 2 and Apollo 11 landing sites.",
      distance: "384,400 km",
      travel: "3 days"
    },
    {
      name: "Mars",
      images: {
        png: "./assets/destination/image-mars.png",
        webp: "./assets/destination/image-mars.webp"
      },
      description: "Don't forget to pack your hiking boots. You'll need them to tackle Olympus Mons, the tallest planetary mountain in our solar system. It's two and a half times the size of Everest!",
      distance: "225 mil. km",
      travel: "9 months"
    },
    {
      name: "Europa",
      images: {
        png: "./assets/destination/image-europa.png",
        webp: "./assets/destination/image-europa.webp"
      },
      description: "The smallest of the four Galilean moons orbiting Jupiter, Europa is a winter lover's dream. With an icy surface, it's perfect for a bit of ice skating, curling, hockey, or simple relaxation in your snug wintery cabin.",
      distance: "628 mil. km",
      travel: "3 years"
    },
    {
      name: "Titan",
      images: {
        png: "./assets/destination/image-titan.png",
        webp: "./assets/destination/image-titan.webp"
      },
      description: "The only moon known to have a dense atmosphere other than Earth, Titan is a home away from home (just a few hundred degrees colder!). As a bonus, you get striking views of the Rings of Saturn.",
      distance: "1.6 bil. km",
      travel: "7 years"
    }
  ]
};

async function loadDestinations() {
  try {
    console.log('Loading destinations from data.json...');
    const response = await fetch('./data.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch data.json: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Data loaded from JSON:', data);
    destinations = data.destinations;
  } catch (error) {
    console.warn('Error loading destinations from JSON, using fallback data:', error.message);
    destinations = fallbackData.destinations;
  }
  
  console.log('Destinations:', destinations);
  if (destinations && destinations.length > 0) {
    console.log('Updating destination display...');
    updateDestination();
    updateDestinationTabs();
  } else {
    console.error('No destinations found in data');
  }
}

function updateDestination() {
  if (!destinations || !destinations[currentDestination]) {
    console.log('No destination data available');
    return;
  }
  
  const destination = destinations[currentDestination];
  console.log('Updating destination:', destination);
  
  const imgEl = document.getElementById('destination-image');
  const nameEl = document.getElementById('destination-name');
  const descEl = document.getElementById('destination-description');
  const distEl = document.getElementById('destination-distance');
  const travelEl = document.getElementById('destination-travel');

  if (imgEl && destination.images) {
    // Ensure path is correct
    const imagePath = destination.images.webp.startsWith('./') 
      ? destination.images.webp 
      : './' + destination.images.webp;
    imgEl.src = imagePath;
    imgEl.alt = destination.name;
    console.log('Setting image src to:', imagePath);
  }
  if (nameEl) {
    nameEl.textContent = destination.name;
    console.log('Setting name to:', destination.name);
  }
  if (descEl) {
    descEl.textContent = destination.description;
    console.log('Setting description');
  }
  if (distEl) {
    distEl.textContent = destination.distance;
    console.log('Setting distance to:', destination.distance);
  }
  if (travelEl) {
    travelEl.textContent = destination.travel;
    console.log('Setting travel time to:', destination.travel);
  }
}

function updateDestinationTabs() {
  const tabs = document.querySelectorAll('.destination-tab');
  tabs.forEach((tab, index) => {
    if (index === currentDestination) {
      tab.classList.add('border-space-white', 'text-space-white');
      tab.classList.remove('border-transparent', 'text-space-light');
    } else {
      tab.classList.remove('border-space-white', 'text-space-white');
      tab.classList.add('border-transparent', 'text-space-light');
    }
  });
}

// Setup tab event listeners
function setupDestinationTabs() {
  const destinationTabs = document.querySelectorAll('.destination-tab');
  destinationTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentDestination = parseInt(tab.getAttribute('data-dest'));
      updateDestination();
      updateDestinationTabs();
    });
  });
}

// Mobile menu toggle
function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const hamburgerIcon = document.getElementById('hamburgerIcon');
  const closeIcon = document.getElementById('closeIcon');

  if (mobileMenuBtn && mobileMenu && hamburgerIcon && closeIcon) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      hamburgerIcon.classList.toggle('hidden');
      closeIcon.classList.toggle('hidden');
    });
  }

  // Close mobile menu when clicking a link
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu && hamburgerIcon && closeIcon) {
        mobileMenu.classList.add('hidden');
        hamburgerIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
      }
    });
  });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupDestinationTabs();
    loadDestinations();
  });
} else {
  // DOM is already ready
  setupMobileMenu();
  setupDestinationTabs();
  loadDestinations();
}

