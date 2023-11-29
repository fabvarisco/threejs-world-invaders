import Prefab from "@prefabs/Prefab";

export interface IAsset {
  key: string;
  prefab: typeof Prefab;
}
