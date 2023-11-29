import Prefab from "./Prefab";

export interface IAsset {
  key: string;
  prefab: typeof Prefab;
}
