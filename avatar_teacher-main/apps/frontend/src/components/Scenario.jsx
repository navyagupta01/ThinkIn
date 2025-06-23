import { CameraControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Avatar } from "./Avatar";

export const Scenario = () => {
  const cameraControls = useRef();

  useEffect(() => {
    // Move camera closer to avatar
    cameraControls.current.setLookAt(0, 1.8, 2.2, 0, 1.0, 0, true);
  }, []);

  return (
    <>
      <CameraControls ref={cameraControls} />

      {/* ✅ FIXED Lighting Setup */}
      <ambientLight intensity={0.8} />
      <directionalLight
        castShadow
        position={[2, 4, 2]} // coming from upper front-right
        intensity={1.5}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Floor Shadow (optional) */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
      >
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.2} />
      </mesh>

      {/* Avatar */}
      <Avatar position={[0, -0.5, 0]} scale={1.2} />
    </>
  );
};
