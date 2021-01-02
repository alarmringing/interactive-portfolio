import React, {useEffect, useRef} from 'react'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

let state = {
	distance: 15,
}


const Scene = () => {

	const mount = useRef(null)

	let setup = () => {
		let scene = new THREE.Scene()
		scene.fog = new THREE.Fog(0x202533, -1, 100)

		// Camera
		let aspect = mount.current.clientWidth / mount.current.clientHeight;
		let camera = new THREE.OrthographicCamera(-state.distance * aspect, state.distance * aspect, state.distance , -state.distance, -1, 100)
		camera.position.set(-10, 10, 10)
		camera.lookAt(new THREE.Vector3())
		//camera.position.z = state.zoom

		let renderer = new THREE.WebGLRenderer({antialias: true})
		renderer.setClearColor(0x888888)
		renderer.setSize(mount.current.clientWidth, mount.current.clientHeight)
		renderer.setPixelRatio(mount.current.devicePixelRatio)
		mount.current.appendChild(renderer.domElement)

		let controls = new OrbitControls(camera, renderer.domElement)

		// Lighting
		scene.add(new THREE.AmbientLight(0xcccccc))
		let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
		directionalLight.position.set(5, 5, 20)
		scene.add(directionalLight)

		let onResize = () => {
			mount.current.clientWidth < 640 ? (camera.position.z = 250) : (camera.position.z = state.zoom)
			camera.aspect = mount.current.clientWidth / mount.current.clientHeight
			camera.updateProjectionMatrix()
			renderer.setSize(mount.current.clientWidth, mount.current.clientHeight)
		}
		window.addEventListener('resize', onResize)

		addMenuItems(scene)

		let animate = () => {
			requestAnimationFrame(animate)
			renderScene()
		}
		let renderScene = () => {
			controls.update()
			renderer.render(scene, camera)
		}
		animate()
	}

	let addMenuItems = (scene) => {
		console.log("addMenuItems working")
		let navItems = [...document.querySelectorAll('.mainNav a')] // Array of DOM elements.

		let loader = new THREE.FontLoader()
		let words = []
		const fontURL = 'fonts/GmarketSansMedium_Regular.json'
		loader.load(fontURL, (font) => {
			const fontOption = {
				font,
				size: 3,
				height: 0.4, 
				curveSegments: 24,
				bevelEnabled: true,
				bevelThickness: 0.9,
				bevelSize: 0.3, 
				bevelOffset: 0,
				bevelSegments: 10,
			}
			console.log("Font has bee nloaded")
			navItems.reverse().forEach((item) => {
				const innerText = item.innerText
				const itemWords = new THREE.Group()
				let letters = [...innerText]
				letters.forEach((letter) => {
					let material = new THREE.MeshPhongMaterial({color:0x97df5e})
					let geometry = new THREE.TextBufferGeometry(letter, fontOption)
					itemWords.add(new THREE.Mesh(geometry, material))
				})
				words.push(itemWords)
				scene.add(itemWords)
			})

		})

	}

	useEffect(() => {
		setup()
	}, [])

	return(
		<>
			<div ref={mount} style={{width: '100vw', height:'100vh'}} />
			<nav className='mainNav' style={{width:0, height:0}}>
				<ul className='mainNav__list'>
					<li className='mainNav__el'>
						<a href='#' className='mainNav__link'>Candies</a>
					</li>
					<li className='mainNav__el'>
						<a href='#' className='mainNav__link'>Chocolate</a>
					</li>
					<li className='mainNav__el'>
						<a href='#' className='mainNav__link'>Caramel</a>
					</li>
				</ul>
			</nav>
		</>
	)
}

export default Scene