import * as THREE from "three";
import React, { useEffect, useState } from "react";
import { useFrame, useThree } from "react-three-fiber";

import { constants, useStore } from "./Store.js";

const Controls = () => {
  const MIN_POLAR_ANGLE = (Math.PI * 2.5) / 8;
  const MAX_POLAR_ANGLE = (Math.PI * 5.5) / 8;
  const MIN_AZIMUTH_ANGLE = -Math.PI / 4;
  const MAX_AZIMUTH_ANGLE = Math.PI / 4;

  const dampingFactor = 0.05;

  const radius = 90; // Around 70 for projectionCamera
  const fov = 380;
  const totalSticksWidth =
    constants.stickConstants.stickWidth * Math.sqrt(2) * constants.stickConstants.numSticks;

  const target = new THREE.Vector3(0, 0, 0);
  const [spherical] = useState(new THREE.Spherical());
  const [sphericalDelta] = useState(new THREE.Spherical());

  // Global var
  const getIntroProgress = useStore((state) => state.getIntroProgress);
  const isLenticularTweenScrollingDown = useStore((state) => state.isLenticularTweenScrollingDown);

  // Local var
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lastIntroMousePos, setLastIntroMousePos] = useState({ x: 0, y: 0 });

  const {
    camera,
    gl: { domElement },
  } = useThree();

  const rightAngle = (interp) => {
    return MAX_AZIMUTH_ANGLE - (MAX_AZIMUTH_ANGLE - MIN_AZIMUTH_ANGLE) * interp;
  };

  const downAngle = (interp) => {
    return MIN_POLAR_ANGLE + (MAX_POLAR_ANGLE - MIN_POLAR_ANGLE) * interp;
  };

  // Constructor
  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    spherical.set(radius, rightAngle(0.5), downAngle(0.5));
  }, []);

  const onMouseMove = (e) => {
    let mouseX = THREE.MathUtils.clamp(e.clientX / window.innerWidth, 0, 1);
    let mouseY = THREE.MathUtils.clamp(e.clientY / window.innerHeight, 0, 1);
    setMousePos({ x: mouseX, y: mouseY });
  };

  const setCameraSpherical = () => {
    let rightAngleAmt = 0;
    let downAngleAmt = 0;

    // We are in the intro section.
    if (getIntroProgress() === 0) {
      // Set the current rotation entirely based on the current mouse position.
      setLastIntroMousePos({ x: mousePos.x, y: mousePos.y });
      spherical.theta = rightAngle(mousePos.x);
      spherical.phi = downAngle(mousePos.y);
    }
    // When lenticularTween is moving, angle is interpolated bewteen last mouse position and the end point.
    else {
      // Scrolling down
      if (isLenticularTweenScrollingDown) {
        // Force flip to end of either side.
        const shouldForceRotateToRightSide = lastIntroMousePos.x > 0.5;
        rightAngleAmt = rightAngle(
          THREE.MathUtils.lerp(
            lastIntroMousePos.x,
            shouldForceRotateToRightSide,
            getIntroProgress()
          )
        );
      }
      // Scrolling up
      else {
        // Update the current mouse position to interpolate with when scrolling up, to reduce surprise jitter when fully back in intro section.
        setLastIntroMousePos({ x: mousePos.x, y: mousePos.y });
        rightAngleAmt = THREE.MathUtils.lerp(
          rightAngle(lastIntroMousePos.x),
          spherical.theta,
          getIntroProgress()
        );
      }
      downAngleAmt = downAngle(THREE.MathUtils.lerp(lastIntroMousePos.y, 0.5, getIntroProgress()));
      spherical.theta = rightAngleAmt;
      spherical.phi = downAngleAmt;
    }

    spherical.makeSafe();
  };

  const setCameraBounds = () => {
    camera.left = (-totalSticksWidth / 2) * 0.8;
    camera.right = (totalSticksWidth / 2) * 0.8;
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera.bottom = camera.left / aspectRatio;
    camera.top = camera.right / aspectRatio;
  };

  useFrame((state) => {
    setCameraSpherical();

    // Setup
    let offset = new THREE.Vector3();

    // so camera.up is the orbit axis
    let quat = new THREE.Quaternion().setFromUnitVectors(camera.up, new THREE.Vector3(0, 1, 0));
    let quatInverse = quat.clone().invert();

    let position = camera.position;
    offset.copy(position).sub(target);

    // rotate offset to "y-axis-is-up" space
    offset.applyQuaternion(quat);

    // Set
    offset.setFromSpherical(spherical);
    offset.applyQuaternion(quatInverse); // rotate offset back to "camera-up-vector-is-up" space

    let destination = new THREE.Vector3();
    destination.copy(target).add(offset);

    camera.position.lerp(destination, 0.125);
    setCameraBounds();
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  });

  // Default orthographic camera settings: near: 0.1, far: 1000, position.z: 5

  return <group />;
};

export default Controls;
