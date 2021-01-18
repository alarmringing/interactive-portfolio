import * as THREE from 'three'
import React, { Suspense, useRef, useEffect, useLayoutEffect, useState } from "react"
import { Canvas, useFrame, useThree, extend } from 'react-three-fiber'
import { Html, Stats, useTexture } from '@react-three/drei'
import lerp from 'lerp'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

import './lenticularShader.js'


extend({ OrbitControls })

const saekdongColors = ['#ffffff', '#293985', '#b83280', '#f2d44a', '#67213d', '#408f4f', '#c03435']
const saekdongColors2 = ['#ffffff', '#002df8', '#ff269d', '#ffe900', '#920061', '#10cd48', '#fa203c']
const saekdongColors3 = ['#ffffff', '#1a3699', '#c81787', '#ffc428', '#843b97', '#0eab50', '#e71739']

const NUM_STICKS = 45
const STICK_WIDTH = 1
const STICK_HEIGHT = 30

// Or a default orthographic camera if Canvas.orthographic is true:
// near: 0.1, far: 1000, position.z: 5

const Stick = ({index, numSticks, textures, destRotation}) => {
  const stickRef = useRef()
  const material = useRef()
  const width = STICK_WIDTH
  const height = STICK_HEIGHT

  const totalSticksWidth = width * Math.sqrt(2) * numSticks

  const {gl} = useThree()

  // Constructor
  useEffect(() => {

    let positionX = -(totalSticksWidth/2) + index * width * Math.sqrt(2)
    stickRef.current.position.set(positionX, 0, 0)

    // let faces = stickRef.current.geometry.faces
    // for(let i = 0; i < faces.length; i++) {
    //   let index = Math.floor(i/2) % saekdongColors.length
    //   let color = saekdongColors2[index]
    //   faces[i].color.set(color)
    // }
    // stickRef.current.geometry.colorsNeedUpdate = true

    stickRef.current.geometry.setAttribute("side", new THREE.Float32BufferAttribute([
      0, 0, 0, 0, 
      1, 1, 1, 1, 
      2, 2, 2, 2, 
      3, 3, 3, 3, 
      4, 4, 4, 4, 
      5, 5, 5, 5
    ], 1));

    stickRef.current.rotation.set(...destRotation);
    //stickRef.current.material.color.set('green')
  }, [])


  useFrame(() => {
    let destQuaternion = new THREE.Quaternion();
    destQuaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), destRotation[1]);

    if (!stickRef.current.rotation.equals(destRotation)) {
        stickRef.current.quaternion.slerp(destQuaternion, 0.1);
    }

/*
    if(timeUntilRotate >= 0) {
      setTimeUntilRotate(timeUntilRotate - clock.getDelta())
    } else {
      if (!stickRef.current.rotation.equals(destRotation)) {
        stickRef.current.quaternion.slerp(destQuaternion, 0.1);
      }
    }
    */

  //   setRotation(rotation => [0, rotation[1] + 0.01, 0])
  //   stickRef.current.rotation.set(...rotation);
  })



  return (
    <mesh ref={stickRef} receiveShadow>
      <boxBufferGeometry attach="geometry" args={[width, height, width] } />
      <customMaterial ref={material} attach='material' index={index} numSticks={numSticks} textures={textures}/>
    </mesh>
  )
}
//      <meshPhysicalMaterial attach="material" vertexColors={THREE.FaceColors} />


const Controls = () => {
  const MIN_POLAR_ANGLE = Math.PI*2.5/8
  const MAX_POLAR_ANGLE = Math.PI*5.5/8
  const MIN_AZIMUTH_ANGLE = -Math.PI / 4
  const MAX_AZIMUTH_ANGLE = Math.PI / 4

  const dampingFactor = 0.05
  const zoom = 40
  const fov = 380

  const target = new THREE.Vector3(0, 0, 0)
  const [spherical,] = useState(new THREE.Spherical());
  const [sphericalDelta,] = useState(new THREE.Spherical());

  const {
    camera,
    gl: { domElement }
  } = useThree()

  const onMouseMove = (e) => {
    let mouseX = e.pageX / window.innerWidth
    let mouseY = e.pageY / window.innerHeight 

    let rightAngle = MAX_AZIMUTH_ANGLE - (MAX_AZIMUTH_ANGLE - MIN_AZIMUTH_ANGLE) * mouseX
    let downAngle = MIN_POLAR_ANGLE + (MAX_POLAR_ANGLE - MIN_POLAR_ANGLE) * mouseY

    spherical.theta = rightAngle
    spherical.phi = downAngle
    spherical.makeSafe();
  }

  // Constructor
  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove)

    let initialPhi = MIN_POLAR_ANGLE + (MAX_POLAR_ANGLE - MIN_POLAR_ANGLE) * 0.5
    let initialTheta = MIN_AZIMUTH_ANGLE + (MAX_AZIMUTH_ANGLE - MIN_AZIMUTH_ANGLE) * 0.5
    spherical.set(zoom, initialPhi, initialTheta)

    // Camera setting
    camera.zoom = zoom
    camera.fov = fov

  }, [])

  const orbitCamera = () => {

    /*
    let newCameraPos = new THREE.Vector3()

    newCameraPos.setFromSpherical(spherical);
    camera.position.copy(newCameraPos)
    camera.updateProjectionMatrix()

    */

    // Setup
    let offset = new THREE.Vector3();

    // so camera.up is the orbit axis
    let quat = new THREE.Quaternion().setFromUnitVectors( camera.up, new THREE.Vector3( 0, 1, 0 ) );
    let quatInverse = quat.clone().invert();

    let position = camera.position;
    offset.copy(position).sub(target);

    // rotate offset to "y-axis-is-up" space
    offset.applyQuaternion( quat );

    // angle from z-axis around y-axis
    //spherical.setFromVector3(offset);

    // Rotate
    //spherical.theta += sphericalDelta.theta * dampingFactor;
    //spherical.phi += sphericalDelta.phi * dampingFactor;
    
    // Zoom
    //spherical.radius = scale;

    // Set
    offset.setFromSpherical(spherical);
    offset.applyQuaternion(quatInverse); // rotate offset back to "camera-up-vector-is-up" space
    position.copy(target).add(offset);
    camera.lookAt(target);
    camera.zoom = 1
    // Damping
    //sphericalDelta.theta *= ( 1 - dampingFactor );
    //sphericalDelta.phi *= ( 1 - dampingFactor );

    /*

    // update condition is:
    // min(camera displacement, camera rotation in radians)^2 > EPS
    // using small-angle approximation cos(x/2) = 1 - x^2 / 8

    if (lastPosition.distanceToSquared( scope.object.position ) > EPS ||
      8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

      scope.dispatchEvent( changeEvent );

      lastPosition.copy( scope.object.position );
      lastQuaternion.copy( scope.object.quaternion );
      zoomChanged = false;

      return true;

    }
    */
  }

  useFrame((state) => {
    orbitCamera()
  })

  // Default orthographic camera settings: near: 0.1, far: 1000, position.z: 5

  return (
    <pointLight intensity={0.25} position={[5, 0, 5]} />
  )
}

