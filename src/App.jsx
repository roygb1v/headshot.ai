import { useRef, useState, useLayoutEffect, useReducer } from "react";
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

  const [src, setSrc] = useState("");

  const [options, dispatch] = useReducer(reducer, {
    constraints: {
      video: {
        facingMode: "user",
      },
    },
    shouldShow: false,
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
    console.log(window.innerHeight, window.innerWidth);
    video.style.height = (window.innerHeight * 2) / 3 + "px";
    video.style.width = (window.innerWidth * 2) / 3 + "px";

    navigator.mediaDevices
      .getUserMedia(options.constraints)
      .then(function success(stream) {
        if (!options.shouldShow) {
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
  }, [options.constraints, options.shouldShow]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly",
      }}
    >
      {options.shouldShow && (
        <ActionIcon
          variant="transparent"
          size="sm"
          color="rgba(255, 255, 255, 1)"
          aria-label="back"
          onClick={() => {
            dispatch({ type: "NO_SHOW_IMAGE" });
          }}
        >
          <IconChevronLeft />
        </ActionIcon>
      )}
      {!options.shouldShow && (
        <video
          ref={videoRef}
          style={{ background: "lightgray" }}
          onClick={handleCameraChange}
        />
      )}
      <canvas
        style={{
          position: "absolute",
          display: "none",
          // width: 640,
          // height: 480, cannot set here
        }}
        width="640"
        height="480"
        ref={canvasRef}
      ></canvas>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: (window.innerWidth * 2) / 3,
          margin: "auto",
        }}
      >
        <ActionIcon
          style={{ width: 80, height: 80 }}
          variant="outline"
          size="xl"
          color="rgba(255, 255, 255, 1)"
          aria-label="toggle"
          onClick={() => {
            // dispatch({ type: "SHOW_IMAGE" });
          }}
        >
          {src.length ? (
            <img
              src={src}
              style={{ height: 80, width: 80, objectFit: "cover" }}
            />
          ) : null}
        </ActionIcon>

        <Button
          disabled={options.loading}
          onClick={async () => {
            const { videoWidth, videoHeight } = videoRef.current;
            console.log(videoWidth, videoHeight);

            const context = canvasRef.current.getContext("2d");
            context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

            const data = canvasRef.current.toDataURL("image/png");
            console.log(data);

            setSrc(data);

            dispatch({ type: "NO_SHOW_IMAGE" });
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
