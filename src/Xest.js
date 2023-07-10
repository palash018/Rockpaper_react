import React, { useRef, useState, useEffect } from "react";
import Final from "./Final";
export default function Xest(props) {
  const [move, setMove] = useState("");
  const [score, setScore] = useState();
  // const [wait,setWait]=useState(true);
  // const [countdown, setCountdown] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [first,setFirst]=useState(true);
  const [status,setStatus]=useState(null);
  function startTimer() {
    setSecondsLeft(10);
  }

  useEffect(() => {
    // Exit early when we reach zero
    if(first) {setFirst(false); return; }
    if (!secondsLeft) { props.socket.emit("move",move); setSecondsLeft(null); return; }
    
    // Save intervalId to clear the interval when the component re-renders
    const intervalId = setInterval(() => {
      setSecondsLeft(secondsLeft - 1);
    }, 1000);

    // Clearing intervalId right before next effect will be called on unmount.
    return () => clearInterval(intervalId);

   // Add `seconds` as a dependency so this effect gets called every time it changes
   }, [secondsLeft]);
  useEffect(() => {
    function onConnect() {
      console.log("established");
    }
    function onOver(value){
      console.log(value);
      setStatus(value);
    }
    function onDisconnect() {}

    function onReady(value) {
      console.log(value);
      for(let i=0;i<value.length;i++){
        if(value[i].player==props.socket.id){
          setScore(value[i].score);
        }
      }
      startTimer();
    }
    function onEvent(value) {
      if (value.move) {
        if (value.move == "rock") {
        }
        if (value.move === "scissor") {
        }
        if (value.move === "paper") {
        }
      }
    }
    props.socket.on("event", onEvent);
    props.socket.on("connect", onConnect);
    props.socket.on("disconnect", onDisconnect);
    props.socket.on("ready", onReady);
    props.socket.on("over",onOver);
    return () => {
      props.socket.off("event", onEvent);
      props.socket.off("connect", onConnect);
      props.socket.off("disconnect", onDisconnect);
    };
  }, []);
  return (
    <div className="xest">
      {status==null?(
      <div>
      <p>You are in room {props.room}</p>
      <p>Current Score :{score}</p>
      {secondsLeft !== null ? (
        <p>Your Move will be fixed in{secondsLeft}</p>
      ) : (
        <p>Please wait</p>
      )}
      <div>
        <button onClick={() =>setMove("rock")}>Rock</button>
        <button onClick={()=>setMove("paper")}>Paper</button>
        <button onClick={()=>setMove("scissor")}>Scissor</button>
        <button onClick={()=>props.socket.emit("ready")}>Ready </button>
      </div>
      </div>):<Final status={status}></Final>
      }
    </div>
  );
}
