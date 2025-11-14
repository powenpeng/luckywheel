

class LuckyWheel {
    constructor() {
        this.canvas = document.getElementById('wheel');
        this.ctx = this.canvas.getContext('2d');
        
        // 檢測系統字體
        this.systemFont = this.getSystemFont();
        
        // 預設18個選項 - 指定項目和數量，隨機排列
        this.options = this.generateDefaultOptions();
        
        this.isSpinning = false;
        this.currentRotation = 0; // 預設從0度開始，確保真正的隨機性
        this.targetRotation = 0;
        this.spinAudio = null;
        this.celebrationAudio = null;
        
        this.init();
    }
    
    // 生成預設選項 - 包含指定項目和數量，隨機排列
    generateDefaultOptions() {
        const defaultItems = [
            // ScoreLive 貼紙：4個 - 每個都創建新的對象
            ...Array(4).fill().map(() => ({ text: 'ScoreLive 貼紙' })),
            // ScoreLive 貼紙：4個 - 每個都創建新的對象
            ...Array(4).fill().map(() => ({ text: 'ScoreLive 貼紙' })),
            // ScoreLive 貼紙：4個 - 每個都創建新的對象
            ...Array(4).fill().map(() => ({ text: 'ScoreLive 貼紙' })),
            // ScoreLive 毛巾：1個
            { text: 'ScoreLive 應援巾' },
            // ScoreLive 棒球帽：1個
            { text: 'ScoreLive 棒球帽' },
            // ScoreLive T恤：2個 - 每個都創建新的對象
            ...Array(2).fill().map(() => ({ text: 'ScoreLive T恤' }))
        ];
        
        // 隨機打亂順序
        const shuffled = [...defaultItems];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // 為每個選項添加指定的漸層顏色 - 按照選項順序，不是內容
        const rainbowColors = [
            '#FF0000', '#FF4000', '#FF8000', '#FFBF00', '#FFFF00', '#BFFF00',
            '#80FF00', '#40FF00', '#00FF00', '#00FF40', '#00FF80', '#00FFBF',
            '#00FFFF', '#00BFFF', '#0080FF', '#0040FF', '#8000FF', '#BF00FF'
        ];
        
        // 每個選項按照其在陣列中的位置獲得對應顏色
        shuffled.forEach((item, index) => {
            item.color = rainbowColors[index]; // 直接使用索引，不使用模運算
        });
        
        return shuffled;
    }
    
    init() {
        // 繪製初始輪盤
        this.drawWheel();
        
        // 設置事件監聽器
        this.setupEventListeners();
        
        // 應用預設旋轉 - 從0度開始，確保真正的隨機性
        this.canvas.style.transform = 'rotate(0deg)';
        
        // 記錄初始選項數量
        this.canvas.dataset.optionsCount = this.options.length.toString();
        
        // 移動設備優化
        this.setupMobileOptimizations();
    }
    
    // 檢測系統字體
    getSystemFont() {
        if (navigator.platform.indexOf('Mac') !== -1) {
            return '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif';
        } else if (navigator.platform.indexOf('Win') !== -1) {
            return '"Segoe UI", "Microsoft YaHei", "Microsoft JhengHei", sans-serif';
        } else {
            return '"Noto Sans CJK TC", "Noto Sans CJK SC", "Roboto", "Arial", sans-serif';
        }
    }
    
    // 移動設備優化設定
    setupMobileOptimizations() {
        // 防止雙擊縮放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // 防止滾動縮放
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
        document.addEventListener('gestureend', (e) => e.preventDefault());
        
        // 設定觸控操作
        document.body.style.touchAction = 'manipulation';
        document.body.style.webkitTouchCallout = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.userSelect = 'none';
    }
    
    // 繪製輪盤
    drawWheel() {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const radius = Math.min(canvasWidth, canvasHeight) / 2 - 30;
        
        // 清除畫布
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        if (this.options.length === 0) return;
        
        // 計算每個選項的角度
        const anglePerOption = (2 * Math.PI) / this.options.length;
        
        this.options.forEach((option, index) => {
            // 調整角度，讓第一個選項從12點鐘方向開始
            const startAngle = index * anglePerOption - Math.PI / 2;
            const endAngle = (index + 1) * anglePerOption - Math.PI / 2;
            
            // 繪製扇形
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = option.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1; // 從2改為1，讓框線更細
            this.ctx.stroke();
            
            // 繪製文字 - 縮小兩級字，不要粗體，使用系統字，黑色文字
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(startAngle + anglePerOption / 2);
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = '#000'; // 從白色改為黑色
            this.ctx.font = `20px ${this.systemFont}`; // 從24px縮小到20px，去掉bold
            this.ctx.fillText(option.text, radius * 0.7, 0);
            this.ctx.restore();
        });
        
        // 繪製中心圓
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
    }
    
