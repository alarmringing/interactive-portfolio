import * as THREE from 'three'
import React, { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from 'react-three-fiber'

import {constants, useStore} from './Store.js'

const stickConstants = constants.stickConstants

const Stick = ({index, numSticks, textures, destRotation, stickSelectedCallback}) => {
  const getIsInIntroState = useStore(state => state.getIsInIntroState)
  const lastClickedStickIndex = useStore(state => state.lastClickedStickIndex)
  const [isHovered, setIsHovered] = useState(false)
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
    setIsHovered(true)
  }
  const stickHoveredOut = () => {
    setIsHovered(false)
  }

  useFrame(() => {
    if (isHovered && getIsInIntroState()) {
      // If hovered and in intro state, apply some effect to the hovered stick.
      stickRef.current.rotation.y += 0.05;
    } else {
      let destQuaternion = new THREE.Quaternion();
      destQuaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), destRotation[1]);
      if (!stickRef.current.rotation.equals(destRotation)) {
          // Lerp rotation
          stickRef.current.quaternion.slerp(destQuaternion, 0.17);

          // A z-direction 'pop' effect
          const distToGoal = destRotation[1] - stickRef.current.rotation.y
          if (distToGoal) {
            const zOffset = Math.sin(distToGoal * (Math.PI / stickConstants.rotationDelta)) * zOffsetModifier
            const distToSelectedIndex = Math.abs(lastClickedStickIndex - index) / stickConstants.numSticks
            stickRef.current.position.z = zOffset * (5 / (Math.pow(distToSelectedIndex*100, 1) + 5))
          }
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
                      topBottomColor={[1, 1, 1]} />
    </mesh>
  )
}

export default Stick