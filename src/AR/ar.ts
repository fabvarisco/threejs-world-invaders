import GameObject from "@/Assets/GameObject";
import {
  Camera,
  Scene,
  WebGLRenderer,
} from "three";


class AR {
  private readonly camera: Camera;
  private readonly renderer: WebGLRenderer;
  private gameObjects: GameObject  = []
  private scene: Scene = new Scene();
  private spawnTime: number = 1000;
  private timer: number = 1000;
  private lastFrameTimestamp: number = 0;

  constructor(camera: Camera, renderer: WebGLRenderer) {
    this.camera = camera;
    this.renderer = renderer;


    this._buildControllers();




    this._animate();
  }

  private _buildControllers():void{

  }
  

  private spawnInvader(){

  } 

  private _animate(){



    this.renderer.render(this.scene, this.camera);
  }

 public Destroy(){
    
  }
}

export default AR;
