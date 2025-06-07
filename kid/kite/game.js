class Game {
    constructor() {
        this.score = 0;
        this.gameOver = false;
        this.playerX = 400;
        this.kiteLength = 200;
        this.kiteAngle = 0;
        this.dots = [];
        this.birds = [];
        this.lastTime = 0;
        
        // DOM elements
        this.player = document.getElementById('player');
        this.kite = document.getElementById('kite');
        this.kiteString = document.getElementById('string');
        this.scoreElement = document.getElementById('score');
        this.gameArea = document.querySelector('.game-area');
        
        // Controls
        this.setupControls();
        this.setupKeyboardControls();
        
        // Start game loop
        this.spawnDots();
        this.spawnBirds();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    setupControls() {
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const upBtn = document.getElementById('upBtn');
        const downBtn = document.getElementById('downBtn');
        
        leftBtn.addEventListener('mousedown', () => this.moveLeft());
        rightBtn.addEventListener('mousedown', () => this.moveRight());
        upBtn.addEventListener('mousedown', () => this.moveUp());
        downBtn.addEventListener('mousedown', () => this.moveDown());
        
        leftBtn.addEventListener('mouseup', () => this.stopMoving());
        rightBtn.addEventListener('mouseup', () => this.stopMoving());
        upBtn.addEventListener('mouseup', () => this.stopMoving());
        downBtn.addEventListener('mouseup', () => this.stopMoving());
        
        leftBtn.addEventListener('mouseleave', () => this.stopMoving());
        rightBtn.addEventListener('mouseleave', () => this.stopMoving());
        upBtn.addEventListener('mouseleave', () => this.stopMoving());
        downBtn.addEventListener('mouseleave', () => this.stopMoving());
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            if (this.gameOver) return;
            
            switch(event.key) {
                case 'ArrowUp':
                case 'w':
                    this.kiteLength = Math.min(this.kiteLength + 20, 550);
                    break;
                case 'ArrowDown':
                case 's':
                    this.kiteLength = Math.max(this.kiteLength - 20, 50);
                    break;
                case 'ArrowLeft':
                case 'a':
                    this.playerX = Math.max(this.playerX - 20, 20);
                    break;
                case 'ArrowRight':
                case 'd':
                    this.playerX = Math.min(this.playerX + 20, 780);
                    break;
            }
        });
    }
    
    spawnDots() {
        setInterval(() => {
            if (this.gameOver) return;
            
            const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            dot.setAttribute("class", "dot");
            dot.setAttribute("r", "10");
            
            // 随机初始位置
            const x = Math.random() * 760 + 20;
            const y = Math.random() * 300 + 100;
            dot.setAttribute("cx", x);
            dot.setAttribute("cy", y);
            
            // 添加漂浮属性
            dot.floatSpeed = {
                x: (Math.random() - 0.5) * 0.5,  // 水平漂浮速度
                y: (Math.random() - 0.5) * 0.3   // 垂直漂浮速度
            };
            
            this.gameArea.querySelector('svg').appendChild(dot);
            this.dots.push(dot);
            
            // Remove dot after 10 seconds
            setTimeout(() => {
                if (dot.parentNode) {
                    dot.parentNode.removeChild(dot);
                    this.dots = this.dots.filter(d => d !== dot);
                }
            }, 10000);
        }, 1000);
    }
    
    spawnBirds() {
        setInterval(() => {
            if (this.gameOver) return;
            
            const bird = document.createElementNS("http://www.w3.org/2000/svg", "g");
            bird.setAttribute("class", "bird");
            
            // 创建小鸟的各个部分，调整尺寸让小鸟更苗条
            const body = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
            body.setAttribute("cx", "15");
            body.setAttribute("cy", "0");
            body.setAttribute("rx", "16");  // 增加身体长度
            body.setAttribute("ry", "5");   // 保持身体高度
            body.setAttribute("fill", "#8B4513");
            
            // 上翅膀（向后倾斜）
            const topWing = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
            topWing.setAttribute("cx", "10");  // 调整翅膀位置
            topWing.setAttribute("cy", "-4");
            topWing.setAttribute("rx", "10");  
            topWing.setAttribute("ry", "4");   
            topWing.setAttribute("fill", "#A0522D");
            topWing.setAttribute("transform", "rotate(20 10 -4)");  // 调整旋转中心
            
            // 下翅膀（向前倾斜）
            const bottomWing = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
            bottomWing.setAttribute("cx", "10");  // 调整翅膀位置
            bottomWing.setAttribute("cy", "4");
            bottomWing.setAttribute("rx", "10");  
            bottomWing.setAttribute("ry", "4");   
            bottomWing.setAttribute("fill", "#A0522D");
            bottomWing.setAttribute("transform", "rotate(-20 10 4)");  // 调整旋转中心
            
            const beak = document.createElementNS("http://www.w3.org/2000/svg", "path");
            beak.setAttribute("d", "M31,0 L36,-2 L31,2 Z");  // 调整喙的位置适应更长的身体
            beak.setAttribute("fill", "#FFD700");
            
            // 眼睛
            const eye = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            eye.setAttribute("cx", "20");  // 调整眼睛位置
            eye.setAttribute("cy", "-1");
            eye.setAttribute("r", "1.5");
            eye.setAttribute("fill", "#000");
            
            bird.appendChild(topWing);
            bird.appendChild(bottomWing);
            bird.appendChild(body);
            bird.appendChild(beak);
            bird.appendChild(eye);
            
            // 设置初始位置和方向
            const startX = Math.random() < 0.5 ? -50 : 850;  // 从左边或右边开始
            const y = Math.random() * 300 + 100;  // 在天空中随机高度
            bird.setAttribute("transform", `translate(${startX}, ${y}) scale(${startX < 0 ? 1 : -1}, 1)`);
            
            // 添加速度属性
            bird.speed = 2;  // 移动速度
            bird.direction = startX < 0 ? 1 : -1;  // 移动方向
            
            this.gameArea.querySelector('svg').appendChild(bird);
            this.birds.push(bird);
            
            // Remove bird after crossing the screen
            setTimeout(() => {
                if (bird.parentNode) {
                    bird.parentNode.removeChild(bird);
                    this.birds = this.birds.filter(b => b !== bird);
                }
            }, 5000);
        }, 2000);
    }
    
    updateKite() {
        // Update player position
        this.player.setAttribute('transform', `translate(${this.playerX}, 550)`);
        
        // Calculate kite position with increased swaying distance
        const kiteX = this.playerX + Math.sin(this.kiteAngle) * 120;
        const kiteY = 565 - this.kiteLength;
        
        // Update kite position
        this.kite.setAttribute('transform', `translate(${kiteX}, ${kiteY})`);
        
        // Update string - connect to player's right hand
        this.kiteString.setAttribute('x1', this.playerX + 15); // 右手的x位置
        this.kiteString.setAttribute('y1', 535); // 右手的y位置 (550 + (-15))
        this.kiteString.setAttribute('x2', kiteX);
        this.kiteString.setAttribute('y2', kiteY);
    }
    
    checkCollisions() {
        const kiteRect = this.kite.getBoundingClientRect();
        
        // Check dots
        this.dots.forEach(dot => {
            const dotRect = dot.getBoundingClientRect();
            if (this.isColliding(kiteRect, dotRect)) {
                this.score += 1;
                this.scoreElement.textContent = this.score;
                dot.parentNode.removeChild(dot);
                this.dots = this.dots.filter(d => d !== dot);
            }
        });
        
        // Check birds
        this.birds.forEach(bird => {
            const birdRect = bird.getBoundingClientRect();
            if (this.isColliding(kiteRect, birdRect)) {
                this.score -= 2;
                this.scoreElement.textContent = this.score;
                bird.parentNode.removeChild(bird);
                this.birds = this.birds.filter(b => b !== bird);
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }
    
    endGame() {
        this.gameOver = true;
        alert(`游戏结束！最终得分：${this.score}`);
    }
    
    gameLoop(timestamp) {
        if (this.gameOver) return;
        
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Update kite angle (increased swaying movement)
        this.kiteAngle += (Math.random() - 0.5) * 0.08;
        
        // Update kite position
        this.updateKite();
        
        // Update dots position
        this.dots.forEach(dot => {
            const x = parseFloat(dot.getAttribute("cx"));
            const y = parseFloat(dot.getAttribute("cy"));
            
            // 计算新的位置
            let newX = x + dot.floatSpeed.x;
            let newY = y + dot.floatSpeed.y;
            
            // 边界检查，碰到边界时反弹
            if (newX < 20 || newX > 780) {
                dot.floatSpeed.x *= -1;
                newX = Math.max(20, Math.min(780, newX));
            }
            if (newY < 100 || newY > 400) {
                dot.floatSpeed.y *= -1;
                newY = Math.max(100, Math.min(400, newY));
            }
            
            dot.setAttribute("cx", newX);
            dot.setAttribute("cy", newY);
        });
        
        // Update birds position
        this.birds.forEach(bird => {
            const transform = bird.getAttribute("transform");
            const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
            if (match) {
                const x = parseFloat(match[1]) + bird.speed * bird.direction;
                const y = parseFloat(match[2]);
                bird.setAttribute("transform", `translate(${x}, ${y}) scale(${bird.direction}, 1)`);
            }
        });
        
        // Check collisions
        this.checkCollisions();
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    moveLeft() {
        if (!this.gameOver) this.playerX = Math.max(this.playerX - 5, 20);
    }
    
    moveRight() {
        if (!this.gameOver) this.playerX = Math.min(this.playerX + 5, 780);
    }
    
    moveUp() {
        if (!this.gameOver) this.kiteLength = Math.min(this.kiteLength + 20, 550); // 风筝线最长550，可达到画面顶部
    }
    
    moveDown() {
        if (!this.gameOver) this.kiteLength = Math.max(this.kiteLength - 20, 50); // 风筝线最短50
    }
    
    stopMoving() {
        // Stop any continuous movement if needed
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
}); 