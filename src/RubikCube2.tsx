import { Canvas, useThree } from "@react-three/fiber";
import { Group, PerspectiveCamera } from "three";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import React, { useRef, useState, useEffect } from "react";

type RubikModelRef = {
  getRotation: () => { x: number; y: number; z: number };
};

function RubikModel(props: any, ref: React.Ref<RubikModelRef>) {
  const { scene } = useGLTF(props.path) as { scene: Group };
  const groupRef = useRef<Group>(null);

  React.useImperativeHandle(ref, () => ({
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

  return (
    <group ref={groupRef} {...props}>
      <primitive object={scene} />
    </group>
  );
}

const ForwardedRubikModel = React.forwardRef<RubikModelRef, any>(RubikModel);

// ✅ Preload all 27 cubies
for (let i = 1; i <= 27; i++) {
  useGLTF.preload(`./blender/rubiks_cube_${i}.glb`);
}

// 🎥 Camera Controller Hook
function CameraController({ cameraPos }: { cameraPos: [number, number, number] }) {
  const { camera } = useThree() as { camera: PerspectiveCamera };

  useEffect(() => {
    camera.position.set(...cameraPos);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [cameraPos, camera]);

  return null;
}

export default function RubikCube() {
  // ✅ Configs for all 27 cubes (adjusted positions)
  const cubeConfigs = [
    { path: "./blender/rubiks_cube_1.glb", pos: [0, 0, 0] },
    { path: "./blender/rubiks_cube_2.glb", pos: [-3, 0, 0] },
    { path: "./blender/rubiks_cube_3.glb", pos: [-6, 0, 0] },
    { path: "./blender/rubiks_cube_4.glb", pos: [0, -3, 0] },
    { path: "./blender/rubiks_cube_5.glb", pos: [-3, -3, 0] },
    { path: "./blender/rubiks_cube_6.glb", pos: [-6, -3, 0] },
    { path: "./blender/rubiks_cube_7.glb", pos: [0, -6, 0] },
    { path: "./blender/rubiks_cube_8.glb", pos: [-3, -6, 0] },
    { path: "./blender/rubiks_cube_9.glb", pos: [-6, -6, 0] },
    { path: "./blender/rubiks_cube_10.glb", pos: [-6, 0, -3] },
    { path: "./blender/rubiks_cube_11.glb", pos: [-6, 0, -6] },
    { path: "./blender/rubiks_cube_12.glb", pos: [-6, -3, -3] },
    { path: "./blender/rubiks_cube_13.glb", pos: [-6, -3, -6] },
    { path: "./blender/rubiks_cube_14.glb", pos: [-6, -6, -3] },
    { path: "./blender/rubiks_cube_15.glb", pos: [-6, -6, -6] },
    { path: "./blender/rubiks_cube_16.glb", pos: [-3, 0, -6] },
    { path: "./blender/rubiks_cube_17.glb", pos: [0, 0, -6] },
    { path: "./blender/rubiks_cube_18.glb", pos: [-3, -3, -6] },
    { path: "./blender/rubiks_cube_19.glb", pos: [0, -3, -6] },
    { path: "./blender/rubiks_cube_20.glb", pos: [-3, -6, -6] },
    { path: "./blender/rubiks_cube_21.glb", pos: [0, -6, -6] },
    { path: "./blender/rubiks_cube_22.glb", pos: [0, 0, -3] },
    { path: "./blender/rubiks_cube_23.glb", pos: [0, -3, -3] },
    { path: "./blender/rubiks_cube_24.glb", pos: [0, -6, -3] },
    { path: "./blender/rubiks_cube_25.glb", pos: [-3, 0, -3] },
    { path: "./blender/rubiks_cube_26.glb", pos: [-3, -6, -3] },
    { path: "./blender/rubiks_cube_27.glb", pos: [-3, -3, -3] },
  ];

  const cubeRefs = useRef<Map<number, RubikModelRef>>(new Map());
  const groupRef = useRef<Group>(null);

  // ✅ Camera position state
  const [cameraPos, setCameraPos] = useState<[number, number, number]>([10, 10, 10]);

  // ✅ Whole cube rotation state
  const [cubeRotation, setCubeRotation] = useState<[number, number, number]>([0, 0, 0]);

  // ✅ Camera input handler
  const handleCameraChange = (axis: "x" | "y" | "z", value: string) => {
    const num = Number(value) || 0;
    setCameraPos((prev) => {
      if (axis === "x") return [num, prev[1], prev[2]];
      if (axis === "y") return [prev[0], num, prev[2]];
      if (axis === "z") return [prev[0], prev[1], num];
      return prev;
    });
  };

  // ✅ Cube rotation input handler
  const handleCubeRotationChange = (axis: "x" | "y" | "z", value: string) => {
    const angleDeg = Number(value) || 0;
    const angleRad = (angleDeg * Math.PI) / 180;

    setCubeRotation((prev) => {
      if (axis === "x") return [angleRad, prev[1], prev[2]];
      if (axis === "y") return [prev[0], angleRad, prev[2]];
      if (axis === "z") return [prev[0], prev[1], angleRad];
      return prev;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* 🎥 Camera Controls */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Camera Position</h3>
        <input
          type="number"
          placeholder="Camera X"
          value={cameraPos[0]}
          onChange={(e) => handleCameraChange("x", e.target.value)}
        />
        <input
          type="number"
          placeholder="Camera Y"
          value={cameraPos[1]}
          onChange={(e) => handleCameraChange("y", e.target.value)}
        />
        <input
          type="number"
          placeholder="Camera Z"
          value={cameraPos[2]}
          onChange={(e) => handleCameraChange("z", e.target.value)}
        />
        <div>Current Camera: {JSON.stringify(cameraPos)}</div>
      </div>

      {/* 🎛 Whole Cube Rotation Controls */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Whole Cube Rotation</h3>
        <input
          type="number"
          placeholder="Rotate X°"
          value={(cubeRotation[0] * 180) / Math.PI}
          onChange={(e) => handleCubeRotationChange("x", e.target.value)}
        />
        <input
          type="number"
          placeholder="Rotate Y°"
          value={(cubeRotation[1] * 180) / Math.PI}
          onChange={(e) => handleCubeRotationChange("y", e.target.value)}
        />
        <input
          type="number"
          placeholder="Rotate Z°"
          value={(cubeRotation[2] * 180) / Math.PI}
          onChange={(e) => handleCubeRotationChange("z", e.target.value)}
        />
        <div>
          Current:{" "}
          {JSON.stringify({
            x: (cubeRotation[0] * 180) / Math.PI,
            y: (cubeRotation[1] * 180) / Math.PI,
            z: (cubeRotation[2] * 180) / Math.PI,
          })}
        </div>
      </div>

      <Canvas
        camera={{ position: cameraPos, fov: 50 }}
        style={{ width: "30vh", height: "30vh", background: "#242424" }}
      >
        {/* 🎥 Dynamic camera updater */}
        <CameraController cameraPos={cameraPos} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />

        {/* ✅ No manual shift here, group stays at (0,0,0) */}
        <group ref={groupRef} rotation={cubeRotation} position={[0, 0, 0]}>
          {cubeConfigs.map((cube, i) => (
            <ForwardedRubikModel
              key={i}
              ref={(ref) => {
                if (ref) cubeRefs.current.set(i, ref);
                else cubeRefs.current.delete(i);
              }}
              path={cube.path}
              scale={1.5}
              // shift positions by +3 so cube spans from -3 to +3
              position={[
                cube.pos[0] + 3,
                cube.pos[1] + 3,
                cube.pos[2] + 3,
              ]}
            />
          ))}
        </group>

        <OrbitControls enableZoom />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}
