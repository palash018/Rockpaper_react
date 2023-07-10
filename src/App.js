import React, { useRef, useState, useEffect } from "react";
import { socket } from "./socket";
import Xest from "./Xest";
import Game from "./Game";
import background from "./background.jpg";
import Final from "./Final";
export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [room, setRoom] = useState(null);
  const [showButtons, setShowButtons] = useState(true);
  const [showTextField, setShowTextField] = useState(false);
  const [text, setText] = useState();

  const handleCreateRoom = () => {
    socket.emit("create", "room");
  };
  const handleJoinClick = () => {
    setShowButtons(false);
    setShowTextField(true);
  };

  const handleExitClick = () => {
    setShowButtons(true);
    setShowTextField(false);
  };
  const handleSubmit = () => {
    socket.emit("join", text);
  };
  useEffect(() => {
    function onConnect() {
      console.log("established");
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onEvent(value) {
      console.log(value);
      if (value.room_id) {
        setRoom(value.room_id);
      }
      if (value.error) {
        alert(value.error);
      }
      // setEvents(previous => [...previous, value]);
    }

    socket.on("event", onEvent);

    return () => {
      socket.off("event", onEvent);
    };
  }, []);

  return (
    <div className="App" style={{ backgroundColor: "rgb(0,0,0)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        {room && <Game room={room} socket={socket} />}({" "}
        {!room && showButtons && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection:"column"
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}>
              <button
                style={{
                  backgroundColor: "#6A2BE2",
                  padding: "8px 20px",
                  color: "#fff",
                  margin: "-2 10px",
                  marginRight:"5px"
                }}
                onClick={handleJoinClick}
              >
                Join
              </button>
              <button
                style={{
                  backgroundColor: "#6A2BE2",
                  padding: "8px 20px",
                  color: "#fff",
                  margin: "-2 10px",
                }}
                onClick={handleCreateRoom}
              >
                Create
              </button>

              </div>
              <br></br>
              <div className="neonText">
                <br />
                <br />
                <p>
                  Here are the rules of the game:
                  <br></br>
                  First one to 3 points win
                  <br></br>
                  If a round is drawn point don't change
                  <br></br>
                  If a player disconnects other one is declared winner
                </p>
              </div>
            </div>
          </>
        )}
        {!room && showTextField && (
          <div>
            <input
              type="text"
              placeholder="Enter room name"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <br />
            <br />
            <button
              style={{
                backgroundColor: "#8A2BE2",
                padding: "5px",
                color: "#fff",
                marginRight: "5%",
              }}
              onClick={handleSubmit}
            >
              Submit
            </button>
            <button
              style={{ backgroundColor: "#ccc", padding: "5px" }}
              onClick={handleExitClick}
            >
              Cancel
            </button>
          </div>
        )}
        )
      </div>
    </div>
  );
}
