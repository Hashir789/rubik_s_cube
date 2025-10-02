import { Canvas } from "@react-three/fiber";
import { Group, Box3, Vector3 } from "three";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import React, { useRef, useEffect } from "react";

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

  // parent group
  const hingeGroupRef = useRef<Group>(null);

  // fan rotation handler
  const rotateFan = () => {
    if (hingeGroupRef.current) {
      hingeGroupRef.current.rotation.z += Math.PI / 6; // rotate 30°
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

        {/* ✅ hinge group for fan-like motion */}
        <group ref={hingeGroupRef} position={[0, 0, 0]}>
          {/* Cube 1 (pivot left) */}
          <group position={[-1.5, 0, 0]}>
            <ForwardedRubikModel
              ref={cubeRef1}
              path="./blender/rubiks_cube_1.glb"
              scale={1.5}
              position={[1.5, 0, 0]} // shift right so hinge is on left edge
            />
          </group>

          {/* Cube 2 (pivot right) */}
          <group position={[1.5, 0, 0]}>
            <ForwardedRubikModel
              ref={cubeRef2}
              path="./blender/rubiks_cube_2.glb"
              scale={1.5}
              position={[-1.5, 0, 0]} // shift left so hinge is on right edge
            />
          </group>
        </group>

        {/* Cube 3 (independent, not in fan group) */}
        <ForwardedRubikModel
          ref={cubeRef3}
          path="./blender/rubiks_cube_3.glb"
          scale={1.5}
          position={[-6, 0, 0]}
        />

        <OrbitControls enableZoom />
        <Environment preset="sunset" />
      </Canvas>

      <button
        onClick={rotateFan}
        style={{ marginTop: "20px", padding: "8px 16px", cursor: "pointer" }}
      >
        Rotate Cube1 + Cube2 (Fan Motion)
      </button>
    </div>
  );
}
