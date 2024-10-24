import { Camera, Group, Mesh, Object3D, Scene, Vector3 } from "three";
import { GameOverOverlay } from "../utils/utils";
import { CameraType } from "../type";
import Gun from "./Gun";
import { Capsule } from "three/examples/jsm/math/Capsule.js";
import WorldWebGameObject from "./gameObjects/WorldWebGameObject";

class WebPlayer {
  private life = 3;
  private endGame: boolean = false;
  private _model: Group | Mesh | Object3D;
  private _gun: Gun;
  private _scene: Scene;
  private _camera: Camera;
  private _cameraType: CameraType;
  private _playerOnFloor: boolean = false;
  private _velocity: Vector3 = new Vector3();
  private _direction: Vector3 = new Vector3();
  private _collider: Capsule = new Capsule(
    new Vector3(0, 0.35, 0),
    new Vector3(0, 1, 0),
    0.35
  );
  private _webWorld: WorldWebGameObject;
  private _mouseTime: number;
  private readonly _gravity = 30;
  private readonly _keyStates: { [key: string]: boolean };

  constructor(scene: Scene, camera: Camera, webWorld: WorldWebGameObject) {
    this._model = new Group();
    this._scene = scene;
    this._camera = camera;
    this._cameraType = "FPS";
    this._webWorld = webWorld;

    this._gun = new Gun(this._scene, this._camera);
    this._keyStates = {};
    this._mouseTime = 0;

    document.addEventListener("keydown", (event) => {
      this._keyStates[event.code] = true;
    });
    document.addEventListener("keyup", (event) => {
      this._keyStates[event.code] = false;
    });
    document.addEventListener("mousedown", () => {
      if (this.IsEndGame()) return;
      document.body.requestPointerLock();
      this._mouseTime = performance.now();
    });
    document.addEventListener("mouseup", () => {
      if (document.pointerLockElement !== null) this._gun.Shoot(this._mouseTime);
    });
    document.body.addEventListener("mousemove", (event) => {
      if (document.pointerLockElement === document.body) {
        this._camera.rotation.y -= event.movementX / 1200;
        this._camera.rotation.x -= event.movementY / 1200;
      }
    });

  }

  private _playerControlls(_deltaTime: number): void {

    const _speedDelta = _deltaTime * (this._playerOnFloor ? 25 : 8);
    if (this._keyStates["KeyW"]) {
      this._velocity.add(this._getForwardVector().multiplyScalar(_speedDelta));
    }
    if (this._keyStates["KeyS"]) {
      this._velocity.add(this._getForwardVector().multiplyScalar(-_speedDelta));
    }
    if (this._keyStates["KeyA"]) {
      this._velocity.add(this._getSideVector().multiplyScalar(-_speedDelta));
    }
    if (this._keyStates["KeyD"]) {
      this._velocity.add(this._getSideVector().multiplyScalar(_speedDelta));
    }
    if (this._playerOnFloor) {
      if (this._keyStates["Space"]) {
        this._velocity.y = 15;
      }
    }
    
  }

  private _getSideVector(): Vector3 {
    this._camera.getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize();
    this._direction.cross(this._camera.up);
    return this._direction;
  }
  
  private _getForwardVector(): Vector3 {
    this._camera.getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize();
    return this._direction;
  }

  public TakeDamage() {
    this.life--;
  }

  public Update(_deltaTime: number) {
    if (this.endGame) return;
    if (this.life <= 0) {
      this.endGame = true;
      GameOverOverlay();
    }
    
    this._playerControlls(_deltaTime);

    let damping = Math.exp(-4 * _deltaTime) - 1;
    if (!this._playerOnFloor) {
      this._velocity.y -= this._gravity * _deltaTime;
      damping *= 0.1;
    }
    this._velocity.addScaledVector(this._velocity, damping);
    const deltaPosition = this._velocity
      .clone()
      .multiplyScalar(_deltaTime);
    this._collider.translate(deltaPosition);
    this._playerCollisions();
    this._camera.position.copy(this._collider.end);


    this._teleportPlayerIfOob();
    
    this._gun.UpdatePosition();
  }

  private _playerCollisions(): void {
    const result = this._webWorld
      .GetOctree()
      .capsuleIntersect(this._collider);

    this._playerOnFloor = false;
    if (result) {
      this._playerOnFloor = result.normal.y > 0;
      if (!this._playerOnFloor) {
        this._velocity.addScaledVector(
          result.normal,
          -result.normal.dot(this._velocity)
        );
      }
      this._collider.translate(result.normal.multiplyScalar(result.depth));
    }
  }

  private _teleportPlayerIfOob(): void {
    if (this._camera.position.y <= -25) {
      this.TakeDamage();
    }
  }


  public IsEndGame() {
    return this.endGame;
  }

  public ChangeCameraType(_type: CameraType) {
    this._cameraType = _type;
  }
}

export default WebPlayer;
