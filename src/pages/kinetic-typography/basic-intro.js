
import React, {useEffect, useRef} from 'react'
import create from 'zustand'

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import MSDFShader from './MSDFShader.js'
import loadFont from 'load-bmfont'

import {vert, frag} from './shaders.js'

global.THREE = require('three')
const THREE = global.THREE
const createGeometry = require("three-bmfont-text");

const screenBkgColor =   0xBE80FF
const textBkgColor = 0xCCFF00 
const textColor = 0xFF0066

const useStore = create(set => ({
  word: 'NEW YEAR, NEW DAYS',
  position: [-0.965, 0, 0],
  rotation: [Math.PI, 0, 0],
  zoom: 100,
}))

const Scene = () => {

	const state = useStore()
	const mount = useRef(null)

	useEffect(() => {
		let scene = new THREE.Scene()

		let camera = new THREE.PerspectiveCamera(75, mount.current.clientWidth, mount.current.clientHeight, 0.1, 1000)
		camera.position.z = state.zoom

		let renderer = new THREE.WebGLRenderer({antialias: true})
		renderer.setClearColor(screenBkgColor)
		renderer.setSize(mount.current.clientWidth, mount.current.clientHeight)
		renderer.setPixelRatio(mount.current.devicePixelRatio)
		mount.current.appendChild(renderer.domElement)

		let controls = new OrbitControls(camera, renderer.domElement)
		let clock = new THREE.Clock()

		let onResize = () => {
			let w = mount.current.clientWidth
			let h = mount.current.clientHeight
			w < 640 ? (camera.position.z = 250) : (camera.position.z = state.zoom)
			camera.aspect = w / h
			camera.updateProjectionMatrix()
			renderer.setSize(w, h)
		}
		window.addEventListener('resize', onResize)

		// Create render target
		let rt = new THREE.WebGLRenderTarget(mount.current.clientWidth, mount.current.clientHeight);
		let rtCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
		rtCamera.position.z = 4.5

		let rtScene = new THREE.Scene()
		rtScene.background = new THREE.Color(textBkgColor)


		// load font files
		let loadBMF = () => {
			let geometry
			loadFont('fonts/Lato-Black.fnt', (err, font) => {
				let fontGeometry = createGeometry({
					font: font,
					text: state.word
				})
				let loader = new THREE.TextureLoader()
				loader.load(`fonts/Lato-Black.png`, (texture) => {
					setTimeout(() => {
						let fontMaterial = new THREE.RawShaderMaterial(
												MSDFShader({
													map: texture,
													color: textColor,
													side: THREE.DoubleSide,
													transparent: true,
													negate: false
												}))
						populateRenderTarget(fontGeometry, fontMaterial)
						createSceneMesh()
						onResize()
						animate()
					}, 1500)
				})
			})
		}
		loadBMF()



		let populateRenderTarget = (fontGeometry, fontMaterial) => {
			let textMesh = new THREE.Mesh(fontGeometry, fontMaterial)

			textMesh.position.set(-1.6, -0.275, 0)
			textMesh.rotation.set(Math.PI, 0, 0)
			textMesh.scale.set(0.008, 0.02, 1)

			rtScene.add(textMesh)
		}

		let mesh, geometry, material
		let createSceneMesh = () => {
			//geometry = new THREE.BoxGeometry(1, 1, 1); // Cube
			geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16 );

			material = new THREE.ShaderMaterial({
				vertexShader:vert,
				fragmentShader:frag,
				transparent: true,
				uniforms: {
					uTime: {value: 0},
					uTexture: {value: rt.texture}
				}
			})

			mesh = new THREE.Mesh(geometry, material)
			// scene.add(new THREE.DirectionalLight( 0xffffff, 0.5 ));
			scene.add(mesh)
		}

		/*
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
		}
		*/

		let animate = () => {
			requestAnimationFrame(animate)
			renderScene()
		}

		let renderScene = () => {
			controls.update()
			material.uniforms.uTime.value = clock.getElapsedTime()

			mesh.rotation.x += 0.004
			mesh.rotation.z += 0.006

			renderer.setRenderTarget(rt)
			renderer.render(rtScene, rtCamera)

			renderer.setRenderTarget(null)
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