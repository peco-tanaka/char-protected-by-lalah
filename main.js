// メイン制御とアプリケーション初期化
document.addEventListener('DOMContentLoaded', function() {
    // ゲームとUIの初期化
    const game = initializeGame();
    const ui = initializeUI();
    
    // 初期描画
    ui.initialize();
    
    // アプリケーション設定
    setupApplication();
    
    // デバッグ用（開発時のみ）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.game = game;
        window.ui = ui;
        console.log('箱入り娘ゲーム - 開発モード');
        console.log('デバッグ用: window.game, window.ui が利用可能');
    }
});

// アプリケーション設定
function setupApplication() {
    // ページの基本設定
    setupPageSettings();
    
    // パフォーマンス最適化
    setupPerformanceOptimizations();
    
    // アクセシビリティ設定
    setupAccessibility();
    
    // 画面サイズ変更対応
    setupResponsiveHandling();
}

// ページの基本設定
function setupPageSettings() {
    // ページタイトルの動的更新
    updatePageTitle();
    
    // ファビコン設定（必要に応じて）
    setupFavicon();
    
    // メタタグ設定
    setupMetaTags();
}

// ページタイトルの更新
function updatePageTitle() {
    const game = getGame();
    const originalTitle = document.title;
    
    // ゲーム状態に応じたタイトル更新
    function updateTitle() {
        if (game.gameWon) {
            document.title = '🎉 クリア！ - ' + originalTitle;
        } else if (game.moveCount > 0) {
            document.title = `(${game.moveCount}手) - ` + originalTitle;
        } else {
            document.title = originalTitle;
        }
    }
    
    // 初期タイトル設定
    updateTitle();
    
    // ゲーム状態変更時にタイトルを更新
    const originalMovePiece = game.movePiece;
    game.movePiece = function(...args) {
        const result = originalMovePiece.apply(this, args);
        setTimeout(updateTitle, 100);
        return result;
    };
    
    const originalReset = game.reset;
    game.reset = function(...args) {
        const result = originalReset.apply(this, args);
        setTimeout(updateTitle, 100);
        return result;
    };
}

// ファビコン設定
function setupFavicon() {
    // 動的にファビコンを設定（必要に応じて）
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/svg+xml';
    favicon.href = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e74c3c"/><text x="50" y="60" font-family="Arial" font-size="40" fill="white" text-anchor="middle">娘</text></svg>';
    document.head.appendChild(favicon);
}

// メタタグ設定
function setupMetaTags() {
    // 既存のメタタグを補完
    const metaTags = [
        { name: 'description', content: '箱入り娘パズルゲーム - 2×2の娘ピースを出口まで導く日本の伝統的なスライドパズル' },
        { name: 'keywords', content: '箱入り娘,パズル,ゲーム,スライドパズル,日本' },
        { name: 'author', content: 'Hakoiri Musume Game' },
        { property: 'og:title', content: '箱入り娘 - 大家族バリアント' },
        { property: 'og:description', content: '2×2の娘ピースを出口まで導く日本の伝統的なスライドパズル' },
        { property: 'og:type', content: 'website' }
    ];
    
    metaTags.forEach(tag => {
        const existing = document.querySelector(`meta[name="${tag.name}"], meta[property="${tag.property}"]`);
        if (!existing) {
            const meta = document.createElement('meta');
            if (tag.name) meta.name = tag.name;
            if (tag.property) meta.property = tag.property;
            meta.content = tag.content;
            document.head.appendChild(meta);
        }
    });
}

// パフォーマンス最適化
function setupPerformanceOptimizations() {
    // 画像遅延読み込み（必要に応じて）
    setupLazyLoading();
    
    // リサイズイベントの最適化
    setupOptimizedResize();
    
    // メモリリーク防止
    setupMemoryLeakPrevention();
}

// 遅延読み込み設定
function setupLazyLoading() {
    // 現在は画像がないため、将来の拡張用
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// 最適化されたリサイズ処理
function setupOptimizedResize() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // リサイズ後の処理
            const ui = getUI();
            if (ui) {
                ui.renderBoard();
            }
        }, 250);
    });
}

