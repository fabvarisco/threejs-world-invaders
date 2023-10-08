class ArOverlay {
  constructor() {
    const container = document.getElementById("container");
    if (container) {
      container.className = "game-over-overlay";
    }
  }

  Render() {}
}

export default ArOverlay;
