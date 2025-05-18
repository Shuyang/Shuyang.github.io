class CrabGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.gameArea = document.getElementById('game-area');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartButton = document.getElementById('restart-button');
        
        this.crabs = [];
        this.caughtCrabs = 0; // 新增：记录抓到的螃蟹数量
        this.isGameOver = false;
        this.timer = null;
        this.moveIntervals = [];
        
        this.init();
    }
    
    init() {
        this.score = 0;
        this.timeLeft = 60;
        this.caughtCrabs = 0; // 重置抓到的螃蟹数量
        this.isGameOver = false;
        this.updateScore();
        this.updateTimer();
        this.gameOverElement.classList.add('hidden');
        
        // 清除所有现有的螃蟹
        this.gameArea.innerHTML = '';
        this.crabs = [];
        this.moveIntervals.forEach(interval => clearTimeout(interval));
        this.moveIntervals = [];
        
        // 创建袋子
        this.createBag();
        
        // 创建5只螃蟹
        for (let i = 0; i < 5; i++) {
            this.createCrab();
        }
        
        this.restartButton.addEventListener('click', () => this.restart());
        this.startGame();
    }
    
    createBag() {
        const bag = document.createElement('div');
        bag.id = 'crab-bag';
        bag.className = 'crab-bag';
        
        // 创建袋子内容显示
        const bagContent = document.createElement('div');
        bagContent.className = 'bag-content';
        bagContent.textContent = '0/30';
        bag.appendChild(bagContent);
        
        this.gameArea.appendChild(bag);
    }
    
    updateBagContent() {
        const bagContent = document.querySelector('.bag-content');
        if (bagContent) {
            bagContent.textContent = `${this.caughtCrabs}/30`;
            
            // 根据抓到的螃蟹数量改变袋子颜色
            const bag = document.getElementById('crab-bag');
            if (this.caughtCrabs >= 25) {
                bag.classList.add('bag-warning');
            } else if (this.caughtCrabs >= 15) {
                bag.classList.add('bag-medium');
            }
        }
    }
    
    createCrab() {
        const crab = document.createElement('div');
        crab.className = 'crab';
        
        // 创建左钳子
        const leftClaw = document.createElement('div');
        leftClaw.className = 'claw left-claw';
        
        // 创建右钳子
        const rightClaw = document.createElement('div');
        rightClaw.className = 'claw right-claw';
        
        // 为每个钳子添加点击事件（点击钳子结束游戏）
        const handleClawClick = (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            console.log('Claw clicked!'); // 调试日志
            this.endGame();
        };
        
        leftClaw.addEventListener('click', handleClawClick);
        rightClaw.addEventListener('click', handleClawClick);
        
        // 为螃蟹身体添加点击事件（点击身体得分）
        crab.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Crab body clicked!'); // 调试日志
            
            // 根据速度计算得分
            const speed = parseFloat(crab.dataset.speed);
            let points;
            if (speed === 1.2) {
                points = 3; // 快速螃蟹得3分
            } else if (speed === 0.8) {
                points = 2; // 中速螃蟹得2分
            } else {
                points = 1; // 慢速螃蟹得1分
            }
            
            this.score += points;
            this.updateScore();
            
            // 增加抓到的螃蟹数量
            this.caughtCrabs++;
            this.updateBagContent();
            
            // 检查是否达到30只螃蟹
            if (this.caughtCrabs >= 30) {
                this.endGame();
                return;
            }
            
            // 移除被抓住的螃蟹
            const index = this.crabs.indexOf(crab);
            if (index > -1) {
                this.crabs.splice(index, 1);
            }
            
            // 添加飞向袋子的动画
            crab.classList.add('caught');
            
            // 获取袋子的位置
            const bag = document.getElementById('crab-bag');
            const bagRect = bag.getBoundingClientRect();
            const crabRect = crab.getBoundingClientRect();
            
            // 计算飞向袋子的终点位置
            const endX = bagRect.left + (bagRect.width / 2) - (crabRect.width / 2);
            const endY = bagRect.top + (bagRect.height / 2) - (crabRect.height / 2);
            
            // 设置螃蟹的终点位置
            crab.style.left = endX + 'px';
            crab.style.top = endY + 'px';
            
            // 等待动画完成后将螃蟹移动到袋子里
            setTimeout(() => {
                // 克隆螃蟹并添加到袋子里
                const bagCrab = crab.cloneNode(true);
                bagCrab.style.left = Math.random() * (bagRect.width - 30) + 'px';
                bagCrab.style.top = Math.random() * (bagRect.height - 20) + 'px';
                bag.appendChild(bagCrab);
                
                // 移除原来的螃蟹
                crab.remove();
                
                // 创建新的螃蟹
                this.createCrab();
            }, 800); // 动画持续时间
        });
        
        // 将钳子添加到螃蟹中
        crab.appendChild(leftClaw);
        crab.appendChild(rightClaw);
        
        // 随机设置螃蟹的初始位置
        const x = Math.random() * (this.gameArea.offsetWidth - 60);
        const y = Math.random() * (this.gameArea.offsetHeight - 40);
        crab.style.left = x + 'px';
        crab.style.top = y + 'px';
        
        // 调整速度分配概率：40%快速，40%中速，20%慢速
        const random = Math.random();
        let speed;
        if (random < 0.4) {
            speed = 1.2; // 快速
        } else if (random < 0.8) {
            speed = 0.8; // 中速
        } else {
            speed = 0.4;  // 慢速
        }
        
        // 设置对应的颜色类
        if (speed === 1.2) {
            crab.classList.add('speed-fast');
        } else if (speed === 0.8) {
            crab.classList.add('speed-medium');
        } else {
            crab.classList.add('speed-slow');
        }
        
        // 存储速度信息
        crab.dataset.speed = speed;
        
        this.gameArea.appendChild(crab);
        this.crabs.push(crab);
        
        // 启动这只螃蟹的移动
        this.moveCrab(crab);
    }
    
    startGame() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    moveCrab(crab) {
        let lastTime = performance.now();
        let directionX = Math.random() < 0.5 ? 1 : -1;
        let directionY = Math.random() < 0.5 ? 1 : -1;
        let directionChangeTime = lastTime;
        
        const move = (currentTime) => {
            if (this.isGameOver) return;
            
            // 计算时间差，并限制最大时间差以避免跳跃
            const deltaTime = Math.min(currentTime - lastTime, 32); // 限制最大时间差为32ms
            lastTime = currentTime;
            
            // 每隔一段时间随机改变方向
            if (currentTime - directionChangeTime > 2000) { // 每2秒可能改变方向
                if (Math.random() < 0.3) { // 30%的概率改变方向
                    directionX = Math.random() < 0.5 ? 1 : -1;
                    directionY = Math.random() < 0.5 ? 1 : -1;
                }
                directionChangeTime = currentTime;
            }
            
            // 使用螃蟹的固定速度
            const speed = parseFloat(crab.dataset.speed);
            
            // 获取当前位置
            const currentX = parseFloat(crab.style.left) || 0;
            const currentY = parseFloat(crab.style.top) || 0;
            
            // 计算新位置（使用时间差来平滑移动）
            const moveDistance = (speed * deltaTime) / 16; // 16ms 是60fps的帧时间
            let newX = currentX + (directionX * moveDistance);
            let newY = currentY + (directionY * moveDistance);
            
            // 确保螃蟹不会移出游戏区域
            newX = Math.max(0, Math.min(newX, this.gameArea.offsetWidth - 60));
            newY = Math.max(0, Math.min(newY, this.gameArea.offsetHeight - 40));
            
            // 如果碰到边界，改变方向
            if (newX <= 0 || newX >= this.gameArea.offsetWidth - 60) {
                directionX *= -1;
                newX = Math.max(0, Math.min(newX, this.gameArea.offsetWidth - 60));
            }
            if (newY <= 0 || newY >= this.gameArea.offsetHeight - 40) {
                directionY *= -1;
                newY = Math.max(0, Math.min(newY, this.gameArea.offsetHeight - 40));
            }
            
            crab.style.left = newX + 'px';
            crab.style.top = newY + 'px';
            
            // 继续动画循环
            requestAnimationFrame(move);
        };
        
        // 启动动画循环
        requestAnimationFrame(move);
    }
    
    catchCrab(e, crab) {
        if (this.isGameOver) return;
        console.log('CatchCrab called!'); // 调试日志
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    updateTimer() {
        this.timerElement.textContent = this.timeLeft;
    }
    
    endGame() {
        this.isGameOver = true;
        clearInterval(this.timer);
        this.moveIntervals.forEach(interval => clearTimeout(interval));
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.remove('hidden');
    }
    
    restart() {
        clearInterval(this.timer);
        this.init();
    }
}

// 启动游戏
window.onload = () => {
    new CrabGame();
}; 