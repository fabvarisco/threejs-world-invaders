import { EventDispatcher } from "three";

export interface IAsset {
  fileName: string;
}

export type CameraType = "FPS" | "TPS"; 