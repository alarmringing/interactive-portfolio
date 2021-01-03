import React, { useRef, useEffect, useLayoutEffect, useState } from "react"
import { Canvas, useFrame, useThree, extend } from 'react-three-fiber'
import { Stats } from '@react-three/drei'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

extend({ OrbitControls })

const saekdongColors = ['#ffffff', '#293985', '#b83280', '#f2d44a', '#67213d', '#408f4f', '#c03435']
const saekdongColors2 = ['#ffffff', '#002df8', '#ff269d', '#ffe900', '#920061', '#10cd48', '#fa203c']
const saekdongColors3 = ['#ffffff', '#1a3699', '#c81787', '#ffc428', '#843b97', '#0eab50', '#e71739']

const Stick = ({index, numSticks}) => {
  const stickRef = useRef()
  const width = 1
  const height = 100

  const totalSticksWidth = width * Math.sqrt(2) * numSticks
  const position = [-(totalSticksWidth/2) + index * width * Math.sqrt(2), 0, 0]
  const color = saekdongColors2[index % saekdongColors.length]

  const [rotation, setRotation] = useState([0, 0, 0])

  // Constructor
  useEffect(() => {
  }, [])

  // useFrame(() => {
  //   setRotation(rotation => [0, rotation[1] + 0.01, 0])
  //   stickRef.current.rotation.set(...rotation);
  // })

  return (
    <mesh ref={stickRef} position={position}>
      <cubeGeometry attach="geometry" args={[width, height, width] } />
      <meshPhysicalMaterial attach="material" color={color} />
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
  const numSticks = 150
  const [sticks, setSticks] = useState([])

  useEffect(() => {
    for (let i = 0; i < numSticks; i++) {
      let newStick = {index:i}
      setSticks( sticks => [...sticks, newStick]);
    }
  },[])

  return (
    <>
      <Stats
        showPanel={0} // Start-up panel (default=0)
        className="stats" // Optional className to add to the stats container dom element
      />
      <Canvas style={{height: '100vh', width: '100vw'}}
              orthographic         
              onCreated={({ gl, camera }) => {
                gl.setClearColor('#030303')
              }}>
      >
        <ambientLight intensity={1} />
        <pointLight intensity={0.25} position={[5, 0, 5]} />
        <spotLight
          castShadow
          position={[-5, 2.5, 5]}
          intensity={0.25}
          penumbra={1}
        />
        <Controls />
        {sticks.map(stick => {
           return (
               <Stick key={stick.index} index={stick.index} numSticks={numSticks}/>
           )
        })}
        <Stick index={0} maxIndex={3}/>
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
