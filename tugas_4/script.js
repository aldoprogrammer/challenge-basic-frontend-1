// State management
let state = {
  passages: null,
  currentPassage: null,
  difficulty: 'hard', // Default to hard
  mode: 'timed',
  isTestActive: false,
  isTestComplete: false,
  startTime: null,
  endTime: null,
  typedText: '',
  errors: new Set(), // Use Set to track unique error positions
  totalErrors: 0, // Track total errors (including corrected ones)
  timer: null,
  timeRemaining: 60,
  timeElapsed: 0,
  personalBest: null
};

// DOM elements
const elements = {
  personalBest: document.getElementById('personalBest'),
  statsBar: document.getElementById('statsBar'),
  wpm: document.getElementById('wpm'),
  accuracy: document.getElementById('accuracy'),
  time: document.getElementById('time'),
  restartBtn: document.getElementById('restartBtn'),
  restartButtonContainer: document.getElementById('restartButtonContainer'),
  difficultyButtons: {
    easy: document.getElementById('difficulty-easy'),
    medium: document.getElementById('difficulty-medium'),
    hard: document.getElementById('difficulty-hard')
  },
  modeButtons: {
    timed: document.getElementById('mode-timed'),
    passage: document.getElementById('mode-passage')
  },
  testArea: document.getElementById('testArea'),
  passageContainer: document.getElementById('passageContainer'),
  passageText: document.getElementById('passageText'),
  startPrompt: document.getElementById('startPrompt'),
  startBtn: document.getElementById('startBtn'),
  resultsModal: document.getElementById('resultsModal'),
  confetti: document.getElementById('confetti'),
  resultsTitle: document.getElementById('resultsTitle'),
  resultsMessage: document.getElementById('resultsMessage'),
  resultsWpm: document.getElementById('resultsWpm'),
  resultsAccuracy: document.getElementById('resultsAccuracy'),
  resultsChars: document.getElementById('resultsChars'),
  goAgainBtn: document.getElementById('goAgainBtn')
};

// Load passages from data.json
async function loadPassages() {
  try {
    const response = await fetch('./data.json');
    state.passages = await response.json();
    loadPersonalBest();
    loadRandomPassage();
  } catch (error) {
    console.error('Error loading passages:', error);
    // Fallback data for file:// protocol
    state.passages = {
      easy: [
        { id: "easy-1", text: "The sun rose over the quiet town. Birds sang in the trees as people woke up and started their day. It was going to be a warm and sunny morning." },
        { id: "easy-2", text: "She walked to the store to buy some bread and milk. The shop was busy but she found what she needed quickly. On her way home, she saw a friend and waved." }
      ],
      medium: [
        { id: "medium-1", text: "Learning a new skill takes patience and consistent practice. Whether you're studying a language, picking up an instrument, or mastering a sport, the key is to show up every day. Small improvements compound over time, and before you know it, you'll have made remarkable progress." }
      ],
      hard: [
        { id: "hard-1", text: "The philosopher's argument hinged on a seemingly paradoxical assertion: that absolute freedom, pursued without constraint, inevitably undermines itself. \"Consider,\" she wrote, \"how the libertarian ideal—when taken to its logical extreme—produces conditions in which the powerful dominate the weak, thereby eliminating freedom for the majority.\" Her critics dismissed this as sophistry; her supporters hailed it as profound." }
      ]
    };
    loadPersonalBest();
    loadRandomPassage();
  }
}

// Load personal best from localStorage
function loadPersonalBest() {
  const pb = localStorage.getItem('typingSpeedPB');
  if (pb) {
    state.personalBest = parseInt(pb);
    elements.personalBest.textContent = state.personalBest;
  } else {
    elements.personalBest.textContent = '--';
  }
}

// Save personal best to localStorage
function savePersonalBest(wpm) {
  localStorage.setItem('typingSpeedPB', wpm.toString());
  state.personalBest = wpm;
  elements.personalBest.textContent = wpm;
}

// Load random passage based on difficulty
function loadRandomPassage() {
  if (!state.passages) return;
  
  const difficultyPassages = state.passages[state.difficulty];
  if (!difficultyPassages || difficultyPassages.length === 0) return;
  
  const randomIndex = Math.floor(Math.random() * difficultyPassages.length);
  state.currentPassage = difficultyPassages[randomIndex];
  state.typedText = '';
  state.errors = new Set();
  state.totalErrors = 0;
  renderPassage();
}

