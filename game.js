// ゲームの状態管理
class HakoiriMusumeGame {
    constructor() {
        this.boardWidth = 6;
        this.boardHeight = 6;
        this.cellSize = this.calculateCellSize();
        this.board = [];
        this.pieces = [];
        this.moveCount = 0;
        this.gameWon = false;
        this.selectedPiece = null;
        
        this.initializeGame();
        this.setupResizeListener();
    }

    // 画面サイズに応じてセルサイズを計算
    calculateCellSize() {
        const screenWidth = window.innerWidth;
        
        if (screenWidth <= 400) {
            return 33.33; // 200px / 6 = 33.33px
        } else if (screenWidth <= 560) {
            return 40; // 240px / 6 = 40px
        } else if (screenWidth <= 768) {
            return 50; // 300px / 6 = 50px
        } else {
            return 80; // デフォルト: 480px / 6 = 80px
        }
    }

    // リサイズイベントリスナーを設定
    setupResizeListener() {
        window.addEventListener('resize', () => {
            const newCellSize = this.calculateCellSize();
            if (newCellSize !== this.cellSize) {
                this.cellSize = newCellSize;
                // UIを再描画
                if (window.gameUI) {
                    window.gameUI.renderBoard();
                }
            }
        });
    }

    // ゲーム初期化
    initializeGame() {
        this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
        this.pieces = [];
        this.moveCount = 0;
        this.gameWon = false;
        this.selectedPiece = null;
        
        // 修正した駒配置 (6行6列)
        // 指定された配置：
        // 空白|空白|父|娘|娘|母   (行0) 
        // 空白|空白|父|娘|娘|母   (行1) 
        // 手代|大番頭|大番頭|大番頭|大番頭|兄嫁  (行2)
        // 丁稚1|女中|女中|番頭|番頭|丁稚2  (行3)
        // 番犬|祖父|祖父|祖母|祖母|丁稚3  (行4)
        // 移動不可|移動不可|出口|出口|移動不可|移動不可   (行5)
        this.pieces = [
            // 娘（2×2）- 位置(3,0)
            { 
                id: 1, 
                type: 'daughter', 
                width: 2, 
                height: 2, 
                x: 3, 
                y: 0, 
                label: 'シャア' 
            },
            
            // 父（1×2）- 位置(2,0)
            { 
                id: 2, 
                type: 'parent', 
                width: 1, 
                height: 2, 
                x: 2, 
                y: 0, 
                label: '白い悪魔' 
            },
            
            // 母（1×2）- 位置(5,0)
            { 
                id: 3, 
                type: 'parent', 
                width: 1, 
                height: 2, 
                x: 5, 
                y: 0, 
                label: '白い悪魔' 
            },
            
            // 手代（1×1）- 位置(0,2)
            { 
                id: 4, 
                type: 'small', 
                width: 1, 
                height: 1, 
                x: 0, 
                y: 2, 
                label: 'RX-78' 
            },
            
            // 大番頭（4×1）- 位置(1,2)
            { 
                id: 5, 
                type: 'special', 
                width: 4, 
                height: 1, 
                x: 1, 
                y: 2, 
                label: '「情けない奴」' 
            },
            
            // 兄嫁（1×1）- 位置(5,2)
            { 
                id: 6, 
                type: 'small', 
                width: 1, 
                height: 1, 
                x: 5, 
                y: 2, 
                label: 'RX-78' 
            },
            
            // 丁稚1（1×1）- 位置(0,3)
            { 
                id: 7, 
                type: 'small', 
                width: 1, 
                height: 1, 
                x: 0, 
                y: 3, 
                label: 'RX-78' 
            },
            
            // 女中（1×2）- 位置(1,3)
            { 
                id: 8, 
                type: 'worker', 
                width: 2, 
                height: 1, 
                x: 1, 
                y: 3, 
                label: 'νガンダム' 
            },
            
            // 番頭（1×2）- 位置(3,3)
            { 
                id: 9, 
                type: 'worker', 
                width: 2, 
                height: 1, 
                x: 3, 
                y: 3, 
                label: 'νガンダム' 
            },
            
            // 丁稚2（1×1）- 位置(5,3)
            { 
                id: 10, 
                type: 'small', 
                width: 1, 
                height: 1, 
                x: 5, 
                y: 3, 
                label: 'RX-78' 
            },
            
            // 番犬（1×1）- 位置(0,4)
            { 
                id: 11, 
                type: 'small', 
                width: 1, 
                height: 1, 
                x: 0, 
                y: 4, 
                label: 'RX-78' 
            },
            
            // 祖父（1×2）- 位置(1,4)
            { 
                id: 12, 
                type: 'elder', 
                width: 2, 
                height: 1, 
                x: 1, 
                y: 4, 
                label: '「大佐引いて下さい！」' 
            },
            
            // 祖母（1×2）- 位置(3,4)
            { 
                id: 13, 
                type: 'elder', 
                width: 2, 
                height: 1, 
                x: 3, 
                y: 4, 
                label: '「大佐どいて下さい！」' 
            },
            
            // 丁稚3（1×1）- 位置(5,4)
            { 
                id: 14, 
                type: 'small', 
                width: 1, 
                height: 1, 
                x: 5, 
                y: 4, 
                label: 'RX-78' 
            },
            
            // 移動不可ブロック1（2×1）- 位置(0,5)
            { 
                id: 15, 
                type: 'wall', 
                width: 2, 
                height: 1, 
                x: 0, 
                y: 5, 
                label: '' 
            },
            
            // 移動不可ブロック2（2×1）- 位置(4,5)
            { 
                id: 16, 
                type: 'wall', 
                width: 2, 
                height: 1, 
                x: 4, 
                y: 5, 
                label: '' 
            },
            
            // 出口（2×1）- 位置(2,5)
            { 
                id: 17, 
                type: 'exit', 
                width: 2, 
                height: 1, 
                x: 2, 
                y: 5, 
                label: '白いガンダム' 
            }
        ];
        
        this.updateBoard();
    }