// メモリリーク防止
function setupMemoryLeakPrevention() {
    // ページ離脱時のクリーンアップ
    window.addEventListener('beforeunload', () => {
        const game = getGame();
        const ui = getUI();
        
        // イベントリスナーの削除
        if (ui) {
            ui.clearMoveIndicators();
        }
        
        // 不要な参照の削除
        window.game = null;
        window.ui = null;
    });
}

// アクセシビリティ設定
function setupAccessibility() {
    // フォーカス管理
    setupFocusManagement();
    
    // スクリーンリーダー対応
    setupScreenReaderSupport();
    
    // 高コントラストモード対応
    setupHighContrastMode();
}

// フォーカス管理
function setupFocusManagement() {
    // ピースにtabindexを設定
    const board = document.getElementById('game-board');
    if (board) {
        board.setAttribute('tabindex', '0');
        board.setAttribute('role', 'application');
        board.setAttribute('aria-label', '箱入り娘ゲームボード');
    }
    
    // キーボードフォーカスの可視化
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
}

// スクリーンリーダー対応
function setupScreenReaderSupport() {
    // ARIA属性の設定
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.setAttribute('aria-label', '箱入り娘ゲーム');
        gameContainer.setAttribute('role', 'main');
    }
    
    // 動的なARIAライブリージョン
    const ariaLive = document.createElement('div');
    ariaLive.id = 'aria-live-region';
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.setAttribute('aria-atomic', 'true');
    ariaLive.style.position = 'absolute';
    ariaLive.style.left = '-10000px';
    ariaLive.style.width = '1px';
    ariaLive.style.height = '1px';
    ariaLive.style.overflow = 'hidden';
    document.body.appendChild(ariaLive);
    
    // ゲーム状態の音声通知
    const game = getGame();
    const originalMovePiece = game.movePiece;
    game.movePiece = function(...args) {
        const result = originalMovePiece.apply(this, args);
        if (result) {
            const piece = args[0];
            const direction = args[1];
            ariaLive.textContent = `${piece.label}が${direction}に移動しました。移動回数: ${this.moveCount}`;
            
            if (this.gameWon) {
                setTimeout(() => {
                    ariaLive.textContent = `おめでとうございます！娘が脱出しました。${this.moveCount}手でクリアしました。`;
                }, 1000);
            }
        }
        return result;
    };
}

// 高コントラストモード対応
function setupHighContrastMode() {
    // 高コントラストモードの検出
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    function handleHighContrast(e) {
        if (e.matches) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }
    
    mediaQuery.addEventListener('change', handleHighContrast);
    handleHighContrast(mediaQuery);
}

// レスポンシブハンドリング
function setupResponsiveHandling() {
    // 画面サイズ変更に対応
    const mediaQueries = [
        { query: '(max-width: 480px)', className: 'mobile' },
        { query: '(max-width: 768px)', className: 'tablet' },
        { query: '(min-width: 769px)', className: 'desktop' }
    ];
    
    mediaQueries.forEach(({ query, className }) => {
        const mediaQuery = window.matchMedia(query);
        
        function handleMediaChange(e) {
            if (e.matches) {
                document.body.classList.add(className);
            } else {
                document.body.classList.remove(className);
            }
        }
        
        mediaQuery.addEventListener('change', handleMediaChange);
        handleMediaChange(mediaQuery);
    });
}

// エラーハンドリング
window.addEventListener('error', (e) => {
    console.error('箱入り娘ゲームエラー:', e.error);
    
    // ユーザーにエラーを通知（オプション）
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        alert('エラーが発生しました。詳細はコンソールを確認してください。');
    }
});

// 未処理のPromise rejection
window.addEventListener('unhandledrejection', (e) => {
    console.error('未処理のPromise rejection:', e.reason);
});

// PWA対応（将来の拡張用）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // サービスワーカーの登録は後で実装
        // navigator.serviceWorker.register('/sw.js');
    });
}

// 開発用ヘルパー関数
function debugGame() {
    const game = getGame();
    game.debugBoard();
    
    console.log('ゲーム状態:', game.getState());
    console.log('移動可能な方向:', game.selectedPiece ? game.getPossibleMoves(game.selectedPiece) : 'ピースが選択されていません');
}

// グローバル関数として公開（開発時のみ）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugGame = debugGame;
}