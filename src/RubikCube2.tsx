import { Canvas, useFrame } from "@react-three/fiber";
import { Group, Box3, Vector3 } from "three";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import React, { useRef, useEffect } from "react";

function RubikModel(props: any) {
  const { scene } = useGLTF("./rubiks_cube4.glb") as { scene: Group };
  const groupRef = useRef<Group>(null); // Ref for the parent group

  // Center the model’s geometry on mount
  useEffect(() => {
    if (scene) {
      // Compute the bounding box to find the geometric center
      const box = new Box3().setFromObject(scene);
      const center = new Vector3();
      box.getCenter(center);

      // Log the center to debug
      console.log("Model center:", center);

      // Shift the scene so its geometric center is at [0, 0, 0]
      scene.position.sub(center);

      // Debug the scene hierarchy
      scene.traverse((child) => {
        console.log(`Child: ${child.name || child.type}, Position:`, child.position);
      });
    }
  }, [scene]);

  // Rotate the group (not the scene) to ensure rotation around [0, 0, 0]
  useFrame((state, delta) => {
    if (groupRef.current) {
      // groupRef.current.rotation.x += delta * 1; // Fan-like rotation on Y-axis
      // groupRef.current.rotation.y += delta * 1; // Fan-like rotation on Y-axis
      // groupRef.current.rotation.z += delta * 1; // Fan-like rotation on Y-axis
    }
  });

  return (
    <group ref={groupRef} {...props}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("./rubiks_cube4.glb");

export default function RubikCube() {
  return (
    <Canvas
      camera={{ position: [30, 10, 10], fov: 50 }}
      style={{ width: "100vw", height: "100vh", background: "#111" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />

      <RubikModel scale={1.5} position={[0, 0, 0]} />

      <OrbitControls enableZoom />
      <Environment preset="sunset" />
    </Canvas>
  );
}