    // ボード状態更新
    updateBoard() {
        // ボードをクリア
        this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
        
        // ピースの位置をボードに反映
        this.pieces.forEach(piece => {
            for (let y = 0; y < piece.height; y++) {
                for (let x = 0; x < piece.width; x++) {
                    if (piece.y + y < this.boardHeight && piece.x + x < this.boardWidth) {
                        this.board[piece.y + y][piece.x + x] = piece.id;
                    }
                }
            }
        });
    }

    // 移動可能性チェック
    canMove(piece, direction) {
        let newX = piece.x;
        let newY = piece.y;
        
        switch (direction) {
            case 'up':
                newY--;
                break;
            case 'down':
                newY++;
                break;
            case 'left':
                newX--;
                break;
            case 'right':
                newX++;
                break;
            default:
                return false;
        }
        
        // 境界チェック
        if (newX < 0 || newX + piece.width > this.boardWidth ||
            newY < 0 || newY + piece.height > this.boardHeight) {
            return false;
        }
        
        // 娘ピースの出口チェック（特殊ケース）
        if (piece.type === 'daughter') {
            // 出口の位置チェック（位置(2,4)）
            if (newX === 2 && newY === 4) {
                return true;
            }
        }
        
        // 他のピースとの衝突チェック
        for (let y = 0; y < piece.height; y++) {
            for (let x = 0; x < piece.width; x++) {
                const checkX = newX + x;
                const checkY = newY + y;
                
                if (checkY < this.boardHeight && checkX < this.boardWidth) {
                    const cellValue = this.board[checkY][checkX];
                    if (cellValue !== 0 && cellValue !== piece.id) {
                        // 娘ピースが出口ピースに重なる場合は許可
                        const otherPiece = this.pieces.find(p => p.id === cellValue);
                        if (piece.type === 'daughter' && otherPiece && otherPiece.type === 'exit') {
                            continue;
                        }
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    // ピース移動実行
    movePiece(piece, direction) {
        if (!this.canMove(piece, direction)) {
            return false;
        }
        
        switch (direction) {
            case 'up':
                piece.y--;
                break;
            case 'down':
                piece.y++;
                break;
            case 'left':
                piece.x--;
                break;
            case 'right':
                piece.x++;
                break;
        }
        
        this.updateBoard();
        this.moveCount++;
        
        // 勝利条件チェック
        if (this.checkWin()) {
            this.gameWon = true;
            this.saveBestRecord();
        }
        
        return true;
    }

    // 座標による移動
    moveToPosition(piece, targetX, targetY) {
        const deltaX = targetX - piece.x;
        const deltaY = targetY - piece.y;
        
        let direction = '';
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }
        
        return this.movePiece(piece, direction);
    }

    // 勝利条件チェック
    checkWin() {
        const daughter = this.pieces.find(p => p.type === 'daughter');
        return daughter && daughter.x === 2 && daughter.y === 4;
    }

    // ピースを座標で取得
    getPieceAt(x, y) {
        // 動的にセルサイズを計算
        const boardElement = document.getElementById('game-board');
        if (!boardElement) return null;
        
        const boardRect = boardElement.getBoundingClientRect();
        const cellSize = boardRect.width / this.boardWidth;
        
        const gridX = Math.floor(x / cellSize);
        const gridY = Math.floor(y / cellSize);
        
        if (gridX < 0 || gridX >= this.boardWidth || 
            gridY < 0 || gridY >= this.boardHeight) {
            return null;
        }
        
        const pieceId = this.board[gridY][gridX];
        return this.pieces.find(p => p.id === pieceId) || null;
    }

    // ピースをIDで取得
    getPieceById(id) {
        return this.pieces.find(p => p.id === id);
    }

    // 可能な移動方向を取得
    getPossibleMoves(piece) {
        const moves = [];
        ['up', 'down', 'left', 'right'].forEach(direction => {
            if (this.canMove(piece, direction)) {
                moves.push(direction);
            }
        });
        return moves;
    }

    // ゲームリセット
    reset() {
        this.initializeGame();
    }

    // 最短記録保存
    saveBestRecord() {
        const currentBest = this.getBestRecord();
        if (currentBest === null || this.moveCount < currentBest) {
            localStorage.setItem('hakoiri-best-record', this.moveCount.toString());
        }
    }

    // 最短記録取得
    getBestRecord() {
        const record = localStorage.getItem('hakoiri-best-record');
        return record ? parseInt(record) : null;
    }

    // ゲーム状態を取得
    getState() {
        return {
            pieces: this.pieces.map(p => ({...p})),
            board: this.board.map(row => [...row]),
            moveCount: this.moveCount,
            gameWon: this.gameWon,
            selectedPiece: this.selectedPiece
        };
    }

    // デバッグ用：ボード状態を表示
    debugBoard() {
        console.log('Board state:');
        this.board.forEach((row, y) => {
            console.log(`Row ${y}:`, row.join(' '));
        });
        console.log('Pieces:');
        this.pieces.forEach(piece => {
            console.log(`${piece.label} (${piece.type}): (${piece.x}, ${piece.y}) ${piece.width}x${piece.height}`);
        });
    }
}

// グローバルなゲームインスタンス
let game = null;

// ゲーム初期化関数
function initializeGame() {
    game = new HakoiriMusumeGame();
    return game;
}

// ゲームインスタンス取得
function getGame() {
    return game || initializeGame();
}