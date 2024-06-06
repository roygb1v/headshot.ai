import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useReducer,
} from "react";
import {
  IconRotateClockwise,
  IconChevronLeft,
  IconClockHour8,
} from "@tabler/icons-react";
import { MantineProvider, ActionIcon, Button } from "@mantine/core";

import "@mantine/core/styles.css";
import "./App.css";

const OBJECT_FIT = "cover";

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

  const [isTimer, setIsTimer] = useState(false);
  const [clearIntervalId, setClearIntervalId] = useState(null);
  const [timer, setTimer] = useState(3);

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

  const handleCameraClick = () => {
    const { videoWidth, videoHeight } = videoRef.current;

    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

    const data = canvasRef.current.toDataURL("image/png");

    setSrc(data);

    dispatch({ type: "NO_SHOW_IMAGE" });
  };

  useEffect(() => {
    if (timer < 0) {
      clearInterval(clearIntervalId);
      setTimer(3);
    }
  }, [timer, clearIntervalId]);

  useLayoutEffect(() => {
    if (options.shouldShow) {
      return;
    }
    const video = videoRef.current;
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.style.height = "478px";
    video.style.width = "100%";
    video.style.objectFit = OBJECT_FIT;

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
      <ActionIcon
        style={{
          width: 40,
          height: 40,
          position: "absolute",
          top: "4px",
          right: 0,
        }}
        variant="transparent"
        size="xl"
        color={isTimer ? "#0ea5e9" : "#f5f5f4"}
        aria-label="timer"
        onClick={() => {
          setIsTimer((prev) => !prev);
        }}
      >
        <IconClockHour8 />
      </ActionIcon>
      {options.shouldShow && (
        <ActionIcon
          style={{ position: "absolute", top: "14px" }}
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
      {options.shouldShow && (
        <img
          style={{
            width: "100%",
            height: "478px",
            objectFit: OBJECT_FIT,
          }}
          src={src}
        />
      )}
      {!options.shouldShow && (
        <video ref={videoRef} onClick={handleCameraChange} />
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
          width: window.innerWidth,
          marginTop: "16px",
        }}
      >
        <ActionIcon
          style={{ width: 80, height: 80 }}
          variant="outline"
          size="xl"
          color="rgba(255, 255, 255, 1)"
          aria-label="toggle"
          onClick={() => {
            dispatch({ type: "SHOW_IMAGE" });
          }}
        >
          {src.length ? (
            <img
              src={src}
              style={{ height: 80, width: 80, objectFit: OBJECT_FIT }}
            />
          ) : null}
        </ActionIcon>
        <Button
          disabled={options.loading}
          onClick={() => {
            if (!isTimer) {
              handleCameraClick();
              return;
            }
            setTimeout(handleCameraClick, 3000);
            const id = setInterval(() => {
              setTimer((prev) => prev - 1);
            }, 1000);
            setClearIntervalId(id);
          }}
          style={{
            width: 80,
            height: 80,
            background: "#FFF",
            borderRadius: "100%",
            margin: "auto",
          }}
        >
          {" "}
          {isTimer && <h1 style={{ color: "gold", margin: 0 }}>{timer}</h1>}
        </Button>
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
