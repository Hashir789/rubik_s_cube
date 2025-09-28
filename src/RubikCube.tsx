import { Canvas } from "@react-three/fiber";
import { Group, Box3, Vector3 } from "three";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import React, { useRef, useEffect, useState } from "react";

type RubikModelRef = {
  rotateXByStep: (angle?: number) => void;
  rotateYByStep: (angle?: number) => void;
  rotateZByStep: (angle?: number) => void;
  rotateNegXByStep: (angle?: number) => void;
  rotateNegYByStep: (angle?: number) => void;
  rotateNegZByStep: (angle?: number) => void;
  getRotation: () => { x: number; y: number; z: number };
};

function RubikModel(props: any, ref: React.Ref<RubikModelRef>) {
  const { scene } = useGLTF("./rubiks_cube4.glb") as { scene: Group };
  const groupRef = useRef<Group>(null);

  React.useImperativeHandle(ref, () => ({
    rotateXByStep: (angle: number = 0.2) => {
      if (groupRef.current) groupRef.current.rotation.x = angle;
    },
    rotateYByStep: (angle: number = 0.2) => {
      if (groupRef.current) groupRef.current.rotation.y = angle;
    },
    rotateZByStep: (angle: number = 0.2) => {
      if (groupRef.current) groupRef.current.rotation.z = angle;
    },
    rotateNegXByStep: (angle: number = 0.2) => {
      if (groupRef.current) groupRef.current.rotation.x = angle;
    },
    rotateNegYByStep: (angle: number = 0.2) => {
      if (groupRef.current) groupRef.current.rotation.y = angle;
    },
    rotateNegZByStep: (angle: number = 0.2) => {
      if (groupRef.current) groupRef.current.rotation.z = angle;
    },
    getRotation: () => {
      if (!groupRef.current) return { x: 0, y: 0, z: 0 };
      const { x, y, z } = groupRef.current.rotation;
      return {
        x: (x * 180) / Math.PI,
        y: (y * 180) / Math.PI,
        z: (z * 180) / Math.PI,
      };
    },
  }));

  useEffect(() => {
    if (scene) {
      const box = new Box3().setFromObject(scene);
      const center = new Vector3();
      box.getCenter(center);
      scene.position.sub(center);
    }
  }, [scene]);

  return (
    <group ref={groupRef} {...props}>
      <primitive object={scene} />
    </group>
  );
}

const ForwardedRubikModel = React.forwardRef<RubikModelRef, any>(RubikModel);

useGLTF.preload("./rubiks_cube4.glb");

export default function RubikCube() {
  const cubeRef = useRef<RubikModelRef>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  const handleInputChange = (axis: "x" | "y" | "z", value: string) => {
    const angleDeg = Number(value) || 0;
    const angleRad = (angleDeg * Math.PI) / 180;
    if (cubeRef.current) {
      if (axis === "x") cubeRef.current.rotateXByStep(angleRad);
      if (axis === "y") cubeRef.current.rotateYByStep(angleRad);
      if (axis === "z") cubeRef.current.rotateZByStep(angleRad);
      setRotation(cubeRef.current.getRotation());
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Canvas
        camera={{ position: [30, 10, 10], fov: 50 }}
        style={{ width: "30vh", height: "30vh", background: "#242424" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />

        <ForwardedRubikModel ref={cubeRef} scale={1.5} position={[0, 0, 0]} 
        rotation={[(6*Math.PI)/180, (26*Math.PI)/180, (-10*Math.PI)/180]} 
        />

        <OrbitControls enableZoom />
        <Environment preset="sunset" />
      </Canvas>

      {/* Manual Input Controls */}
      <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {(["x", "y", "z"] as const).map((axis) => (
          <div key={axis} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <label>{axis.toUpperCase()} (°):</label>
            <input
              type="number"
              value={rotation[axis]}
              onChange={(e) => handleInputChange(axis, e.target.value)}
              style={{ width: "80px" }}
            />
          </div>
        ))}
      </div>

      {/* Current Rotation Output */}
      <div style={{ marginTop: "15px", textAlign: "center" }}>
        <p>
          Current Rotation → X: {rotation.x.toFixed(1)}°, Y: {rotation.y.toFixed(1)}°, Z:{" "}
          {rotation.z.toFixed(1)}°
        </p>
      </div>
    </div>
  );
}
