import {
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  Scene,
} from "three";

export function CreateStars(scene: Scene) {
  const starsGeometry = new BufferGeometry();
  const starsMaterial = new PointsMaterial({
    color: 0xffffff,
    size: 2,
  });   

  const starsVertices = [];
  for (let i = 0; i < 7000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starsVertices.push(x, y, z);
  }

  starsGeometry.setAttribute(
    "position",
    new Float32BufferAttribute(starsVertices, 3)
  );
  const stars = new Points(starsGeometry, starsMaterial);
  scene.add(stars);
}
