import * as THREE from 'three'
import React, { Suspense, useRef, useEffect } from "react"
import { Canvas, useFrame } from 'react-three-fiber'
import { Html, Stats } from '@react-three/drei'
import lerp from 'lerp'

import './lenticularShader.js'
import Sticks from './sticks.js'
import Page from './page.js'
import Controls from './controls.js'

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
  useFrame(() => (ref.current.material.opacity = lerp(ref.current.material.opacity, 0, 0.1)))
  return (
    <mesh ref={ref} position={[0, 0, 200]} scale={[1000, 1000, 1]}>
      <planeBufferGeometry attach='geometry' />
      <meshBasicMaterial attach='material' color='#000000' transparent />
    </mesh>
  )
}


const Lenticular = () => {
  const canvasRef = useRef(null)
  const canvasStyle = {
    height: '100%',
    width: '100%',
    position: 'fixed',
    zIndex: '999'
  }

  return (
    <>
      <Stats
        showPanel={0} // Start-up panel (default=0)
        className="stats" // Optional className to add to the stats container dom element
      />
      <Canvas style={canvasStyle} orthographic alpha={1}
              onCreated={({ gl, camera, canvas }) => {
                //gl.setClearColor('#030303')
                // Default orthographicCamera settings. near: 0.1, far: 1000, position.z: 5
                camera.far = 500
                camera.near = -500
                canvasRef.current = canvas
                camera.updateProjectionMatrix()
              }}>
      >
        <Suspense fallback={<Html center className='loading'> loading... </Html>}>
          <MainScene />
          <Startup />
        </Suspense>
      </Canvas>
      <Page canvasRef = {canvasRef}/>
    </>
  )
}

export default Lenticular
