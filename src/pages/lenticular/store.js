import create from 'zustand'

const colorConstants = {
	saekdongColors: ['#ffffff', '#293985', '#b83280', '#f2d44a', '#67213d', '#408f4f', '#c03435'],
	saekdongColors2: ['#ffffff', '#002df8', '#ff269d', '#ffe900', '#920061', '#10cd48', '#fa203c'],
	saekdongColors3: ['#ffffff', '#1a3699', '#c81787', '#ffc428', '#843b97', '#0eab50', '#e71739'],
}

const stickConstants = {
	numSticks: 100,
	stickWidth: 0.5,
	stickHeight: 30,
	rotationDelta: Math.PI/2,
}

const constants = {
	colorConstants,
	stickConstants
}

const useStore = create(set => ({
  lastClickedIndex: 0,
  setClickedIndex: (val) => set({ lastClickedIndex: val }),

  lenticularTweenProgress: 0,
  setLenticularTweenProgress: (val) => set({lenticularTweenProgress: val}),

  lenticularTweenProgress: 0,
  setLenticularTweenProgress: (val) => set({lenticularTweenProgress: val}),

  isLenticularTweenScrollingDown: 1,
  setIsLenticularTweenScrollingDown: (val) => set({isLenticularTweenScrollingDown: val > 0}),
}))

export {constants, useStore}