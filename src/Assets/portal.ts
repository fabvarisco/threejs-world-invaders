import * as THREE from 'three';

class Portal {
    private scene: THREE.Scene;

    constructor(scene:THREE.Scene) {
        this.scene = scene;
        this._addObjects();
    }
    _addObjects() {
        const insideBox = this.createInsideBox()
        insideBox.scale.setScalar(300 * 0.99)

        const outsideBox = this.createOutsideBox()
        outsideBox.scale.setScalar(300)

        this.scene.add(insideBox)
        this.scene.add(outsideBox)
    }
    private createInsideBox() {
        const geo = new THREE.BoxGeometry(1, 1, 1)
        const mat = new THREE.MeshLambertMaterial({
            color: 0xff0000,
        })
        const insideMat = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            side: THREE.BackSide,
        })
        const box = new THREE.Mesh(geo, mat)
        box.scale.setScalar(0.2)
        box.rotation.x = Math.PI / 4
        box.rotation.y = Math.PI / 4
        const innerBox = new THREE.Mesh(geo, insideMat)
        const insideBox = new THREE.Object3D()
        insideBox.add(box)
        insideBox.add(innerBox)
        return insideBox
    }

    private createOutsideBox() {
        const outsidePlaneGeo = new THREE.PlaneGeometry(1, 1, 1, 1)
        const planeOptionArr = [
            {// Right
                rotateY: Math.PI / 2,
                rotateX: 0,
                translate: [0.5, 0, 0]
            },
            {// Left
                rotateY: -Math.PI / 2,
                rotateX: 0,
                translate: [-0.5, 0, 0]
            },
            {// Top
                rotateY: 0,
                rotateX: -Math.PI / 2,
                translate: [0, 0.5, 0]
            },
            {// Bottom
                rotateY: 0,
                rotateX: Math.PI / 2,
                translate: [0, -0.5, 0]
            },
            {// Back
                rotateY: 0,
                rotateX: Math.PI,
                translate: [0, 0, -0.5]
            },
        ]
        const outsideMat = new THREE.MeshBasicMaterial({
            colorWrite: false,
        })
        const outsideBox = new THREE.Object3D()
        planeOptionArr.forEach((opt) => {
            const { rotateY, rotateX, translate } = opt
            const geo = outsidePlaneGeo.clone().rotateY(rotateY).rotateX(rotateX).translate(translate[0],translate[1],translate[2]);
            const mesh = new THREE.Mesh(geo, outsideMat)
            mesh.renderOrder = -1
            outsideBox.add(mesh)
        })
        return outsideBox
    }

}

export default Portal;
