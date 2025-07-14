// デバッグ用スクリプト: data-piece-id="16"の位置調査
// ブラウザのコンソールで実行してください

function debugPiecePosition() {
    console.log('=== 位置調査開始 ===');
    
    // data-piece-id="16"の要素を取得
    const piece16 = document.querySelector('[data-piece-id="16"]');
    const piece15 = document.querySelector('[data-piece-id="15"]');
    
    if (!piece16) {
        console.error('data-piece-id="16"の要素が見つかりません');
        return;
    }
    
    if (!piece15) {
        console.error('data-piece-id="15"の要素が見つかりません');
        return;
    }
    
    // ボード要素を取得
    const board = document.getElementById('game-board');
    if (!board) {
        console.error('ゲームボードが見つかりません');
        return;
    }
    
    // 計算された位置を取得
    const piece16Computed = window.getComputedStyle(piece16);
    const piece15Computed = window.getComputedStyle(piece15);
    const boardComputed = window.getComputedStyle(board);
    
    // ボードのサイズ情報
    const boardRect = board.getBoundingClientRect();
    
    console.log('--- ボード情報 ---');
    console.log('ボードサイズ:', {
        width: boardRect.width,
        height: boardRect.height,
        cssWidth: boardComputed.width,
        cssHeight: boardComputed.height
    });
    
    // CSS変数の値を取得
    const cellSize = getComputedStyle(document.documentElement).getPropertyValue('--cell-size');
    const boardSize = getComputedStyle(document.documentElement).getPropertyValue('--board-size');
    
    console.log('CSS変数:', {
        '--cell-size': cellSize,
        '--board-size': boardSize
    });
    
    // 動的に計算されるセルサイズ
    const calculatedCellSize = boardRect.width / 6;
    console.log('計算されたセルサイズ:', calculatedCellSize + 'px');
    
    // ピース16の位置情報
    console.log('--- data-piece-id="16" (移動不可ブロック2) ---');
    console.log('CSS left:', piece16Computed.left);
    console.log('CSS top:', piece16Computed.top);
    console.log('style.left:', piece16.style.left);
    console.log('style.top:', piece16.style.top);
    
    // ゲームデータでの位置
    const game = window.game || getGame();
    const piece16Data = game.getPieceById(16);
    if (piece16Data) {
        console.log('ゲームデータ位置:', {
            x: piece16Data.x,
            y: piece16Data.y,
            width: piece16Data.width,
            height: piece16Data.height
        });
        console.log('期待される位置:', {
            left: `calc(var(--cell-size) * ${piece16Data.x})`,
            top: `calc(var(--cell-size) * ${piece16Data.y})`,
            leftPx: calculatedCellSize * piece16Data.x + 'px',
            topPx: calculatedCellSize * piece16Data.y + 'px'
        });
    }
    
    // ピース15の位置情報（比較用）
    console.log('--- data-piece-id="15" (移動不可ブロック1) ---');
    console.log('CSS left:', piece15Computed.left);
    console.log('CSS top:', piece15Computed.top);
    console.log('style.left:', piece15.style.left);
    console.log('style.top:', piece15.style.top);
    
    const piece15Data = game.getPieceById(15);
    if (piece15Data) {
        console.log('ゲームデータ位置:', {
            x: piece15Data.x,
            y: piece15Data.y,
            width: piece15Data.width,
            height: piece15Data.height
        });
        console.log('期待される位置:', {
            left: `calc(var(--cell-size) * ${piece15Data.x})`,
            top: `calc(var(--cell-size) * ${piece15Data.y})`,
            leftPx: calculatedCellSize * piece15Data.x + 'px',
            topPx: calculatedCellSize * piece15Data.y + 'px'
        });
    }
    
    // 実際のBoundingClientRectで位置確認
    const piece16Rect = piece16.getBoundingClientRect();
    const piece15Rect = piece15.getBoundingClientRect();
    
    console.log('--- 実際の画面位置 (getBoundingClientRect) ---');
    console.log('ピース16位置:', {
        left: piece16Rect.left,
        top: piece16Rect.top,
        right: piece16Rect.right,
        bottom: piece16Rect.bottom,
        width: piece16Rect.width,
        height: piece16Rect.height
    });
    
    console.log('ピース15位置:', {
        left: piece15Rect.left,
        top: piece15Rect.top,
        right: piece15Rect.right,
        bottom: piece15Rect.bottom,
        width: piece15Rect.width,
        height: piece15Rect.height
    });
    
    // ボードを基準とした相対位置
    console.log('--- ボード基準の相対位置 ---');
    console.log('ピース16:', {
        relativeLeft: piece16Rect.left - boardRect.left,
        relativeTop: piece16Rect.top - boardRect.top
    });
    
    console.log('ピース15:', {
        relativeLeft: piece15Rect.left - boardRect.left,
        relativeTop: piece15Rect.top - boardRect.top
    });
    
    // グリッド位置の計算
    const piece16GridX = (piece16Rect.left - boardRect.left) / calculatedCellSize;
    const piece16GridY = (piece16Rect.top - boardRect.top) / calculatedCellSize;
    const piece15GridX = (piece15Rect.left - boardRect.left) / calculatedCellSize;
    const piece15GridY = (piece15Rect.top - boardRect.top) / calculatedCellSize;
    
    console.log('--- グリッド位置 (計算値) ---');
    console.log('ピース16:', { gridX: piece16GridX, gridY: piece16GridY });
    console.log('ピース15:', { gridX: piece15GridX, gridY: piece15GridY });
    
    // 位置ずれの検証
    console.log('--- 位置ずれ検証 ---');
    if (piece16Data && piece15Data) {
        const piece16ExpectedLeft = calculatedCellSize * piece16Data.x;
        const piece16ExpectedTop = calculatedCellSize * piece16Data.y;
        const piece15ExpectedLeft = calculatedCellSize * piece15Data.x;
        const piece15ExpectedTop = calculatedCellSize * piece15Data.y;
        
        const piece16ActualLeft = piece16Rect.left - boardRect.left;
        const piece16ActualTop = piece16Rect.top - boardRect.top;
        const piece15ActualLeft = piece15Rect.left - boardRect.left;
        const piece15ActualTop = piece15Rect.top - boardRect.top;
        
        console.log('ピース16 位置差:', {
            leftDiff: piece16ActualLeft - piece16ExpectedLeft,
            topDiff: piece16ActualTop - piece16ExpectedTop
        });
        
        console.log('ピース15 位置差:', {
            leftDiff: piece15ActualLeft - piece15ExpectedLeft,
            topDiff: piece15ActualTop - piece15ExpectedTop
        });
        
        // 重複チェック
        const isOverlapping = (
            piece16Rect.left < piece15Rect.right &&
            piece16Rect.right > piece15Rect.left &&
            piece16Rect.top < piece15Rect.bottom &&
            piece16Rect.bottom > piece15Rect.top
        );
        
        console.log('重複状態:', isOverlapping);
        
        // 隣接チェック（期待される配置）
        const shouldBeAdjacent = (piece15Data.x + piece15Data.width === piece16Data.x) && (piece15Data.y === piece16Data.y);
        console.log('隣接すべきか:', shouldBeAdjacent);
        
        if (shouldBeAdjacent) {
            const actualGap = piece16Rect.left - piece15Rect.right;
            console.log('実際の隙間:', actualGap + 'px');
            
            if (Math.abs(actualGap) > 1) {
                console.warn('警告: ピース間に予期しない隙間があります');
            }
        }
    }
    
    console.log('=== 位置調査終了 ===');
}

// 実行
debugPiecePosition();

// コンソールに手動実行用の関数も提供
console.log('手動でデバッグを実行するには: debugPiecePosition()');