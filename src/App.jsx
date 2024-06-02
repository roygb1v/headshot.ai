import { useState, useRef, useEffect, useReducer } from "react";
import { IconRotateClockwise, IconChevronLeft } from "@tabler/icons-react";
import { MantineProvider, ActionIcon } from "@mantine/core";

import "@mantine/core/styles.css";
import "./App.css";

function reducer(state, action) {
  if (action.type === "TOGGLE_CAMERA") {
    return {
      ...state,
      startCamera: !state.startCamera,
    };
  } else if (action.type === "TOGGLE_FACING_MODE") {
    if (state.constraints.video.facingMode === "user") {
      return {
        ...state,
        constraints: {
          video: {
            facingMode: "environment",
          },
        },
      };
    } else {
      return {
        ...state,
        constraints: {
          video: {
            facingMode: "user",
          },
        },
      };
    }
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

function VideoComponent() {
  const videoRef = useRef(null);

  const [loadingCapture, setLoadingCapture] = useState(false);
  const [imageURL, setImageURL] = useState("");
  const [showImageCapture, setShowImageCapture] = useState(false);

  const [options, dispatch] = useReducer(reducer, {
    constraints: {
      video: {
        facingMode: "user",
      },
    },
    startCamera: true,
    stream: null,
  });

  const handleCameraChange = () => {
    dispatch({ type: "TOGGLE_FACING_MODE" });
  };

  useEffect(() => {
    const video = videoRef.current;
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    navigator.mediaDevices
      .getUserMedia(options.constraints)
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
  }, [options.constraints, options.startCamera]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        justifyContent: "space-between",
      }}
    >
      {showImageCapture && (
        <ActionIcon
          variant="transparent"
          size="sm"
          color="rgba(255, 255, 255, 1)"
          aria-label="back"
          onClick={() => setShowImageCapture(false)}
        >
          <IconChevronLeft />
        </ActionIcon>
      )}
      {!showImageCapture && (
        <video
          style={{ width: 364, height: 364, background: "#000000" }}
          ref={videoRef}
          onClick={handleCameraChange}
        />
      )}
      {showImageCapture && imageURL.length && (
        <img
          src={imageURL}
          style={{ width: 364, height: 364, objectFit: "cover" }}
        />
      )}
      <div
        style={{
          display: "flex",
        }}
      >
        <ActionIcon
          style={{ width: 80, height: 80 }}
          variant="outline"
          size="xl"
          color="rgba(255, 255, 255, 1)"
          aria-label="toggle"
          onClick={() => setShowImageCapture(true)}
        >
          {imageURL.length ? (
            <img
              src={imageURL}
              style={{ width: 80, height: 80, objectFit: "cover" }}
            />
          ) : null}
        </ActionIcon>

        <button
          disabled={loadingCapture}
          onClick={async () => {
            setLoadingCapture(true);
            const imageCapture = new ImageCapture(
              options.stream.getVideoTracks()[0]
            );
            const blob = await imageCapture.takePhoto();

            const url = URL.createObjectURL(blob);
            setImageURL(url);

            // const imageWindow = open(url);

            // imageWindow.addEventListener("beforeunload", () =>
            //   URL.revokeObjectURL(url)
            // );
            setLoadingCapture(false);
          }}
          style={{
            width: 80,
            height: 80,
            background: "#FFF",
            border: "2px solid black",
            borderRadius: "100%",
            margin: "auto",
          }}
        />
        <ActionIcon
          style={{ width: 80, height: 80 }}
          variant="outline"
          color="rgba(255, 255, 255, 1)"
          aria-label="rotate"
          onClick={() => dispatch({ type: "TOGGLE_FACING_MODE" })}
        >
          <IconRotateClockwise />
        </ActionIcon>
      </div>
    </div>
  );
}

function App() {
  return (
    <MantineProvider>
      <VideoComponent />
    </MantineProvider>
  );
}

export default App;
