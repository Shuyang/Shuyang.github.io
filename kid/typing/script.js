// Special characters for typing practice
const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', '|', ':', '"', '<', '>', '?', '~', '`', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Game state
let gameState = {
    isPlaying: false,
    timeLeft: 60,
    correctChars: 0,
    attemptedChars: 0,
    timer: null,
    lastInputLength: 0,
    startTime: null,
    lastTypingTime: null,
    charStats: {}, // Track statistics for each character
    lastInputText: '', // Track the last input to detect changes
    round: 1 // Track current round
};

// Initialize character statistics
function initCharStats() {
    gameState.charStats = {};
    specialChars.forEach(char => {
        gameState.charStats[char] = {
            attempted: 0,
            correct: 0,
            weight: 1 // Initial weight for character selection
        };
    });
}

// Calculate character weights based on accuracy
function calculateCharWeights() {
    Object.entries(gameState.charStats).forEach(([char, stats]) => {
        if (stats.attempted > 0) {
            const accuracy = (stats.correct / stats.attempted) * 100;
            // Lower accuracy = higher weight
            stats.weight = Math.max(1, Math.round(100 - accuracy));
        } else {
            stats.weight = 1; // Default weight for unused characters
        }
    });
}

// Generate weighted character array for selection
function generateWeightedChars() {
    let weightedChars = [];
    Object.entries(gameState.charStats).forEach(([char, stats]) => {
        // Add the character to the array based on its weight
        for (let i = 0; i < stats.weight; i++) {
            weightedChars.push(char);
        }
    });
    return weightedChars;
}

// Generate text with weighted character selection
function generateText() {
    const textLength = 50;
    let text = '';
    const weightedChars = generateWeightedChars();
    
    for (let i = 0; i < textLength; i++) {
        const randomIndex = Math.floor(Math.random() * weightedChars.length);
        text += weightedChars[randomIndex];
    }
    return text;
}

// DOM elements
const targetText = document.getElementById('target-text');
const inputField = document.getElementById('input-field');
const startBtn = document.getElementById('start-btn');
const timerDisplay = document.getElementById('timer');
const accuracyDisplay = document.getElementById('accuracy');
const wpmDisplay = document.getElementById('wpm');
const resultsModal = document.getElementById('results-modal');
const closeModal = document.getElementById('close-modal');

// Initialize game
function initGame() {
    inputField.value = '';
    inputField.disabled = true;
    gameState.isPlaying = false;
    gameState.timeLeft = 60;
    gameState.correctChars = 0;
    gameState.attemptedChars = 0;
    gameState.lastInputLength = 0;
    gameState.startTime = null;
    gameState.lastTypingTime = null;
    gameState.lastInputText = '';
    if (gameState.round === 1) {
        initCharStats();
    } else {
        calculateCharWeights();
    }
    updateDisplay();
}

// Format text with spans for highlighting
function formatText(text) {
    return text.split('').map(char => 
        `<span class="char">${char}</span>`
    ).join('');
}

// Update character highlighting
function updateHighlighting(inputText, targetText) {
    const chars = targetText.querySelectorAll('.char');
    chars.forEach((char, index) => {
        char.classList.remove('correct', 'incorrect', 'current');
        
        if (index < inputText.length) {
            if (inputText[index] === char.textContent) {
                char.classList.add('correct');
            } else {
                char.classList.add('incorrect');
            }
        } else if (index === inputText.length) {
            char.classList.add('current');
        }
    });
}

// Calculate CPM (Characters Per Minute)
function calculateCPM() {
    if (!gameState.startTime) return 0;
    
    const timeElapsed = (Date.now() - gameState.startTime) / 1000 / 60; // Convert to minutes
    if (timeElapsed === 0) return 0;
    
    return Math.round(gameState.correctChars / timeElapsed);
}

