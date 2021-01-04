import * as THREE from 'three'
import React, { useRef, useEffect, useLayoutEffect, useState } from "react"
import { Canvas, useFrame, useThree, extend } from 'react-three-fiber'
import { Stats } from '@react-three/drei'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import './lenticularShader.js'


extend({ OrbitControls })

const saekdongColors = ['#ffffff', '#293985', '#b83280', '#f2d44a', '#67213d', '#408f4f', '#c03435']
const saekdongColors2 = ['#ffffff', '#002df8', '#ff269d', '#ffe900', '#920061', '#10cd48', '#fa203c']
const saekdongColors3 = ['#ffffff', '#1a3699', '#c81787', '#ffc428', '#843b97', '#0eab50', '#e71739']

/*
const HalfCylinder = ({index, numCylinder}) => {
  //var geometry = new THREE.CylinderGeometry(100,100,150, 8, 1, false, 0, Math.PI);
}
*/

// Or a default orthographic camera if Canvas.orthographic is true:
// near: 0.1, far: 1000, position.z: 5

const Stick = ({index, numSticks}) => {
  const stickRef = useRef()
  const material = useRef()
  const width = 3
  const height = 60

  const totalSticksWidth = width * Math.sqrt(2) * numSticks
  //const color = saekdongColors2[index % saekdongColors.length]

  const {gl} = useThree()

  // TODO(testing): when 'R' is pressed rotate the cubes for testing.
  const OnKeyPress = (e) => {
    if(e.code != 'KeyR') return
    setRotation(rotation => [0, rotation[1] + Math.PI/4, 0])
  }

  const [rotation, setRotation] = useState([0, Math.PI/4, 0])

  // Constructor
  useEffect(() => {

    document.addEventListener('keypress', OnKeyPress)

    let positionX = -(totalSticksWidth/2) + index * width * Math.sqrt(2)
    stickRef.current.position.set(positionX, 0, 0)

    // let faces = stickRef.current.geometry.faces
    // for(let i = 0; i < faces.length; i++) {
    //   let index = Math.floor(i/2) % saekdongColors.length
    //   let color = saekdongColors2[index]
    //   faces[i].color.set(color)
    // }
    // stickRef.current.geometry.colorsNeedUpdate = true

    stickRef.current.geometry.addAttribute("side", new THREE.Float32BufferAttribute([
      0, 0, 0, 0, 
      1, 1, 1, 1, 
      2, 2, 2, 2, 
      3, 3, 3, 3, 
      4, 4, 4, 4, 
      5, 5, 5, 5
    ], 1));



    stickRef.current.rotation.set(...rotation);
    //stickRef.current.material.color.set('green')
  }, [])


  useFrame(() => {
    //let destQutaernion = new THREE.Vector3(rotation[0], rotation[1], rotation[2])
    let destQutaernion = new THREE.Quaternion();
    destQutaernion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), rotation[1]);
    stickRef.current.quaternion.slerp( destQutaernion, 0.1 );

  //   setRotation(rotation => [0, rotation[1] + 0.01, 0])
  //   stickRef.current.rotation.set(...rotation);
  })



  return (
    <mesh ref={stickRef}>
      <boxBufferGeometry attach="geometry" args={[width, height, width] } />
      <customMaterial ref={material} attach='material' />
    </mesh>
  )
}
//      <meshPhysicalMaterial attach="material" vertexColors={THREE.FaceColors} />


const Controls = () => {
  const {
    camera,
    gl: { domElement }
  } = useThree()

  // Default orthographic camera settings: near: 0.1, far: 1000, position.z: 5
  //camera.near = 0
  //camera.updateProjectionMatrix()

  return (
    <orbitControls args={[camera, domElement]} />
  )
}

const Scene = () => {
  const numSticks = 30
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
      <Canvas style={{height: '100vh', width: '100vw'}} orthographic        
              onCreated={({ gl, camera }) => {
                gl.setClearColor('#030303')
                camera.far = 500
                camera.near = -500
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
