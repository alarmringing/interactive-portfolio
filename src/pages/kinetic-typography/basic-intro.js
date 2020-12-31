
import React, {useEffect, useRef} from 'react'
import create from 'zustand'

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import MSDFShader from './MSDFShader.js'
import loadFont from 'load-bmfont'

global.THREE = require('three')
const THREE = global.THREE
const createGeometry = require("three-bmfont-text");

const useStore = create(set => ({
  word: 'Sample Word',
  position: [-80, 0, 0],
  rotation: [Math.PI, 0, 0],
  zoom: 150
}))

const Scene = () => {

	const state = useStore()
	const mount = useRef(null)

	useEffect(() => {
		let scene = new THREE.Scene()

		let camera = new THREE.PerspectiveCamera(75, window.innerWidth, window.innerHeight, 0.1, 1000)
		camera.position.z = state.zoom

		let renderer = new THREE.WebGLRenderer({antialias: true})
		renderer.setClearColor('#995599')
		renderer.setSize(mount.current.innerWidth, mount.current.innerHeight)
		renderer.setPixelRatio(mount.current.devicePixelRatio)
		mount.current.appendChild(renderer.domElement)

		let controls = new OrbitControls(camera, renderer.domElement)

		let onResize = () => {
			let w = mount.current.clientWidth
			let h = mount.current.clientHeight
			w < 640 ? (camera.position.z = 250) : (camera.position.z = state.zoom)
			camera.aspect = w / h
			camera.updateProjectionMatrix()
			renderer.setSize(w, h)
		}
		window.addEventListener('resize', onResize)

		// load font files
		
		let loadBMF = () => {
			let geometry
			loadFont('fonts/Lato-Black.fnt', (err, font) => {
				geometry = createGeometry({
					font: font,
					text: state.word
				})
				let loader = new THREE.TextureLoader()
				loader.load(`fonts/Lato-Black.png`, (texture) => {
					setTimeout(() => {
						setupMesh(geometry, texture)
					}, 1500)
				})
			})
		}

		loadBMF()

		let setupMesh = (geometry, texture) => {
			// Material
			let material = new THREE.RawShaderMaterial(
				MSDFShader({
					map: texture,
					color: 0x000000,
					side: THREE.DoubleSide,
					transparent: true,
					negate: false
				}))
			// Mesh
			console.log("Geometry looks like ", geometry)
			let mesh = new THREE.Mesh(geometry, material)
			mesh.position.set(state.position[0], state.position[1], state.position[2])
			mesh.rotation.set(state.rotation[0],state.rotation[1],state.rotation[2])
			scene.add(mesh)

			onResize()
			animate()
		}

		let animate = () => {
			requestAnimationFrame(animate)
			renderScene()
		}

		let renderScene = () => {
			renderer.render(scene, camera)
		}

		// Used for cleanup.
		return() => {
			window.removeEventListener('resize', onResize)
			mount.current.removeChild(renderer.domElement)
		}

	}, []) // Empty array here makes useEffect run only once upon initialization.

	return (
		<>
			test
			<div ref={mount} style={{width: '100vw', height:'100vh'} } /> 
		</>
	)
}

export default Scene