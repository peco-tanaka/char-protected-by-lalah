# data-piece-id="16" 位置問題の分析

## 問題の特定

コードを分析した結果、`data-piece-id="16"`（移動不可ブロック2）の位置に関する以下の問題を特定しました：

### 1. ゲームデータでの配置
`game.js`の初期化部分で、以下のように定義されています：

```javascript
// 移動不可ブロック2（2×1）- 位置(4,5)
{ 
    id: 16, 
    type: 'wall', 
    width: 2, 
    height: 1, 
    x: 4, 
    y: 5, 
    label: '' 
}
```

### 2. 期待される配置と実際の問題

期待される最下段の配置：
```
|移動不可|移動不可|出口|出口|移動不可|移動不可|   (行5)
```

- ピース15（id: 15）: 位置(0,5), サイズ2x1 → セル0,1を占有
- ピース17（id: 17, 出口）: 位置(2,5), サイズ2x1 → セル2,3を占有  
- ピース16（id: 16）: 位置(4,5), サイズ2x1 → セル4,5を占有

### 3. 潜在的な問題点

#### A. CSS変数の不整合
`style.css`では以下のようにCSS変数を使用：
```css
--board-size: min(480px, calc(100vw - 60px));
--cell-size: calc(var(--board-size) / 6);
```

#### B. JavaScript計算との不整合
`game.js`と`ui.js`では独自に計算：
```javascript
// game.js
calculateCellSize() {
    if (screenWidth <= 400) return 33.33;
    else if (screenWidth <= 560) return 40;
    else if (screenWidth <= 768) return 50;
    else return 80;
}

// ui.js  
const cellSize = boardRect.width / 6;
```

#### C. 位置設定の不整合
`ui.js`の`createPieceElement`では：
```javascript
element.style.left = `calc(var(--cell-size) * ${piece.x})`;
element.style.top = `calc(var(--cell-size) * ${piece.y})`;
```

しかし、ドラッグ後の位置更新では：
```javascript
const cellSize = boardRect.width / 6; // 動的計算
const newGridX = Math.round((relativeX - this.dragOffset.x) / cellSize);
```

## 修正方法の提案

### 1. 統一されたセルサイズ計算

CSS変数とJavaScript計算を統一する：

```javascript
// 統一されたセルサイズ取得関数
function getUnifiedCellSize() {
    const boardElement = document.getElementById('game-board');
    if (!boardElement) return 80; // デフォルト値
    
    const boardRect = boardElement.getBoundingClientRect();
    return boardRect.width / 6;
}
```

### 2. 位置設定の統一

CSS calc()を使わず、直接ピクセル値で設定：

```javascript
createPieceElement(piece) {
    const element = document.createElement('div');
    element.className = `piece ${piece.type}`;
    element.dataset.pieceId = piece.id;
    element.textContent = piece.label;
    
    const cellSize = getUnifiedCellSize();
    element.style.left = `${cellSize * piece.x}px`;
    element.style.top = `${cellSize * piece.y}px`;
    
    return element;
}
```

### 3. レスポンシブ対応の改善

画面サイズ変更時の再計算を強化：

```javascript
setupResizeListener() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            this.updatePiecePositions();
        }, 100);
    });
}

updatePiecePositions() {
    const cellSize = getUnifiedCellSize();
    this.pieces.forEach(piece => {
        const element = document.querySelector(`[data-piece-id="${piece.id}"]`);
        if (element) {
            element.style.left = `${cellSize * piece.x}px`;
            element.style.top = `${cellSize * piece.y}px`;
        }
    });
}
```

## デバッグ手順

1. ブラウザでゲームを開く
2. F12で開発者ツールを開く
3. `debug_position.js`の内容をコンソールに貼り付けて実行
4. 位置情報の詳細を確認
5. 上記の修正を適用してテスト

## 予想される修正結果

- ピース15とピース16が正確に隣接配置される
- 画面サイズ変更時も位置が保たれる
- ドラッグ&ドロップ後の位置が正確になる
- CSS変数とJavaScript計算の整合性が取れる