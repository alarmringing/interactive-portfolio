import React, { useRef, useEffect, useLayoutEffect, useState } from "react"
import { Canvas, useFrame, useThree } from 'react-three-fiber'

import { getState } from '../utils/store.js'

import '../styles/threepractice.scss'

const Rock = () => {
  const rockRef = useRef();

  useFrame(() => {
    if (rockRef.current) {
      const { advance } = getState();
      const rotations = advance("rock", "rotation", state => {
        const [x, y, z] = state.rock.rotation
        return [x + 0.01, y + 0.01, z + 0.01]
      })
      rockRef.current.rotation.set(...rotations);
    }
  })
  useEffect(() => {
    const {setInitialState} = getState();
    setInitialState("rock", {
      rotation: [0, 0, 0],
    })
  }, [])

  return (
    <mesh ref={rockRef} castShadow position={[0, 0.5, 0]}>
      <dodecahedronGeometry attach="geometry" args={[1, 0]} />
      <meshPhysicalMaterial attach="material" color="pink" />
    </mesh>
  )
}

const Ground = () => {
  return (
    <mesh receiveShadow position={[0, -1, 0]} rotation={[-Math.PI/2, 0, 0]}>
      <planeBufferGeometry attach="geometry" args={[100, 100, 100]} />
      <meshPhysicalMaterial attach="material" color="brown" />
    </mesh>
  )
}

const ThreeFiberPractice = () => {
  return (
    <Canvas shadowMap>
      <ambientLight intensity={0.75} />
      <pointLight intensity={0.25} position={[5, 0, 5]} />
      <spotLight
        castShadow
        position={[-5, 2.5, 5]}
        intensity={0.25}
        penumbra={1}
      />
      <Rock />
      <Ground />
    </Canvas>
  )
}


export default ThreeFiberPractice
