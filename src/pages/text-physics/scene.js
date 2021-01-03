import React, {useEffect, useRef} from 'react'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import C from 'cannon'

let state = {
	distance: 15,
}

const Rectangle = class {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
  area() {
    return this.height * this.width;
  }
};

const Menu = class {

	constructor(scene, physicsWorld, camera) {
		this.scene = scene
		this.physicsWorld = physicsWorld
		this.camera = camera

		this.words = []
		this.navItems = [...document.querySelectorAll('.mainNav a')] // Array of DOM elements.

		// Physics constants
		this.margin = 6 // y offset between each element.
		this.totalMass = 1 // constant to keep same total mass on each word.
		this.mouse = new THREE.Vector2()
		this.raycaster = new THREE.Raycaster()

		// Bind events
		document.addEventListener('click', () => {this.onClick()})
		window.addEventListener('mousemove', (e) => {this.onMouseMove(e)})

		this.totalOffset = this.navItems.length * this.margin * 0.5

		const loader = new THREE.FontLoader()
		const fontURL = 'fonts/Spoqa Han Sans Neo Bold_Bold.json'
		loader.load(fontURL, (font) => {
			this.addMenuItems(font)
		})
	}

	onMouseMove(e) {
		// We set normalized coordinate of the mouse
		this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
		this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
	}

	// Punch on click!
	onClick() {
		// Update the picking ray with the camera and mouse position
		this.raycaster.setFromCamera(this.mouse, this.camera)

		// Calculate objects intersecting the picking ray
		// It will return an array with intersecting objects
		const intersects = this.raycaster.intersectObjects(
			this.scene.children,
			true
		)

		if (intersects.length > 0) {
			let {object, face} = intersects[0]
			if (!object.isMesh) return

			// Global force applied on click
			const force = 25
			let impulse = new THREE.Vector3().copy(face.normal).negate().multiplyScalar(force)

			this.words.forEach((word, i) => {
				word.children.forEach((letter) => {
					if (letter !== object) return

					// only for the letter that was hit..
					letter.body.applyLocalImpulse(impulse, new C.Vec3())
				})
			})
		}
	}

	addMenuItems(font) {
		const fontOption = {
			font,
			size: 3,
			height: 0.4, 
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 0.9,
			bevelSize: 0, 
			bevelOffset: 0,
			bevelSegments: 12,
		}
		// friction
		let groundMat = new C.Material()
		let letterMat = new C.Material()
		let contactMaterial = new C.ContactMaterial(groundMat, letterMat, {
			friction: 0.01
		})
		this.physicsWorld.addContactMaterial(contactMaterial)

		// For each Menu Item			
		this.navItems.reverse().forEach((item, i) => {
			const innerText = item.innerText
			const itemWords = new THREE.Group()
			itemWords.letterOff = 0

			itemWords.ground = new C.Body({
				mass: 0,
				shape: new C.Box(new C.Vec3(50, 0.1, 50)),
				position: new C.Vec3(0, i * this.margin - this.totalOffset, 0),
				material: groundMat
			})
			this.physicsWorld.addBody(itemWords.ground)

			// For each letter in one menu item
			let letters = [...innerText]
			letters.forEach((letter) => {
				let material = new THREE.MeshPhongMaterial({color:0x97df5e})
				let geometry = new THREE.TextBufferGeometry(letter, fontOption)

				geometry.computeBoundingBox()
				geometry.computeBoundingSphere()

				let mesh = new THREE.Mesh(geometry, material)
				mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3())

				// Use this accumulator to get offset of each letter.
				itemWords.letterOff += mesh.size.x

				// Create thes hape of our letter 
				// Scsale down geometry because of Box's Cannon class setup.
				let rigidBodyBox = new C.Box(new C.Vec3().copy(mesh.size).scale(0.5))

				// Attach the rigidbody to mesh
				let letterBodyPosY = (this.navItems.length - i - 1) * this.margin - this.totalOffset
				mesh.body = new C.Body({
					mass: this.totalMass / innerText.length,
					position: new C.Vec3(itemWords.letterOff, letterBodyPosY, 0),
					material: letterMat
				})

				// Add shape to body and offset it to the center of our mesh.
				const center = mesh.geometry.boundingSphere.center
				mesh.body.addShape(rigidBodyBox, new C.Vec3(center.x, center.y, center.z))

				this.physicsWorld.addBody(mesh.body)
				itemWords.add(mesh)
			})
			// Recenter each body based on the whole string.
			itemWords.children.forEach((letter) => {
				letter.body.position.x -= letter.size.x + itemWords.letterOff * 0.5
			})

			this.words.push(itemWords)
			this.scene.add(itemWords)
		})
		this.setConstraints()
	}

	setConstraints() {
		this.words.forEach((word) => {
			for (let i = 0; i < word.children.length; i++) {
				let letter = word.children[i]
				let nextLetter = i === word.children.length - 1 ? null : word.children[i+1]
				if (!nextLetter) { continue } 

				// Choose ConeTwistConstraint because it's more rigid than other constraints
				let c = new C.ConeTwistConstraint(letter.body, nextLetter.body, {
					pivotA: new C.Vec3(letter.size.x, 0, 0),
					pivotB: new C.Vec3(0, 0, 0)
				})

				c.collideConnected = true //optional 
				this.physicsWorld.addConstraint(c)
			}
		})
	}

	updateMenu() {
		if (!this.words) return

		// Sync THREE geometry position to World body position
		this.words.forEach((word) => {
			word.children.forEach((letter) => {
				letter.position.copy(letter.body.position)
				letter.quaternion.copy(letter.body.quaternion)
			})
		})
	}
}


