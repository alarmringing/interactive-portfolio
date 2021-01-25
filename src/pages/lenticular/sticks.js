import * as THREE from 'three'
import React, { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from 'react-three-fiber'
import { useTexture } from '@react-three/drei'

import useStore from './store.js'

const saekdongColors = ['#ffffff', '#293985', '#b83280', '#f2d44a', '#67213d', '#408f4f', '#c03435']
const saekdongColors2 = ['#ffffff', '#002df8', '#ff269d', '#ffe900', '#920061', '#10cd48', '#fa203c']
const saekdongColors3 = ['#ffffff', '#1a3699', '#c81787', '#ffc428', '#843b97', '#0eab50', '#e71739']

const NUM_STICKS = 100
const STICK_WIDTH = 0.5
const STICK_HEIGHT = 30
const ROTATION_DELTA = Math.PI/2

const Stick = ({index, numSticks, textures, destRotation, stickSelectedCallback}) => {
  const lastClickedIndex = useStore(state => state.lastClickedIndex)
  const stickRef = useRef()
  const material = useRef()
  const width = STICK_WIDTH
  const height = STICK_HEIGHT

  const totalSticksWidth = width * Math.sqrt(2) * numSticks
  const zOffsetModifier = 2

  const {clock} = useThree()

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
        // Lerp rotation
        stickRef.current.quaternion.slerp(destQuaternion, 0.1);

        // A z-direction 'pop' effect
        const distToGoal = destRotation[1] - stickRef.current.rotation.y
        if (distToGoal) {
          const zOffset = Math.sin(distToGoal * (Math.PI / ROTATION_DELTA)) * zOffsetModifier
          const distToSelectedIndex = Math.abs(lastClickedIndex - index)/NUM_STICKS
          stickRef.current.position.z = zOffset * (5 / (Math.pow(distToSelectedIndex*100, 1) + 5))
        }
    }
  })

  return (
    <mesh ref={stickRef} receiveShadow onClick={(e) => stickSelectedCallback(index)}>
      <boxBufferGeometry attach="geometry" args={[width, height, width] } />
      <customMaterial ref={material} attach='material' 
                      index={index} 
                      numSticks={numSticks} 
                      textures={textures}
                      topBottomColor={[1, 1, 1]}/>
    </mesh>
  )
}



const Sticks = () => {
  const [lastClickedIndex, setClickedIndex] = useStore(state => [state.lastClickedIndex, state.setClickedIndex])

  const numSticks = NUM_STICKS
  const [sticks, setSticks] = useState([])

  const loadedTextures = useTexture(['img/korean.jpg', 'img/english.jpg', 'img/chinese.jpg', 'img/japanese.jpg'])
  let [korean, english, japanese, chinese] = loadedTextures.map(texture => ((texture.minFilter = THREE.LinearFilter), texture))
  // First four or the sides of the stick. Last two are top and bottom.
  let textures = [korean, english, japanese, chinese, 0, 0] 

  const {clock} = useThree()

  const [indMoveCount, setIndMoveCount] = useState(-1)

  const [timeElapsedSinceRotateStart, setTimeElapsedSinceRotateStart] = useState(-1)
  const [targetRotation, setTargetRotation] = useState([0, Math.PI/4, 0])
  const rotateDelayRate = 0.01

  // Initializer
  useEffect(() => {
    for (let i = 0; i < numSticks; i++) {
      let newStick = {index:i, destRotation:targetRotation}
      setSticks( sticks => [...sticks, newStick]);
    }
    clock.stop()
  },[])

  const stickSelectedCallback = (index) => {
    clock.start()

    setIndMoveCount(0)
    setClickedIndex(index)

    setTargetRotation(prev => [prev[0], prev[1] + ROTATION_DELTA, prev[2]])
  }

  useFrame(() => {
    if (!clock.running) return
    let newSticks = [...sticks]

    let i = indMoveCount
    let rightInd, leftInd
    // Update the stick rotations when necessary.
    while(Math.pow(i * rotateDelayRate, 0.7) < clock.getElapsedTime()) {

      rightInd = lastClickedIndex + i
      if (rightInd < numSticks) newSticks[rightInd].destRotation = targetRotation

      leftInd = lastClickedIndex - i;
      if (leftInd >= 0) newSticks[leftInd].destRotation = targetRotation

      i += 1
    }

    setIndMoveCount(i)
    setSticks(newSticks)

    // End condition
    if (rightInd >= numSticks && leftInd < 0) clock.stop()    
  })

  return (
    <>
      {sticks.map((stick) => {
         return (
             <Stick  
                     key={stick.index} 
                     index={stick.index} 
                     numSticks={numSticks} 
                     destRotation={stick.destRotation} 
                     textures={textures} 
                     stickSelectedCallback={stickSelectedCallback}
              />
         )
      })}
    </>
  )
}

export default Sticks