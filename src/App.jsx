import { useRef, useEffect, useReducer } from "react";
import { IconRotateClockwise, IconChevronLeft } from "@tabler/icons-react";
import { MantineProvider, ActionIcon } from "@mantine/core";

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
        justifyContent: "space-evenly",
      }}
    >
      {imageOptions.shouldShow && (
        <ActionIcon
          variant="transparent"
          size="sm"
          color="rgba(255, 255, 255, 1)"
          aria-label="back"
          onClick={() => dispatchImage({ type: "NO_SHOW_IMAGE" })}
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
      {imageOptions.shouldShow && imageOptions.url.length && (
        <img
          src={imageOptions.url}
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

        <button
          disabled={imageOptions.loading}
          onClick={async () => {
            dispatchImage({ type: "LOADING_TRUE" });
            const imageCapture = new ImageCapture(
              options.stream.getVideoTracks()[0]
            );
            const blob = await imageCapture.takePhoto();

            const url = URL.createObjectURL(blob);

            dispatchImage({ type: "SET_URL", url: url });
            dispatchImage({ type: "LOADING_FALSE" });
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
