import * as THREE from 'three'
import React, { useEffect, useState, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {ScrollToPlugin} from 'gsap/ScrollToPlugin'

import {constants, useStore} from './store.js'


// const Section = () => {
// 	return (
// 		</>
// 	)
// }

const Page = ({ canvasRef }) => {
	const introSectionRef = useRef(null)
	const contentSectionRef = useRef(null)
	const mousePosRef = useRef({})

	// Global var -- lenticular 
	const setLenticularTweenProgress = useStore(state => state.setLenticularTweenProgress)
	const setIsLenticularTweenScrollingDown = useStore(state => state.setIsLenticularTweenScrollingDown)

	// Global var -- sections
	const [currentPageType, currentBkgColor] = useStore(state => [state.currentPageType, state.currentBkgColor])
	const setCurrentPageTypeWithMouseXPos = useStore(state => state.setCurrentPageTypeWithMouseXPos)

	// For page switching
  	const PageTypeEnum = constants.PageTypeEnum

	// Section styles
	const introSectionStyle = {
	  width: '100%',
	  height: '200vh',  
	  position: 'relative',
	  backgroundColor: 'black',
	  opacity: '0.5',
	}

	const contentSectionStyle = {
	  width: '100%',
	  height: '500vh',  
	  position: 'relative',
	}
	const [contentBkgColor, setContentBkgColor] = useState('#ffc428')

	const onMouseMove = (e) => {
	    let mouseX = THREE.MathUtils.clamp(e.clientX / window.innerWidth, 0, 1) 
	    let mouseY = THREE.MathUtils.clamp(e.clientY / window.innerHeight, 0, 1) 
	    mousePosRef.current.x = mouseX
	    mousePosRef.current.y = mouseY
	}

	const updateGlobalTweenInfo = (progress, direction) => {
		setLenticularTweenProgress(progress)
		setIsLenticularTweenScrollingDown(direction > 0) 
	}

	const onEnter = (scroller, direction, goalPoint) => {
		// Initiate scroll down
		if (direction > 0) {
			// If we had changed sides...
			setCurrentPageTypeWithMouseXPos(mousePosRef.current.x)
			setContentBkgColor(currentBkgColor) //Update page type.
		}

		// Auto scroll to next or previous section
		gsap.to(scroller, {
		    scrollTo: {
		    	y: goalPoint,
		    	autoKill:false
		    },
		    duration: 0.75,
		    overwrite: true,
		    ease: 'power1.out'
		  });
	}

	useEffect(() => {
		document.addEventListener('mousemove', onMouseMove)
		gsap.registerPlugin(ScrollToPlugin);
		gsap.registerPlugin(ScrollTrigger);

		ScrollTrigger.create({
		  trigger: introSectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onUpdate: ({progress, direction}) => {
          	setLenticularTweenProgress(progress)
			setIsLenticularTweenScrollingDown(direction > 0) 
          },
          onEnter: ({scroller, end}) => onEnter(scroller, 1, end+1),
          onEnterBack: ({scroller, start}) => onEnter(scroller, -1, 0),
		})

	    gsap.to(
		      introSectionRef.current,
		      {
		        opacity: 1,
		        scrollTrigger: {
		          trigger: introSectionRef.current,
		          start: "top top",
		          end: "bottom top",
		          scrub: true
		        },
		      })

	},[])

	return (
	<div>
		<div ref={introSectionRef} style={introSectionStyle}>
			INITIAL BACKGROUND COLOR.
		</div>
		<div ref={contentSectionRef} style={{...contentSectionStyle, backgroundColor: contentBkgColor}}>
			SECTION 2
		</div>
	</div>
	)
}

export default Page
