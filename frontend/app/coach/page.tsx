"use client"
import { MainNav } from "@/components/main-nav";
import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs";
import { Input } from "@/components/ui/input";
import { Pose } from "@tensorflow-models/pose-detection";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


// Function to calculate Euclidean distance between two keypoints
function euclideanDistance(pose1, pose2) {
  if (pose1.length !== pose2.length) {
      throw new Error('Poses have different lengths');
  }
  let distanceSquared = 0;
  for (let i = 0; i < pose1.length; i++) {
      const p1 = pose1[i];
      const p2 = pose2[i];
      distanceSquared += Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
  }
  return Math.sqrt(distanceSquared);
}

// Function to calculate DTW distance between two arrays of poses
function dtwDistance(poses1, poses2) {
  const n = poses1.length;
  const m = poses2.length;

  // Initialize DTW matrix
  const DTW = [];

  for (let i = 0; i < n; i++) {
      DTW[i] = [];
      for (let j = 0; j < m; j++) {
          DTW[i][j] = Infinity;
      }
  }
  DTW[0][0] = 0;

  for (let i = 1; i < n; i++) {
      for (let j = 1; j < m; j++) {
          const cost = euclideanDistance(poses1[i], poses2[j]);
          DTW[i][j] = cost + Math.min(DTW[i - 1][j], DTW[i][j - 1], DTW[i - 1][j - 1]);
      }
  }
  // console.log(DTW)
  return DTW[n-1][m-1] / Math.min(n, m);
}

function adjustedDTWScores(DTW_scores_array) {
  const filteredScores = DTW_scores_array.filter(score => score !== Infinity);
  const highScore = filteredScores.length > 0 ? Math.max(...filteredScores) : 100000;

  // const highScore = Math.max(...DTW_scores_array);
  if (highScore == 0) {
    let ar = []
    for (let i = 0; i < DTW_scores_array.length; i++)
      ar.push(100)
    return ar;
  }
  // Adjust each element in DTW_scores_array
  for (let i = 0; i < DTW_scores_array.length; i++) {
    // DTW_scores_array[i] = highScore - DTW_scores_array[i]; // OLDER ADJUSTENT (max(values) - value)
    DTW_scores_array[i] = 100 - DTW_scores_array[i] * (100 / highScore); // NEWER ADJUSTMENT (1 - (value / max(values)))
    if (isNaN(DTW_scores_array[i]))
      DTW_scores_array[i] = 0
    else if (DTW_scores_array[i] == Infinity || DTW_scores_array[i] == -Infinity || DTW_scores_array[i] < 0)
      DTW_scores_array[i] = 0

  }

  return DTW_scores_array; // Return the adjusted array
}


