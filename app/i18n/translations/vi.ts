export const vi = {
  meta: {
    title: "0:0",
    description: "Khung vẽ giới hạn (-10000 đến 10000)"
  },
  game: {
    score: "Điểm của bạn",
    noCalculations: "Chưa có tính toán",
    startGame: "Bắt đầu trò chơi để xem kết quả vòng",
    playAgain: "Chơi lại",
    playWithBot: "Chơi với Bot",
    stopAutoPlay: "Dừng tự động chơi",
    startAutoPlay: "Bắt đầu tự động chơi",
    openNavigator: "Mở điều hướng",
    closeNavigator: "Đóng điều hướng",
    go: "Đi",
    share: "Chia sẻ điểm",
    copy: "Sao chép liên kết",
    gameOver: "Trò chơi kết thúc",
    finalScore: "Điểm cuối cùng"
  },
  rules: {
    title: "Luật chơi",
    basicMechanics: {
      title: "Cơ chế cơ bản",
      items: [
        "Nhấp vào ô để hiện giá trị ngẫu nhiên (-23 đến 20)",
        "Mỗi số ảnh hưởng đến các ô trong bán kính 15 đơn vị",
        "Tính điểm: Giá trị mới + (Tổng giá trị trong bán kính × |Giá trị mới|)"
      ]
    },
    specialCells: {
      title: "Ô đặc biệt",
      items: [
        { key: "X", desc: "Kết thúc - Kết thúc ngay lập tức, điểm về 0" },
        { key: "I", desc: "Đảo điểm - Nhân điểm hiện tại với -1" },
        { key: "Z", desc: "Xóa điểm - Đặt lại điểm về 0" },
        { key: "F", desc: "Hoàn thành - Kết thúc trò chơi với điểm hiện tại" }
      ]
    },
    navigation: {
      title: "Điều hướng",
      items: [
        "Kéo lưới để khám phá",
        "Sử dụng 🧭 điều hướng để nhảy đến tọa độ cụ thể",
        "Phạm vi tọa độ hợp lệ: -10000 đến 10000"
      ]
    },
    strategy: {
      title: "Mẹo chiến thuật",
      items: [
        "Tìm số dương cao để nhân với giá trị bán kính",
        "Cẩn thận với số âm - chúng có thể làm giảm điểm",
        "Ô đặc biệt xuất hiện ngẫu nhiên - có thể giúp hoặc cản trở chiến thuật",
        "Lên kế hoạch di chuyển để tối đa hóa hiệu ứng bán kính"
      ]
    },
    changeLanguage: "Đổi ngôn ngữ",
    close: "Đóng"
  },
  calculation: {
    newValue: "Giá trị mới",
    radiusSum: "Tổng bán kính",
    multiplier: "Hệ số nhân",
    totalAdded: "Tổng cộng thêm",
    specialEffects: {
      "Game Over!": "Trò chơi kết thúc - Điểm về 0",
      "Score Inverted!": "Điểm đã đảo ngược",
      "Score Zeroed!": "Điểm đã về 0",
      "Game Finished!": "Trò chơi hoàn thành",
      "Decorative Cell!": "Ô trang trí"
    }
  }
}; 