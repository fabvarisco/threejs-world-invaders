import { ARButton } from "three/addons/webxr/ARButton.js";
import Web from "./Web/web.ts";
import AR from "./AR/ar.ts";
import "./style.css";
import { Asset } from "@/type";
import { PREFABS } from "@/utils/utils.ts";
import Prefab from "@/Assets/Prefab.ts";
import PlayerShoot from "@/Assets/SceneObjects/PlayerShoot.ts";
import {
  DirectionalLight,
  Group,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";

import TitleScreen from "@/TitleScreen/TitleScreen.ts";
import BaseMonster from "@/Assets/SceneObjects/BaseMonster.ts";
import DraggableObject from "./Assets/SceneObjects/DraggableObject.ts";

class App {
  private readonly camera: PerspectiveCamera;
  private readonly scene: Scene;
  private readonly renderer: WebGLRenderer;
  private activeGame: Web | AR | TitleScreen | undefined;
  private loading: boolean = true;
  private readonly assets: Asset[];
  constructor() {
    
    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    this.assets = [
      {
        asset: "BaseMonster",
        sceneObjectType: BaseMonster,
        hasAnimation: true,
      },
      {
        asset: "PlayerShoot",
        sceneObjectType: PlayerShoot,
      },
      {
        asset: "DraggableObject",
        sceneObjectType: DraggableObject,
      },
    ];
    this.camera = new PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      400,
    );
    this.camera.position.set(0, 0, 20);
    this.camera.lookAt(new Vector3(0, 0, 0));
    this.scene = new Scene();
    
    this.scene.add(new HemisphereLight(0x606060, 0x404040));

    const light = new DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    //this.renderer.shadowMap.enabled = true;

    this.activeGame = new TitleScreen(this.scene);
    this.renderer.setAnimationLoop(this._render.bind(this));

    this._createLoading();

    window.addEventListener("resize", this._resize.bind(this));
    container.appendChild( this.renderer.domElement );

  }

  public Start() {
    this._init().finally(() => {
      this.renderer.xr.enabled = true;
      this._createButtons();
      this._removeLoading();
    });
  }
  private async _init() {
    console.log("Loading...");
    for (const { asset, hasAnimation } of this.assets) {
      const prefab = new Prefab(asset, hasAnimation);
      await prefab.Load();
      PREFABS[asset] = prefab;
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
    this.loading = false;
    const container = document.getElementById("loadingContainer");
    container?.remove();
  }

  private _createButtons(): void {
    const startArButton = ARButton.createButton(this.renderer, {});
    startArButton.addEventListener("click", this._onStartAr.bind(this));
    document.body.appendChild(startArButton);

    // const startWebButton = document.createElement("button");
    // startWebButton.addEventListener("click", this._onStartWeb.bind(this));

    // startWebButton.id = "WebButton";
    // startWebButton.textContent = "START WEB";
    // startWebButton.className = "WebButton";
    // document.body.appendChild(startWebButton);

    // const startVrButton = VRButton.createButton(this.renderer);
    // startVrButton.addEventListener("click", this._onStartVr.bind(this));
    // startVrButton.className = "VRButton";
    // document.body.appendChild(startVrButton);
  }

  private _onStartAr(): void {
    this.activeGame?.Destroy();
    this.activeGame = new AR(this.scene, this.renderer);
  }

  // private _onStartVr() {}

  private _onStartWeb(): void {
    //this.activeGame = new Web(this.scene, this.camera);
  }

  private _resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private _render(timestamp: any, frame: any): void {
    if (!this.loading) {
      if (this.activeGame) {
        this.activeGame.Render(timestamp, frame);
      }
      this.renderer.render(this.scene, this.camera);
    }
  }
}

export default App;
