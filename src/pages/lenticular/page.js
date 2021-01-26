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

	const updateCameraControls = () => {
		if (scrollTriggerRef.current) setLenticularTweenProgress(scrollTriggerRef.current.progress)
	}

	const autoScrollToSection = (scroller, direction, goalPoint) => {
		gsap.to(scroller, {
		    scrollTo: {y: goalPoint},
		    duration: 0.8,
		    ease: 'power1.out'
		  });
	}

	useEffect(() => {
		gsap.registerPlugin(ScrollToPlugin);
		gsap.registerPlugin(ScrollTrigger);

		ScrollTrigger.create({
		  trigger: contentSectionRef.current,
          start: "top bottom",
          end: "top top",
          scrub: true,
          onUpdate: updateCameraControls,
          onEnter: ({scroller, end}) => autoScrollToSection(scroller, 1, end),
          onEnterBack: ({scroller, start}) => autoScrollToSection(scroller, 0, 0),
          snap: {snapTo: [0, 1], delay: 0.2, duration:{min: 0.3, max: 0.8}}
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
	  height: '100vh',  
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
