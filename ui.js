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
        this.lastKnownX = null;
        this.lastKnownY = null;
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

        // ポインターイベントで統一的に処理（タッチとマウス両対応）
        if ('onpointerdown' in window) {
            // ポインターイベントが利用可能
            this.boardElement.addEventListener('pointerdown', (e) => {
                this.handlePointerStart(e);
            });

            document.addEventListener('pointermove', (e) => {
                this.handlePointerMove(e);
            });

            document.addEventListener('pointerup', (e) => {
                this.handlePointerEnd(e);
            });
            
            // ポインターキャンセルも処理
            document.addEventListener('pointercancel', (e) => {
                this.handlePointerEnd(e);
            });
        } else {
            // フォールバック: タッチとマウスイベントを別々で処理
            this.setupFallbackEvents();
        }
        
        // デバッグ用情報
        console.log('Pointer events supported:', 'onpointerdown' in window);
        console.log('Touch device:', 'ontouchstart' in window || navigator.maxTouchPoints > 0);
    }
    
    // フォールバックイベント設定
    setupFallbackEvents() {
        // タッチイベント
        this.boardElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePointerStart(e.touches[0]);
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (this.draggedPiece && e.touches.length > 0) {
                e.preventDefault();
                this.handlePointerMove(e.touches[0]);
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (e.changedTouches && e.changedTouches.length > 0) {
                this.handlePointerEnd(e.changedTouches[0]);
            }
        });
        
        // マウスイベント
        this.boardElement.addEventListener('mousedown', (e) => {
            this.handlePointerStart(e);
        });

        document.addEventListener('mousemove', (e) => {
            this.handlePointerMove(e);
        });

        document.addEventListener('mouseup', (e) => {
            this.handlePointerEnd(e);
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

    // 統一ポインター開始処理
    handlePointerStart(e) {
        const game = getGame();
        if (game.gameWon) return;
        
        // ポインターイベントまたはタッチ/マウスイベントから座標取得
        const clientX = e.clientX;
        const clientY = e.clientY;
        
        // デバッグ情報
        console.log('Pointer start:', {
            type: e.type,
            pointerType: e.pointerType || 'unknown',
            clientX,
            clientY,
            isPrimary: e.isPrimary !== undefined ? e.isPrimary : true
        });
        
        const boardRect = this.boardElement.getBoundingClientRect();
        const relativeX = clientX - boardRect.left;
        const relativeY = clientY - boardRect.top;
        
        console.log('Board rect:', boardRect);
        console.log('Relative position:', { relativeX, relativeY });
        
        const piece = game.getPieceAt(relativeX, relativeY);
        console.log('Piece found:', piece);
        
        if (piece && piece.type !== 'wall' && piece.type !== 'exit') {
            // ポインターキャプチャを設定（ポインターイベントの場合）
            if (e.setPointerCapture && e.pointerId !== undefined) {
                this.boardElement.setPointerCapture(e.pointerId);
                this.capturedPointerId = e.pointerId;
            }
            
            game.selectedPiece = piece;
            this.draggedPiece = piece;
            
            // ドラッグオフセットの計算
            const pieceElement = this.boardElement.querySelector(`[data-piece-id="${piece.id}"]`);
            if (pieceElement) {
                const pieceRect = pieceElement.getBoundingClientRect();
                this.dragOffset.x = clientX - pieceRect.left;
                this.dragOffset.y = clientY - pieceRect.top;
                
                console.log('Piece rect:', pieceRect);
                console.log('Drag offset:', this.dragOffset);
                
                // ドラッグ開始時の元の位置を保存
                this.originalPiecePosition = {
                    x: piece.x,
                    y: piece.y
                };
                
                // 即座にドラッグ状態を表示
                pieceElement.style.zIndex = '1000';
                pieceElement.classList.add('dragging');
                
                console.log('Drag started for piece:', piece.id, 'at position:', piece.x, piece.y);
            }
            
            this.pointerStartPos = { x: clientX, y: clientY };
            
            this.renderBoard();
        } else {
            console.log('No movable piece found at position');
        }
    }

    // 統一ポインター移動処理
    handlePointerMove(e) {
        if (!this.draggedPiece) return;
        
        const clientX = e.clientX;
        const clientY = e.clientY;
        
        const pieceElement = this.boardElement.querySelector(`[data-piece-id="${this.draggedPiece.id}"]`);
        if (pieceElement) {
            const boardRect = this.boardElement.getBoundingClientRect();
            const newX = clientX - boardRect.left - this.dragOffset.x;
            const newY = clientY - boardRect.top - this.dragOffset.y;
            
            // 最後の既知の位置を保存
            this.lastKnownPos = { x: clientX, y: clientY };
            
            // 視覚的な移動のみ、実際のゲーム状態は変更しない
            pieceElement.style.left = `${newX}px`;
            pieceElement.style.top = `${newY}px`;
            pieceElement.style.zIndex = '1000';
            pieceElement.classList.add('dragging');
        }
    }

    // 統一ポインター終了処理
    handlePointerEnd(e) {
        if (!this.draggedPiece) return;
        
        console.log('Pointer end detected:', {
            type: e.type,
            pointerType: e.pointerType || 'unknown',
            pointerId: e.pointerId
        });
        
        const game = getGame();
        
        // ポインターキャプチャを解除
        if (this.capturedPointerId !== undefined && e.pointerId === this.capturedPointerId) {
            this.boardElement.releasePointerCapture(this.capturedPointerId);
            this.capturedPointerId = undefined;
        }
        
        // 終了位置を取得（最後の既知の位置またはイベントから）
        const clientX = e.clientX || (this.lastKnownPos ? this.lastKnownPos.x : this.pointerStartPos.x);
        const clientY = e.clientY || (this.lastKnownPos ? this.lastKnownPos.y : this.pointerStartPos.y);
        
        console.log('End position:', { clientX, clientY });
        
        // ドラッグ距離の計算
        const dragDistance = Math.sqrt(
            Math.pow(clientX - this.pointerStartPos.x, 2) + 
            Math.pow(clientY - this.pointerStartPos.y, 2)
        );
        
        console.log('Drag distance:', dragDistance);
        
        // 短いドラッグはタップ/クリックとして扱う
        if (dragDistance < 15) { // 闾値を少し上げる
            console.log('Tap/click detected, not drag');
            this.cleanupDrag();
            return;
        }

        const boardRect = this.boardElement.getBoundingClientRect();
        const relativeX = clientX - boardRect.left;
        const relativeY = clientY - boardRect.top;
        
        // 正確なセルサイズを使用
        const cellSize = boardRect.width / 6; // 6x6のボード
        
        // ピースの中心位置を考慮したグリッド位置の計算
        const pieceElement = this.boardElement.querySelector(`[data-piece-id="${this.draggedPiece.id}"]`);
        const pieceCenterX = relativeX - this.dragOffset.x + (this.draggedPiece.width * cellSize) / 2;
        const pieceCenterY = relativeY - this.dragOffset.y + (this.draggedPiece.height * cellSize) / 2;
        
        const newGridX = Math.floor(pieceCenterX / cellSize);
        const newGridY = Math.floor(pieceCenterY / cellSize);
        
        console.log('Calculated grid position:', { 
            newGridX, newGridY, 
            pieceCenterX, pieceCenterY, 
            cellSize,
            pieceSize: { width: this.draggedPiece.width, height: this.draggedPiece.height }
        });
        
        // 移動を試行
        let moved = false;
        
        // 目標位置への移動を試行
        if (this.canMoveToPosition(this.draggedPiece, newGridX, newGridY)) {
            moved = this.moveToPosition(this.draggedPiece, newGridX, newGridY);
            console.log('Move executed successfully:', moved);
        } else {
            console.log('Move not possible to position:', { newGridX, newGridY });
            // 近くの有効な位置を探す
            const nearbyPositions = this.findNearbyValidPositions(this.draggedPiece, newGridX, newGridY);
            if (nearbyPositions.length > 0) {
                const closest = nearbyPositions[0];
                moved = this.moveToPosition(this.draggedPiece, closest.x, closest.y);
                console.log('Moved to nearby position:', closest, 'success:', moved);
            }
        }

        this.cleanupDrag();
        
        // 勝利チェック
        if (game.gameWon) {
            this.showWinMessage();
        }
    }
    
    // ドラッグ状態のクリーンアップ
    cleanupDrag() {
        this.draggedPiece = null;
        this.lastKnownPos = null;
        this.pointerStartPos = null;
        this.capturedPointerId = undefined;
        this.renderBoard();
    }
    
    // 近くの有効な位置を探す
    findNearbyValidPositions(piece, targetX, targetY) {
        const positions = [];
        const maxDistance = 2;
        
        for (let dx = -maxDistance; dx <= maxDistance; dx++) {
            for (let dy = -maxDistance; dy <= maxDistance; dy++) {
                const x = targetX + dx;
                const y = targetY + dy;
                
                if (this.canMoveToPosition(piece, x, y)) {
                    const distance = Math.abs(dx) + Math.abs(dy);
                    positions.push({ x, y, distance });
                }
            }
        }
        
        // 距離でソート
        return positions.sort((a, b) => a.distance - b.distance);
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