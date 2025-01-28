export const ko = {
  meta: {
    title: "0:0",
    description: "제한된 캔버스 (-10000에서 10000)"
  },
  game: {
    score: "점수",
    finalScore: "최종 점수",
    noCalculations: "계산 내역 없음",
    startGame: "게임을 시작하여 라운드 결과 보기",
    playAgain: "다시 하기",
    playWithBot: "봇과 플레이",
    stopAutoPlay: "자동 플레이 중지",
    startAutoPlay: "자동 플레이 시작",
    openNavigator: "내비게이터 열기",
    closeNavigator: "내비게이터 닫기",
    go: "이동",
    share: "점수 공유하기",
    copy: "링크 복사",
    gameOver: "게임 오버"
  },
  rules: {
    title: "게임 규칙",
    changeLanguage: "언어 변경",
    close: "닫기",
    basicMechanics: {
      title: "기본 메커닉스",
      items: [
        "셀을 클릭하여 무작위 값(-23에서 20) 표시",
        "각 숫자는 15단위 반경 내의 셀에 영향을 줍니다",
        "점수 계산: 새 값 + (반경 내 값의 합 × |새 값|)"
      ]
    },
    specialCells: {
      title: "특수 셀",
      items: [
        { key: "X", desc: "게임 오버 - 즉시 종료, 점수 0" },
        { key: "I", desc: "점수 반전 - 현재 점수에 -1 곱하기" },
        { key: "Z", desc: "점수 초기화 - 점수를 0으로 리셋" },
        { key: "F", desc: "게임 종료 - 현재 점수로 게임 종료" }
      ]
    },
    navigation: {
      title: "내비게이션",
      items: [
        "그리드를 드래그하여 탐색",
        "🧭 내비게이터로 특정 좌표로 이동",
        "유효 좌표 범위: -10000에서 10000"
      ]
    },
    strategy: {
      title: "전략 팁",
      items: [
        "반경 값을 곱하기 위해 높은 양수 찾기",
        "음수 주의 - 점수가 감소할 수 있습니다",
        "특수 셀은 무작위로 등장 - 전략에 도움 또는 방해될 수 있음",
        "반경 효과를 최대화하도록 이동 계획"
      ]
    }
  },
  calculation: {
    newValue: "새 값",
    radiusSum: "반경 합계",
    multiplier: "승수",
    totalAdded: "총 추가",
    specialEffects: {
      "Game Over!": "게임 오버 - 점수가 0으로 초기화",
      "Score Inverted!": "점수 반전",
      "Score Zeroed!": "점수가 0으로 초기화",
      "Game Finished!": "게임 종료",
      "Decorative Cell!": "장식 셀"
    }
  }
}; 