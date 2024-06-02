import { useState, useRef, useEffect, useReducer } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";

function reducer(state, action) {
  if (action.type === "TOGGLE_CAMERA") {
    return {
      ...state,
      startCamera: !state.startCamera,
    };
  } else if (action.type === "TOGGLE_FACING_MODE") {
    return {
      ...state,
      facingMode: state.facingMode === "user" ? "environment" : "user",
    };
  } else if (action.type === "ADD_STREAM") {
    return {
      ...state,
      stream: action.stream,
    };
  } else if (action.type === "REMOVE_STREAM") {
    return {
      ...state,
      stream: null,
    };
  }
  throw Error("Unknown action!");
}

function App() {
  const videoRef = useRef(null);

  const [loadingCapture, setLoadingCapture] = useState(false);

  const [options, dispatch] = useReducer(reducer, {
    facingMode: "environment",
    startCamera: false,
    stream: null,
  });

  const handleCameraChange = () => {
    dispatch({ type: "TOGGLE_FACING_MODE" });
  };

  useEffect(() => {
    const video = videoRef.current;
    video.style.width = "400px";
    video.style.height = "400px";
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    const constraints = {
      audio: false,
      video: options.facingMode,
    };

    console.log("constraints", constraints);

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function success(stream) {
        if (options.startCamera) {
          video.srcObject = stream;
          dispatch({ type: "ADD_STREAM", stream: stream });
        } else {
          const tracks = stream.getTracks();

          tracks.forEach((track) => {
            track.stop();
          });

          video.srcObject = null;
          dispatch({ type: "REMOVE_STREAM" });
        }
      });
  }, [options.facingMode, options.startCamera]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <video
        style={{ width: 400, height: 340, background: "#e4e4e7" }}
        ref={videoRef}
        onClick={handleCameraChange}
      />
      <div
        style={{
          display: "flex",
          gap: 8,
          paddingTop: 16,
        }}
      >
        <button
          style={{ background: "maroon" }}
          onClick={() => dispatch({ type: "TOGGLE_CAMERA" })}
        >
          {options.startCamera ? "Stop" : "Start"}
        </button>
        <button
          disabled={loadingCapture}
          onClick={async () => {
            setLoadingCapture(true);
            const imageCapture = new ImageCapture(
              options.stream.getVideoTracks()[0]
            );
            const blob = await imageCapture.takePhoto();

            const url = URL.createObjectURL(blob);

            const imageWindow = open(url);

            imageWindow.addEventListener("beforeunload", () =>
              URL.revokeObjectURL(url)
            );
            setLoadingCapture(false);
          }}
          style={{
            width: 80,
            height: 80,
            background: "#FFF",
            borderRadius: "100%",
            margin: "auto",
          }}
        />
        <button onClick={() => dispatch({ type: "TOGGLE_FACING_MODE" })}>
          Switch
        </button>
      </div>
    </div>
  );
}

export default App;