export default function IndexPage() {
    const webcamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [capturing, setCapturing] = useState(false);
    const [didRPose, setRPose] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [poses, setPoses] = useState([]);
    const [selectedReference, setSelectedReference] = useState<File | null>(null);
    const [referencePoses, setReferencePoses] = useState<Pose[][]>([]);
    const [webcamPoses, setWebPoses] = useState<Pose[][]>([]);
    const [dtwGraph, setDTW] = useState<number[]>([]);
    const [adjDtwGraph, setDTWadj] = useState<number[]>([]);
    const [xAxisData, setXAxisData] = useState<number[]>([]);
    const [timestamps, setTimestamps] = useState([]);

    const normalizePoint = (pose) => {
      const averagex = pose.reduce((acc, point) => acc + point.x, 0) / pose.length;
      const averagey = pose.reduce((acc, point) => acc + point.y, 0) / pose.length;


      // Find the bounding box of the pose
      const minX = Math.min(...pose.map(point => point.x));
      const maxX = Math.max(...pose.map(point => point.x));
      const minY = Math.min(...pose.map(point => point.y));
      const maxY = Math.max(...pose.map(point => point.y));


      // Calculate the diagonal distance of the bounding box
      const diagonal = Math.sqrt(Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2));


      // Modify each point's x and y to be the distance from the average
      // Then scale it by the diagonal distance of the bounding box
      pose.forEach(point => {
        point.x = (Math.abs(point.x - averagex) / diagonal).toFixed(8); // Adjust precision as needed
        point.y = (Math.abs(point.y - averagey) / diagonal).toFixed(8); // Adjust precision as needed
      });
      return pose
    }


    const normalize = (poses) => {
      poses.forEach(pose => {
        // Calculate average x and y for the current pose
        const averagex = pose.reduce((acc, point) => acc + point.x, 0) / pose.length;
        const averagey = pose.reduce((acc, point) => acc + point.y, 0) / pose.length;


        // Find the bounding box of the pose
        const minX = Math.min(...pose.map(point => point.x));
        const maxX = Math.max(...pose.map(point => point.x));
        const minY = Math.min(...pose.map(point => point.y));
        const maxY = Math.max(...pose.map(point => point.y));


        // Calculate the diagonal distance of the bounding box
        const diagonal = Math.sqrt(Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2));


        // Modify each point's x and y to be the distance from the average
        // Then scale it by the diagonal distance of the bounding box
        pose.forEach(point => {
          point.x = (Math.abs(point.x - averagex) / diagonal).toFixed(8); // Adjust precision as needed
          point.y = (Math.abs(point.y - averagey) / diagonal).toFixed(8); // Adjust precision as needed
        });
      });
      return poses
    }

    const functionHighestWindowTotalScore = (array, windowSize, totalToGet, distanceFactor, adjustDTWarray) => {
        let distanceSums = [];
        let currentSum = 0;

        for (let i = 0; i <= array.length - windowSize; i++) {
          // if (array[i] == Infinity) array[i] = 0
          currentSum += adjustDTWarray[i];
          if (i >= windowSize) {
            currentSum -= adjustDTWarray[i - windowSize]
          }
          distanceSums.push([currentSum, i]);
        }
        console.log("MINE", distanceSums)

        distanceSums.sort()
        console.log("SORTED", distanceSums)

        let answer = [distanceSums.slice(0, 1)]
        const distance = windowSize * distanceFactor;
        let left = totalToGet - 1;
        let coords = []
        coords.push(distanceSums[0][1]);
        for (let i = 1; i < distanceSums.length && left > 0; i++) {
          let val = distanceSums[i][1]
          //check if val is within 2 of any of the coordinates in coords
          let flag = false;
          for (let j = 0; j < coords.length; j++) {
            if (Math.abs(val - coords[j]) < distance) {
              flag = true;
              break;
            }
          }
          if (!flag) {
            answer.push(distanceSums[i]);
            coords.push(val);
            left--;
          }
        }
        coords = coords.sort((a, b) => a - b);
        console.log("Answer:", coords)
        return coords
    }

    const getIndicesOfTopValues = (arr, k) => {
        // Create an array of objects with value and original index
        const arrayWithIndex = arr.map((value, index) => ({ value, index }));

        // Sort the array by value in descending order
        arrayWithIndex.sort((a, b) => b.value - a.value);

        // Get the indices of the top two values
        const indicesOfTopTwo = arrayWithIndex.slice(0, k).map(item => item.index);

        return indicesOfTopTwo;
    }

    useEffect(() => {
        if (capturing){
            const intervalId = setInterval(() => {
                detectPoses();
            }, 200); // Adjust the interval as needed
            return () => clearInterval(intervalId);
        }
    }, [capturing]);

    useEffect(() => {
      if (referencePoses.length > 0){
        setRPose(true);
      }
    }, [referencePoses])

    useEffect(() => {
      if (referencePoses.length > 0 && webcamPoses.length > 0){
        //DTW HERE
        const new_ref = referencePoses.slice(0, Math.min(referencePoses.length, webcamPoses.length));
        if (new_ref.length > 0){

          const DTWValue = dtwDistance(new_ref, webcamPoses);
          setDTW((currentDTW) => [...currentDTW, DTWValue]);

          const tmp = dtwGraph.slice();
          let adjusted = adjustedDTWScores(tmp);
          for(let i = 0; i < adjusted.length; i++){
              adjusted[i] = Math.min(adjusted[i] * 3, 100);
          }
          setDTWadj(adjusted.slice(Math.min(5, adjusted.length), adjusted.length))
          let xData = []
          for (let i = 0; i < webcamPoses.length; i++) {
            xData.push(i / 5)
          }
          setXAxisData(xData.splice(Math.min(5, xData.length), xData.length))
        }
      }
    }, [referencePoses, webcamPoses])

    useEffect(() => {
        if (selectedReference && selectedReference.type==='video/mp4'){
            const video = document.createElement('video');
            video.preload = 'auto';
            video.src = URL.createObjectURL(selectedReference);
            video.crossOrigin = 'anonymous';
            video.playbackRate = 100;
            video.muted = true;
            const framesPerSec = 3
            // Wait for the video to be ready to play
            video.onloadeddata = async () => {
                try {
                    // Initialize the pose detector
                    const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);

                    // Define the processFrame function
                    const processFrame = async (currentTime, allPoses = []) => {
                        video.currentTime = currentTime;
                        video.onseeked = async () => {
                        const poses = await detector.estimatePoses(video);
                        const newAllPoses = [...allPoses, poses[0].keypoints.slice(5, 11)];
                        console.log('Poses at', video.currentTime, newAllPoses);

                        if (video.currentTime < video.duration) {
                            processFrame(video.currentTime + ((30 / framesPerSec) / 30), newAllPoses); // Assuming 30 FPS
                        } else {
                            console.log('Video processing complete.');
                            URL.revokeObjectURL(video.src); // Clean up
                            setReferencePoses(normalize(allPoses));
                        }
                        };
                    };

                    // Set the onplay event handler
                    video.onplay = async () => {
                        console.log("PAUSE");
                        video.pause(); // Pause the video to start processing
                        processFrame(0);
                    };

                    // Explicitly play the video
                    await video.play();
                } catch (error) {
                console.error('Failed to process video:', error);
                }
            };
        }
    }, [selectedReference]);

    const processFrame = async (video) => {
        const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
        const poses = await detector.estimatePoses(video);
        if (capturing){
            setPoses(poses);
            if (poses.length > 0){
              const dummy = poses[0].keypoints.slice(5, 11).map(point => ({ ...point }));
              const averagex = dummy.reduce((acc, point) => acc + point.x, 0) / dummy.length;
              const averagey = dummy.reduce((acc, point) => acc + point.y, 0) / dummy.length;


              // Find the bounding box of the pose
              const minX = Math.min(...dummy.map(point => point.x));
              const maxX = Math.max(...dummy.map(point => point.x));
              const minY = Math.min(...dummy.map(point => point.y));
              const maxY = Math.max(...dummy.map(point => point.y));


              // Calculate the diagonal distance of the bounding box
              const diagonal = Math.sqrt(Math.pow(maxX - minX, 2) + Math.pow(maxY - minY, 2));


              // Modify each point's x and y to be the distance from the average
              // Then scale it by the diagonal distance of the bounding box
              dummy.forEach(point => {
                point.x = (Math.abs(point.x - averagex) / diagonal).toFixed(8); // Adjust precision as needed
                point.y = (Math.abs(point.y - averagey) / diagonal).toFixed(8); // Adjust precision as needed
              });
              setWebPoses((currentWebcamPoses) => [...currentWebcamPoses, dummy]);
            }
        }
    };

    const detectPoses = async () => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4 && capturing) {
          const { video } = webcamRef.current;
          const { height, width } = video;
          await processFrame(video);
        }
    };

    const handleStartCaptureClick = () => {
      setCapturing(true);
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: "video/webm"
      });
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
      mediaRecorderRef.current.start();
    };

    const handleDataAvailable = ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    };

    useEffect(() => {
        if (!capturing){
            setPoses([]);
        }
    }, [capturing])

    const handleStopCaptureClick = () => {
      mediaRecorderRef.current.stop();
      setCapturing(false);

      let topInd = getIndicesOfTopValues(dtwGraph.slice(Math.min(5, dtwGraph.length), dtwGraph.length), 3)
      let seconds = 5
      let keypoints = functionHighestWindowTotalScore(dtwGraph.slice(Math.min(5, dtwGraph.length), dtwGraph.length), seconds * 3, 6, 0.5, adjDtwGraph)

      console.log(topInd, adjDtwGraph[topInd[0]])
      console.log(keypoints)

      let keypointVals = []
      for (const frameNum of topInd) {
        console.log("num: ", frameNum)
        keypointVals.push([Math.floor(frameNum / 5), adjDtwGraph[frameNum], "Lowest performance here", 0])
      }

      for (const frameNum of keypoints) {

        keypointVals.push([Math.floor(frameNum / 5), adjDtwGraph[frameNum], "Poor performance in this section", 1])
      }
      keypointVals.sort((a, b) => a[0] - b[0]);
      console.log(keypointVals)

      // Step 2: Filter the array to keep only unique first elements
      let uniqueByKey = [];
      let previousValue = null;
      keypointVals.forEach(item => {
        if (item[0] !== previousValue) {
          if (item[1] > 90) item[2] = "Great job! You matched closely."
          else if(item[1] >= 70) item[2] = "Good performance! Some room for improvement."
          uniqueByKey.push(item);
          previousValue = item[0];
        }
      });

      console.log(uniqueByKey)
      setTimestamps(uniqueByKey)
      setPoses([]);
    };

    const handleDownload = () => {
      if (recordedChunks.length) {
        const blob = new Blob(recordedChunks, {
          type: "video/webm"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = url;
        a.download = "react-webcam-stream-capture.webm";
        a.click();
        window.URL.revokeObjectURL(url);
        setRecordedChunks([]);
        setWebPoses([]);
        setDTW([]);
        setDTWadj([]);
        setTimestamps([]);
      }
    };

    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (poses.length > 0) {
            const pointRadius = 2.3;
            const proceed1 = [9, 7, 5, 6, 8, 10];
            const proceed2 = [15, 13, 11, 12, 14, 16];
            const scalex = 4.3;
            const scaley = 4.4;

            // Apply mirroring transformation
            ctx.save(); // Save the current state
            ctx.translate(canvas.width, 0); // Move to the far right of the canvas
            ctx.scale(-1, 1); // Flip horizontally

            // Draw poses
            for (let i = 0; i < 5; i++) {
                const part = poses[0].keypoints[i];
                // Draw a point
                ctx.beginPath();
                ctx.arc(part.x / scalex, part.y / scaley, pointRadius, 0, 2 * Math.PI);
                ctx.fillStyle = "red";
                ctx.fill();
            }

            for (let i = 0; i < proceed1.length; i++) {
                const part = poses[0].keypoints[proceed1[i]];
                // Draw a point
                ctx.beginPath();
                ctx.arc(part.x / scalex, part.y / scaley, pointRadius, 0, 2 * Math.PI);
                ctx.fillStyle = "red";
                ctx.fill();

                // Connect points
                if (i > 0) {
                    const prevPart = poses[0].keypoints[proceed1[i - 1]];
                    ctx.beginPath();
                    ctx.moveTo(prevPart.x / scalex, prevPart.y / scaley);
                    ctx.lineTo(part.x / scalex, part.y / scaley);
                    ctx.strokeStyle = "red";
                    ctx.stroke();
                }
            }

            for (let i = 0; i < proceed2.length; i++) {
                const part = poses[0].keypoints[proceed2[i]];
                // Draw a point
                ctx.beginPath();
                ctx.arc(part.x / scalex, part.y / scaley, pointRadius, 0, 2 * Math.PI);
                ctx.fillStyle = "red";
                ctx.fill();

                // Connect points
                if (i > 0) {
                    const prevPart = poses[0].keypoints[proceed2[i - 1]];
                    ctx.beginPath();
                    ctx.moveTo(prevPart.x / scalex, prevPart.y / scaley);
                    ctx.lineTo(part.x / scalex, part.y / scaley);
                    ctx.strokeStyle = "red";
                    ctx.stroke();
                }
            }

            ctx.restore(); // Restore the saved state to remove mirroring
        }
    }, [poses]);


    const handleReferenceChange = async (event: any) => {
        const file = event.target.files[0];
        console.log(file, file.name)
        setSelectedReference(file);
    };

    const videoConstraints = {
      width: 1280,
      height: 720,
      aspectRatio: 16 / 9,
    };

    const getNiceTimeStamp = (timestamp) => {
        const formatTime = (time) => {
          const minutes = Math.floor(time / 60);
          const seconds = time % 60;
          return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        // Calculate and format the original timestamp
        const originalTime = formatTime(timestamp);
        // Calculate and format the timestamp plus 5 seconds
        const plusFiveSeconds = formatTime(timestamp + 5);

        // Return the formatted time strings, separated by space
        return `${originalTime} - ${plusFiveSeconds}`;
      }
      const getNiceTimeStamp1 = (timestamp) => {
        const formatTime = (time) => {
          const minutes = Math.floor(time / 60);
          const seconds = time % 60;
          return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        const originalTime = formatTime(timestamp);
        // Return the formatted time strings, separated by space
        return `${originalTime}`;
      }

    return (
      <>
        <header className="bg-background sticky top-0 z-40 w-full">
        <div className="flex flex-col">
            {/* First row */}
            <div className="flex flex-row items-start">
                <div className="w-full flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 mt-4 ml-6">
                <MainNav />
                </div>
                {/* Second row */}
                <div className="flex flex-col items-center justify-center gap-2 mb-3 mt-4">
                    <p className="max-w-[700px] text-md text-muted-foreground mb-1">
                    Upload a reference video MP4 dancing file:
                    </p>
                    <Input id="reference" type="file" className="w-[500px]" onChange={handleReferenceChange} />
                </div>
                <div className="w-full"></div>
            </div>
        </div>
        </header>
        <div style={{ position: "relative", maxWidth: "1100px" }}>
                <Webcam mirrored={true} muted={true} audio={true} ref={webcamRef} videoConstraints={videoConstraints} style={{ maxWidth: "100%", display: "block", zIndex: -1 }} />
                {selectedReference && selectedReference.type === 'video/mp4' && (
                    <VideoPreview file={selectedReference} />
                )}
                <canvas
                    ref={canvasRef}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        zIndex: 1,
                        width: "100%", // Adjusted to match webcam width
                        height: "100%", // Adjusted to match webcam height
                        display: "block"
                    }}
                />
            </div>
        <span className="mt-4 mb-10 flex flex-row gap-4">
        {capturing ? (
          <Button className="min-w-[200px]" onClick={handleStopCaptureClick}>Stop Capture</Button>
        ) : (
          <Button className="min-w-[200px]" onClick={handleStartCaptureClick} disabled={!didRPose}>
            {didRPose ? 'Start Capture' : 'Process Reference Video...'}
          </Button>
        )}
        {recordedChunks.length > 0 && (
          <Button className="min-w-[200px]" onClick={handleDownload}>Download</Button>
        )}
        </span>
        {adjDtwGraph.length > 0 && (
            <div className="flex flex-row gap-4 mb-10">
                <div className="flex flex-col items-center justify-center">
                    <Label className="text-md mb-2 font-semibold"> Your Dance Performance </Label>
                    <AreaChart
                        width={800}
                        height={400}
                        data={adjDtwGraph.map((value, index) => ({ name: xAxisData[index], uv: value }))}
                        margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                </div>
                <section style={{ color: 'black', background: 'radial-gradient(circle, #212e38, black)', flex: '30%' }}>
                  <div style={{ marginLeft: '15px', marginTop: '8px', color: 'white' }}>
                    <h1 style={{ textDecoration: 'underline' }}><b>Key Insights</b></h1>

                    <ul style={{ listStyleType: 'none', marginLeft: '10px' }}> {/* Remove default bullet points and add left margin */}
                      {timestamps.map((timestamp, index) => {
                        const niceTimestamp = getNiceTimeStamp(timestamp[0]);
                        const niceTimestamp1 = getNiceTimeStamp1(timestamp[0]);
                        return (
                          <li key={index} style={{ fontSize: '14px' }}> {/* Adjust font size for the entire line including the custom bullet */}

                            {timestamp[3] === 0 ? (
                              <p><span style={{ fontSize: '12px', color: '#aaa' }}>• </span>
                                <b style={{ color: '#b3d9ff' }}>{`${niceTimestamp1}`}</b> {`(${(timestamp[1]).toFixed(0)}%): ${timestamp[2]}`}
                              </p>) : (
                              // <div>
                              <p style={{}}><span style={{ fontSize: '12px', color: '#aaa' }}>• </span>
                                <b style={{ color: '#b3d9ff' }}>{`${niceTimestamp}`}</b> {`(${(timestamp[1]).toFixed(0)}%): ${timestamp[2]}`}</p>
                              // <p></p>
                            )
                            }
                            {/* <b>{`${niceTimestamp}`}</b> {`(${(timestamp[1]).toFixed(0)}%): ${timestamp[2]}`} */}
                          </li>
                        );
                      })}
                    </ul>

                  </div>
                </section >
            </div>
        )}
      </>
    );
};

interface VideoPreviewProps {
    file: File;
  }

  const VideoPreview: React.FC<VideoPreviewProps> = ({ file }) => {
    const videoUrl = URL.createObjectURL(file);

    return (
      <div className="flex flex-col items-center justify-center gap-2" style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 2,
        width: "10%", // Adjusted to match webcam width
        height: "10%", // Adjusted to match webcam height
        display: "block"
    }}>
        <video controls className="max-w-[350px]">
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };
