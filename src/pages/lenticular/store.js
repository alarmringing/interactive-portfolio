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

const PageTypeEnum = {ABOUT:1, PROJECTS:2, THIRD:3, FOURTH:4}

const constants = {
	colorConstants,
	stickConstants,
	PageTypeEnum
}

const useStore = create((set, get) => ({
  lastClickedStickIndex: 0,
  setClickedStickIndex: (val) => set({ lastClickedStickIndex: val }),

  globalStickTargetRotation: [0, Math.PI/4, 0],
  setGlobalStickTargetRotation: (val) => set({ globalStickTargetRotation: val }),
  advanceGlobalStickTargetYRotation: (rotationDelta) => {
	  set(state => {
	  	let prevR = state.globalStickTargetRotation
	    return {
	      ...state,
	      globalStickTargetRotation: [prevR[0], prevR[1] + rotationDelta, prevR[2]]
	    }
	  })
	},

  introScrollTrigger: {start: 0, end: 100, scroller:{}},
  setIntroScrollTrigger: (startPoint, endPoint, scroller) => set({
  	introScrollTrigger: {start: startPoint, end: endPoint, scroller: scroller}}),

  isLenticularTweenScrollingDown: 1,
  setIsLenticularTweenScrollingDown: (val) => set({isLenticularTweenScrollingDown: val > 0}),

  currentPageType: PageTypeEnum.ABOUT,
  setCurrentPageTypeWithMouseXPos: (mouseXPos) => {
  	let currentYRot = get().globalStickTargetRotation[1] % (Math.PI*2)
 	const delta = (mouseXPos < 0.5) ? -Math.PI/4 : Math.PI/4
 	const pageTypeInd = Math.round(((currentYRot + delta) / (Math.PI/2))) + 1
  	set({currentPageType: pageTypeInd})
  },
  colorToBkgColorMapping: (val) => {
  	let colorId = 0
  	switch(val){
  		case(PageTypeEnum.ABOUT):
  			colorId = 3
  			break
  		case(PageTypeEnum.PROJECTS):
  			colorId = 6
  			break
  		case(PageTypeEnum.THIRD):
  			colorId = 1
  			break
  		case(PageTypeEnum.FOURTH):
  			colorId = 2
  			break
  	}
  	return(colorConstants.saekdongColors3[colorId])
  },
  currentBkgColor: () => {
  	return get().colorToBkgColorMapping(get().currentPageType)
  },
  currentTextPrimaryColor: () => {
  	let nextPageTypeColor = (get().currentPageType + 1) % 4
  	return get().colorToBkgColorMapping(nextPageTypeColor)
  }
}))

export {constants, useStore}