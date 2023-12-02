import { EventDispatcher } from "three";

export interface IAsset {
  fileName: string;
}


export interface IGameEvents {
  [key: string]: EventDispatcher<any>;
}