    // 設置事件監聽器
    setupEventListeners() {
        // 開始轉動按鈕
        document.getElementById('spinButton').addEventListener('click', () => this.spin());
        document.getElementById('spinButton').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.spin();
        });
        
        // 彈窗事件
        document.querySelector('.close').addEventListener('click', () => this.hideEditModal());
        document.querySelector('.close').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.hideEditModal();
        });
        
        document.getElementById('addOption').addEventListener('click', () => this.addOption());
        document.getElementById('addOption').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.addOption();
        });
        
        document.getElementById('clearOptions').addEventListener('click', () => this.clearOptions());
        document.getElementById('clearOptions').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.clearOptions();
        });
        
        document.getElementById('randomOptions').addEventListener('click', () => this.generateRandomOptions());
        document.getElementById('randomOptions').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.generateRandomOptions();
        });
        
        document.getElementById('saveOptions').addEventListener('click', () => this.saveOptions());
        document.getElementById('saveOptions').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.saveOptions();
        });
        
        // 按Enter鍵新增選項
        document.getElementById('optionInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addOption();
            }
        });
        
        // 點擊彈窗外部關閉
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('editModal')) {
                this.hideEditModal();
            }
        });
        
        // 觸控事件支援
        window.addEventListener('touchend', (e) => {
            if (e.target === document.getElementById('editModal')) {
                this.hideEditModal();
            }
        });
        
        // 三角形指針作為編輯設定按鈕
        document.querySelector('.pointer').addEventListener('click', () => this.showEditModal());
        document.querySelector('.pointer').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.showEditModal();
        });
    }
    
    // 開始轉動
    spin() {
        if (this.isSpinning || this.options.length === 0) return;
        
        this.isSpinning = true;
        document.getElementById('spinButton').disabled = true;
        
        // 開始轉動音效
        this.startSpinSound();
        
        // 計算目標旋轉角度 - 確保最後指向選項中間
        const spins = 5 + Math.random() * 5; // 5-10圈
        const targetAngle = Math.random() * 360; // 隨機停止角度
        this.targetRotation = this.currentRotation + (spins * 360) + targetAngle;
        
        // 開始動畫
        this.animate();
    }
    
    // 動畫
    animate() {
        const duration = 4000; // 4秒
        const startTime = performance.now();
        const startRotation = this.currentRotation;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用緩動函數
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.currentRotation = startRotation + (this.targetRotation - startRotation) * easeOut;
            
            // 應用旋轉
            this.canvas.style.transform = `rotate(${this.currentRotation}deg)`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.finishSpin();
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // 轉動結束
    finishSpin() {
        this.isSpinning = false;
        document.getElementById('spinButton').disabled = false;
        
        // 停止轉動音效
        this.stopSpinSound();
        
        // 播放慶祝音效
        this.playCelebrationSound();
        
        // 創建彩帶特效
        this.createConfetti();
        
        // 計算並顯示結果
        const result = this.calculateResult();
        console.log('轉動結果:', result);
        console.log('最終角度:', this.targetRotation);
        
        // 保持最終旋轉角度，不強制重置
        // 這樣可以確保指針準確指向選中的選項
    }
    
    // 計算結果
    calculateResult() {
        if (this.options.length === 0) return '無選項';
        
        // 計算指針指向的選項
        // 指針位於輪盤頂部（12點鐘方向），選項從12點鐘方向開始
        const normalizedRotation = (360 - (this.targetRotation % 360)) % 360;
        const anglePerOption = 360 / this.options.length;
        
        // 計算選項索引，確保指向選項中間而不是分隔線
        // 每個選項的中心點在該選項角度的中間
        const selectedIndex = Math.floor((normalizedRotation + anglePerOption / 2) / anglePerOption);
        
        return this.options[selectedIndex % this.options.length].text;
    }
    
    // 鼓聲轉動音效 - 使用音效檔案
    startSpinSound() {
        try {
            // 創建音效元素
            this.spinAudio = new Audio('drum_effect.m4a');
            this.spinAudio.loop = true; // 循環播放
            this.spinAudio.volume = 0.5; // 設置音量
            
            // 播放音效
            this.spinAudio.play().catch(error => {
                console.log('音效播放失敗:', error);
            });
            
        } catch (error) {
            console.log('轉動音效播放失敗:', error);
        }
    }

    // 停止轉動音效
    stopSpinSound() {
        try {
            if (this.spinAudio) {
                // 漸弱效果
                this.spinAudio.volume = 0.5;
                
                // 延遲停止音效，讓漸弱效果更自然
                setTimeout(() => {
                    if (this.spinAudio) {
                        this.spinAudio.pause();
                        this.spinAudio.currentTime = 0;
                        this.spinAudio = null;
                    }
                }, 300);
                
            }
        } catch (error) {
            console.log('停止轉動音效失敗:', error);
        }
    }
    
    // 播放慶祝音效
    playCelebrationSound() {
        try {
            // 創建慶祝音效元素
            this.celebrationAudio = new Audio('lucky_effect.m4a');
            this.celebrationAudio.volume = 0.6; // 設置音量
            
            // 播放音效
            this.celebrationAudio.play().catch(error => {
                console.log('慶祝音效播放失敗:', error);
            });
            
        } catch (error) {
            console.log('慶祝音效播放失敗:', error);
        }
    }
    
    // 創建彩帶特效
    createConfetti() {
        const confettiCount = 200; // 彩帶數量
        const colors = ['#FF0000', '#FF4000', '#FF8000', '#FFBF00', '#FFFF00', '#BFFF00', '#80FF00', '#40FF00', '#00FF00', '#00FF40', '#00FF80', '#00FFBF', '#00FFFF', '#00BFFF', '#0080FF', '#0040FF', '#8000FF', '#BF00FF'];
        
        // 創建彩帶容器
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'fixed';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none';
        confettiContainer.style.zIndex = '1000';
        document.body.appendChild(confettiContainer);
        
        // 生成彩帶
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                const color = colors[Math.floor(Math.random() * colors.length)];
                const size = Math.random() * 10 + 5;
                const startX = Math.random() * window.innerWidth;
                const startY = -20;
                
                confetti.style.position = 'absolute';
                confetti.style.width = size + 'px';
                confetti.style.height = size + 'px';
                confetti.style.backgroundColor = color;
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.left = startX + 'px';
                confetti.style.top = startY + 'px';
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                confetti.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                confetti.style.boxShadow = `0 0 10px ${color}`;
                
                confettiContainer.appendChild(confetti);
                
                // 動畫
                requestAnimationFrame(() => {
                    const endX = startX + (Math.random() - 0.5) * 400;
                    const endY = window.innerHeight + 100;
                    const rotation = Math.random() * 720 - 360;
                    
                    confetti.style.left = endX + 'px';
                    confetti.style.top = endY + 'px';
                    confetti.style.transform = `rotate(${rotation}deg)`;
                    confetti.style.opacity = '0';
                });
                
                // 移除彩帶
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 1000);
                
            }, i * 20); // 每20ms創建一個彩帶
        }
        
        // 移除彩帶容器
        setTimeout(() => {
            if (confettiContainer.parentNode) {
                confettiContainer.parentNode.removeChild(confettiContainer);
            }
        }, 3000);
    }
    
    // 彈窗管理
    showEditModal() {
        // 保存當前輪盤狀態
        const currentTransform = this.canvas.style.transform;
        const currentRotation = this.currentRotation;
        
        document.getElementById('editModal').style.display = 'block';
        this.updateOptionsList();
        
        // 確保輪盤狀態不變
        this.canvas.style.transform = currentTransform;
        this.currentRotation = currentRotation;
    }
    
    hideEditModal() {
        document.getElementById('editModal').style.display = 'none';
    }
    
    // 選項管理
    addOption() {
        const textInput = document.getElementById('optionInput');
        const colorInput = document.getElementById('colorInput');
        const text = textInput.value.trim();
        const color = colorInput.value;
        
        if (text && color) {
            this.options.push({ text, color });
            textInput.value = '';
            colorInput.value = '#FF1744';
            this.updateWheelWithoutRotation();
            this.updateOptionsList();
        }
    }
    
    removeOption(index) {
        this.options.splice(index, 1);
        this.updateWheelWithoutRotation();
        this.updateOptionsList();
    }
    
    clearOptions() {
        this.options = [];
        this.updateWheelWithoutRotation();
        this.updateOptionsList();
    }
    
    generateRandomOptions() {
        // 重新生成預設選項（重新隨機排列）
        this.options = this.generateDefaultOptions();
        this.updateWheelWithoutRotation();
        this.updateOptionsList();
    }
    
    updateOptionsList() {
        const list = document.getElementById('optionsList');
        list.innerHTML = '';
        
        this.options.forEach((option, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="option-info">
                    <div class="color-preview" style="background-color: ${option.color}"></div>
                    <input type="text" class="option-text-input" value="${option.text}" 
                           data-index="${index}" maxlength="20" placeholder="輸入選項名稱">
                    <div class="color-input-group">
                        <input type="color" class="option-color-input" value="${option.color}" 
                               data-index="${index}">
                        <input type="text" class="option-hex-input" value="${option.color}" 
                               data-index="${index}" placeholder="#FF6B6B" maxlength="7">
                    </div>
                </div>
                <button onclick="wheel.removeOption(${index})" class="delete-btn">刪除</button>
            `;
            list.appendChild(li);
        });
        
        // 添加事件監聽器
        this.setupOptionEditListeners();
    }
    
    // 設置選項編輯事件監聽器
    setupOptionEditListeners() {
        // 文字編輯事件
        const textInputs = document.querySelectorAll('.option-text-input');
        textInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                const index = parseInt(e.target.dataset.index);
                const newText = e.target.value.trim();
                if (newText && newText !== this.options[index].text) {
                    this.options[index].text = newText;
                    this.updateWheelWithoutRotation();
                }
            });
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.target.blur();
                }
            });
        });
        
        // 顏色選擇器事件
        const colorInputs = document.querySelectorAll('.option-color-input');
        colorInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const newColor = e.target.value;
                if (newColor !== this.options[index].color) {
                    this.options[index].color = newColor;
                    this.updateWheelWithoutRotation();
                    // 同步更新對應的十六進制輸入框
                    const hexInput = e.target.parentNode.querySelector('.option-hex-input');
                    if (hexInput) {
                        hexInput.value = newColor;
                    }
                }
            });
        });
        
        // 十六進制顏色輸入事件
        const hexInputs = document.querySelectorAll('.option-hex-input');
        hexInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                const index = parseInt(e.target.dataset.index);
                let newColor = e.target.value.trim();
                
                // 驗證十六進制顏色格式
                if (newColor && /^#[0-9A-Fa-f]{6}$/.test(newColor)) {
                    if (newColor !== this.options[index].color) {
                        this.options[index].color = newColor;
                        this.updateWheelWithoutRotation();
                        // 同步更新對應的顏色選擇器
                        const colorInput = e.target.parentNode.querySelector('.option-color-input');
                        if (colorInput) {
                            colorInput.value = newColor;
                        }
                    }
                } else if (newColor) {
                    // 如果格式不正確，恢復原值
                    e.target.value = this.options[index].color;
                    alert('請輸入正確的十六進制顏色格式，例如：#FF6B6B');
                }
            });
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.target.blur();
                }
            });
        });
    }
    
    // 更新輪盤內容但不影響旋轉狀態
    updateWheelWithoutRotation() {
        // 保存當前的旋轉狀態
        const currentTransform = this.canvas.style.transform;
        const currentRotation = this.currentRotation;
        
        // 重新繪製輪盤以反映選項的變化
        this.drawWheel();
        
        // 恢復旋轉狀態
        this.canvas.style.transform = currentTransform;
        this.currentRotation = currentRotation;
        
        // 更新選項數量記錄
        this.canvas.dataset.optionsCount = this.options.length.toString();
    }
    
    saveOptions() {
        if (this.options.length < 2) {
            alert('至少需要2個選項！');
            return;
        }
        this.hideEditModal();
        alert('設定已儲存！');
    }
}

// 初始化轉盤
let wheel;
document.addEventListener('DOMContentLoaded', () => {
    wheel = new LuckyWheel();
});
