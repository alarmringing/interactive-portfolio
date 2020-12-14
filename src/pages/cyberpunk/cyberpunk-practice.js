import React, { useRef, createRef, useEffect } from "react"
import { Canvas, useFrame } from 'react-three-fiber'
import shallow from 'zustand/shallow'
import lerp from 'lerp'
import {Block, useBlock} from './blocks.js'
import useStore from './state.js'

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

const Cross = () => {
  const [pages, top, zoom] = useStore(state => [state.pages, state.top, state.zoom], shallow)

  const ref = useRef()
  const {viewportHeight} = useBlock()
  useFrame(() => {
      const curRotationZ = ref.current.rotation.z
      const nextRotationZ = (top.current / ((pages-1) * viewportHeight * zoom)) * 2 * Math.PI
      ref.current.rotation.z = lerp(curRotationZ, nextRotationZ, 0.1)
  })
  return (
    <group ref={ref} scale={[3, 3, 3]}>
      <Plane scale={[1, 0.1, 0.01]} color = 'pink' />
      <Plane scale={[0.1, 1, 0.01]} color = 'pink' />
    </group>
  )
}

const Stripe = () => {
  const { contentMaxWidth } = useBlock()
  return (
    <Plane scale={[100, 1, 1]} rotation={[0, 0, Math.PI / 4]} position={[0, 0, -1]} color = 'blue' />
  )
}

const CyberpunkPractice = () => {
  const scrollArea = useRef()

  const [pages, top, zoom] = useStore(state => [state.pages, state.top, state.zoom], shallow)

  const onScroll = e => {
    top.current = e.target.scrollTop
    //console.log("top is ", top.current)
  }
  useEffect(() => void onScroll({target: scrollArea.current}), [])
  return (
    <>
      Before canvas
      <Canvas orthographic colorManagement={false} camera={{zoom:zoom, position:[0, 0, 500]}}>
        <Block factor={1.5} offset={0}>
          <Content left />
        </Block>
        <Block factor={2} offset={1}>
          <Content />
        </Block>
        <Block factor={-1.0} offset={0}>
          <Stripe />
        </Block>
        <Block factor={1.5} offset={2}>
          <Content left>
            <Block factor = {-0.5}>
              <Plane scale={[0.5, 0.5, 0.5]}/>
              <Cross />
            </Block>
          </Content>
        </Block>
      </Canvas>
      After canvas
      <div className='scrollArea' ref={scrollArea} onScroll={onScroll} >
        Top value: {top.current} zoom: {zoom} pages:{pages}
        <div style={{height: `${pages * 100}vh`}}/>
      </div>
    </>
  )
}

export default CyberpunkPractice
