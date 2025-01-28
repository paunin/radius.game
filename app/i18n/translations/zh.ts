export const zh = {
  meta: {
    title: "0:0",
    description: "有限画布（-10000至10000）"
  },
  game: {
    score: "您的得分",
    noCalculations: "暂无计算",
    startGame: "开始游戏查看回合结果",
    playAgain: "再玩一次",
    playWithBot: "与机器人对战",
    stopAutoPlay: "停止自动播放",
    startAutoPlay: "开始自动播放",
    openNavigator: "打开导航",
    closeNavigator: "关闭导航",
    go: "前往",
    share: "分享得分",
    copy: "复制链接",
    gameOver: "游戏结束",
    finalScore: "最终得分"
  },
  rules: {
    title: "游戏规则",
    basicMechanics: {
      title: "基本机制",
      items: [
        "点击任意单元格显示随机值（-23至20）",
        "每个数字会影响15单位半径内的单元格",
        "得分计算：新值 + (半径内值的总和 × |新值|)"
      ]
    },
    specialCells: {
      title: "特殊单元格",
      items: [
        { key: "X", desc: "游戏结束 - 立即结束，得分变为0" },
        { key: "I", desc: "得分反转 - 将当前得分乘以-1" },
        { key: "Z", desc: "得分清零 - 重置得分为0" },
        { key: "F", desc: "完成游戏 - 以当前得分结束游戏" }
      ]
    },
    navigation: {
      title: "导航",
      items: [
        "拖动网格进行探索",
        "使用 🧭 导航器跳转到特定坐标",
        "有效坐标范围：-10000至10000"
      ]
    },
    strategy: {
      title: "策略提示",
      items: [
        "寻找高正数来乘以半径值",
        "谨慎使用负数 - 它们可能会减少得分",
        "特殊单元格随机出现 - 可能有助于或妨碍策略",
        "规划移动以最大化半径效果"
      ]
    },
    changeLanguage: "更改语言",
    close: "关闭"
  },
  calculation: {
    newValue: "新值",
    radiusSum: "半径总和",
    multiplier: "乘数",
    totalAdded: "总计增加",
    specialEffects: {
      "Game Over!": "游戏结束 - 分数重置为0",
      "Score Inverted!": "分数已反转",
      "Score Zeroed!": "分数已清零",
      "Game Finished!": "游戏完成",
      "Decorative Cell!": "装饰单元格"
    }
  }
}; 