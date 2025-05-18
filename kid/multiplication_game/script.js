document.addEventListener('DOMContentLoaded', () => {
    const questionElement = document.getElementById('question');
    const answerInput = document.getElementById('answer');
    const submitButton = document.getElementById('submit');
    const startButton = document.getElementById('start');
    const timeElement = document.getElementById('time');
    const scoreElement = document.getElementById('score');
    const resultElement = document.getElementById('result');
    const historyContainer = document.getElementById('history-container');
    const historyBody = document.getElementById('history-body');

    let currentAnswer = 0;
    let score = 0;
    let timer = null;
    let gameActive = false;
    let currentQuestion = '';
    let answerHistory = [];

    // 创建浮动表情
    function createFloatingEmoji(x, y, isHeart) {
        const element = document.createElement('div');
        element.className = isHeart ? 'heart' : 'sad-face';
        element.textContent = isHeart ? '❤️' : '😢';
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        document.body.appendChild(element);

        // 动画结束后移除元素
        element.addEventListener('animationend', () => {
            element.remove();
        });
    }

    // 生成随机乘法题
    function generateQuestion() {
        const num1 = Math.floor(Math.random() * 9) + 1;
        const num2 = Math.floor(Math.random() * 9) + 1;
        currentAnswer = num1 * num2;
        currentQuestion = `${num1} × ${num2}`;
        questionElement.textContent = `${currentQuestion} = ?`;
    }

    // 显示答题历史
    function displayHistory() {
        historyContainer.style.display = 'block';
        historyBody.innerHTML = '';
        
        answerHistory.forEach(record => {
            const row = document.createElement('tr');
            row.className = record.isCorrect ? 'correct-row' : 'wrong-row';
            
            row.innerHTML = `
                <td>${record.question}</td>
                <td>${record.userAnswer}</td>
                <td>${record.correctAnswer}</td>
                <td>${record.isCorrect ? '✅' : '❌'}</td>
            `;
            
            historyBody.appendChild(row);
        });
    }

    // 检查答案
    function checkAnswer() {
        if (!gameActive) return;
        
        const userAnswer = parseInt(answerInput.value);
        if (isNaN(userAnswer)) return;

        const inputRect = answerInput.getBoundingClientRect();
        const isCorrect = userAnswer === currentAnswer;

        // 记录答题历史
        answerHistory.push({
            question: currentQuestion,
            userAnswer: userAnswer,
            correctAnswer: currentAnswer,
            isCorrect: isCorrect
        });

        if (isCorrect) {
            score++;
            resultElement.textContent = "正确！";
            resultElement.className = "result correct";
            
            // 在答对时创建3个爱心
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const randomOffset = Math.random() * 100 - 50;
                    createFloatingEmoji(
                        inputRect.left + inputRect.width / 2 + randomOffset,
                        inputRect.top,
                        true
                    );
                }, i * 100);
            }
        } else {
            score--;
            resultElement.textContent = `错误！正确答案是 ${currentAnswer}`;
            resultElement.className = "result wrong";

            // 在答错时创建3个哭脸
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const randomOffset = Math.random() * 100 - 50;
                    createFloatingEmoji(
                        inputRect.left + inputRect.width / 2 + randomOffset,
                        inputRect.top,
                        false
                    );
                }, i * 100);
            }
        }

        scoreElement.textContent = score;
        answerInput.value = '';
        generateQuestion();
    }

    // 开始游戏
    function startGame() {
        gameActive = true;
        score = 0;
        scoreElement.textContent = score;
        answerHistory = [];
        let timeLeft = 60;
        
        // 重置界面
        startButton.style.display = 'none';
        submitButton.style.display = 'block';
        answerInput.style.display = 'block';
        resultElement.textContent = '';
        answerInput.value = '';
        historyContainer.style.display = 'none';
        answerInput.focus();

        generateQuestion();

        // 设置定时器
        timer = setInterval(() => {
            timeLeft--;
            timeElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    // 结束游戏
    function endGame() {
        gameActive = false;
        clearInterval(timer);
        questionElement.textContent = "游戏结束！";
        resultElement.textContent = `最终得分：${score}`;
        resultElement.className = "result";
        submitButton.style.display = 'none';
        startButton.style.display = 'block';
        answerInput.style.display = 'none';
        
        // 显示答题历史
        displayHistory();
    }

    // 事件监听器
    startButton.addEventListener('click', startGame);
    
    submitButton.addEventListener('click', checkAnswer);
    
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });

    // 初始化界面
    submitButton.style.display = 'none';
    answerInput.style.display = 'none';
}); 