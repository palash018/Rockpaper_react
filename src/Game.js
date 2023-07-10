// 0. Install fingerpose npm install fingerpose
// 1. Add Use State
// 2. Import emojis and finger pose import * as fp from "fingerpose";
// 3. Setup hook and emoji object
// 4. Update detect function for gesture handling
// 5. Add emoji display to the screen

///////// NEW STUFF ADDED USE STATE
import React, { useRef, useState, useEffect } from "react";
///////// NEW STUFF ADDED USE STATE
import '@tensorflow/tfjs-backend-webgl';
// import logo from './logo.svg';
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import "./App.css";
import { drawHand } from "./utilities";
import { RockGesture, PaperGesture, ScissorsGesture } from './Gestures';
///////// NEW STUFF IMPORTS
import * as fp from "fingerpose";
import victory from "./victory.png";
import rock from "./rock.png";
import paper from "./paper.png";
import Final from "./Final";
///////// NEW STUFF IMPORTS

export default function Game(props) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [move, setMove] = useState();
  const [score, setScore] = useState();
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [first,setFirst]=useState(true);
  const [model,setModel]=useState(false);
  const [status,setStatus]=useState(null);
  ///////// NEW STUFF ADDED STATE HOOK
  const [emoji, setEmoji] = useState(null);
  const images = { rock:rock, scissor:victory,paper:paper };
  
  ///////// NEW STUFF ADDED STATE HOOK
  
  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 10);
  };
 
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
      if(value.error){
        alert(value.error);
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
  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const hand = await net.estimateHands(video);
      // console.log(hand);

      ///////// NEW STUFF ADDED GESTURE HANDLING

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          RockGesture,
          ScissorsGesture,
          PaperGesture
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 4);
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          // console.log(gesture.gestures);

          const confidence = gesture.gestures.map(
            (prediction) => prediction.confidence
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );
          // console.log(gesture.gestures[maxConfidence].name);
          setEmoji(gesture.gestures[maxConfidence].name);
          setMove(gesture.gestures[maxConfidence].name);
          if(!model){
            setModel(true);
          props.socket.emit('ready');
          }
        }
      }

      ///////// NEW STUFF ADDED GESTURE HANDLING

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  useEffect(()=>{runHandpose()},[]);

  return (
    <div className="App">
      {status==null?
      (
      <div>
        <div className="neonText" style={{position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            }}>
       {secondsLeft !== null ? (
        <p >Your Move will be fixed in {secondsLeft} </p>
      ) : (
        <p >Please wait</p>
      )}
      
       <p>You are in room {props.room}</p>
       <p>Current Score :{score}</p>
       </div>
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 0,
            width: 640,
            height: 480,
          }}
        />
        
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 0,
            width: 640,
            height: 480,
          }}
        />
        {/* NEW STUFF */}
        {emoji !== null ? (
          <img
            src={images[emoji]}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 400,
              bottom: 500,
              right: 0,
              textAlign: "center",
              height: 100,
            }}
          />
        ) : (
          ""
        )}
      </header>
      
      
      </div>
      ):<Final status={status}/>}
    </div>
  );
}

