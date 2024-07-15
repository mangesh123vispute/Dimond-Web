import "./App.css";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

const App = () => {
  const [color, setColor] = useState("#ffffff");
  return (
    <>
      <Canvas>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <OrbitControls enableZoom={false} />
        <DiamondModel path="diamond.glb" />
      </Canvas>
    </>
  );
};

const DiamondModel = ({ path }) => {
  const { scene } = useGLTF("./model8.glb");
  return <primitive object={scene} />;
};

export default App;
