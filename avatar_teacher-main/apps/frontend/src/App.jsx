import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Scenario } from "./components/Scenario";
import { ChatInterface } from "./components/ChatInterface";

function App() {
  return (
    <>
      <Loader />
      <Leva collapsed hidden />
      <ChatInterface />

      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundImage: "url('/images/classroom.jpg')", // Make sure this path is correct
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Canvas
          shadows
          camera={{ position: [0, 1.8, 3.5], fov: 40 }} // Camera adjusted for a typical classroom shot
          style={{ width: "100%", height: "100%", background: "transparent" }}
        >
          <Scenario />
        </Canvas>
      </div>
    </>
  );
}

export default App;
