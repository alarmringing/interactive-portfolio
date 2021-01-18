import * as THREE from 'three'
import React, { Suspense, useRef, useEffect } from "react"
import { Canvas, useFrame } from 'react-three-fiber'
import { Html, Stats } from '@react-three/drei'
import lerp from 'lerp'

import './lenticularShader.js'
import Sticks from './sticks.js'
import Controls from './controls.js'

const saekdongColors = ['#ffffff', '#293985', '#b83280', '#f2d44a', '#67213d', '#408f4f', '#c03435']
const saekdongColors2 = ['#ffffff', '#002df8', '#ff269d', '#ffe900', '#920061', '#10cd48', '#fa203c']
const saekdongColors3 = ['#ffffff', '#1a3699', '#c81787', '#ffc428', '#843b97', '#0eab50', '#e71739']

const MainScene = () => {
  return (
    <>
      <Controls />
      <Sticks />
    </>
  )
}

const Startup = () => {
  const ref = useRef()
  useFrame(() => (ref.current.material.opacity = lerp(ref.current.material.opacity, 0, 0.025)))
  return (
    <mesh ref={ref} position={[0, 0, 200]} scale={[100, 100, 1]}>
      <planeBufferGeometry attach='geometry' />
      <meshBasicMaterial attach='material' color='#ffffff' transparent />
    </mesh>
  )
}


const Scene = () => {
  return (
    <>
      <Stats
        showPanel={0} // Start-up panel (default=0)
        className="stats" // Optional className to add to the stats container dom element
      />
      <Canvas style={{height: '100vh', width: '100vw'}} orthographic   
              onCreated={({ gl, camera }) => {
                gl.setClearColor('#030303')
                // Default orthographicCamera settings. near: 0.1, far: 1000, position.z: 5
                camera.far = 500
                camera.near = -500
              }}>
      >
        <Suspense fallback={<Html center className='loading'> loading... </Html>}>
          <MainScene />
          <Startup />
        </Suspense>
      </Canvas>
    </>
  )
}

export default Scene
