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
  const { scene } = useGLTF(props.path) as { scene: Group };
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

useGLTF.preload("./blender/rubiks_cube_1.glb");
useGLTF.preload("./blender/rubiks_cube_2.glb");
useGLTF.preload("./blender/rubiks_cube_3.glb");

export default function RubikCube() {
  const cubeRef1 = useRef<RubikModelRef>(null);
  const cubeRef2 = useRef<RubikModelRef>(null);
  const cubeRef3 = useRef<RubikModelRef>(null);

  const [rotation1, setRotation1] = useState({ x: 0, y: 0, z: 0 });
  const [rotation2, setRotation2] = useState({ x: 0, y: 0, z: 0 });
  const [rotation3, setRotation3] = useState({ x: 0, y: 0, z: 0 });

  const handleInputChange = (
    cube: "cube1" | "cube2" | "cube3",
    axis: "x" | "y" | "z",
    value: string
  ) => {
    const angleDeg = Number(value) || 0;
    const angleRad = (angleDeg * Math.PI) / 180;

    let ref: RubikModelRef | null = null;
    switch (cube) {
      case "cube1":
        ref = cubeRef1.current;
        break;
      case "cube2":
        ref = cubeRef2.current;
        break;
      case "cube3":
        ref = cubeRef3.current;
        break;
    }

    if (ref) {
      if (axis === "x") ref.rotateXByStep(angleRad);
      if (axis === "y") ref.rotateYByStep(angleRad);
      if (axis === "z") ref.rotateZByStep(angleRad);

      const updated = ref.getRotation();
      if (cube === "cube1") setRotation1(updated);
      else if (cube === "cube2") setRotation2(updated);
      else setRotation3(updated);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Canvas
        camera={{ position: [30, 10, 10], fov: 50 }}
        style={{ width: "60vh", height: "60vh", background: "#242424" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />

        {/* Cube 1 */}
        <ForwardedRubikModel
          ref={cubeRef1}
          path="./blender/rubiks_cube_1.glb"
          scale={1.5}
          position={[0, 0, 0]}
        />

        {/* Cube 2 */}
        <ForwardedRubikModel
          ref={cubeRef2}
          path="./blender/rubiks_cube_2.glb"
          scale={1.5}
          position={[-3, 0, 0]}
        />

        {/* Cube 3 */}
        <ForwardedRubikModel
          ref={cubeRef3}
          path="./blender/rubiks_cube_3.glb"
          scale={1.5}
          position={[-6, 0, 0]}
        />

        <OrbitControls enableZoom />
        <Environment preset="sunset" />
      </Canvas>

      {/* Controls for Cube 1 */}
      <div style={{ marginTop: "15px", padding: "10px", border: "1px solid #666", borderRadius: "8px" }}>
        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Cube 1 Controls</h3>
        {(["x", "y", "z"] as const).map((axis) => (
          <div key={axis} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "5px" }}>
            <label>{axis.toUpperCase()} (°):</label>
            <input
              type="number"
              value={rotation1[axis]}
              onChange={(e) => handleInputChange("cube1", axis, e.target.value)}
              style={{ width: "80px" }}
            />
          </div>
        ))}
        <p style={{ marginTop: "10px", textAlign: "center" }}>
          Rotation → X: {rotation1.x.toFixed(1)}°, Y: {rotation1.y.toFixed(1)}°, Z: {rotation1.z.toFixed(1)}°
        </p>
      </div>

      {/* Controls for Cube 2 */}
      <div style={{ marginTop: "15px", padding: "10px", border: "1px solid #666", borderRadius: "8px" }}>
        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Cube 2 Controls</h3>
        {(["x", "y", "z"] as const).map((axis) => (
          <div key={axis} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "5px" }}>
            <label>{axis.toUpperCase()} (°):</label>
            <input
              type="number"
              value={rotation2[axis]}
              onChange={(e) => handleInputChange("cube2", axis, e.target.value)}
              style={{ width: "80px" }}
            />
          </div>
        ))}
        <p style={{ marginTop: "10px", textAlign: "center" }}>
          Rotation → X: {rotation2.x.toFixed(1)}°, Y: {rotation2.y.toFixed(1)}°, Z: {rotation2.z.toFixed(1)}°
        </p>
      </div>

      {/* Controls for Cube 3 */}
      <div style={{ marginTop: "15px", padding: "10px", border: "1px solid #666", borderRadius: "8px" }}>
        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Cube 3 Controls</h3>
        {(["x", "y", "z"] as const).map((axis) => (
          <div key={axis} style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "5px" }}>
            <label>{axis.toUpperCase()} (°):</label>
            <input
              type="number"
              value={rotation3[axis]}
              onChange={(e) => handleInputChange("cube3", axis, e.target.value)}
              style={{ width: "80px" }}
            />
          </div>
        ))}
        <p style={{ marginTop: "10px", textAlign: "center" }}>
          Rotation → X: {rotation3.x.toFixed(1)}°, Y: {rotation3.y.toFixed(1)}°, Z: {rotation3.z.toFixed(1)}°
        </p>
      </div>
    </div>
  );
}
