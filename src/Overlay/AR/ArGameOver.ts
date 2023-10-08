class ArGameOver {
  constructor() {
    const container = document.getElementById("container");
    if (container) {
      container.className = "game-over-overlay";
    }
  }
}

export default ArGameOver;
