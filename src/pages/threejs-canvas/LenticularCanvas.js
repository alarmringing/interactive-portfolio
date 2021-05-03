import * as THREE from "three";
import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "react-three-fiber";
import { Html, Stats } from "@react-three/drei";
import lerp from "lerp";

import "./LenticularShader.js";
import SticksController from "./SticksController.js";
import Text2Textures from "./Text2Textures.js";
import Page from "./Page.js";
import Controls from "./Controls.js";

const MainScene = () => {
  return (
    <>
      <Controls />
      <Text2Textures />
      <SticksController />
    </>
  );
};

const Startup = () => {
  const ref = useRef();
  useFrame(() => (ref.current.material.opacity = lerp(ref.current.material.opacity, 0, 0.1)));
  return (
    <mesh ref={ref} position={[0, 0, 200]} scale={[1000, 1000, 1]}>
      <planeBufferGeometry attach="geometry" />
      <meshBasicMaterial attach="material" color="#000000" transparent />
    </mesh>
  );
};

const LenticularCanvas = () => {
  const canvasRef = useRef(null);
  const canvasStyle = {
    height: "100%",
    width: "100%",
    position: "fixed",
    zIndex: "999",
    top: "0%",
  };

  return (
    <>
      <Stats
        showPanel={0} // Start-up panel (default=0)
        className="stats" // Optional className to add to the stats container dom element
      />
      <div alpha={1} style={canvasStyle} ref={canvasRef}>
        <Canvas
          orthographic
          alpha={1}
          onCreated={({ gl, camera }) => {
            //gl.setClearColor('#030303')
            // Default orthographicCamera settings. near: 0.1, far: 1000, position.z: 5
            camera.far = 500;
            camera.near = -500;
            camera.updateProjectionMatrix();
          }}
        >
          >
          <Suspense
            fallback={
              <Html center className="loading">
                {" "}
                loading...{" "}
              </Html>
            }
          >
            <MainScene />
            <Startup />
          </Suspense>
        </Canvas>
      </div>
      <Page canvasRef={canvasRef} />
    </>
  );
};

export default LenticularCanvas;
