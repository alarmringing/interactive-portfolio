
import {createRef} from 'react'
import create from 'zustand'

const useStore = create(set => ({
  sections: 3,
  pages: 3,
  zoom: 75,
  aspect: 1.75,
  images: ['img/flavor_wheel.jpg', 'img/jumbotron.jpg'],
  top: createRef(),
}))

export default useStore
