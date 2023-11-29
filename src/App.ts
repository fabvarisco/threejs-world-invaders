import { ARButton } from "three/addons/webxr/ARButton.js";
import "./style.css";
import {
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";

import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { IAsset } from "./type";
import WebWorldPrefab from "./WebWorldPrefab";
import EarthPrefab from "./EarthPrefab";
import InvaderPrefab from "./InvaderPrefab";
import GunPrefab from "./GunPrefab";
import TitleScreen from "./titleScreen";
import VR from "./vr";
import AR from "./ar";
import Web from "./web";
import Prefab from "./Prefab";

class App {
  private readonly camera: PerspectiveCamera;
  private readonly scene: Scene;
  private readonly renderer: WebGLRenderer;
  private readonly assets: IAsset[] = [
    { key: "worldWeb", prefab: WebWorldPrefab },
    { key: "invader", prefab: InvaderPrefab },
    { key: "earth", prefab: EarthPrefab },
    { key: "gun", prefab: GunPrefab },
  ];
  private readonly prefabs: Map<string, Prefab> = new Map();
  private activeGame: Web | AR | VR | TitleScreen | undefined | null = null;
  private startButtonContainer: HTMLElement | null = null;

  constructor() {
    this.camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      400
    );

    this.camera.position.set(0, 0, 20);
    this.camera.lookAt(new Vector3(0, 0, 0));
    this.scene = new Scene();

    this.scene.add(new HemisphereLight(0x606060, 0x404040));

    const light = new DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    this.renderer = new WebGLRenderer({
      canvas: document.getElementById("app") as HTMLCanvasElement,
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this._createLoading();

    window.addEventListener("resize", this._resize.bind(this));
  }

  public async Start(): Promise<void> {
    await this._init();
    this.renderer.xr.enabled = true;
    this._createButtons();
    this._removeLoading();
    this.activeGame = new TitleScreen(this.camera, this.renderer, this.prefabs);
    document.getElementById("ARButton");
  }

  private async _init(): Promise<void> {
    console.log("Loading...");
    for (const { key, prefab } of this.assets) {
      const instance = new prefab();
      await instance.Load();
      this.prefabs.set(key, instance);
    }
    console.log("All prefabs were created!");
  }

  private _createLoading(): void {
    const app = document.getElementById("container");
    const loadingContainer = document.createElement("div");
    loadingContainer.id = "loadingContainer";
    loadingContainer.textContent = "Loading...";
    loadingContainer.style.position = "absolute";
    loadingContainer.style.left = "50%";
    loadingContainer.style.fontSize = "54px";
    app?.appendChild(loadingContainer);
  }

  private _removeLoading(): void {
    const container = document.getElementById("loadingContainer");
    container?.remove();
  }

  private _destroyStartButtonsContainer(): void {
    if (!this.startButtonContainer) return;
    this.startButtonContainer.remove();
  }
  private _createButtons(): void {
    this.startButtonContainer = document.getElementById("start-buttons");

    const startArButton = ARButton.createButton(this.renderer, {});
    startArButton.addEventListener("click", this._onStartAr.bind(this));
    startArButton.className = "button";
    startArButton.removeAttribute("style");

    if (startArButton!.textContent!.toLowerCase().includes("not supported")) {
      startArButton.getAttribute("button");
    }

    const startWebButton = document.createElement("button");
    startWebButton.addEventListener("click", this._onStartWeb.bind(this));
    startWebButton.id = "WebButton";
    startWebButton.removeAttribute("style");
    startWebButton.textContent = "START WEB";
    startWebButton.className = "button";

    const startVrButton = VRButton.createButton(this.renderer);
    startVrButton.addEventListener("click", this._onStartVr.bind(this));
    startVrButton.removeAttribute("style");
    startVrButton.className = "button";

    this.startButtonContainer?.appendChild(startArButton);
    this.startButtonContainer?.appendChild(startWebButton);
    this.startButtonContainer?.appendChild(startVrButton);
  }

  private _onStartAr(): void {
    document.getElementById("title-container")?.remove();
    this.activeGame?.Destroy();
    this.activeGame = null;
    this.activeGame = new AR(this.camera, this.renderer, this.prefabs);
  }

  private _onStartVr(): void {
    document.getElementById("title-container")?.remove();
    this.activeGame?.Destroy();
    this.activeGame = null;
    this.activeGame = new VR(this.camera, this.renderer, this.prefabs);
  }

  private _onStartWeb(): void {
    this._destroyStartButtonsContainer();
    this.activeGame?.Destroy();
    this.activeGame = null;
    this.activeGame = new Web(this.camera, this.renderer, this.prefabs);
  }

  private _resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public AddNewSceneObject(): void {}

  public RemoveSceneObject(): void {}
}

export default App;
