import React from "react"
import { Canvas } from 'react-three-fiber'

import '../styles/threepractice.scss'

const App = () => {
  return (
    <Canvas>
      <mesh>
        <boxBufferGeometry attach="geometry" args={1,1,1} />
        <meshBasicMaterial attach="material" color="pink" />
      </mesh>
    </Canvas>
  )
}


export default App
