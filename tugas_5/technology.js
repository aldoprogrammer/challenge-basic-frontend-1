// Technology tabs functionality
let currentTechnology = 0;
let technology = null;

// Fallback data if fetch fails (for file:// protocol)
const fallbackData = {
  technology: [
    {
      name: "Launch vehicle",
      images: {
        portrait: "./assets/technology/image-launch-vehicle-portrait.jpg",
        landscape: "./assets/technology/image-launch-vehicle-landscape.jpg"
      },
      description: "A launch vehicle or carrier rocket is a rocket-propelled vehicle used to carry a payload from Earth's surface to space, usually to Earth orbit or beyond. Our WEB-X carrier rocket is the most powerful in operation. Standing 150 metres tall, it's quite an awe-inspiring sight on the launch pad!"
    },
    {
      name: "Spaceport",
      images: {
        portrait: "./assets/technology/image-spaceport-portrait.jpg",
        landscape: "./assets/technology/image-spaceport-landscape.jpg"
      },
      description: "A spaceport or cosmodrome is a site for launching (or receiving) spacecraft, by analogy to the seaport for ships or airport for aircraft. Based in the famous Cape Canaveral, our spaceport is ideally situated to take advantage of the Earth's rotation for launch."
    },
    {
      name: "Space capsule",
      images: {
        portrait: "./assets/technology/image-space-capsule-portrait.jpg",
        landscape: "./assets/technology/image-space-capsule-landscape.jpg"
      },
      description: "A space capsule is an often-crewed spacecraft that uses a blunt-body reentry capsule to reenter the Earth's atmosphere without wings. Our capsule is where you'll spend your time during the flight. It includes a space gym, cinema, and plenty of other activities to keep you entertained."
    }
  ]
};

async function loadTechnology() {
  try {
    console.log('Loading technology from data.json...');
    const response = await fetch('./data.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch data.json: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Data loaded from JSON:', data);
    technology = data.technology;
  } catch (error) {
    console.warn('Error loading technology from JSON, using fallback data:', error.message);
    technology = fallbackData.technology;
  }
  
  console.log('Technology:', technology);
  if (technology && technology.length > 0) {
    console.log('Updating technology display...');
    updateTechnology();
    updateTechTabs();
  } else {
    console.error('No technology found in data');
  }
}

function updateTechnology() {
  if (!technology || !technology[currentTechnology]) {
    console.log('No technology data available');
    return;
  }
  
  const tech = technology[currentTechnology];
  console.log('Updating technology:', tech);
  
  const portraitImg = document.getElementById('tech-image-portrait');
  const landscapeImg = document.getElementById('tech-image-landscape');
  const nameEl = document.getElementById('tech-name');
  const descEl = document.getElementById('tech-description');
  
  if (portraitImg && tech.images) {
    const portraitPath = tech.images.portrait.startsWith('./') 
      ? tech.images.portrait 
      : './' + tech.images.portrait;
    portraitImg.srcset = portraitPath;
    console.log('Setting portrait image srcset to:', portraitPath);
  }
  if (landscapeImg && tech.images) {
    const landscapePath = tech.images.landscape.startsWith('./') 
      ? tech.images.landscape 
      : './' + tech.images.landscape;
    landscapeImg.src = landscapePath;
    landscapeImg.alt = tech.name;
    console.log('Setting landscape image src to:', landscapePath);
  }
  if (nameEl) {
    nameEl.textContent = tech.name.toUpperCase();
    console.log('Setting name to:', tech.name);
  }
  if (descEl) {
    descEl.textContent = tech.description;
    console.log('Setting description');
  }
}

function updateTechTabs() {
  const tabs = document.querySelectorAll('.tech-tab');
  tabs.forEach((tab, index) => {
    if (index === currentTechnology) {
      tab.classList.add('bg-space-white', 'text-space-dark', 'border-space-white');
      tab.classList.remove('border-space-light');
    } else {
      tab.classList.remove('bg-space-white', 'text-space-dark', 'border-space-white');
      tab.classList.add('border-space-light');
    }
  });
}

// Setup tab event listeners
function setupTechTabs() {
  const techTabs = document.querySelectorAll('.tech-tab');
  techTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentTechnology = parseInt(tab.getAttribute('data-tech'));
      updateTechnology();
      updateTechTabs();
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
    setupTechTabs();
    loadTechnology();
  });
} else {
  // DOM is already ready
  setupMobileMenu();
  setupTechTabs();
  loadTechnology();
}

