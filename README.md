**Claude Codeを試すために作ってみたアプリです**
**制作時間４時間。ゴール演出が発動しないバグ有り**

# 迫り来る白い悪魔から逃げ延び、ガンダムに乗り込め！

箱入り坊やゲームのガンダム版！大佐を白いガンダムまで導こう！

https://peco-tanaka.github.io/char-protected-by-lalah/


## ローカル環境の起動手順

### 1. プロジェクトのクローン
```bash
git clone <リポジトリURL>
cd char-protected-by-lalah
```

### 2. ローカルサーバーの起動

#### 方法A: Python（推奨 - macOSに標準インストール）
```bash
# Python 3の場合
python3 -m http.server 8000

#### 方法B: Node.js（開発者向け）
```bash
# http-serverをグローバルインストール
npm install -g http-server

# サーバー起動
http-server -p 8000
```

#### 方法C: VS Codeユーザー
Live Server拡張機能をインストールして、`index.html`を右クリック→「Open with Live Server」

### 3. ゲームを開く
ブラウザで `http://localhost:8000` にアクセス

## ゲームの遊び方
- ピースをドラッグして移動
- タップでピースを選択し、矢印キーで移動
- 赤い娘ピース（大佐）を下の出口まで導く
- 最短移動回数でのクリアを目指そう！

## 操作方法
- **ドラッグ操作**: ピースを直接ドラッグして移動
- **キーボード操作**: ピースをクリックして選択後、矢印キーで移動
- **リセット**: 「ループ」ボタンでゲームをリセット
