import { Object3D } from "three";

export interface IAsset {
  fileName: string;
}

export type CameraType = "FPS" | "TPS";

export type GlobalAssetsType = {
  [key: string]: Map<string, Object3D>;
};
