import React, { useRef, createRef, useEffect } from "react"
import { Canvas } from 'react-three-fiber'
import shallow from 'zustand/shallow'
import lerp from 'lerp'
import {Block, useBlock} from './blocks.js'
import useStore from './state.js'

import './cyberpunk.css'


const Plane = ({color='blue', ...props}) => {
  console.log("Plane rendered")
  return (
    <mesh {...props}>
      <planeBufferGeometry attach='geometry'/>
      <meshBasicMaterial attach='material' color={color} />
    </mesh>
  )
}

const Content = ({left, children}) => {
  const { contentMaxWidth, canvasWidth, margin } = useBlock()
  const aspect = 1.75
  const alignRight = (canvasWidth - contentMaxWidth - margin) / 2
  return (
    <group position={[alignRight * (left ? -1 : 1), 0, 0]}>
      <Plane scale={[contentMaxWidth, contentMaxWidth/aspect, 1]} color='#bfe2ca'/>
      {children}
    </group>
  )
}

const CyberpunkPractice = () => {
  console.log("Testing if cyberpunkpractice works")
  const scrollArea = useRef()
  const [pages, top, zoom] = useStore(state => [state.pages, state.top, state.zoom], shallow)

  const onScroll = e => {
    top.current = e.target.scrollTop
    //console.log("top is ", top.current)
  }
  useEffect(() => void onScroll({target: scrollArea.current}), [])
  return (
    <>
      Beginning of canvas
      <Canvas orthographic colorManagement={false} camera={{zoom:zoom, position:[0, 0, 500]}}>
        <Plane />
        <Block factor={1.5} offset={0}>
          <Content left={false} />
        </Block>
      </Canvas>
      <div className='scrollArea' ref={scrollArea} onScroll={onScroll} >
        Top value: {top.current} zoom: {zoom} pages:{pages}
        <div style={{height: `${pages * 100}vh`}}/>
      </div>
    </>
  )
}

export default CyberpunkPractice
