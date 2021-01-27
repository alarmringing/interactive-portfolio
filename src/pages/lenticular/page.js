import React, { useEffect, useState, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {ScrollToPlugin} from 'gsap/ScrollToPlugin'

import useStore from './store.js'

// const Section = () => {
// 	return (
// 		</>
// 	)
// }

const Page = ({ canvasRef }) => {
	const introSectionRef = useRef(null)
	const contentSectionRef = useRef(null)

	const setLenticularTweenProgress = useStore(state => state.setLenticularTweenProgress)
	const setIsLenticularTweenScrollingDown = useStore(state => state.setIsLenticularTweenScrollingDown)

	const updateGlobalTweenInfo = (progress, direction) => {
		setLenticularTweenProgress(progress)
		setIsLenticularTweenScrollingDown(direction > 0) 
	}

	const autoScrollToSection = (scroller, direction, goalPoint) => {
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
		gsap.registerPlugin(ScrollToPlugin);
		gsap.registerPlugin(ScrollTrigger);

		ScrollTrigger.create({
		  trigger: introSectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onUpdate: ({progress, direction}) => updateGlobalTweenInfo(progress, direction),
          onEnter: ({scroller, end}) => autoScrollToSection(scroller, 1, end+1),
          onEnterBack: ({scroller, start}) => autoScrollToSection(scroller, 0, 0),
          //snap: {snapTo: [0, 1], delay: 0.2, duration:{min: 0.2, max: 0.5}}
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

	const introSectionStyle = {
	  width: '100%',
	  height: '150vh',  
	  position: 'relative',
	  backgroundColor: 'black',
	  opacity: '0.5',
	}

	const contentSectionStyle = {
	  width: '100%',
	  height: '500vh',  
	  position: 'relative',
	  backgroundColor:'#ffc428'
	}

	return (
	<div>
		<div ref={introSectionRef} style={introSectionStyle}>
			INITIAL BACKGROUND COLOR.
		</div>
		<div ref={contentSectionRef} style={contentSectionStyle}>
			SECTION 2
		</div>
	</div>
	)
}

export default Page