// Render passage with visual feedback
function renderPassage() {
  if (!state.currentPassage) return;
  
  const text = state.currentPassage.text;
  let html = '';
  const currentIndex = state.typedText.length;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const typedChar = state.typedText[i];
    
    if (i < state.typedText.length) {
      // Character has been typed - show what user typed
      if (typedChar === char) {
        // Correct character - green
        html += `<span class="text-green-500 font-semibold">${escapeHtml(char)}</span>`;
      } else {
        // Incorrect character - red with underline
        html += `<span class="text-red-500 underline font-semibold">${escapeHtml(char)}</span>`;
        // Mark this position as an error (only add once)
        state.errors.add(i);
      }
    } else if (i === currentIndex) {
      // Current cursor position - blue background
      html += `<span class="bg-blue-400 text-neutral-900 font-semibold">${escapeHtml(char)}</span>`;
    } else {
      // Not yet typed - neutral gray
      html += `<span class="text-neutral-400">${escapeHtml(char)}</span>`;
    }
  }
  
  elements.passageText.innerHTML = html;
  
  // Scroll to keep cursor visible
  if (elements.passageContainer) {
    const cursorElement = elements.passageText.querySelector('.bg-blue-400');
    if (cursorElement) {
      cursorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Calculate WPM
function calculateWPM() {
  if (!state.startTime) return 0;
  
  const now = Date.now();
  const minutes = (now - state.startTime) / 60000;
  const words = state.typedText.length / 5; // Average word length is 5 characters
  return Math.round(words / minutes);
}

// Calculate accuracy
function calculateAccuracy() {
  if (state.typedText.length === 0) return 100;
  const totalChars = state.typedText.length;
  // Count unique error positions
  const errorCount = state.errors.size;
  const accuracy = Math.max(0, ((totalChars - errorCount) / totalChars) * 100);
  return Math.round(accuracy);
}

// Update stats
function updateStats() {
  if (!state.isTestActive) return;
  
  const wpm = calculateWPM();
  const accuracy = calculateAccuracy();
  
  if (state.mode === 'timed') {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;
    elements.time.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  } else {
    const minutes = Math.floor(state.timeElapsed / 60);
    const seconds = Math.floor(state.timeElapsed % 60);
    elements.time.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  elements.wpm.textContent = wpm;
  elements.accuracy.textContent = `${accuracy}%`;
  
  // Always show accuracy in red, time in yellow
  elements.accuracy.classList.add('text-red-500');
  elements.accuracy.classList.remove('text-white', 'text-neutral-400');
  elements.time.classList.add('text-yellow-400');
  elements.time.classList.remove('text-white', 'text-neutral-400');
}

// Start test
function startTest() {
  if (state.isTestActive) return;
  
  state.isTestActive = true;
  state.isTestComplete = false;
  state.startTime = Date.now();
  state.typedText = '';
  state.errors = new Set();
  state.totalErrors = 0;
  state.timeElapsed = 0;
  
  elements.startPrompt.classList.add('hidden');
  elements.statsBar.classList.remove('hidden');
  elements.statsBar.classList.add('flex');
  if (elements.restartButtonContainer) {
    elements.restartButtonContainer.classList.remove('hidden');
  }
  
  if (state.mode === 'timed') {
    state.timeRemaining = 60;
    state.timer = setInterval(() => {
      state.timeRemaining--;
      updateStats();
      
      if (state.timeRemaining <= 0) {
        endTest();
      }
    }, 1000);
  } else {
    state.timer = setInterval(() => {
      state.timeElapsed += 0.1;
      updateStats();
    }, 100);
  }
  
  renderPassage();
  updateStats();
  elements.passageContainer.focus();
}

// End test
function endTest() {
  if (!state.isTestActive) return;
  
  state.isTestActive = false;
  state.isTestComplete = true;
  state.endTime = Date.now();
  
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
  
  const wpm = calculateWPM();
  const accuracy = calculateAccuracy();
  const errorCount = state.errors.size;
  const correctChars = state.typedText.length - errorCount;
  const incorrectChars = errorCount;
  
  // Check for personal best
  let isNewPB = false;
  let isFirstTest = false;
  
  if (state.personalBest === null) {
    isFirstTest = true;
    savePersonalBest(wpm);
    elements.resultsTitle.textContent = 'Baseline Established!';
    elements.resultsMessage.textContent = 'You\'ve set your first personal best. Keep practicing to improve!';
  } else if (wpm > state.personalBest) {
    isNewPB = true;
    savePersonalBest(wpm);
    elements.resultsTitle.textContent = 'High Score Smashed!';
    elements.resultsMessage.textContent = 'Congratulations! You\'ve beaten your personal best.';
    elements.confetti.classList.remove('hidden');
  } else {
    elements.resultsTitle.textContent = 'Test Complete!';
    elements.resultsMessage.textContent = 'Solid run. Keep pushing to beat your high score.';
    elements.confetti.classList.add('hidden');
  }
  
  elements.resultsWpm.textContent = wpm;
  elements.resultsAccuracy.textContent = `${accuracy}%`;
  elements.resultsChars.textContent = `${correctChars} / ${incorrectChars}`;
  elements.resultsModal.classList.remove('hidden');
  if (elements.restartButtonContainer) {
    elements.restartButtonContainer.classList.remove('hidden');
  }
}

// Check if passage is complete
function checkPassageComplete() {
  if (!state.currentPassage) return false;
  return state.typedText.length >= state.currentPassage.text.length;
}

// Restart test
function restartTest() {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }
  
  state.isTestActive = false;
  state.isTestComplete = false;
  state.typedText = '';
  state.errors = new Set();
  state.totalErrors = 0;
  state.startTime = null;
  state.endTime = null;
  state.timeRemaining = 60;
  state.timeElapsed = 0;
  
  loadRandomPassage();
  elements.startPrompt.classList.remove('hidden');
  elements.statsBar.classList.add('hidden');
  elements.statsBar.classList.remove('flex');
  elements.resultsModal.classList.add('hidden');
  elements.confetti.classList.add('hidden');
  if (elements.restartButtonContainer) {
    elements.restartButtonContainer.classList.add('hidden');
  }
}

// Handle typing
function handleTyping(e) {
  // Start test if not active
  if (!state.isTestActive && !state.isTestComplete) {
    startTest();
  }
  
  if (!state.isTestActive || state.isTestComplete) {
    e.preventDefault();
    return;
  }
  
  // Handle backspace
  if (e.key === 'Backspace') {
    if (state.typedText.length > 0) {
      const lastIndex = state.typedText.length - 1;
      state.typedText = state.typedText.slice(0, -1);
      // Note: We don't remove errors from the Set because errors should count even if corrected
      // This matches the requirement: "original errors still count against accuracy"
    }
  } 
  // Handle regular character input
  else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const currentIndex = state.typedText.length;
    const expectedChar = state.currentPassage.text[currentIndex];
    
    // Only allow typing if we haven't completed the passage
    if (currentIndex < state.currentPassage.text.length) {
      state.typedText += e.key;
      
      // Check if this character is correct
      if (e.key !== expectedChar) {
        // Mark this position as an error
        state.errors.add(currentIndex);
      }
      
      // Check if passage is complete
      if (checkPassageComplete()) {
        endTest();
      }
    }
  }
  
  renderPassage();
  updateStats();
  e.preventDefault();
}

// Update difficulty button states
function updateDifficultyButtons() {
  Object.keys(elements.difficultyButtons).forEach(key => {
    const btn = elements.difficultyButtons[key];
    if (btn) {
      if (key === state.difficulty) {
        btn.classList.add('border-blue-400');
        btn.classList.remove('border-neutral-500');
      } else {
        btn.classList.remove('border-blue-400');
        btn.classList.add('border-neutral-500');
      }
    }
  });
}

// Update mode button states
function updateModeButtons() {
  Object.keys(elements.modeButtons).forEach(key => {
    const btn = elements.modeButtons[key];
    if (btn) {
      if (key === state.mode) {
        btn.classList.add('border-blue-400');
        btn.classList.remove('border-neutral-500');
      } else {
        btn.classList.remove('border-blue-400');
        btn.classList.add('border-neutral-500');
      }
    }
  });
}

// Event listeners
elements.startBtn.addEventListener('click', startTest);
elements.restartBtn.addEventListener('click', restartTest);
elements.goAgainBtn.addEventListener('click', restartTest);
elements.passageContainer.addEventListener('click', () => {
  if (!state.isTestActive) {
    elements.passageContainer.focus();
  }
});
elements.passageContainer.addEventListener('keydown', handleTyping);

// Difficulty button listeners
Object.keys(elements.difficultyButtons).forEach(key => {
  const btn = elements.difficultyButtons[key];
  if (btn) {
    btn.addEventListener('click', () => {
      if (!state.isTestActive) {
        state.difficulty = key;
        updateDifficultyButtons();
        loadRandomPassage();
      }
    });
  }
});

// Mode button listeners
Object.keys(elements.modeButtons).forEach(key => {
  const btn = elements.modeButtons[key];
  if (btn) {
    btn.addEventListener('click', () => {
      if (!state.isTestActive) {
        state.mode = key;
        updateModeButtons();
        loadRandomPassage();
      }
    });
  }
});

// Close modal on outside click
elements.resultsModal.addEventListener('click', (e) => {
  if (e.target === elements.resultsModal) {
    restartTest();
  }
});

// Initialize
loadPassages();
updateDifficultyButtons();
updateModeButtons();

