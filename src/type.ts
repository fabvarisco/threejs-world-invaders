import Prefab from "./assets/prefabs/Prefab";

export interface IAsset {
  key: string;
  prefab: typeof Prefab;
}