const Scene = () => {

	const mount = useRef(null)

	let setup = () => {
		// Cannon Physics Scene
		let physicsWorld = new C.World()
		physicsWorld.gravity.set(0, -50, 0)

		// THREE.js Scene
		let scene = new THREE.Scene()
		scene.fog = new THREE.Fog(0x202533, -1, 100)

		// Camera
		let aspect = mount.current.clientWidth / mount.current.clientHeight;
		let camera = new THREE.OrthographicCamera(-state.distance * aspect, state.distance * aspect, state.distance , -state.distance, -1, 100)
		camera.position.set(-10, 10, 10)
		camera.lookAt(new THREE.Vector3())

		// Renderer
		let renderer = new THREE.WebGLRenderer({antialias: true})
		renderer.setClearColor(0x888888)
		renderer.setSize(mount.current.clientWidth, mount.current.clientHeight)
		renderer.setPixelRatio(mount.current.devicePixelRatio)
		mount.current.appendChild(renderer.domElement)

		// Controls
		let controls = new OrbitControls(camera, renderer.domElement)

		// Lighting
		scene.add(new THREE.AmbientLight(0xcccccc))
		let directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
		directionalLight.position.set(5, 5, 20)
		scene.add(directionalLight)

		// Resize
		let onResize = () => {
			mount.current.clientWidth < 640 ? (camera.position.z = 250) : (camera.position.z = state.zoom)
			camera.aspect = mount.current.clientWidth / mount.current.clientHeight
			camera.updateProjectionMatrix()
			renderer.setSize(mount.current.clientWidth, mount.current.clientHeight)
		}
		window.addEventListener('resize', onResize)

		let menu = new Menu(scene, physicsWorld, camera)

		// Final rendering loop
		let draw = () => {
			physicsWorld.step(1/60)
			menu.updateMenu()
			requestAnimationFrame(draw)
			controls.update()
			renderer.render(scene, camera)
		}
		draw()
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
						<a href='#' className='mainNav__link'>황지희</a>
					</li>
					<li className='mainNav__el'>
						<a href='#' className='mainNav__link'>ONLY</a>
					</li>
					<li className='mainNav__el'>
						<a href='#' className='mainNav__link'>THIS</a>
					</li>
				</ul>
			</nav>
		</>
	)
}

export default Scene