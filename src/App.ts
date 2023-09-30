import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {ARButton} from 'three/addons/webxr/ARButton.js';
import {VRButton} from 'three/addons/webxr/VRButton.js';
import Web from "./Web/web.ts";
import AR from "./AR/ar.ts";
import "./style.css"
import Prefab from "@/Assets/Prefab.ts";
import Tower from "@/Assets/Tower.ts";
import {Asset} from "@/type";

class App {
    private readonly camera: THREE.PerspectiveCamera;
    private readonly scene: THREE.Scene;
    private readonly renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private activeGame: Web | AR | undefined;
    private readonly prefabs:  {[k: string]: Prefab};
    private readonly assets: Asset[]
    constructor() {
        this.prefabs = {};
        this.assets = [{
            asset: "Tower",
            position: new THREE.Vector3(80, 0, 96),
            prefabType: Tower
        }]
        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.25, 4000  );
        this.camera.position.set( - 5, 3, 10 );
        this.camera.lookAt( 0, 2, 0 );

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xe0e0e0 );

        this.scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1).normalize();
        this.scene.add(light);

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('app') as HTMLCanvasElement,
            antialias: true, alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);


        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 3.5, 0);
        this.controls.update();


        this.activeGame = undefined;
        this._init().then(r => r);
        window.addEventListener('resize', this._resize.bind(this));
    }

    private async _init(){
        console.log("Loading...");
        for (const {asset, position, prefabType} of this.assets) {
            const prefab = new prefabType(asset, position);
            await prefab.Load();
            this.prefabs[asset] = prefab;
        }
        console.log("All prefabs were created!");
    }


    public Start() {
        this.renderer.xr.enabled = true;
        this._createButtons();
        this.renderer.setAnimationLoop(this._render.bind(this));
    }

    private _createButtons() {
        const startArButton = ARButton.createButton(this.renderer, {requiredFeatures: ['hit-test']});
        startArButton.addEventListener('click', this._onStartAr.bind(this));
        document.body.appendChild(startArButton);

        const startWebButton = document.createElement("button");
        startWebButton.addEventListener('click', this._onStartWeb.bind(this));

        startWebButton.id = "WebButton";
        startWebButton.textContent = "START WEB";
        startWebButton.className = "WebButton";
        document.body.appendChild(startWebButton);

        const startVrButton = VRButton.createButton(this.renderer);
        startVrButton.addEventListener('click', this._onStartVr.bind(this));
        startVrButton.className = "VRButton";
        document.body.appendChild(startVrButton);
    }


    private _onStartAr() {
        this.activeGame = new AR(this.scene, this.renderer);

    }

    private _onStartVr() {

    }

    private _onStartWeb() {
        this.activeGame = new Web(this.scene, this.camera, this.prefabs);
    }

    private _resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private _render(timestamp:any, frame:any) {
        if (this.activeGame) {
            this.activeGame.Render(timestamp, frame);
        }
        this.renderer.render(this.scene, this.camera);
    }

}

export default App;