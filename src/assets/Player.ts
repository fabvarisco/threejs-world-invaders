import { GameOverOverlay } from "../utils";

class Player {
  private life = 3;
  private score = 0;
  private wave = 1;
  private endGame: boolean = false;
  constructor() {}

  public TakeDamage() {
    this.life--;
  }

  public Update() {
    if (this.endGame) return;
    if (this.life <= 0) {
      this.endGame = true;
      GameOverOverlay();
    }
  }

  public IsEndGame() {
    return this.endGame;
  }
}

export default Player;
