import React, { createContext, useRef, useContext} from 'react'
import { useThree, useFrame } from 'react-three-fiber'
import lerp from 'lerp'

import useStore from './state.js'

const offsetContext = createContext(0)

const Block = ({children, offset, factor, ...props}) => {
  console.log("Testing if block works")
  const ref = useRef()
  // Fetch parent offset and the height of a single section
  const { offset: parentOffset, sectionHeight } = useBlock()
  offset = offset !== undefined ? offset : parentOffset //offset is parentOffset if undefined

  const [top, zoom] = useStore(state => [state.top, state.zoom])
  console.log("Block was constructed, I think")

  // runs every frame and lerps the inner block into its place
  useFrame(() => {
    const curY = ref.current.position.y
    ref.current.position.y = lerp(curY, (top.current / zoom) * factor, 0.1)
  })

  return (
    <>
      Is something working?
      <offsetContext.Provider value={offset}>
        <group {...props} position={[0, -sectionHeight * offset * factor, 0]}>
          <group ref={ref}>{children}</group>
        </group>
      </offsetContext.Provider>
    </>
  )
}

const useBlock = () => {
  const [sections, pages] = useStore(state => [state.sections, state.pages])
  const { size, viewport } = useThree()
  const offset = useContext(offsetContext)
  const viewportWidth = viewport.width
  const viewportHeight = viewport.height
  const canvasWidth = viewportWidth
  const canvasHeight = viewportHeight
  const mobile = size.width < 700
  const margin = canvasWidth * (mobile ? 0.2 : 0.1)
  const contentMaxWidth = canvasWidth * (mobile ? 0.8 : 0.6)
  const sectionHeight = canvasHeight * ((pages - 1) / (sections - 1))
  return {
    viewport,
    offset,
    viewportWidth,
    viewportHeight,
    canvasWidth,
    canvasHeight,
    mobile,
    margin,
    contentMaxWidth,
    sectionHeight
  }
}

export {Block, useBlock}