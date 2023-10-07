import SceneObject from "@/Assets/SceneObjects/SceneObject.ts";

class CollisionObserver {
  private observers: SceneObject[];
  constructor() {
    this.observers = [];
  }

  addObserver(observer: SceneObject) {
    this.observers.push(observer);
  }

  // notifyCollision(object1: SceneObject, object2: SceneObject) {
  //   this.observers.forEach((observer) => {
  //     //observer.onCollision(object1, object2);
  //   });
  // }
}
export default CollisionObserver;
