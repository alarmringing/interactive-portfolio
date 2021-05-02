import * as THREE from 'three'
import React, { useRef, useEffect, useState, useMemo } from "react"
import { createPortal, useFrame, useThree } from 'react-three-fiber'
import { PerspectiveCamera, TorusKnot, Text } from '@react-three/drei'

import {constants, useStore} from './Store.js'

function SpinningThing() {
  const mesh = useRef()
  useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y = mesh.current.rotation.z += 0.01))
  return (
    <TorusKnot ref={mesh} args={[1, 0.4, 100, 64]}>
      <meshNormalMaterial attach="material" />
    </TorusKnot>
  )
}


const TextScene = ({renderTarget, text, fontPath, textColor}) => {
  return (
    <>
    	<Text>
    		{text}
    	</Text>
    </>
  )
}

const TextureScene = ({renderTarget, bkgColor, ...props}) => {
  const cam = useRef()

  const [scene] = useMemo(() => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(bkgColor)
    renderTarget.samples = 8
    return [scene]
  }, [])

  useFrame((state) => {
  	state.gl.autoClear = false
    state.gl.setRenderTarget(renderTarget)
    state.gl.render(scene, cam.current)
    state.gl.setRenderTarget(null)
  })

  return (
    <>
      <PerspectiveCamera ref={cam} position={[0, 0, 3]} />
      {createPortal(<TextScene />, scene)}
    </>
  )
}

const Text2Textures = ({renderTargets}) => {

  const [pageTypeToBkgColorMapping, pageTypeToTextPrimaryColorMapping] = useStore(state => [state.pageTypeToBkgColorMapping, state.pageTypeToTextPrimaryColorMapping])
  
  const setUpStickTexture = (renderTarget, text, modeIndex) => {
    // Temp for now.
    const testFontPath = 'fonts/Lato-Black'

    return (<TextureScene 
              key={modeIndex}
              renderTarget={renderTarget}
              text={text} 
              bkgColor={pageTypeToBkgColorMapping(modeIndex)} 
              textColor={pageTypeToTextPrimaryColorMapping(modeIndex)} 
            />)
  }

  const textureScenes = [
    setUpStickTexture(renderTargets[0], 'Test1', 1),
    setUpStickTexture(renderTargets[1], 'Test2', 2),
    setUpStickTexture(renderTargets[2], 'Test3', 3),
    setUpStickTexture(renderTargets[3], 'Test4', 4),
  ]

  return(
    <>
      {textureScenes}
    </>
  )
}

export default Text2Textures