import React, { useEffect, useState, useRef } from "react"
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import useStore from './store.js'

const Page = ({ canvasRef }) => {
	const ref = useRef(null)
	const controlsTween = useRef(null)
	const setLenticularTweenProgress = useStore(state => state.setLenticularTweenProgress)

	const updateCameraControls = () => {
		setLenticularTweenProgress(controlsTween.current.progress())
	}

	useEffect(() => {
		gsap.registerPlugin(ScrollTrigger);
		const element = ref.current
	    controlsTween.current = gsap.to(
				      {},
				      {
				        scrollTrigger: {
				          trigger: element.querySelector(".section2"),
				          start: "top bottom",
				          end: "top top",
				          scrub: true
				        },
				        onUpdate: updateCameraControls
				      })

	    gsap.to(
		      element.querySelector('.initialBkg'),
		      {
		        opacity: 1,
		        scrollTrigger: {
		          trigger: element.querySelector(".initialBkg"),
		          start: "top top",
		          end: "bottom top",
		          scrub: true
		        },
		      })

	},[])

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
	  backgroundColor:'#ffc428'
	}

	return (
	<div ref={ref}>
		<div style={introSectionStyle} className='initialBkg'>
			INITIAL BACKGROUND COLOR.
		</div>
		<div style={contentSectionStyle} className='section2'>
			SECTION 2
		</div>
	</div>
	)
}

export default Page
