import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ARButton } from "three/addons/webxr/ARButton.js";
import Web from "./Web/web.ts";
import AR from "./AR/ar.ts";
import "./style.css";
import { Asset } from "@/type";
import { PREFABS } from "@/utils/utils.ts";
import Prefab from "@/Assets/Prefab.ts";
import Bee from "@/Assets/SceneObjects/Bee.ts";
import PlayerShoot from "@/Assets/SceneObjects/PlayerShoot.ts";
import {
  Color,
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";

class App {
  private readonly camera: PerspectiveCamera;
  private readonly scene: Scene;
  private readonly renderer: WebGLRenderer;
  private controls: OrbitControls;
  private activeGame: Web | AR | undefined;
  private readonly assets: Asset[];
  constructor() {
    this.assets = [
      {
        asset: "Bee",
        sceneObjectType: Bee,
      },
      {
        asset: "PlayerShoot",
        sceneObjectType: PlayerShoot,
      },
    ];
    this.camera = new PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.25,
      4000,
    );
    this.camera.position.set(-5, 3, 10);
    this.camera.lookAt(0, 2, 0);

    this.scene = new Scene();
    this.scene.background = new Color(0xe0e0e0);

    this.scene.add(new HemisphereLight(0x606060, 0x404040));

    const light = new DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    this.scene.add(light);

    this.renderer = new WebGLRenderer({
      canvas: document.getElementById("app") as HTMLCanvasElement,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 3.5, 0);
    this.controls.update();

    this.activeGame = undefined;
    this._init();
    window.addEventListener("resize", this._resize.bind(this));
  }

  private async _init() {
    console.log("Loading...");
    for (const { asset } of this.assets) {
      const prefab = new Prefab(asset);
      await prefab.Load();
      PREFABS[asset] = prefab;
    }
    console.log("All prefabs were created!");
  }

  public Start() {
    this.renderer.xr.enabled = true;
    this._createButtons();
    this.renderer.setAnimationLoop(this._render.bind(this));
  }

  private _createButtons() {
    const startArButton = ARButton.createButton(this.renderer, {});
    startArButton.addEventListener("click", this._onStartAr.bind(this));
    document.body.appendChild(startArButton);

    const startWebButton = document.createElement("button");
    startWebButton.addEventListener("click", this._onStartWeb.bind(this));

    startWebButton.id = "WebButton";
    startWebButton.textContent = "START WEB";
    startWebButton.className = "WebButton";
    document.body.appendChild(startWebButton);

    // const startVrButton = VRButton.createButton(this.renderer);
    // startVrButton.addEventListener("click", this._onStartVr.bind(this));
    // startVrButton.className = "VRButton";
    // document.body.appendChild(startVrButton);
  }

  private _onStartAr() {
    this.activeGame = new AR(this.scene, this.renderer);
  }

  // private _onStartVr() {}

  private _onStartWeb() {
    //this.activeGame = new Web(this.scene, this.camera);
  }

  private _resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private _render(timestamp: any, frame: any) {
    if (this.activeGame) {
      this.activeGame.Render(timestamp, frame);
      this.renderer.render(this.scene, this.camera);
    }
  }
}

export default App;
