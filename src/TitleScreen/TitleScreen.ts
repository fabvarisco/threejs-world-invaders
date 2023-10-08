import Text from "@/Assets/Text.ts";
import { Scene } from "three";

class TitleScreen {
  private titleText: Text;
  constructor(scene: Scene) {
    this.titleText = new Text("./fonts/Pixel.json", "World Invaders", scene);
  }

  //@ts-ignore
  Render(timestamp: any, frame: any) {}

  Destroy() {
    this.titleText.Destroy();
  }
}

export default TitleScreen;
