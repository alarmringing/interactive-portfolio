import React, { useRef, useEffect, useLayoutEffect, useState } from "react"
import { Canvas, useFrame, useThree, extend } from 'react-three-fiber'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

extend({ OrbitControls })

const Ground = () => {
  return (
    <mesh receiveShadow position={[0, -1, 0]} rotation={[-Math.PI/2, 0, 0]}>
      <planeBufferGeometry attach="geometry" args={[100, 100, 100]} />
      <meshPhysicalMaterial attach="material" color="brown" />
    </mesh>
  )
}

const Stick = () => {
  return (
    <mesh>
      <cubeGeometry attach="geometry" args={[3, 30, 3]} />
      <meshPhysicalMaterial attach="material" color="blue" />
    </mesh>
  )
}

const Controls = () => {
  const {
    camera,
    gl: { domElement }
  } = useThree()
  return (
    <orbitControls args={[camera, domElement]} />
  )
}

const Scene = () => {



  return (
    <>
      Lenticular starting.
      <Canvas style={{height: '100vh', width: '100vw'}}
              orthographic
      >
        <ambientLight intensity={0.75} color={0x929253} />
        <pointLight intensity={0.25} position={[5, 0, 5]} />
        <spotLight
          castShadow
          position={[-5, 2.5, 5]}
          intensity={0.25}
          penumbra={1}
        />
        <Controls />
        <Stick />
        <Ground />
      </Canvas>
    </>
  )
}

/*
const Rock = () => {
  const rockRef = useRef();

  const {gl} = useThree()
  const [toggle, setToggle] = useState(true)
  const [hover, setHover] = useState(false)

  const onHover = () => { setHover(!hover) }

  useLayoutEffect(() => {
    if (hover) {
      gl.domElement.classList.add("onHover")
      return
    }
    gl.domElement.classList.remove("onHover")
  }, [hover, gl])

  useFrame(() => {
    if (toggle && rockRef.current) {
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
    <mesh ref={rockRef} castShadow position={[0, 0.5, 0]}
          scale={hover ? [1.25, 1.25, 1.25] : [1, 1, 1]}
          onPointerDown={() => {setToggle(!toggle)}}
          onPointerOver={onHover} onPointerOut={onHover}>
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
    <>
      ThreeFiberPractice starting.
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
    </>
  )
}

*/

export default Scene
