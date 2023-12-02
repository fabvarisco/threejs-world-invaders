import { ARButton } from "three/addons/webxr/ARButton.js";
import "./style.css";
import {
  DirectionalLight,
  EventDispatcher,
  HemisphereLight,
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";

import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { IAsset, IGameEvents } from "./type";
import TitleScreen from "./game/TitleScreen";
import AR from "./game/AR";
import VR from "./game/VR";
import Web from "./game/Web";
import { Loader } from "./utils";

class App {
  private readonly camera: PerspectiveCamera;
  private readonly scene: Scene;
  private readonly renderer: WebGLRenderer;
  private readonly assetList: IAsset[] = [
    { fileName: "webWorld.glb" },
    { fileName: "invader.glb" },
    { fileName: "gun.glb" },
    { fileName: "earth.fbx" },
  ];
  private readonly assets: Map<string, Object3D> = new Map();
  private activeGame: Web | AR | VR | TitleScreen | undefined | null = null;
  private startButtonContainer: HTMLElement | null = null;
  private customEvents: IGameEvents = {
    shootArray: new EventDispatcher()
  };
  constructor() {
    //Camera
    this.camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      400
    );
    this.camera.position.set(0, 0, 20);
    this.camera.lookAt(new Vector3(0, 0, 0));

    //Scene
    this.scene = new Scene();
    this.scene.add(new HemisphereLight(0x606060, 0x404040));

    //light
    const light = new DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    //renderer
    this.renderer = new WebGLRenderer({
      canvas: document.getElementById("app") as HTMLCanvasElement,
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    //game
    this._createLoading();
    this.activeGame = null;

    // resize
    window.addEventListener("resize", this._resize.bind(this));
  }

  public async Start(): Promise<void> {
    await this._init();
    this.renderer.xr.enabled = true;
    this._createButtons();
    this._removeLoading();
    this.activeGame = new TitleScreen(this.camera, this.renderer, this.assets);
    document.getElementById("ARButton");
  }

  private async _init(): Promise<void> {
    console.log("Loading...");
    for (const { fileName } of this.assetList) {
      const instance = await Loader(fileName);
      const key = fileName.split(".")[0];
      this.assets.set(key, instance);
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
    this.activeGame = null;
    this.activeGame = new AR(this.camera, this.renderer, this.assets);
  }

  private _onStartVr(): void {
    document.getElementById("title-container")?.remove();
    this.activeGame = null;
    this.activeGame = new VR(this.camera, this.renderer, this.assets);
  }

  private _onStartWeb(): void {
    document.getElementById("title-container")?.remove();
    this._destroyStartButtonsContainer();
    this.activeGame = null;
    this.activeGame = new Web(this.camera, this.renderer, this.assets);
  }

  private _resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

}

export default App;
