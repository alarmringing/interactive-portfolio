import * as THREE from "three";
import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree, useFBO } from "react-three-fiber";
import { useTexture, Box } from "@react-three/drei";

import { constants, useStore } from "./Store.js";
import Stick from "./Stick.js";

const SticksController = () => {
  // States from zustand.
  const getIsInIntroState = useStore((state) => state.getIsInIntroState);
  const [lastClickedStickIndex, setClickedStickIndex] = useStore((state) => [
    state.lastClickedStickIndex,
    state.setClickedStickIndex,
  ]);

  // Settings for sticks.
  const stickConstants = constants.stickConstants;

  // Sticks.
  const [sticks, setSticks] = useState([]);
  const { clock } = useThree();

  const [indMoveCount, setIndMoveCount] = useState(-1);

  const [timeElapsedSinceRotateStart, setTimeElapsedSinceRotateStart] = useState(-1);
  const [globalStickTargetRotation, advanceGlobalStickTargetYRotation] = useStore((state) => [
    state.globalStickTargetRotation,
    state.advanceGlobalStickTargetYRotation,
  ]);
  const rotateDelayRate = 0.01;

  // Stick textures.
  const stickFaceRenderTargets = useStore((state) => state.stickFaceRenderTargets);
  const loadedTextureFiles = useTexture([
    "img/korean.jpg",
    "img/english.jpg",
    "img/chinese.jpg",
    "img/japanese.jpg",
  ]);
  const [korean, english, japanese, chinese] = loadedTextureFiles.map(
    (texture) => ((texture.minFilter = THREE.LinearFilter), texture)
  );
  const textures = [
    stickFaceRenderTargets[0].texture,
    stickFaceRenderTargets[1].texture,
    stickFaceRenderTargets[2].texture,
    stickFaceRenderTargets[3].texture,
    0,
    0,
  ];

  // Sticks Initializer
  useEffect(() => {
    for (let i = 0; i < stickConstants.numSticks; i++) {
      let newStick = { index: i, destRotation: globalStickTargetRotation };
      setSticks((sticks) => [...sticks, newStick]);
    }
    clock.stop();
  }, []);

  const stickSelectedCallback = (index) => {
    // Interaction is disabled if not in intro screen state
    if (!getIsInIntroState()) return;
    clock.start();

    setIndMoveCount(0);
    setClickedStickIndex(index);

    advanceGlobalStickTargetYRotation(stickConstants.rotationDelta);
  };

  useFrame(() => {
    if (!clock.running) return;
    let newSticks = [...sticks];

    let i = indMoveCount;
    let rightInd, leftInd;
    // Update the stick rotations when necessary.
    while (Math.pow(i * rotateDelayRate, 0.7) < clock.getElapsedTime()) {
      rightInd = lastClickedStickIndex + i;
      if (rightInd < stickConstants.numSticks)
        newSticks[rightInd].destRotation = globalStickTargetRotation;

      leftInd = lastClickedStickIndex - i;
      if (leftInd >= 0) newSticks[leftInd].destRotation = globalStickTargetRotation;

      i += 1;
    }

    setIndMoveCount(i);
    setSticks(newSticks);

    // End condition
    if (rightInd >= stickConstants.numSticks && leftInd < 0) clock.stop();
  });

  return (
    <>
      {sticks.map((stick) => {
        return (
          <Stick
            key={stick.index}
            numSticks={stickConstants.numSticks}
            index={stick.index}
            destRotation={stick.destRotation}
            textures={textures}
            stickSelectedCallback={stickSelectedCallback}
          />
        );
      })}
    </>
  );
};

export default SticksController;
