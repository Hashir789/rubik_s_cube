import { Canvas, useThree } from "@react-three/fiber";
import { Group, PerspectiveCamera, Vector3 } from "three";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import { a, useSpring } from "@react-spring/three";

// Define face types for Rubik's Cube
type Face = "front" | "back" | "left" | "right" | "up" | "down";

// Preload all 27 cubie models
for (let i = 1; i <= 27; i++) {
  useGLTF.preload(`./blender/rubiks_cube_${i}.glb`);
}

// Component to load a single Rubik's Cube piece
function RubikModel({ path }: { path: string }) {
  const { scene } = useGLTF(path) as { scene: Group };
  return <primitive object={scene.clone()} scale={1.5} />;
}

// Component to control camera position and orientation
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
  // State for cube loading and interaction modes
  const [isLoaded, setIsLoaded] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [counts, setCounts] = useState<[number, number, number] | null>(null);

  // References for cube groups
  const masterGroup = useRef<Group>(null);
  const rotatingGroup = useRef<Group>(new Group());

  // State for rotation animation
  const [rotationAxis, setRotationAxis] = useState<[number, number, number]>([0, 0, 0]);
  const [turns, setTurns] = useState(0);

  // Load all 27 cubies
  useEffect(() => {
    let loadedCount = 0;
    const totalCubies = 27;

    const checkLoading = () => {
      loadedCount += 1;
      if (loadedCount === totalCubies) {
        setIsLoaded(true);
      }
    };

    for (let i = 1; i <= totalCubies; i++) {
      setTimeout(checkLoading, 0); // Simulate loading completion
    }
  }, []);

  // Automatic rotation animation logic
  useEffect(() => {
    let interval: any = null;
    const phase1Faces: Face[] = ["front", "back", "left", "right", "up", "down"];
    const phase2Faces: Face[] = ["front", "back", "up", "down"];

    if (isLoaded && !manualMode) {
      // Initialize counts after 5-second delay on first run
      if (counts === null) {
        setTimeout(() => {
          setCounts([0, 0, 0]);
        }, 5000);
        return;
      }

      // Run automatic rotations every second
      interval = setInterval(() => {
        setCounts((prev) => {
          if (!prev) return [0, 0, 0]; // Guard against null

          const [count, count2, count3] = prev;
          const isPhase1 = count3 === 0;
          const faces = isPhase1 ? phase1Faces : phase2Faces;
          const limit = isPhase1 ? 4 : 3;

          const face = faces[count];
          if (face) rotateFace(face, true);

          const nextCount = count + 1;
          if (nextCount >= faces.length) {
            const nextCount2 = count2 + 1;
            const nextCount3 = nextCount2 >= limit ? (isPhase1 ? 1 : 0) : count3;
            return [0, nextCount2 >= limit ? 0 : nextCount2, nextCount3];
          }

          return [nextCount, count2, count3];
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoaded, manualMode, counts]);

  // Handle keypresses for face rotations and mode toggle
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isLoaded) return;

      const key = event.key.toLowerCase();

      // Toggle manual mode with 'P'
      if (key === "p") {
        setManualMode((prev) => {
          console.log(`Manual mode: ${!prev}`);
          return !prev;
        });
        return;
      }

      // Only process face rotations in manual mode
      if (!manualMode) return;

      const isCounterClockwise = event.shiftKey;
      const keyToFace: { [key: string]: Face } = {
        f: "front",
        u: "up",
        d: "down",
        r: "right",
        l: "left",
        b: "back",
      };

      const face = keyToFace[key];
      if (face) {
        rotateFace(face, !isCounterClockwise);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoaded, manualMode]);

  // Animation for rotating faces
  const { angle } = useSpring({
    angle: turns * (Math.PI / 2),
    config: { tension: 120, friction: 14, clamp: true },
    onRest: () => {
      if (rotatingGroup.current && masterGroup.current) {
        const axis = rotationAxis[0] ? "x" : rotationAxis[1] ? "y" : "z";
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

  // Select cubies for a given face
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

  // Rotate a specified face
  const rotateFace = (face: Face, clockwise: boolean = true) => {
    console.log({ face, clockwise });
    if (!masterGroup.current || rotatingGroup.current.children.length > 0) return;

    let axis: [number, number, number];
    let faceValue: number;

    switch (face) {
      case "front":
        axis = [0, 0, clockwise ? 1 : -1];
        faceValue = 3;
        break;
      case "back":
        axis = [0, 0, clockwise ? -1 : 1];
        faceValue = -3;
        break;
      case "left":
        axis = [clockwise ? -1 : 1, 0, 0];
        faceValue = -3;
        break;
      case "right":
        axis = [clockwise ? 1 : -1, 0, 0];
        faceValue = 3;
        break;
      case "up":
        axis = [0, clockwise ? 1 : -1, 0];
        faceValue = 3;
        break;
      case "down":
        axis = [0, clockwise ? -1 : 1, 0];
        faceValue = -3;
        break;
      default:
        return;
    }

    setRotationAxis(axis);
    selectFace(axis[0] ? "x" : axis[1] ? "y" : "z", faceValue);
    setTurns((t) => t + (clockwise ? 1 : -1));
  };

  // Cube configuration for all 27 cubies
  const cubeConfigs = [
    { path: "./blender/rubiks_cube_21.glb", pos: [0, -6, -6], index: 1 },
    { path: "./blender/rubiks_cube_20.glb", pos: [-3, -6, -6], index: 2 },
    { path: "./blender/rubiks_cube_15.glb", pos: [-6, -6, -6], index: 3 },
    { path: "./blender/rubiks_cube_24.glb", pos: [0, -6, -3], index: 4 },
    { path: "./blender/rubiks_cube_26.glb", pos: [-3, -6, -3], index: 5, center: "white" },
    { path: "./blender/rubiks_cube_14.glb", pos: [-6, -6, -3], index: 6 },
    { path: "./blender/rubiks_cube_7.glb", pos: [0, -6, 0], index: 7 },
    { path: "./blender/rubiks_cube_8.glb", pos: [-3, -6, 0], index: 8 },
    { path: "./blender/rubiks_cube_9.glb", pos: [-6, -6, 0], index: 9 },
    { path: "./blender/rubiks_cube_19.glb", pos: [0, -3, -6], index: 10 },
    { path: "./blender/rubiks_cube_18.glb", pos: [-3, -3, -6], index: 11, center: "blue" },
    { path: "./blender/rubiks_cube_13.glb", pos: [-6, -3, -6], index: 12 },
    { path: "./blender/rubiks_cube_23.glb", pos: [0, -3, -3], index: 13, center: "red" },
    { path: "./blender/rubiks_cube_27.glb", pos: [-3, -3, -3], index: 14 },
    { path: "./blender/rubiks_cube_12.glb", pos: [-6, -3, -3], index: 15, center: "orange" },
    { path: "./blender/rubiks_cube_4.glb", pos: [0, -3, 0], index: 16 },
    { path: "./blender/rubiks_cube_5.glb", pos: [-3, -3, 0], index: 17, center: "green" },
    { path: "./blender/rubiks_cube_6.glb", pos: [-6, -3, 0], index: 18 },
    { path: "./blender/rubiks_cube_17.glb", pos: [0, 0, -6], index: 19 },
    { path: "./blender/rubiks_cube_16.glb", pos: [-3, 0, -6], index: 20 },
    { path: "./blender/rubiks_cube_11.glb", pos: [-6, 0, -6], index: 21 },
    { path: "./blender/rubiks_cube_22.glb", pos: [0, 0, -3], index: 22 },
    { path: "./blender/rubiks_cube_25.glb", pos: [-3, 0, -3], index: 23, center: "yellow" },
    { path: "./blender/rubiks_cube_10.glb", pos: [-6, 0, -3], index: 24 },
    { path: "./blender/rubiks_cube_1.glb", pos: [0, 0, 0], index: 25 },
    { path: "./blender/rubiks_cube_2.glb", pos: [-3, 0, 0], index: 26 },
    { path: "./blender/rubiks_cube_3.glb", pos: [-6, 0, 0], index: 27 },
  ];

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