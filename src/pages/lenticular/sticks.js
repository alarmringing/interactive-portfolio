import * as THREE from 'three'
import React, { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from 'react-three-fiber'
import { useTexture } from '@react-three/drei'

const NUM_STICKS = 45
const STICK_WIDTH = 1
const STICK_HEIGHT = 30

const Stick = ({index, numSticks, textures, destRotation}) => {
  const stickRef = useRef()
  const material = useRef()
  const width = STICK_WIDTH
  const height = STICK_HEIGHT

  const totalSticksWidth = width * Math.sqrt(2) * numSticks

  // Constructor
  useEffect(() => {

    let positionX = -(totalSticksWidth/2) + index * width * Math.sqrt(2)
    stickRef.current.position.set(positionX, 0, 0)
    stickRef.current.geometry.setAttribute("side", new THREE.Float32BufferAttribute([
      0, 0, 0, 0, 
      1, 1, 1, 1, 
      2, 2, 2, 2, 
      3, 3, 3, 3, 
      4, 4, 4, 4, 
      5, 5, 5, 5
    ], 1));

    stickRef.current.rotation.set(...destRotation);
  }, [])


  useFrame(() => {
    let destQuaternion = new THREE.Quaternion();
    destQuaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), destRotation[1]);

    if (!stickRef.current.rotation.equals(destRotation)) {
        stickRef.current.quaternion.slerp(destQuaternion, 0.1);
    }
  })

  return (
    <mesh ref={stickRef} receiveShadow>
      <boxBufferGeometry attach="geometry" args={[width, height, width] } />
      <customMaterial ref={material} attach='material' index={index} numSticks={numSticks} textures={textures}/>
    </mesh>
  )
}

const Sticks = () => {
  const numSticks = NUM_STICKS
  const [sticks, setSticks] = useState([])

  const loadedTextures = useTexture(['img/korean.jpg', 'img/english.jpg', 'img/chinese.jpg', 'img/japanese.jpg'])
  let [korean, english, japanese, chinese] = loadedTextures.map(texture => ((texture.minFilter = THREE.LinearFilter), texture))
  // First four or the sides of the stick. Last two are top and bottom.
  let textures = [korean, english, japanese, chinese, 0, 0] 

  const {clock} = useThree()
  const [rotateStartIndex, setRotateStartIndex] = useState(0)
  const [indexToRotate, setIndexToRotate] = useState(-1)
  const [timeElapsedSinceRotateStart, setTimeElapsedSinceRotateStart] = useState(-1)
  const rotateDelayRate = 0.03
  const rotationDelta = Math.PI/2

  // Initializer
  useEffect(() => {
    for (let i = 0; i < numSticks; i++) {
      let newStick = {index:i, destRotation:[0, Math.PI/4, 0]}
      setSticks( sticks => [...sticks, newStick]);
    }
    document.addEventListener('keypress', OnKeyPress)
    clock.stop()
  },[])

  const OnKeyPress = (e) => {
    // TODO(testing): when 'R' is pressed rotate the cubes for testing.
    if(e.code != 'KeyR') return
    clock.start()
    setIndexToRotate(rotateStartIndex)
  }

  useFrame(() => {
    if (!clock.running) return
    let newSticks = [...sticks]

    // Update the stick rotations when necessary.
    for (let i = indexToRotate; i < numSticks; i++) {
      if (i*rotateDelayRate < clock.getElapsedTime()) {
        newSticks[i].destRotation[1] += rotationDelta
        setIndexToRotate(i+1)
      } else break
    }
    setSticks(newSticks)
    if (indexToRotate == numSticks) {
      clock.stop()
      setIndexToRotate(rotateStartIndex)
    }
  })

  return (
    <>
      <ambientLight intensity={1} />
      <pointLight intensity={0.25} position={[5, 0, 5]} />
      <spotLight
        castShadow
        position={[-5, 2.5, 5]}
        intensity={0.25}
        penumbra={1}
      />
      {sticks.map((stick) => {
         return (
             <Stick  
                     key={stick.index} 
                     index={stick.index} 
                     numSticks={numSticks} 
                     destRotation={stick.destRotation} 
                     textures={textures} />
         )
      })}
    </>
  )
}

export default Sticks