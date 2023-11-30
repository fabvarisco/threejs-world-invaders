import { Vector3 } from "three";
class Player {
  private life = 10;
  private score = 0;
  private wave = 1;
  private playerVelocity: Vector3;
  constructor() {}

  WebPlayer() {
    this._webPlayerControlls();
  }

  private _webPlayerControlls() {}
}

export default Player;
