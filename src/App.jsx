import { useRef, useLayoutEffect, useReducer } from "react";
import { IconRotateClockwise, IconChevronLeft } from "@tabler/icons-react";
import { MantineProvider, ActionIcon, Button } from "@mantine/core";

import "@mantine/core/styles.css";
import "./App.css";

function reducer(state, action) {
  if (action.type === "TOGGLE_FACING_MODE") {
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

function imageReducer(state, action) {
  if (action.type === "LOADING_TRUE") {
    return {
      ...state,
      loading: true,
    };
  } else if (action.type === "LOADING_FALSE") {
    return {
      ...state,
      loading: false,
    };
  } else if (action.type === "SET_URL") {
    return {
      ...state,
      url: action.url,
    };
  } else if (action.type === "SHOW_IMAGE") {
    return {
      ...state,
      shouldShow: true,
    };
  } else if (action.type === "NO_SHOW_IMAGE") {
    return {
      ...state,
      shouldShow: false,
    };
  }
  throw Error("Unknown action!");
}

function VideoComponent() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [imageOptions, dispatchImage] = useReducer(imageReducer, {
    loading: false,
    shouldShow: false,
    url: "",
  });

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

  useLayoutEffect(() => {
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
        justifyContent: "space-evenly",
      }}
    >
      {imageOptions.shouldShow && (
        <ActionIcon
          variant="transparent"
          size="sm"
          color="rgba(255, 255, 255, 1)"
          aria-label="back"
          onClick={() => {
            dispatchImage({ type: "NO_SHOW_IMAGE" });
          }}
        >
          <IconChevronLeft />
        </ActionIcon>
      )}
      {!imageOptions.shouldShow && (
        <video
          style={{
            width: 364,
            height: 364,
            background: "#000000",
          }}
          ref={videoRef}
          onClick={handleCameraChange}
        />
      )}
      <canvas
        style={{
          display: imageOptions.shouldShow ? "block" : "none",
          // width: imageOptions.shouldShow ? 364 : 0,
          // height: imageOptions.shouldShow ? 364 : 0,
        }}
        ref={canvasRef}
      ></canvas>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <ActionIcon
          style={{ width: 80, height: 80 }}
          variant="outline"
          size="xl"
          color="rgba(255, 255, 255, 1)"
          aria-label="toggle"
          onClick={() => {
            dispatchImage({ type: "SHOW_IMAGE" });
          }}
        >
          {imageOptions.url.length ? (
            <img
              src={imageOptions.url}
              style={{ width: 80, height: 80, objectFit: "cover" }}
            />
          ) : null}
        </ActionIcon>

        <Button
          disabled={imageOptions.loading}
          onClick={async () => {
            // dispatchImage({ type: "LOADING_TRUE" });

            const { videoWidth, videoHeight } = videoRef.current;

            const context = canvasRef.current.getContext("2d");
            // canvasRef.current.style.imagesRatio = 9 / 16;
            canvasRef.current.style.minWidth = videoWidth;
            canvasRef.current.style.minHeight = videoHeight;

            context.drawImage(videoRef.current, 0, 0, 364, 364);

            dispatchImage({ type: "SHOW_IMAGE" });
            // dispatchImage({ type: "LOADING_FALSE" });
          }}
          style={{
            width: 80,
            height: 80,
            background: "#FFF",
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
