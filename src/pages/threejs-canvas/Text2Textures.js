import * as THREE from "three";
import React, { useRef, useEffect, useState, useMemo } from "react";
import { createPortal, useFrame, useThree } from "react-three-fiber";
import { PerspectiveCamera, TorusKnot, Text } from "@react-three/drei";

import { constants, useStore } from "./Store.js";

const SpinningThing = ({ textColor }) => {
  const mesh = useRef();
  const directionalLight = useRef();
  const objectColor = new THREE.Color(textColor);
  useEffect(() => {
    console.log("Textcolor is ", textColor);
  }, []);
  useFrame((state) => {
    mesh.current.rotation.x = mesh.current.rotation.y = mesh.current.rotation.z += 0.01;
    const cameraVector = new THREE.Vector3();
    state.camera.getWorldPosition(cameraVector);
    directionalLight.current.position.set(cameraVector.x, cameraVector.y, cameraVector.z);
  });
  return (
    <>
      <directionalLight intensity={1} ref={directionalLight} castShadow />
      <TorusKnot ref={mesh} args={[1, 0.4, 100, 64]}>
        <meshStandardMaterial attach="material" color={textColor} roughness={0.0} metalic={1} />
      </TorusKnot>
    </>
  );
};

const TextScene = ({ text, fontPath, textColor }) => {
  return (
    <>
      <Text>{text}</Text>
    </>
  );
};

const TextureScene = ({ renderTarget, bkgColor, textColor, ...props }) => {
  const cam = useRef();

  const [scene] = useMemo(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bkgColor);
    return [scene];
  }, []);

  useFrame((state) => {
    state.gl.setRenderTarget(renderTarget);
    state.gl.render(scene, cam.current);
    state.gl.setRenderTarget(null);
  });

  return (
    <>
      <PerspectiveCamera ref={cam} position={[0, 0, 3]} />
      {createPortal(<SpinningThing textColor={textColor} />, scene)}
    </>
  );
};

const Text2Textures = () => {
  const [pageTypeToBkgColorMapping, pageTypeToTextPrimaryColorMapping] = useStore((state) => [
    state.pageTypeToBkgColorMapping,
    state.pageTypeToTextPrimaryColorMapping,
  ]);
  const stickFaceRenderTargets = useStore((state) => state.stickFaceRenderTargets);

  const setUpStickTexture = (renderTarget, text, modeIndex) => {
    // Temp for now.
    const testFontPath = "fonts/Lato-Black";

    return (
      <TextureScene
        key={modeIndex}
        renderTarget={renderTarget}
        text={text}
        bkgColor={pageTypeToBkgColorMapping(modeIndex)}
        textColor={pageTypeToTextPrimaryColorMapping(modeIndex)}
      />
    );
  };

  const textureScenes = [
    setUpStickTexture(stickFaceRenderTargets[0], "Test1", 1),
    setUpStickTexture(stickFaceRenderTargets[1], "Test2", 2),
    setUpStickTexture(stickFaceRenderTargets[2], "Test3", 3),
    setUpStickTexture(stickFaceRenderTargets[3], "Test4", 4),
  ];

  return <>{textureScenes}</>;
};

export default Text2Textures;
