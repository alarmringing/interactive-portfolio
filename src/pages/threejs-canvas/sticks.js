import * as THREE from 'three'
import React, { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from 'react-three-fiber'
import { useTexture } from '@react-three/drei'

import {constants, useStore} from './store.js'

const stickConstants = constants.stickConstants

const Stick = ({index, numSticks, textures, destRotation, stickSelectedCallback}) => {
  const lastClickedStickIndex = useStore(state => state.lastClickedStickIndex)
  const stickRef = useRef()
  const material = useRef()
  const width = stickConstants.stickWidth
  const height = stickConstants.stickHeight

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

  // TODO: Add some hover animation here.
  const stickHoveredIn = () => {
    //stickRef.current.position.y = 1
  }
  const stickHoveredOut = () => {
    //stickRef.current.position.y = 0
  }

  useFrame(() => {
    let destQuaternion = new THREE.Quaternion();
    destQuaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), destRotation[1]);
    if (!stickRef.current.rotation.equals(destRotation)) {
        // Lerp rotation
        stickRef.current.quaternion.slerp(destQuaternion, 0.1);

        // A z-direction 'pop' effect
        const distToGoal = destRotation[1] - stickRef.current.rotation.y
        if (distToGoal) {
          const zOffset = Math.sin(distToGoal * (Math.PI / stickConstants.rotationDelta)) * zOffsetModifier
          const distToSelectedIndex = Math.abs(lastClickedStickIndex - index) / stickConstants.numSticks
          stickRef.current.position.z = zOffset * (5 / (Math.pow(distToSelectedIndex*100, 1) + 5))
        }
    }
  })

  return (
    <mesh ref={stickRef} receiveShadow onClick={(e) => stickSelectedCallback(index)} 
          onPointerOver={stickHoveredIn} onPointerOut={stickHoveredOut}>
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
  const lenticularTweenProgress = useStore(state => state.lenticularTweenProgress)
  const [lastClickedStickIndex, setClickedStickIndex] = useStore(state => [state.lastClickedStickIndex, state.setClickedStickIndex])

  const numSticks = stickConstants.numSticks
  const [sticks, setSticks] = useState([])

  const loadedTextures = useTexture(['img/korean.jpg', 'img/english.jpg', 'img/chinese.jpg', 'img/japanese.jpg'])
  let [korean, english, japanese, chinese] = loadedTextures.map(texture => ((texture.minFilter = THREE.LinearFilter), texture))
  // First four or the sides of the stick. Last two are top and bottom.
  let textures = [korean, english, japanese, chinese, 0, 0] 

  const {clock} = useThree()

  const [indMoveCount, setIndMoveCount] = useState(-1)

  const [timeElapsedSinceRotateStart, setTimeElapsedSinceRotateStart] = useState(-1)
  const [globalStickTargetRotation, advanceGlobalStickTargetYRotation] = 
        useStore(state => [state.globalStickTargetRotation, state.advanceGlobalStickTargetYRotation])
  const rotateDelayRate = 0.01

  // Initializer
  useEffect(() => {
    for (let i = 0; i < numSticks; i++) {
      let newStick = {index:i, destRotation:globalStickTargetRotation}
      setSticks( sticks => [...sticks, newStick]);
    }
    clock.stop()
  },[])

  const stickSelectedCallback = (index) => {
    // Interaction is disabled if not in intro screen state
    if (lenticularTweenProgress > 0) return

    clock.start()

    setIndMoveCount(0)
    setClickedStickIndex(index)

    advanceGlobalStickTargetYRotation(stickConstants.rotationDelta)
  }

  useFrame(() => {
    if (!clock.running) return
    let newSticks = [...sticks]

    let i = indMoveCount
    let rightInd, leftInd
    // Update the stick rotations when necessary.
    while(Math.pow(i * rotateDelayRate, 0.7) < clock.getElapsedTime()) {

      rightInd = lastClickedStickIndex + i
      if (rightInd < numSticks) newSticks[rightInd].destRotation = globalStickTargetRotation

      leftInd = lastClickedStickIndex - i;
      if (leftInd >= 0) newSticks[leftInd].destRotation = globalStickTargetRotation

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