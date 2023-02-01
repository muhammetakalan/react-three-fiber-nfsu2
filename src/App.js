import * as THREE from 'three'
import { useState, useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  useGLTF,
  Environment,
  Lightformer,
  ContactShadows
} from '@react-three/drei'
import { useControls } from 'leva'

export default function App() {
  const [audio, setAudio] = useState(new Audio('SnoopDogg.mp3'))
  const { color, raughness, metalness } = useControls({
    color: { value: '#ffffff', label: 'Color' },
    raughness: { value: 0, min: -1, max: 1, label: 'Raughness' },
    metalness: { value: 0, min: -1, max: 1, label: 'Metalness' }
  })

  useEffect(() => {
    const colorAudio = new Audio('color.mp3')
    colorAudio.play()
  }, [color])

  function Lights() {
    const group = useRef()
    const position = [2, 0, 2, 0, 2, 0, 2, 0]

    useFrame((state, delta) => {
      if ((group.current.position.z += delta * 15) > 20) {
        group.current.position.z = -45
      }
    })

    return (
      <Environment frames={Infinity} resolution={256}>
        <group ref={group}>
          {position.map((x, i) => (
            <Lightformer
              key={i}
              form="circle"
              intensity={4}
              rotation={[Math.PI / 2, 0, 0]}
              position={[x, 4, i * 4]}
              scale={[2, 0.5, 0]}
            />
          ))}
        </group>

        <Lightformer
          form="circle"
          intensity={10}
          rotation={[2.5, 0, 0]}
          position={[0, 2, 3]}
        />
        <Lightformer
          form="circle"
          intensity={10}
          rotation={[4, -2, 0]}
          position={[3, 2, -1]}
        />
        <Lightformer
          form="circle"
          intensity={10}
          rotation={[4, 2, 0]}
          position={[-3, 2, -1]}
        />
      </Environment>
    )
  }

  function Model(props) {
    const { nodes, materials } = useGLTF('porsche.glb')

    materials['Material.006'].setValues({
      color: props.color,
      roughness: props.raughness,
      metalness: props.metalness
    })

    return <primitive object={nodes.Scene} />
  }

  function CameraRig({ v = new THREE.Vector3() }) {
    return useFrame((state) => {
      const t = state.clock.elapsedTime

      state.camera.position.lerp(
        v.set(
          Math.sin(t * 0.1) * 6,
          Math.sin(t * 0.2) * 1 + 1.5,
          Math.cos(t * 0.1) * 4
        ),
        0.1
      )

      state.camera.lookAt(0, 0, 0)
    })
  }

  return (
    <>
      <img className="nfsu2" src="nfsu2.png" />
      <Canvas
        camera={{ fov: 25 }}
        onClick={() => {
          audio.play()
          audio.loop = true
          audio.volume = 0.2
        }}
      >
        <Lights />

        <Model color={color} raughness={raughness} metalness={metalness} />

        <ContactShadows />

        <mesh position={[0, -0.0001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial
            map={useMemo(() => {
              const texture = new THREE.TextureLoader().load('road.jpg')
              texture.anisotropy = 16
              return texture
            }, [])}
          />
        </mesh>

        <CameraRig />
      </Canvas>
    </>
  )
}
