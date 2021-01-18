import * as THREE from 'three'
import React, { useEffect, useState } from "react"
import { useFrame, useThree } from 'react-three-fiber'

const Controls = () => {
  const MIN_POLAR_ANGLE = Math.PI*2.5/8
  const MAX_POLAR_ANGLE = Math.PI*5.5/8
  const MIN_AZIMUTH_ANGLE = -Math.PI / 4
  const MAX_AZIMUTH_ANGLE = Math.PI / 4

  const dampingFactor = 0.05

  const radius = 70 // Around 70 for projectionCamera
  const zoom = 25 // Around 25 for orthographicCamera
  const fov = 380

  const target = new THREE.Vector3(0, 0, 0)
  const [spherical,] = useState(new THREE.Spherical());
  const [sphericalDelta,] = useState(new THREE.Spherical());

  const {
    camera,
    gl: { domElement }
  } = useThree()

  const onMouseMove = (e) => {
    let mouseX = e.pageX / window.innerWidth
    let mouseY = e.pageY / window.innerHeight 

    let rightAngle = MAX_AZIMUTH_ANGLE - (MAX_AZIMUTH_ANGLE - MIN_AZIMUTH_ANGLE) * mouseX
    let downAngle = MIN_POLAR_ANGLE + (MAX_POLAR_ANGLE - MIN_POLAR_ANGLE) * mouseY

    spherical.theta = rightAngle
    spherical.phi = downAngle
    spherical.makeSafe();
  }

  // Constructor
  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove)

    let initialPhi = MIN_POLAR_ANGLE + (MAX_POLAR_ANGLE - MIN_POLAR_ANGLE) * 0.5
    let initialTheta = MIN_AZIMUTH_ANGLE + (MAX_AZIMUTH_ANGLE - MIN_AZIMUTH_ANGLE) * 0.5
    spherical.set(radius, initialPhi, initialTheta)

    // Camera setting
    camera.zoom = zoom
    camera.fov = fov

  }, [])

  useFrame((state) => {

    /*
    let newCameraPos = new THREE.Vector3()

    newCameraPos.setFromSpherical(spherical);
    camera.position.copy(newCameraPos)
    camera.updateProjectionMatrix()

    */

    // Setup
    let offset = new THREE.Vector3();

    // so camera.up is the orbit axis
    let quat = new THREE.Quaternion().setFromUnitVectors( camera.up, new THREE.Vector3( 0, 1, 0 ) );
    let quatInverse = quat.clone().invert();

    let position = camera.position;
    offset.copy(position).sub(target);

    // rotate offset to "y-axis-is-up" space
    offset.applyQuaternion( quat );

    // angle from z-axis around y-axis
    //spherical.setFromVector3(offset);

    // Rotate
    //spherical.theta += sphericalDelta.theta * dampingFactor;
    //spherical.phi += sphericalDelta.phi * dampingFactor;
    
    // Zoom
    //spherical.radius = scale;

    // Set
    offset.setFromSpherical(spherical);
    offset.applyQuaternion(quatInverse); // rotate offset back to "camera-up-vector-is-up" space
    position.copy(target).add(offset);
    camera.lookAt(target);
    camera.zoom = zoom
    camera.updateProjectionMatrix()

    // Damping
    //sphericalDelta.theta *= ( 1 - dampingFactor );
    //sphericalDelta.phi *= ( 1 - dampingFactor );

    /*

    // update condition is:
    // min(camera displacement, camera rotation in radians)^2 > EPS
    // using small-angle approximation cos(x/2) = 1 - x^2 / 8

    if (lastPosition.distanceToSquared( scope.object.position ) > EPS ||
      8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

      scope.dispatchEvent( changeEvent );

      lastPosition.copy( scope.object.position );
      lastQuaternion.copy( scope.object.quaternion );
      zoomChanged = false;

      return true;

    }
    */
  })

  // Default orthographic camera settings: near: 0.1, far: 1000, position.z: 5

  return (
    <pointLight intensity={0.25} position={[5, 0, 5]} />
  )
}

export default Controls