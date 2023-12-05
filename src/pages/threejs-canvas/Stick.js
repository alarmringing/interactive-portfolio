import * as THREE from "three";
import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "react-three-fiber";

import { constants, useStore } from "./Store.js";

const stickConstants = constants.stickConstants;
const EPSILON = 0.005;

const Stick = ({ index, numSticks, textures, destRotation, stickSelectedCallback }) => {
  const getIntroProgress = useStore((state) => state.getIntroProgress);
  const lastClickedStickIndex = useStore((state) => state.lastClickedStickIndex);
  const [isHovered, setIsHovered] = useState(false);
  const stickRef = useRef();
  const light = useRef();
  const width = stickConstants.stickWidth;
  const height = stickConstants.stickHeight;

  const totalSticksWidth = width * Math.sqrt(2) * numSticks;
  const zOffsetModifier = 2;

  const { clock } = useThree();

  // Constructor
  useEffect(() => {
    let positionX = -(totalSticksWidth / 2) + index * width * Math.sqrt(2);
    stickRef.current.position.set(positionX, 0, 0);
    stickRef.current.geometry.setAttribute(
      "side",
      new THREE.Float32BufferAttribute(
        [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5],
        1
      )
    );

    stickRef.current.rotation.set(...destRotation);
  }, []);

  // TODO: Add some hover animation here.
  const stickHoveredIn = () => {
    setIsHovered(true);
  };
  const stickHoveredOut = () => {
    setIsHovered(false);
  };

  useFrame(() => {
    // Update stick rotation
    if (isHovered && getIntroProgress() == 0) {
      // If hovered and in intro state, apply some effect to the hovered stick.
      stickRef.current.rotation.y += 0.05;
    } else {
      let destQuaternion = new THREE.Quaternion();
      destQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), destRotation[1]);
      if (Math.abs(stickRef.current.rotation.toVector3().y - destRotation[1]) > EPSILON) {
        // Lerp rotation
        stickRef.current.quaternion.slerp(destQuaternion, 0.17);

        // A z-direction 'pop' effect
        // const distToGoal = destRotation[1] - stickRef.current.rotation.y;
        // if (distToGoal) {
        //   const zOffset =
        //     Math.sin(distToGoal * (Math.PI / stickConstants.rotationDelta)) * zOffsetModifier;
        //   const distToSelectedIndex =
        //     Math.abs(lastClickedStickIndex - index) / stickConstants.numSticks;
        //   stickRef.current.position.z =
        //     zOffset * (5 / (Math.pow(distToSelectedIndex * 100, 1) + 5));
        // }
      }
    }
  });

  function createBoxWithRoundedEdges(width, height, depth, radius0, smoothness) {
    let shape = new THREE.Shape();
    let eps = 0.00001;
    let radius = radius0 - eps;
    shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
    shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
    shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true);
    shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
    let geometry = new THREE.ExtrudeBufferGeometry(shape, {
      amount: depth - radius0 * 2,
      bevelEnabled: true,
      bevelSegments: smoothness * 2,
      steps: 1,
      bevelSize: radius,
      bevelThickness: radius0,
      curveSegments: smoothness,
    });

    geometry.center();

    return geometry;
  }

  // Vertical spread
  // const onMouseMove = (e) => {
  //   let mouseX = THREE.MathUtils.clamp(e.clientX / window.innerWidth, 0, 1);
  //   let mouseY = THREE.MathUtils.clamp(e.clientY / window.innerHeight, 0, 1);

  //   // Update stick height
  //   const mouseDistFromCenter = 4 * Math.abs(mouseY - 0.5) * Math.abs(mouseX - 0.5);
  //   const stickIndDistFromCenter = Math.pow((2 * Math.abs(index - numSticks / 2)) / numSticks, 1);
  //   const verticalSpreadAmt =
  //     stickConstants.perturbAmt *
  //     (1 - getIntroProgress()) *
  //     mouseDistFromCenter *
  //     stickIndDistFromCenter;

  //   let verticalSpreadDir =
  //     (mouseX < 0.5 && index < numSticks / 2) || (mouseX > 0.5 && index > numSticks / 2);
  //   if (verticalSpreadDir == 0) verticalSpreadDir = -1;

  //   stickRef.current.position.y = verticalSpreadAmt * verticalSpreadDir;
  // };
  // useEffect(() => {
  //   document.addEventListener("mousemove", onMouseMove);
  // }, []);

  return (
    <mesh
      ref={stickRef}
      receiveShadow
      castShadow
      onClick={(e) => stickSelectedCallback(index)}
      onPointerOver={stickHoveredIn}
      onPointerOut={stickHoveredOut}
    >
      {/*<cylinderGeometry attach="geometry" args={[width / 1.4, width / 1.4, height, 32]} />*/}
      {<boxBufferGeometry attach="geometry" args={[width, height, width]} />}
      {/*<meshStandardMaterial attach="material" color="#ffc428" roughness={0.5} metalic={0} />*/}
      {
        <customMaterial
          attach="material"
          index={index}
          numSticks={numSticks}
          textures={textures}
          topBottomColor={[1, 1, 1]}
        />
      }
    </mesh>
  );
};

export default Stick;
