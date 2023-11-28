import Prefab from "@Prefabs/Prefab";

export interface IAsset {
  key: string;
  prefab: typeof Prefab;
}
