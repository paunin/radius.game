export const ja = {
  meta: {
    title: "0:0",
    description: "制限付きキャンバス（-10000から10000）"
  },
  game: {
    score: "スコア",
    noCalculations: "計算履歴なし",
    startGame: "ゲームを開始して結果を表示",
    playAgain: "もう一度プレイ",
    playWithBot: "ボットとプレイ",
    gameOver: "ゲームオーバー",
    finalScore: "最終スコア",
    stopAutoPlay: "オートプレイを停止",
    startAutoPlay: "オートプレイを開始",
    openNavigator: "ナビゲーターを開く",
    closeNavigator: "ナビゲーターを閉じる",
    go: "移動",
    share: "スコアを共有",
    copy: "リンクをコピー"
  },
  rules: {
    title: "ゲームルール",
    basicMechanics: {
      title: "基本メカニクス",
      items: [
        "セルをクリックしてランダムな値（-23から20）を表示",
        "各数値は15単位の半径内のセルに影響を与えます",
        "スコア計算：新しい値 + (半径内の値の合計 × |新しい値|)"
      ]
    },
    specialCells: {
      title: "特殊セル",
      items: [
        { key: "X", desc: "ゲームオーバー - 即座にゲーム終了、スコアは0になります" },
        { key: "I", desc: "スコア反転 - 現在のスコアに-1を掛けます" },
        { key: "Z", desc: "スコアリセット - スコアを0にリセット" },
        { key: "F", desc: "ゲーム終了 - 現在のスコアを保持してゲーム終了" }
      ]
    },
    navigation: {
      title: "ナビゲーション",
      items: [
        "グリッドをドラッグして探索",
        "🧭 ナビゲーターを使用して特定の座標にジャンプ",
        "有効な座標範囲：-10000から10000"
      ]
    },
    strategy: {
      title: "戦略のヒント",
      items: [
        "半径値を掛け合わせるために高い正の数を探す",
        "負の数は慎重に - スコアが減少する可能性があります",
        "特殊セルはランダムに出現 - 戦略の助けにも妨げにもなります",
        "半径効果を最大限に活用するように動きを計画"
      ]
    },
    changeLanguage: "言語を変更",
    close: "閉じる"
  },
  calculation: {
    newValue: "新しい値",
    radiusSum: "半径内の合計",
    multiplier: "乗数",
    totalAdded: "追加された合計",
    specialEffects: {
      "Game Over!": "ゲームオーバー - スコアが0にリセット",
      "Score Inverted!": "スコア反転",
      "Score Zeroed!": "スコアが0にリセット",
      "Game Finished!": "ゲーム終了",
      "Decorative Cell!": "装飾セル"
    }
  }
}; 