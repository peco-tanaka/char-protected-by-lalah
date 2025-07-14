// UI制御クラス
class GameUI {
    constructor() {
        this.boardElement = document.getElementById('game-board');
        this.moveCountElement = document.getElementById('move-count');
        this.bestRecordElement = document.getElementById('best-record');
        this.resetButton = document.getElementById('reset-btn');
        this.winMessage = document.getElementById('win-message');
        this.finalMovesElement = document.getElementById('final-moves');
        this.playAgainButton = document.getElementById('play-again');
        
        this.draggedPiece = null;
        this.dragOffset = { x: 0, y: 0 };
        this.touchStartPos = { x: 0, y: 0 };
        this.isTouchDevice = 'ontouchstart' in window;
        
        this.setupEventListeners();
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // リセットボタン
        this.resetButton.addEventListener('click', () => {
            this.resetGame();
        });

        // もう一度ボタン
        this.playAgainButton.addEventListener('click', () => {
            this.hideWinMessage();
            this.resetGame();
        });

        // キーボード操作
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        // マウス・タッチイベント
        this.boardElement.addEventListener('mousedown', (e) => {
            this.handlePointerDown(e);
        });

        this.boardElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePointerDown(e);
        });

        document.addEventListener('mousemove', (e) => {
            this.handlePointerMove(e);
        });

        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handlePointerMove(e);
        });

        document.addEventListener('mouseup', (e) => {
            this.handlePointerUp(e);
        });

        document.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handlePointerUp(e);
        });
    }

    // ゲームボードの描画
    renderBoard() {
        const game = getGame();
        this.boardElement.innerHTML = '';

        game.pieces.forEach(piece => {
            const pieceElement = this.createPieceElement(piece);
            this.boardElement.appendChild(pieceElement);
        });

        this.updateStats();
    }

    // ピース要素の作成
    createPieceElement(piece) {
        const element = document.createElement('div');
        element.className = `piece ${piece.type}`;
        element.dataset.pieceId = piece.id;
        element.textContent = piece.label;
        
        // CSSカスタムプロパティを使用して位置を設定
        element.style.left = `calc(var(--cell-size) * ${piece.x})`;
        element.style.top = `calc(var(--cell-size) * ${piece.y})`;
        
        // 選択状態の反映
        if (getGame().selectedPiece && getGame().selectedPiece.id === piece.id) {
            element.classList.add('selected');
        }
        
        return element;
    }

    // 統計情報の更新
    updateStats() {
        const game = getGame();
        this.moveCountElement.textContent = `移動回数: ${game.moveCount}`;
        
        const bestRecord = game.getBestRecord();
        this.bestRecordElement.textContent = `最短記録: ${bestRecord !== null ? bestRecord : '--'}`;
    }

    // ポインターダウン処理
    handlePointerDown(e) {
        const game = getGame();
        if (game.gameWon) return;

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        const boardRect = this.boardElement.getBoundingClientRect();
        const relativeX = clientX - boardRect.left;
        const relativeY = clientY - boardRect.top;
        
        const piece = game.getPieceAt(relativeX, relativeY);
        
        if (piece && piece.type !== 'wall' && piece.type !== 'exit') {
            game.selectedPiece = piece;
            this.draggedPiece = piece;
            
            // ドラッグオフセットの計算
            const pieceElement = this.boardElement.querySelector(`[data-piece-id="${piece.id}"]`);
            if (pieceElement) {
                const pieceRect = pieceElement.getBoundingClientRect();
                this.dragOffset.x = clientX - pieceRect.left;
                this.dragOffset.y = clientY - pieceRect.top;
                
                // ドラッグ開始時の元の位置を保存
                this.originalPiecePosition = {
                    x: piece.x,
                    y: piece.y
                };
            }
            
            this.touchStartPos.x = clientX;
            this.touchStartPos.y = clientY;
            
            this.renderBoard();
        }
    }

    // ポインタームーブ処理
    handlePointerMove(e) {
        if (!this.draggedPiece) return;

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        const pieceElement = this.boardElement.querySelector(`[data-piece-id="${this.draggedPiece.id}"]`);
        if (pieceElement) {
            const boardRect = this.boardElement.getBoundingClientRect();
            const newX = clientX - boardRect.left - this.dragOffset.x;
            const newY = clientY - boardRect.top - this.dragOffset.y;
            
            // 視覚的な移動のみ（実際の駒の位置は変更しない）
            pieceElement.style.left = `${newX}px`;
            pieceElement.style.top = `${newY}px`;
            pieceElement.style.zIndex = '1000';
            pieceElement.classList.add('dragging');
        }
    }

    // ポインターアップ処理
    handlePointerUp(e) {
        if (!this.draggedPiece) return;

        const game = getGame();
        const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
        const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);
        
        // ドラッグ距離の計算
        const dragDistance = Math.sqrt(
            Math.pow(clientX - this.touchStartPos.x, 2) + 
            Math.pow(clientY - this.touchStartPos.y, 2)
        );
        
        // 短いドラッグはタップとして扱う
        if (dragDistance < 10) {
            this.draggedPiece = null;
            this.renderBoard();
            return;
        }

        const boardRect = this.boardElement.getBoundingClientRect();
        const relativeX = clientX - boardRect.left;
        const relativeY = clientY - boardRect.top;
        
        // 動的なセルサイズを計算
        const cellSize = boardRect.width / 6; // 6x6のボード
        const newGridX = Math.round((relativeX - this.dragOffset.x) / cellSize);
        const newGridY = Math.round((relativeY - this.dragOffset.y) / cellSize);
        
        // 移動を試行
        let moved = false;
        
        // 目標位置への移動を試行
        if (this.canMoveToPosition(this.draggedPiece, newGridX, newGridY)) {
            // 元の位置から目標位置への移動を実行
            moved = this.moveToPosition(this.draggedPiece, newGridX, newGridY);
        }

        this.draggedPiece = null;
        this.renderBoard();
        
        // 勝利チェック
        if (game.gameWon) {
            this.showWinMessage();
        }
    }

    // 指定位置への移動が可能かチェック
    canMoveToPosition(piece, targetX, targetY) {
        const game = getGame();
        
        // 目標位置が境界内かチェック
        if (targetX < 0 || targetX >= game.boardWidth || 
            targetY < 0 || targetY >= game.boardHeight) {
            return false;
        }
        
        // 駒のサイズを考慮して移動可能かチェック
        for (let y = 0; y < piece.height; y++) {
            for (let x = 0; x < piece.width; x++) {
                const checkX = targetX + x;
                const checkY = targetY + y;
                
                // 境界チェック
                if (checkX >= game.boardWidth || checkY >= game.boardHeight) {
                    return false;
                }
                
                // 他の駒との衝突チェック
                if (game.board[checkY][checkX] !== 0 && game.board[checkY][checkX] !== piece.id) {
                    return false;
                }
            }
        }
        
        return true;
    }

    // 指定位置への移動を実行
    moveToPosition(piece, targetX, targetY) {
        const game = getGame();
        
        // 移動可能な場合、適切な方向に移動
        const deltaX = targetX - piece.x;
        const deltaY = targetY - piece.y;
        
        let moved = false;
        
        // 水平移動を試行
        if (deltaX !== 0) {
            const direction = deltaX > 0 ? 'right' : 'left';
            const steps = Math.abs(deltaX);
            
            for (let i = 0; i < steps; i++) {
                if (game.canMove(piece, direction)) {
                    moved = game.movePiece(piece, direction) || moved;
                } else {
                    break;
                }
            }
        }
        
        // 垂直移動を試行
        if (deltaY !== 0) {
            const direction = deltaY > 0 ? 'down' : 'up';
            const steps = Math.abs(deltaY);
            
            for (let i = 0; i < steps; i++) {
                if (game.canMove(piece, direction)) {
                    moved = game.movePiece(piece, direction) || moved;
                } else {
                    break;
                }
            }
        }
        
        return moved;
    }

    // キーボード操作処理
    handleKeyPress(e) {
        const game = getGame();
        if (game.gameWon || !game.selectedPiece) return;

        let direction = '';
        switch (e.key) {
            case 'ArrowUp':
                direction = 'up';
                break;
            case 'ArrowDown':
                direction = 'down';
                break;
            case 'ArrowLeft':
                direction = 'left';
                break;
            case 'ArrowRight':
                direction = 'right';
                break;
            case 'Escape':
                game.selectedPiece = null;
                this.renderBoard();
                return;
            default:
                return;
        }

        e.preventDefault();
        
        if (game.movePiece(game.selectedPiece, direction)) {
            this.renderBoard();
            
            if (game.gameWon) {
                this.showWinMessage();
            }
        }
    }

    // 勝利メッセージの表示
    showWinMessage() {
        const game = getGame();
        this.finalMovesElement.textContent = game.moveCount;
        
        // 派手なゴール演出を開始
        this.startGoalCelebration();
        
        // 遅延して勝利メッセージを表示
        setTimeout(() => {
            this.winMessage.classList.remove('hidden');
            this.winMessage.classList.add('enhanced');
            
            // 背景オーバーレイを追加
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            overlay.id = 'win-overlay';
            document.body.appendChild(overlay);
        }, 1000);
    }
    
    // 派手なゴール演出
    startGoalCelebration() {
        // 全画面フラッシュ
        this.createScreenFlash();
        
        // ボード振動とレインボー効果
        this.boardElement.classList.add('goal-celebration');
        
        // 娘ピースの特別演出
        const daughterElement = this.boardElement.querySelector('.piece.daughter');
        if (daughterElement) {
            daughterElement.classList.add('goal-reached');
            
            // 花火エフェクト
            this.createFireworks();
            
            // コンフェッティ（紙吹雪）
            this.createConfetti();
            
            // スパークルエフェクト
            daughterElement.classList.add('goal-effect');
        }
        
        // 効果音（仮想）
        this.playVictorySound();
        
        // 3秒後にエフェクトをクリーンアップ
        setTimeout(() => {
            this.cleanupCelebrationEffects();
        }, 3000);
    }
    
    // 全画面フラッシュ効果
    createScreenFlash() {
        const flash = document.createElement('div');
        flash.className = 'screen-flash';
        document.body.appendChild(flash);
        
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 500);
    }
    
    // 花火エフェクト
    createFireworks() {
        const container = document.getElementById('game-container');
        
        for (let i = 0; i < 5; i++) {
            const firework = document.createElement('div');
            firework.className = 'firework';
            container.appendChild(firework);
            
            // ランダム位置
            const randomX = Math.random() * container.offsetWidth;
            const randomY = Math.random() * container.offsetHeight;
            firework.style.left = randomX + 'px';
            firework.style.top = randomY + 'px';
        }
    }
    
    // コンフェッティ（紙吹雪）効果
    createConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // ランダム位置と遅延
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            
            document.body.appendChild(confetti);
            
            // 自動削除
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 6000);
        }
    }
    
    // 勝利音効果（仮想）
    playVictorySound() {
        // 実際の音声ファイルがある場合は以下のようにして再生
        // const audio = new Audio('victory.mp3');
        // audio.play().catch(e => console.log('音声再生エラー:', e));
        
        // 代替として視覚的な"音"表現
        console.log('🎉 VICTORY! 🎉');
        console.log('♪ ファンファーレ ♪');
    }
    
    // 演出エフェクトのクリーンアップ
    cleanupCelebrationEffects() {
        // ボードエフェクト削除
        this.boardElement.classList.remove('goal-celebration');
        
        // 娘ピースエフェクト削除
        const daughterElement = this.boardElement.querySelector('.piece.daughter');
        if (daughterElement) {
            daughterElement.classList.remove('goal-reached', 'goal-effect', 'celebrating');
        }
        
        // 花火エフェクト削除
        const fireworks = document.querySelectorAll('.firework');
        fireworks.forEach(fw => {
            if (fw.parentNode) {
                fw.parentNode.removeChild(fw);
            }
        });
        
        // 残存するコンフェッティ削除
        const confettis = document.querySelectorAll('.confetti');
        confettis.forEach(conf => {
            if (conf.parentNode) {
                conf.parentNode.removeChild(conf);
            }
        });
    }

    // 勝利メッセージの非表示
    hideWinMessage() {
        this.winMessage.classList.add('hidden');
        this.winMessage.classList.remove('enhanced');
        const overlay = document.getElementById('win-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        // 演出エフェクトもクリーンアップ
        this.cleanupCelebrationEffects();
    }

    // ゲームリセット
    resetGame() {
        this.hideWinMessage();
        const game = getGame();
        game.reset();
        this.renderBoard();
    }

    // 初期化
    initialize() {
        this.renderBoard();
    }

    // ピースの移動可能な方向を視覚的に表示
    showPossibleMoves(piece) {
        const game = getGame();
        const moves = game.getPossibleMoves(piece);
        
        // 既存のインジケーターを削除
        this.clearMoveIndicators();
        
        // 動的なセルサイズを計算
        const boardRect = this.boardElement.getBoundingClientRect();
        const cellSize = boardRect.width / 6;
        
        moves.forEach(direction => {
            const indicator = document.createElement('div');
            indicator.className = 'move-indicator';
            indicator.dataset.direction = direction;
            
            let x = piece.x * cellSize;
            let y = piece.y * cellSize;
            
            switch (direction) {
                case 'up':
                    y -= cellSize;
                    break;
                case 'down':
                    y += piece.height * cellSize;
                    break;
                case 'left':
                    x -= cellSize;
                    break;
                case 'right':
                    x += piece.width * cellSize;
                    break;
            }
            
            indicator.style.left = `${x}px`;
            indicator.style.top = `${y}px`;
            indicator.style.width = `${cellSize}px`;
            indicator.style.height = `${cellSize}px`;
            
            this.boardElement.appendChild(indicator);
        });
    }

    // 移動インジケーターのクリア
    clearMoveIndicators() {
        const indicators = this.boardElement.querySelectorAll('.move-indicator');
        indicators.forEach(indicator => indicator.remove());
    }
}

// グローバルUIインスタンス
let gameUI = null;

// UI初期化
function initializeUI() {
    gameUI = new GameUI();
    return gameUI;
}

// UI取得
function getUI() {
    return gameUI || initializeUI();
}