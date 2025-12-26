// Crew tabs functionality
let currentCrew = 0;
let crew = null;

// Fallback data if fetch fails (for file:// protocol)
const fallbackData = {
  crew: [
    {
      name: "Douglas Hurley",
      images: {
        png: "./assets/crew/image-douglas-hurley.png",
        webp: "./assets/crew/image-douglas-hurley.webp"
      },
      role: "Commander",
      bio: "Douglas Gerald Hurley is an American engineer, former Marine Corps pilot and former NASA astronaut. He launched into space for the third time as commander of Crew Dragon Demo-2."
    },
    {
      name: "Mark Shuttleworth",
      images: {
        png: "./assets/crew/image-mark-shuttleworth.png",
        webp: "./assets/crew/image-mark-shuttleworth.webp"
      },
      role: "Mission Specialist",
      bio: "Mark Richard Shuttleworth is the founder and CEO of Canonical, the company behind the Linux-based Ubuntu operating system. Shuttleworth became the first South African to travel to space as a space tourist."
    },
    {
      name: "Victor Glover",
      images: {
        png: "./assets/crew/image-victor-glover.png",
        webp: "./assets/crew/image-victor-glover.webp"
      },
      role: "Pilot",
      bio: "Pilot on the first operational flight of the SpaceX Crew Dragon to the International Space Station. Glover is a commander in the U.S. Navy where he pilots an F/A-18.He was a crew member of Expedition 64, and served as a station systems flight engineer."
    },
    {
      name: "Anousheh Ansari",
      images: {
        png: "./assets/crew/image-anousheh-ansari.png",
        webp: "./assets/crew/image-anousheh-ansari.webp"
      },
      role: "Flight Engineer",
      bio: "Anousheh Ansari is an Iranian American engineer and co-founder of Prodea Systems. Ansari was the fourth self-funded space tourist, the first self-funded woman to fly to the ISS, and the first Iranian in space."
    }
  ]
};

async function loadCrew() {
  try {
    console.log('Loading crew from data.json...');
    const response = await fetch('./data.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch data.json: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Data loaded from JSON:', data);
    crew = data.crew;
  } catch (error) {
    console.warn('Error loading crew from JSON, using fallback data:', error.message);
    crew = fallbackData.crew;
  }
  
  console.log('Crew:', crew);
  if (crew && crew.length > 0) {
    console.log('Updating crew display...');
    updateCrew();
    updateCrewTabs();
  } else {
    console.error('No crew found in data');
  }
}

function updateCrew() {
  if (!crew || !crew[currentCrew]) {
    console.log('No crew data available');
    return;
  }
  
  const crewMember = crew[currentCrew];
  console.log('Updating crew:', crewMember);
  
  const imgEl = document.getElementById('crew-image');
  const roleEl = document.getElementById('crew-role');
  const nameEl = document.getElementById('crew-name');
  const bioEl = document.getElementById('crew-bio');

  if (imgEl && crewMember.images) {
    const imagePath = crewMember.images.webp.startsWith('./') 
      ? crewMember.images.webp 
      : './' + crewMember.images.webp;
    imgEl.src = imagePath;
    imgEl.alt = crewMember.name;
    console.log('Setting crew image src to:', imagePath);
  }
  if (roleEl) {
    roleEl.textContent = crewMember.role.toUpperCase();
    console.log('Setting role to:', crewMember.role);
  }
  if (nameEl) {
    nameEl.textContent = crewMember.name;
    console.log('Setting name to:', crewMember.name);
  }
  if (bioEl) {
    bioEl.textContent = crewMember.bio;
    console.log('Setting bio');
  }
}

function updateCrewTabs() {
  const tabs = document.querySelectorAll('.crew-tab');
  tabs.forEach((tab, index) => {
    if (index === currentCrew) {
      tab.classList.remove('opacity-20');
      tab.classList.add('opacity-100');
    } else {
      tab.classList.add('opacity-20');
      tab.classList.remove('opacity-100');
    }
  });
}

// Setup tab event listeners
function setupCrewTabs() {
  const crewTabs = document.querySelectorAll('.crew-tab');
  crewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentCrew = parseInt(tab.getAttribute('data-crew'));
      updateCrew();
      updateCrewTabs();
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
    setupCrewTabs();
    loadCrew();
  });
} else {
  // DOM is already ready
  setupMobileMenu();
  setupCrewTabs();
  loadCrew();
}

