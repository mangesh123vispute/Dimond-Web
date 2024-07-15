/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import "./App.css";
import * as THREE from "three";

import { Canvas, useLoader } from "@react-three/fiber";
import {
  useGLTF,
  MeshRefractionMaterial,
  AccumulativeShadows,
  RandomizedLight,
  Environment,
  Center,
  PresentationControls,
  OrbitControls,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { RGBELoader } from "three-stdlib";

function Ring({ map, ...props }) {
  const { nodes, materials } = useGLTF("/model8.glb");
  console.log("This is the nodes", nodes);
  console.log("This is the materials", materials);

  return (
    <group {...props} dispose={null}>
      {Object.keys(nodes).map((key) => {
        if (key.startsWith("Diamond_Round")) {
          return (
            <mesh key={key} geometry={nodes[key].geometry}>
              <MeshRefractionMaterial
                envMap={map}
                aberrationStrength={0.02}
                toneMapped={false}
              />
            </mesh>
          );
        } else {
          return (
            <mesh
              key={key}
              geometry={nodes[key].geometry}
              material={materials["perfect gold 2.002"]}
            >
              {/* Optionally, customize materials or add properties here */}
            </mesh>
          );
        }
      })}
    </group>
  );
}

export default function App() {
  const texture = useLoader(
    RGBELoader,
    "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/peppermint_powerplant_2_1k.hdr"
  );
  texture.mapping = THREE.EquirectangularReflectionMapping;

  return (
    <Canvas shadows camera={{ position: [15, 15, 15], fov: 75 }} dpr={[1, 2]}>
      <OrbitControls />
      <color attach="background" args={["#ffffff"]} />
      <ambientLight />
      <Environment map={texture} />
      <PresentationControls
        global
        config={{ mass: 1, tension: 250, friction: 25 }}
        snap={{ mass: 2, tension: 250, friction: 50 }}
        zoom={1.25}
        rotation={[0.5, 0.5, 0]}
        polar={[-Math.PI / 5, Math.PI / 4]}
        azimuth={[-Math.PI / 1.75, Math.PI / 4]}
      >
        <group position={[0, -3, 0]}>
          <Center position={[0, 0, 0]}>
            <Ring map={texture} scale={1} />
          </Center>
          <AccumulativeShadows
            temporal
            frames={100}
            alphaTest={0.95}
            opacity={1}
            scale={20}
          >
            <RandomizedLight
              amount={8}
              radius={10}
              ambient={0.5}
              position={[0, 10, -2.5]}
              bias={0.001}
              size={3}
            />
          </AccumulativeShadows>
        </group>
      </PresentationControls>
      <EffectComposer>
        <Bloom luminanceThreshold={1} intensity={0.85} levels={9} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