// Show results modal
function showResults() {
    const totalChars = document.getElementById('total-chars');
    const correctChars = document.getElementById('correct-chars');
    const finalAccuracy = document.getElementById('final-accuracy');
    const finalCpm = document.getElementById('final-cpm');
    const charStats = document.getElementById('char-stats');
    
    // Update overall stats
    totalChars.textContent = gameState.attemptedChars;
    correctChars.textContent = gameState.correctChars;
    finalAccuracy.textContent = Math.round((gameState.correctChars / gameState.attemptedChars) * 100);
    finalCpm.textContent = calculateCPM();
    
    // Generate character statistics
    charStats.innerHTML = '';
    Object.entries(gameState.charStats)
        .sort((a, b) => {
            const accuracyA = a[1].attempted === 0 ? 100 : (a[1].correct / a[1].attempted) * 100;
            const accuracyB = b[1].attempted === 0 ? 100 : (b[1].correct / b[1].attempted) * 100;
            return accuracyA - accuracyB;
        })
        .forEach(([char, stats]) => {
            if (stats.attempted > 0) {
                const accuracy = Math.round((stats.correct / stats.attempted) * 100);
                const statDiv = document.createElement('div');
                statDiv.className = `char-stat ${accuracy >= 90 ? 'good' : accuracy >= 70 ? 'medium' : 'poor'}`;
                statDiv.innerHTML = `
                    <div>${char}</div>
                    <div>${accuracy}%</div>
                    <div>(${stats.correct}/${stats.attempted})</div>
                    <div>Weight: ${stats.weight}</div>
                `;
                charStats.appendChild(statDiv);
            }
        });
    
    resultsModal.classList.add('show');
}

// Start the game
function startGame() {
    if (gameState.isPlaying) return;
    
    gameState.isPlaying = true;
    gameState.startTime = Date.now(); // Start timing when game starts
    inputField.disabled = false;
    inputField.value = '';
    inputField.focus();
    
    const text = generateText();
    targetText.innerHTML = formatText(text);
    gameState.lastInputLength = 0;
    gameState.lastInputText = '';
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateDisplay();
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// End the game
function endGame() {
    clearInterval(gameState.timer);
    gameState.isPlaying = false;
    inputField.disabled = true;
    updateDisplay();
    showResults();
}

// Update display
function updateDisplay() {
    timerDisplay.textContent = gameState.timeLeft;
    
    const accuracy = gameState.attemptedChars === 0 ? 100 :
        Math.round((gameState.correctChars / gameState.attemptedChars) * 100);
    accuracyDisplay.textContent = accuracy;
    
    wpmDisplay.textContent = calculateCPM();
}

// Handle input
inputField.addEventListener('input', () => {
    if (!gameState.isPlaying) return;
    
    const inputText = inputField.value;
    const targetTextContent = targetText.textContent;
    
    // Track character statistics
    if (inputText.length > gameState.lastInputLength) {
        // New character(s) typed
        const newChar = inputText[inputText.length - 1];
        const targetChar = targetTextContent[inputText.length - 1];
        
        // Update character stats
        gameState.charStats[targetChar].attempted++;
        if (newChar === targetChar) {
            gameState.charStats[targetChar].correct++;
            gameState.correctChars++;
        }
        gameState.attemptedChars++;
    }
    
    gameState.lastInputLength = inputText.length;
    updateHighlighting(inputText, targetText);
    updateDisplay();
    
    // Check if completed
    if (inputText.length === targetTextContent.length) {
        const newText = generateText();
        targetText.innerHTML = formatText(newText);
        inputField.value = '';
        gameState.lastInputLength = 0;
    }
});

// Start button event listener
startBtn.addEventListener('click', () => {
    if (gameState.isPlaying) {
        endGame();
        startBtn.textContent = 'Start Game';
    } else {
        initGame();
        startGame();
        startBtn.textContent = 'End Game';
    }
});

// Close modal event listener
closeModal.addEventListener('click', () => {
    resultsModal.classList.remove('show');
    gameState.round++;
    startBtn.textContent = 'Next Round';
});

// Initialize the game
initGame(); 