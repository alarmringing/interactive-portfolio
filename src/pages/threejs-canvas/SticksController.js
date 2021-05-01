import * as THREE from 'three'
import React, { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from 'react-three-fiber'
import { useTexture } from '@react-three/drei'

import {constants, useStore} from './Store.js'
import Stick from './Stick.js'

const stickConstants = constants.stickConstants

const SticksController = () => {
  const getIsInIntroState = useStore(state => state.getIsInIntroState)
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
    if (!getIsInIntroState()) return

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

export default SticksController