const Startup = () => {
  const ref = useRef()
  useFrame(() => (ref.current.material.opacity = lerp(ref.current.material.opacity, 0, 0.025)))
  return (
    <mesh ref={ref} position={[0, 0, 200]} scale={[100, 100, 1]}>
      <planeBufferGeometry attach='geometry' />
      <meshBasicMaterial attach='material' color='#ffffff' transparent />
    </mesh>
  )
}

const Sticks = () => {
  const numSticks = NUM_STICKS
  const [sticks, setSticks] = useState([])

  const loadedTextures = useTexture(['img/flavor_wheel.jpg', 'img/jumbotron.jpg'])
  let [img1, img2] = loadedTextures.map(texture => ((texture.minFilter = THREE.LinearFilter), texture))
  // First four or the sides of the stick. Last two are top and bottom.
  let textures = [img1, img2, img1, img2, 0, 0] 

  const {clock} = useThree()
  const [rotateStartIndex, setRotateStartIndex] = useState(0)
  const [indexToRotate, setIndexToRotate] = useState(-1)
  const [timeElapsedSinceRotateStart, setTimeElapsedSinceRotateStart] = useState(-1)
  const rotateDelayRate = 0.03
  const rotationDelta = Math.PI/4

  // Initializer
  useEffect(() => {
    for (let i = 0; i < numSticks; i++) {
      let newStick = {index:i, destRotation:[0, 0, 0]}
      setSticks( sticks => [...sticks, newStick]);
    }
    document.addEventListener('keypress', OnKeyPress)
    clock.stop()
  },[])

  const OnKeyPress = (e) => {
    // TODO(testing): when 'R' is pressed rotate the cubes for testing.
    if(e.code != 'KeyR') return
    clock.start()
    setIndexToRotate(rotateStartIndex)
  }

  useFrame(() => {
    if (!clock.running) return
    let newSticks = [...sticks]

    // Update the stick rotations when necessary.
    for (let i = indexToRotate; i < numSticks; i++) {
      if (i*rotateDelayRate < clock.getElapsedTime()) {
        newSticks[i].destRotation[1] += rotationDelta
        setIndexToRotate(i+1)
      } else break
    }
    setSticks(newSticks)
    if (indexToRotate == numSticks) {
      clock.stop()
      setIndexToRotate(rotateStartIndex)
    }
  })

  return (
    <>
      <ambientLight intensity={1} />
      <pointLight intensity={0.25} position={[5, 0, 5]} />
      <spotLight
        castShadow
        position={[-5, 2.5, 5]}
        intensity={0.25}
        penumbra={1}
      />
      <Controls />
      {sticks.map((stick) => {
         return (
             <Stick  
                     key={stick.index} 
                     index={stick.index} 
                     numSticks={numSticks} 
                     destRotation={stick.destRotation} 
                     textures={textures} />
         )
      })}
    </>
  )
}

const Scene = () => {
  return (
    <>
      <Stats
        showPanel={0} // Start-up panel (default=0)
        className="stats" // Optional className to add to the stats container dom element
      />
      <Canvas style={{height: '100vh', width: '100vw'}}       
              onCreated={({ gl, camera }) => {
                gl.setClearColor('#030303')
                //camera.far = 500
                //camera.near = -500
              }}>
      >
        <Suspense fallback={<Html center className='loading'> loading... </Html>}>
          <Sticks />
          <Startup />
        </Suspense>
      </Canvas>
    </>
  )
}

export default Scene
