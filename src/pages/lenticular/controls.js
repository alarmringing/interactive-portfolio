import * as THREE from 'three'
import React, { useEffect, useState } from "react"
import { useFrame, useThree } from 'react-three-fiber'

import useStore from './store.js'

const Controls = () => {
  const MIN_POLAR_ANGLE = Math.PI*2.5/8
  const MAX_POLAR_ANGLE = Math.PI*5.5/8
  const MIN_AZIMUTH_ANGLE = -Math.PI / 4
  const MAX_AZIMUTH_ANGLE = Math.PI / 4

  const dampingFactor = 0.05

  const radius = 90 // Around 70 for projectionCamera
  const zoom = 23 // Around 25 for orthographicCamera
  const fov = 380

  const target = new THREE.Vector3(0, 0, 0)
  const [spherical,] = useState(new THREE.Spherical());
  const [sphericalDelta,] = useState(new THREE.Spherical());

  const lenticularTweenProgress = useStore(state => state.lenticularTweenProgress)
  const [mousePos, setMousePos] = useState({x:0, y:0})
  const [lastIntroMousePos, setLastIntroMousePos] = useState({x:0, y:0})

  const {
    camera,
    gl: { domElement }
  } = useThree()

  const rightAngle = (interp) => {
    return MAX_AZIMUTH_ANGLE - (MAX_AZIMUTH_ANGLE - MIN_AZIMUTH_ANGLE) * interp
  }

  const downAngle = (interp) => {
    return MIN_POLAR_ANGLE + (MAX_POLAR_ANGLE - MIN_POLAR_ANGLE) * interp
  }

  // Constructor
  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove)
    spherical.set(radius, rightAngle(0.5), downAngle(0.5))

    // Camera setting
    camera.zoom = zoom
    camera.fov = fov

  }, [])

  const onMouseMove = (e) => {
    let mouseX = THREE.MathUtils.clamp(e.screenX/ window.innerWidth * 1.2 - 0.1, 0, 1) 
    let mouseY = THREE.MathUtils.clamp(e.screenY / window.innerHeight * 1.2 - 0.1, 0, 1) 
    setMousePos({x:mouseX, y:mouseY}) 
  }

  const setCameraSpherical = () => {
    let rightAngleAmt = 0
    let downAngleAmt = 0

    // Only update last mouse position when we aren't force updating controls.
    if (lenticularTweenProgress === 0) {
      setLastIntroMousePos({x:mousePos.x, y:mousePos.y})
      rightAngleAmt = mousePos.x 
      downAngleAmt = mousePos.y
    }
    else if (lenticularTweenProgress > 0) {
      const shouldForceRotateToRightSide = lastIntroMousePos.x > 0.5
      rightAngleAmt = THREE.MathUtils.lerp(lastIntroMousePos.x, shouldForceRotateToRightSide, lenticularTweenProgress)
      downAngleAmt = THREE.MathUtils.lerp(lastIntroMousePos.y, 0.5, lenticularTweenProgress)
    }
    spherical.theta = rightAngle(rightAngleAmt)
    spherical.phi = downAngle(downAngleAmt)
    spherical.makeSafe();
  }

  useFrame((state) => {
    setCameraSpherical()

    // Setup
    let offset = new THREE.Vector3();

    // so camera.up is the orbit axis
    let quat = new THREE.Quaternion().setFromUnitVectors( camera.up, new THREE.Vector3( 0, 1, 0 ) );
    let quatInverse = quat.clone().invert();

    let position = camera.position;
    offset.copy(position).sub(target);

    // rotate offset to "y-axis-is-up" space
    offset.applyQuaternion( quat );

    // Set
    offset.setFromSpherical(spherical);
    offset.applyQuaternion(quatInverse); // rotate offset back to "camera-up-vector-is-up" space

    let destination = new THREE.Vector3()
    destination.copy(target).add(offset);

    camera.position.lerp(destination, 0.125)
    camera.lookAt(target);
    camera.zoom = zoom
    camera.updateProjectionMatrix()
  })

  // Default orthographic camera settings: near: 0.1, far: 1000, position.z: 5

  return (
    <group />
  )
}

export default Controls