// game.js
const game = (function() {
    // Game state
    let gameState = {
        active: false,
        type: null,
        score: 0,
        timer: 60,
        timerInterval: null,
        currentQuestion: 0,
        questions: [],
        correctAnswers: 0
    };

    // Math questions database
    const mathQuestions = [
        {
            question: "What is 7 × 8?",
            options: ["54", "56", "64", "72"],
            answer: 1
        },
        {
            question: "Solve: 15 + 23",
            options: ["38", "37", "36", "35"],
            answer: 0
        },
        {
            question: "What is ¾ of 20?",
            options: ["12", "15", "10", "5"],
            answer: 1
        },
        {
            question: "Calculate: 5² + 3³",
            options: ["32", "34", "52", "54"],
            answer: 2
        },
        {
            question: "If x = 5, what is 2x + 3?",
            options: ["10", "13", "15", "18"],
            answer: 1
        },
        {
            question: "What is the square root of 144?",
            options: ["12", "14", "16", "18"],
            answer: 0
        },
        {
            question: "Solve: 45 ÷ 9",
            options: ["4", "5", "6", "7"],
            answer: 1
        },
        {
            question: "What is 30% of 50?",
            options: ["10", "15", "20", "25"],
            answer: 1
        },
        {
            question: "Calculate: 7 × 6 - 8",
            options: ["34", "36", "38", "40"],
            answer: 0
        },
        {
            question: "What is the next number: 2, 4, 8, 16, ?",
            options: ["24", "28", "32", "36"],
            answer: 2
        }
    ];

    // Initialize the game module
    function init() {
        console.log("EduQuest Game Module Initialized");
        setupEventListeners();
    }

    // Set up game event listeners
    function setupEventListeners() {
        // Option button clicks
        document.getElementById('math-options').addEventListener('click', function(e) {
            if (e.target.classList.contains('option-btn')) {
                const selectedOption = Array.from(this.children).indexOf(e.target);
                checkAnswer(selectedOption);
            }
        });
    }

    // Start a new game
    function startGame(type) {
        gameState.active = true;
        gameState.type = type;
        gameState.score = 0;
        gameState.timer = 60;
        gameState.currentQuestion = 0;
        gameState.correctAnswers = 0;
        
        // Set up questions based on game type
        if (type === 'math') {
            // Shuffle questions for variety
            gameState.questions = [...mathQuestions].sort(() => Math.random() - 0.5);
        }
        
        // Update UI
        document.getElementById('game-score').textContent = gameState.score;
        document.getElementById('game-timer').textContent = gameState.timer;
        document.getElementById('math-game').classList.add('active');
        document.getElementById('results-screen').classList.remove('active');
        
        // Start timer
        startTimer();
        
        // Load first question
        loadQuestion();
    }

    // Load a question
    function loadQuestion() {
        if (gameState.currentQuestion >= gameState.questions.length) {
            endGame();
            return;
        }
        
        const question = gameState.questions[gameState.currentQuestion];
        document.getElementById('math-question').textContent = question.question;
        
        const optionsContainer = document.getElementById('math-options');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            optionsContainer.appendChild(button);
        });
        
        document.getElementById('math-feedback').textContent = '';
        document.getElementById('math-feedback').className = 'feedback';
    }

    // Check if answer is correct
    function checkAnswer(selectedIndex) {
        if (!gameState.active) return;
        
        const question = gameState.questions[gameState.currentQuestion];
        const options = document.querySelectorAll('.option-btn');
        const feedback = document.getElementById('math-feedback');
        
        // Disable all buttons to prevent multiple clicks
        options.forEach(btn => btn.disabled = true);
        
        if (selectedIndex === question.answer) {
            // Correct answer
            options[selectedIndex].classList.add('correct');
            feedback.textContent = 'Correct! +10 points';
            feedback.className = 'feedback correct';
            
            gameState.score += 10;
            gameState.correctAnswers++;
            document.getElementById('game-score').textContent = gameState.score;
        } else {
            // Incorrect answer
            options[selectedIndex].classList.add('incorrect');
            options[question.answer].classList.add('correct');
            feedback.textContent = `Incorrect! The answer is ${question.options[question.answer]}`;
            feedback.className = 'feedback incorrect';
        }
        
        // Move to next question after a delay
        setTimeout(() => {
            gameState.currentQuestion++;
            loadQuestion();
        }, 1500);
    }

    // Start the game timer
    function startTimer() {
        clearInterval(gameState.timerInterval);
        
        gameState.timerInterval = setInterval(() => {
            gameState.timer--;
            document.getElementById('game-timer').textContent = gameState.timer;
            
            if (gameState.timer <= 0) {
                endGame();
            }
        }, 1000);
    }

    // End the game
    function endGame() {
        gameState.active = false;
        clearInterval(gameState.timerInterval);
        
        // Show results screen
        document.getElementById('math-game').classList.remove('active');
        document.getElementById('results-screen').classList.add('active');
        
        document.getElementById('final-score').textContent = gameState.score;
        document.getElementById('correct-answers').textContent = gameState.correctAnswers;
        document.getElementById('total-questions').textContent = gameState.questions.length;
        
        // Check if user earned a badge
        let badgeEarned = null;
        if (gameState.correctAnswers >= gameState.questions.length * 0.8) {
            badgeEarned = {
                id: 'math_master',
                name: 'Math Master',
                icon: '🏆',
                description: 'Scored 80% or higher in a math quiz'
            };
            
            document.getElementById('badge-earned').classList.remove('hidden');
            document.getElementById('badge-name').textContent = badgeEarned.name;
        } else {
            document.getElementById('badge-earned').classList.add('hidden');
        }
        
        // Update user progress
        if (typeof updateUserProgress === 'function') {
            updateUserProgress(gameState.score, badgeEarned);
        }
    }

    // Public methods
    return {
        init: init,
        startGame: startGame,
        endGame: endGame
    };
})();