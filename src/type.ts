import Prefab from "src/Assets/prefabs/Prefab";

export interface IAsset {
  key: string;
  prefab: typeof Prefab;
}
