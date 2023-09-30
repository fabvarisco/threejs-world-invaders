import Prefab from "@/Assets/Prefab.ts";
import { Vector3 } from "three";
export const PREFABS: { [k: string]: Prefab } = {};
export function instanceNewPrefab(prefabName: string, position?: Vector3) {
  PREFABS[prefabName].AddToScene(position);
}
