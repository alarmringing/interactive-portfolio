import {createRef} from 'react'
import create from 'zustand'

const useStore = create(set => ({
  sections: 3,
  pages: 3,
  zoom: 75,
  top: createRef(),
}))

export default useStore
