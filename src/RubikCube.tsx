import { Canvas, useThree } from "@react-three/fiber";
import { Group, PerspectiveCamera, Vector3 } from "three";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { a, useSpring } from "@react-spring/three";

// Preload all 27 cubies
for (let i = 1; i <= 27; i++) {
  useGLTF.preload(`./blender/rubiks_cube_${i}.glb`);
}

// Simple RubikModel loader
function RubikModel({ path }: { path: string }) {
  const { scene } = useGLTF(path) as { scene: Group };
  return <primitive object={scene.clone()} scale={1.5} />;
}

// Camera controller
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
  const [isLoaded, setIsLoaded] = useState(false); // Track if all models are loaded

  // Track loading of all cubies
  useEffect(() => {
    let loadedCount = 0;
    const totalCubies = 27;

    // Simulate checking if each cubie is loaded
    const checkLoading = () => {
      loadedCount += 1;
      if (loadedCount === totalCubies) {
        setIsLoaded(true); // All cubies are loaded
      }
    };

    // Since useGLTF.preload doesn't return a promise, we rely on the fact that
    // useGLTF in RubikModel will resolve. For simplicity, we assume all cubies
    // are preloaded and trigger checkLoading for each model.
    for (let i = 1; i <= totalCubies; i++) {
      // Simulate loading completion for each cubie
      setTimeout(checkLoading, 0); // Replace with actual loading check if possible
    }
  }, []);

  // Animation logic
  useEffect(() => {
    if (!isLoaded) return; // Only start animation when all cubies are loaded

    let count = 0;
    let count2 = 0;
    let count3 = 0;

    const phase1Faces = ["front", "back", "left", "right", "up", "down"];
    const phase2Faces = ["front", "back", "up", "down"];

    const interval = setInterval(() => {
      const isPhase1 = count3 === 0;
      const faces = isPhase1 ? phase1Faces : phase2Faces;
      const limit = isPhase1 ? 4 : 3;

      console.log({ count, count2, count3 });

      const face = faces[count];
      if (face) {
        rotateFace(face);
        console.log(face);
      }

      count++;

      // When all faces in this pattern are done
      if (count >= faces.length) {
        count = 0;
        count2++;
        console.log(`iteration ${count2}`);

        // When 4 or 3 pattern cycles done
        if (count2 >= limit) {
          count2 = 0;
          count3 = isPhase1 ? 1 : 0; // Toggle phase
          count = 0; // Reset so 'front' is never skipped
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoaded]); // Depend on isLoaded to start animation only when true

  // Generate 27 cubie configs dynamically
  const positions: [number, number, number][] = [];
  [-6, -3, 0].forEach((x) =>
    [-6, -3, 0].forEach((y) =>
      [-6, -3, 0].forEach((z) => positions.push([x, y, z]))
    )
  );

  const cubeConfigs = [
    { path: "./blender/rubiks_cube_21.glb", pos: [0, -6, -6], index: 1 },
    { path: "./blender/rubiks_cube_20.glb", pos: [-3, -6, -6], index: 2 },
    { path: "./blender/rubiks_cube_15.glb", pos: [-6, -6, -6], index: 3 },
    { path: "./blender/rubiks_cube_24.glb", pos: [0, -6, -3], index: 4 },
    { path: "./blender/rubiks_cube_26.glb", pos: [-3, -6, -3], index: 5, center: 'white' },
    { path: "./blender/rubiks_cube_14.glb", pos: [-6, -6, -3], index: 6 },
    { path: "./blender/rubiks_cube_7.glb", pos: [0, -6, 0], index: 7 },
    { path: "./blender/rubiks_cube_8.glb", pos: [-3, -6, 0], index: 8 },
    { path: "./blender/rubiks_cube_9.glb", pos: [-6, -6, 0], index: 9 },
    { path: "./blender/rubiks_cube_19.glb", pos: [0, -3, -6], index: 10 },
    { path: "./blender/rubiks_cube_18.glb", pos: [-3, -3, -6], index: 11, center: 'blue' },
    { path: "./blender/rubiks_cube_13.glb", pos: [-6, -3, -6], index: 12 },
    { path: "./blender/rubiks_cube_23.glb", pos: [0, -3, -3], index: 13, center: 'red' },
    { path: "./blender/rubiks_cube_27.glb", pos: [-3, -3, -3], index: 14 },
    { path: "./blender/rubiks_cube_12.glb", pos: [-6, -3, -3], index: 15, center: 'orange' },
    { path: "./blender/rubiks_cube_4.glb", pos: [0, -3, 0], index: 16 },
    { path: "./blender/rubiks_cube_5.glb", pos: [-3, -3, 0], index: 17, center: 'green' },
    { path: "./blender/rubiks_cube_6.glb", pos: [-6, -3, 0], index: 18 },
    { path: "./blender/rubiks_cube_17.glb", pos: [0, 0, -6], index: 19 },
    { path: "./blender/rubiks_cube_16.glb", pos: [-3, 0, -6], index: 20 },
    { path: "./blender/rubiks_cube_11.glb", pos: [-6, 0, -6], index: 21 },
    { path: "./blender/rubiks_cube_22.glb", pos: [0, 0, -3], index: 22 },
    { path: "./blender/rubiks_cube_25.glb", pos: [-3, 0, -3], index: 23, center: 'yellow' },
    { path: "./blender/rubiks_cube_10.glb", pos: [-6, 0, -3], index: 24 },
    { path: "./blender/rubiks_cube_1.glb", pos: [0, 0, 0], index: 25 },
    { path: "./blender/rubiks_cube_2.glb", pos: [-3, 0, 0], index: 26 },
    { path: "./blender/rubiks_cube_3.glb", pos: [-6, 0, 0], index: 27 },
  ];

  const masterGroup = useRef<Group>(null);
  const rotatingGroup = useRef<Group>(new Group());

  const [rotationAxis, setRotationAxis] = useState<[number, number, number]>([0, 0, 0]);
  const [turns, setTurns] = useState(0);

  // Spring animation with smoother physics-based config
  const { angle } = useSpring({
    angle: turns * (Math.PI / 2),
    config: { tension: 120, friction: 14, clamp: true },
    onRest: () => {
      if (rotatingGroup.current && masterGroup.current) {
        const axis = rotationAxis[0] ? 'x' : rotationAxis[1] ? 'y' : 'z';
        const currentAngle = rotatingGroup.current.rotation[axis];
        const snappedAngle = Math.round(currentAngle / (Math.PI / 2)) * (Math.PI / 2);

        rotatingGroup.current.rotation.set(0, 0, 0);
        rotatingGroup.current.rotation[axis] = snappedAngle;
        rotatingGroup.current.updateMatrixWorld();

        const children = [...rotatingGroup.current.children];
        children.forEach((child) => {
          child.applyMatrix4(rotatingGroup.current.matrixWorld);
          child.updateMatrixWorld();
          masterGroup.current!.add(child);
        });

        rotatingGroup.current.clear();
        rotatingGroup.current.rotation.set(0, 0, 0);
        rotatingGroup.current.updateMatrixWorld();

        setRotationAxis([0, 0, 0]);
        setTurns(0);
      }
    },
  });

  // Helper: select cubes for a face
  const selectFace = (axis: "x" | "y" | "z", value: number) => {
    if (!masterGroup.current) return;
    const children = masterGroup.current.children.filter((child) => {
      const pos = new Vector3();
      child.getWorldPosition(pos);
      const rounded = Math.round(pos[axis] / 3) * 3;
      return rounded === value;
    });
    children.forEach((c) => rotatingGroup.current.add(c));
    masterGroup.current.add(rotatingGroup.current);
  };

  // Rotate face function
  const rotateFace = (face: "front" | "back" | "left" | "right" | "up" | "down") => {
    console.log({ face });
    if (!masterGroup.current) return;

    if (rotatingGroup.current.children.length > 0) return; // Prevent overlapping moves

    switch (face) {
      case "front":
        setRotationAxis([0, 0, 1]);
        selectFace("z", 3);
        break;
      case "back":
        setRotationAxis([0, 0, 1]);
        selectFace("z", -3);
        break;
      case "left":
        setRotationAxis([1, 0, 0]);
        selectFace("x", -3);
        break;
      case "right":
        setRotationAxis([1, 0, 0]);
        selectFace("x", 3);
        break;
      case "up":
        setRotationAxis([0, 1, 0]);
        selectFace("y", 3);
        break;
      case "down":
        setRotationAxis([0, 1, 0]);
        selectFace("y", -3);
        break;
    }
    setTurns((t) => t + 1);
  };

  const [cameraPos] = useState<[number, number, number]>([15, 15, 15]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Canvas camera={{ position: cameraPos, fov: 50 }} style={{ width: "40vh", height: "40vh", background: "#242424" }}>
        <CameraController cameraPos={cameraPos} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />

        <group ref={masterGroup}>
          {cubeConfigs.map((cube) => (
            <group key={cube.index} position={[cube.pos[0] + 3, cube.pos[1] + 3, cube.pos[2] + 3]}>
              <RubikModel path={cube.path} />
            </group>
          ))}
        </group>

        <a.group
          ref={rotatingGroup}
          rotation-x={rotationAxis[0] ? angle : 0}
          rotation-y={rotationAxis[1] ? angle : 0}
          rotation-z={rotationAxis[2] ? angle : 0}
        />

        <OrbitControls />
        <Environment preset="forest" />
      </Canvas>
    </div>
  );
}