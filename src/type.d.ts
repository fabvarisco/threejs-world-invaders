import * as THREE from 'three';
import Prefab from "@/Assets/Prefab.ts";

type Asset = {
    asset: string;
    position: THREE.Vector3;
    prefabType:typeof Prefab;
}