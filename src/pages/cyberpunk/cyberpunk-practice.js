import React, { Suspense, useRef, createRef, useEffect } from "react"
import { Canvas, useFrame } from 'react-three-fiber'
import { Html, useTexture } from '@react-three/drei'
import { TextureLoader, LinearFilter } from 'three'
import shallow from 'zustand/shallow'
import lerp from 'lerp'
import {Block, useBlock} from './blocks.js'
import useStore from './state.js'

const Plane = ({color='blue', map, ...props}) => {
  // map in a mesh acts as a texture.

  return (
    <mesh {...props}>
      <planeBufferGeometry attach='geometry'/>
      <meshBasicMaterial attach='material' color={color} map={map} />
    </mesh>
  )
}

const Content = ({left, children, map}) => {
  const { contentMaxWidth, canvasWidth, margin } = useBlock()
  const aspect = useStore(state => state.aspect)
  const alignRight = (canvasWidth - contentMaxWidth - margin) / 2
  return (
    <group position={[alignRight * (left ? -1 : 1), 0, 0]}>
      <Plane scale={[contentMaxWidth, contentMaxWidth/aspect, 1]} color='#bfe2ca' map={map}/>
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

const Pages = () => {
  const [pages, top, zoom, images, aspect] = useStore(state => [state.pages, state.top, state.zoom, state.images, state.aspect], shallow)
  const {contentMaxWidth, mobile} = useBlock()
  const pixelWidth = contentMaxWidth * zoom

  //const texture = useLoader(TextureLoader, './flavor_wheel.jpg')
  //const texture = useTexture('img/flavor_wheel.jpg')
  const textures = useTexture(images)
  const [img1, img2] = textures.map(texture => ((texture.minFilter = LinearFilter), texture))

  return (
      <>
        <Block factor={1.5} offset={0}>
          <Content left map={img1}>
            <Html style = {{width: pixelWidth / (mobile ? 1 : 2), textAlign:"left"}} position={[-contentMaxWidth / 2, -contentMaxWidth / 2 / aspect - 0.4, 1]}>
              Hey here's a simple dom paragraph! Check this out. Lorem ipsum lorem ipsum BENEE is a really cool Gen Z artist that I like seriously.
            </Html>
          </Content>
        </Block>
        <Block factor={2} offset={1}>
          <Content map={img2}> 
            <Html style={{width: pixelWidth / (mobile ? 1 : 2), textAlign:'right'}} position={[mobile ? -contentMaxWidth / 2 : 0, -contentMaxWidth / 2 / aspect - 0.4, 1]}> 
              hey hey heres more text on the left side 
            </Html>
          </Content>
        </Block>
        <Block factor={-1.0} offset={0}>
          <Stripe />
        </Block>
        <Block factor={1.5} offset={2}>
          <Content left map={img1}>
            <Block factor = {-0.5}>
              <Plane scale={[0.5, 0.5, 0.5]}/>
              <Cross />
            </Block>
          </Content>
        </Block>
      </>
  )
}

const Startup = () => {
  const ref = useRef()
  useFrame(() => (ref.current.material.opacity = lerp(ref.current.material.opacity, 0, 0.025)))
  return (
    <mesh ref={ref} position={[0, 0, 200]} scale={[100, 100, 1]}>
      <planeBufferGeometry attach='geometry' />
      <meshBasicMaterial attach='material' color='#ffffff' transparent />
    </mesh>
  )
}

const CyberpunkPractice = () => {
  const [pages, top, zoom, images, aspect] = useStore(state => [state.pages, state.top, state.zoom, state.images, state.aspect], shallow)

  const scrollArea = useRef()

  const onScroll = e => { top.current = e.target.scrollTop }
  useEffect(() => void onScroll({target: scrollArea.current}), [])

  return(
      <>
      <Canvas orthographic colorManagement={false} camera={{zoom:zoom, position:[0, 0, 500]}}>
        <Suspense fallback={<Html center className='loading'> loading... </Html>}>
          <Pages />
          <Startup />
        </Suspense>
      </Canvas>
      <div className='scrollArea' ref={scrollArea} onScroll={onScroll} >
        zoom: {zoom} pages:{pages}
        <div style={{height: `${pages * 100}vh`}}/>
      </div>
    </>
  )
}

export default CyberpunkPractice
