import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { AnimationMixer, Group, LoadingManager } from "three";
import { STATES } from "@/utils/utils.ts";

class Prefab {
  private loader: FBXLoader;
  private readonly fileName: string;
  protected object: Group;
  protected model: any;
  protected mixer: any;
  protected manager: any;
  protected animations: any;
  private hasAnimation: boolean;

  constructor(fileName: string, hasAnimation: boolean = false) {
    this.fileName = fileName;
    this.object = new Group();
    this.loader = new FBXLoader();
    this.model = undefined;
    this.mixer = undefined;
    this.manager = undefined;
    this.animations = {
      [STATES.CHASING]: "chasing",
      [STATES.HIT]: "hit",
      [STATES.ATTACKING]: "attacking",
      [STATES.DIE]: "die",
    };
    this.hasAnimation = hasAnimation;
  }

  async Load() {
    await this.loader
      .loadAsync(`/models/${this.fileName}.fbx`)
      .then((object) => {
        object.scale.set(0.01 / 5, 0.01 / 5, 0.01 / 5);
        this.object = object;

        if (this.hasAnimation) {
          this.mixer = new AnimationMixer(this.object);
          this.manager = new LoadingManager();

          const _OnLoad = (animName: string, objAnim: Group): void => {
            debugger;
            const clip = objAnim.animations[0];
            if (objAnim.animations.length === 0) return;
            const action = this.mixer?.clipAction(clip);

            this.animations[animName] = {
              clip: clip,
              action: action,
            };
          };

          const animLoader = new FBXLoader(this.manager);
          animLoader.setPath("/models/");
          animLoader.load(`${this.fileName}_normal.fbx`, (a) => {
            _OnLoad("normal", a);
          });
          animLoader.load(`${this.fileName}_damage.fbx`, (a) => {
            _OnLoad("damage", a);
          });
        }
      })
      .catch(() => {
        throw new Error("Failed to load " + this.fileName);
      });
  }

  changeAnimation() {}
  GetObject() {
    return this.object;
  }
}

export default Prefab;
