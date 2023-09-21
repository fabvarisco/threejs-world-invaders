import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {ARButton} from 'three/addons/webxr/ARButton.js';
import {VRButton} from 'three/addons/webxr/VRButton.js';
import "./style.css"
import Web from "./Web/web.ts";
import {BoxLineGeometry} from 'three/addons/geometries/BoxLineGeometry.js';
import AR from "./AR/ar.ts";
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";

class App {
    private readonly camera: THREE.PerspectiveCamera;
    private readonly scene: THREE.Scene;
    private readonly renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private activeGame: Web | AR | undefined;

    constructor() {
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

        // ground
        const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0xcbcbcb, depthWrite: false } ) );
        mesh.rotation.x = - Math.PI / 2;
        this.scene.add( mesh );

        const grid = new THREE.GridHelper( 200, 40, 0x000000, 0x000000 );
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        this.scene.add( grid );


        // const loader = new FBXLoader();
        // loader.load( 'src/untitled.fbx', ( object ) => {
        //     object.position.x = 0;
        //     object.position.y = 0;
        //     object.position.z = 0;
        //
        //     this.scene.add( object );
        //
        // } );

        const loader = new GLTFLoader();

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
        loader.setDRACOLoader( dracoLoader );

// Load a glTF resource
        loader.load(
            // resource URL
            'dungeon.glb    ',
            // called when the resource is loaded
           ( gltf )=> {

                this.scene.add( gltf.scene );

                gltf.animations; // Array<THREE.AnimationClip>
                gltf.scene; // THREE.Group
                gltf.scenes; // Array<THREE.Group>
                gltf.cameras; // Array<THREE.Camera>
                gltf.asset; // Object

            },
            // called while loading is progressing
            function ( xhr ) {

                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

            },
            // called when loading has errors
            function ( error ) {

                console.log( 'An error happened' );

            }
        );



        this.activeGame = undefined;
        window.addEventListener('resize', this._resize.bind(this));
    }

    public Start() {
        this.renderer.xr.enabled = true;
        this._createButtons();
        console.log("asdasdsda")
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
        this.activeGame = new Web(this.scene);
    }

    private _resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    private _render() {
        if (this.activeGame) {
            //this.activeGame.Render(timestamp, frame);
        }
        this.renderer.render(this.scene, this.camera);
    }

}

export default App;