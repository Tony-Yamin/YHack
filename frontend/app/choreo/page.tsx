"use client"
// import { adjustedDTWScores, dtwDistance } from './dtw'; // adjust the path if necessary


import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Search } from "@/components/search"
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from "react"
import { Question } from "@/components/quiz/question"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Video } from "@/components/video/video"
import { wait } from "@/lib/utils"
import { MainNav } from "@/components/main-nav"
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { Paper } from '@mui/material';
// Suppose you're using a third-party chart library compatible with MUI
// import { Chart, Series } from 'some-react-chart-library';

import { LineChart } from '@mui/x-charts/LineChart';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"
// import { LineChart, Line } from 'recharts';
// import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';



export default function IndexPage() {

  const [generating, setGen] = useState(false);
  const [responseData, setResponseData] = useState('');
  const [yourData, setYourData] = useState([2, 1, 4, 5, 2, 3, 45, 51, 78]);
  const [selectedReference, setSelectedReference] = useState<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isChartVisible, setChartVisible] = useState(false);
  const [xAxisData, setXAxisData] = useState([1, 2, 3, 5, 8, 10, 15, 20, 30, 35, 37, 40, 41, 42, 43, 46, 48, 51, 52, 53, 55, 58, 59]);
  const [seriesData, setSeriesData] = useState([2, 5.5, 2, 8.5, 1.5, 5, 2, 5.5, 2, 8.5, 1.5, 52, 5.5, 2, 8.5, 1.5, 52, 5.5, 2, 8.5, 1.5, 5]);
  const [myPoses, setMyPoses] = useState([]);
  const [referencePoses, setReferencePoses] = useState([]);
  const [timestamps, setTimestamps] = useState([
    [12, 3, "arm"],
    [15, 10, "leg"],
    [11, 18, "head"],
    [21, 23, "right elbow"],
  ]);

  const [isProcessingCompleteMe, setIsProcessingCompleteMe] = useState(false);
  const [isProcessingCompleteRef, setIsProcessingCompleteRef] = useState(false);

  // Use a ref to reference the chart section for scrolling
  const chartRef = useRef(null);

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    console.log(file, file.name)
    setSelectedFile(file);
  };

  const handleReferenceChange = async (event: any) => {
    const file = event.target.files[0];
    console.log(file, file.name)
    setSelectedReference(file);
  };

  // Scroll to the chart when it becomes visible
  useEffect(() => {
    if (isChartVisible && chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isChartVisible]); // Dependency array ensures this runs only when isChartVisible changes

  useEffect(() => {
    if (isProcessingCompleteMe && isProcessingCompleteRef) {
      // TODO: use myPoses and referencePoses
      //  calculate DTW and all stuff
      // then set state variables for graphs and feedback
      // display that
    }
  }, [isProcessingCompleteMe, isProcessingCompleteRef]);


  async function processVideo(source, setPoses) {
    let accumulatedPoses = []
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.src = URL.createObjectURL(source);
      video.crossOrigin = 'anonymous';
      video.playbackRate = 100;
      video.muted = true;
      const framesPerSec = 3;
      video.onloadeddata = async () => {
        try {
          const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
          const processFrame = async (currentTime) => {
            video.currentTime = currentTime;
            video.onseeked = async () => {
              const poses = await detector.estimatePoses(video);
              // console.log('Poses at for ' + source, video.currentTime, poses[0].keypoints.slice(5, 17));
              // Use dynamic stateVariableName to update state
              // setPoses((prevPoses) => [...prevPoses, poses]); // Append new poses
              accumulatedPoses.push(poses[0].keypoints.slice(5, 17));
              // console.log(poses.slice(5, 17))
              // console.log(accumulatedPoses.length)
              if (video.currentTime < video.duration) {
                processFrame(video.currentTime + ((30 / framesPerSec) / 30));
              } else {
                // console.log('Video processing complete.');
                // setIsProcessingCompleteMe(true);
                URL.revokeObjectURL(video.src);
                resolve(accumulatedPoses); // Resolve the promise upon completion
              }
            };
          };
          video.onplay = async () => {
            video.pause();
            processFrame(0);
          };
          await video.play();
        } catch (error) {
          console.error('Failed to process video:', error);
          reject(error); // Reject the promise on error
        }
      };
    });
  }

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
    return DTW[n - 1][m - 1] / Math.min(n, m);
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
  const getIndicesOfTopValues = (arr, k) => {
    // Create an array of objects with value and original index
    const arrayWithIndex = arr.map((value, index) => ({ value, index }));

    // Sort the array by value in descending order
    arrayWithIndex.sort((a, b) => b.value - a.value);

    // Get the indices of the top two values
    const indicesOfTopTwo = arrayWithIndex.slice(0, k).map(item => item.index);

    return indicesOfTopTwo;
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

  // Function to handle button click
  const handleClick = async () => {
    // console.log("Set visible")
    if (!selectedReference || selectedReference.type !== 'video/mp4') {
      console.error('Selected reference is not an MP4');
      return;
    } else if (!selectedFile || selectedFile.type !== 'video/mp4') {
      console.error('Selected file is not an MP4');
      return;
    } else {
      setGen(true);
      Promise.all([
        processVideo(selectedFile, setMyPoses),
        processVideo(selectedReference, setReferencePoses)
      ]).then(([myPoses, referencePoses]) => {
        // setMyPoses(a);
        // setReferencePoses(b);
        myPoses = normalize(myPoses)
        referencePoses = normalize(referencePoses)
        console.log('Both videos have been processed.');
        console.log(myPoses.length)
        console.log(myPoses[28])
        console.log(referencePoses.length)
        console.log(referencePoses[28])
        setChartVisible(true)

        let DTW_scores_array = []
        // DTW_scores_array.push(3)
        // Calculate average DTW for increasing number of poses
        console.log("Going to calculate")
        let xData = []
        for (let i = 0; i < myPoses.length; i++) {
          xData.push(i / 3)
        }
        setXAxisData(xData.splice(Math.min(5, xData.length), xData.length))
        for (let i = 1; i <= Math.min(myPoses.length, referencePoses.length); i++) {
          // const DTW_value = dtwDistance(myPoses.slice(Math.floor(i * 0.3), Math.ceil(i * 1.1)), referencePoses.slice(0, i));
          const DTW_value = dtwDistance(myPoses.slice(0, i), referencePoses.slice(0, i));
          console.log("Calculating ", i, Math.min(myPoses.length, referencePoses.length), DTW_value)
          DTW_scores_array.push(DTW_value)
        }
        const DTW_value = dtwDistance(myPoses, referencePoses);
        // console.log(`DTW for first ${i} poses: ${DTW_value}`);
        if (myPoses.length != referencePoses.length) {
          DTW_scores_array.push(DTW_value)
        }
        let adjusted = adjustedDTWScores(DTW_scores_array.slice())
        for(let i = 0; i < adjusted.length; i++){
            adjusted[i] = Math.min(adjusted[i] * 3, 100);
        }
        setSeriesData(adjusted.slice(Math.min(5, adjusted.length), adjusted.length))
        console.log("orig DTW_scores_array: ", DTW_scores_array); // ORIGINAL VALUE!
        console.log("adjusted DTW_scores_array: ", adjusted); // ADjusted VALUE!

        let topInd = getIndicesOfTopValues(DTW_scores_array, 3)
        let seconds = 5
        let keypoints = functionHighestWindowTotalScore(DTW_scores_array, seconds * 3, 6, 0.5, adjusted)

        console.log(topInd, adjusted[topInd[0]])
        console.log(keypoints)

        let keypointVals = []
        for (const frameNum of topInd) {
          console.log("num: ", frameNum)
          keypointVals.push([Math.floor(frameNum / 3), adjusted[frameNum], "Lowest performance here", 0])
        }

        for (const frameNum of keypoints) {
          keypointVals.push([Math.floor(frameNum / 3), adjusted[frameNum], "Poor performance in this section", 1])
        }
        keypointVals.sort((a, b) => a[0] - b[0]);

        // Step 2: Filter the array to keep only unique first elements
        let uniqueByKey = [];
        let previousValue = null;
        keypointVals.forEach(item => {
          if (item[0] !== previousValue) {
            if (item[1] > 90) item[2] = "Great job! You matched closely."
            uniqueByKey.push(item);
            previousValue = item[0];
          }
        });

        console.log(uniqueByKey)
        setTimestamps(uniqueByKey)

        setGen(false)
      }).catch((error) => {
        console.error('Error processing videos:', error);
      });
    }
  };

  const data = [
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];
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
  const CustomizedDot = (props) => {
    const { cx, cy, stroke, payload, value } = props;

    if (value > 2500) {
      return (
        <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="red" viewBox="0 0 1024 1024">
          <path d="M512 1009.984c-274.912 0-497.76-222.848-497.76-497.76s222.848-497.76 497.76-497.76c274.912 0 497.76 222.848 497.76 497.76s-222.848 497.76-497.76 497.76zM340.768 295.936c-39.488 0-71.52 32.8-71.52 73.248s32.032 73.248 71.52 73.248c39.488 0 71.52-32.8 71.52-73.248s-32.032-73.248-71.52-73.248zM686.176 296.704c-39.488 0-71.52 32.8-71.52 73.248s32.032 73.248 71.52 73.248c39.488 0 71.52-32.8 71.52-73.248s-32.032-73.248-71.52-73.248zM772.928 555.392c-18.752-8.864-40.928-0.576-49.632 18.528-40.224 88.576-120.256 143.552-208.832 143.552-85.952 0-164.864-52.64-205.952-137.376-9.184-18.912-31.648-26.592-50.08-17.28-18.464 9.408-21.216 21.472-15.936 32.64 52.8 111.424 155.232 186.784 269.76 186.784 117.984 0 217.12-70.944 269.76-186.784 8.672-19.136 9.568-31.2-9.12-40.096z" />
        </svg>
      );
    }

    return (
      <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="green" viewBox="0 0 1024 1024">
        <path d="M517.12 53.248q95.232 0 179.2 36.352t145.92 98.304 98.304 145.92 36.352 179.2-36.352 179.2-98.304 145.92-145.92 98.304-179.2 36.352-179.2-36.352-145.92-98.304-98.304-145.92-36.352-179.2 36.352-179.2 98.304-145.92 145.92-98.304 179.2-36.352zM663.552 261.12q-15.36 0-28.16 6.656t-23.04 18.432-15.872 27.648-5.632 33.28q0 35.84 21.504 61.44t51.2 25.6 51.2-25.6 21.504-61.44q0-17.408-5.632-33.28t-15.872-27.648-23.04-18.432-28.16-6.656zM373.76 261.12q-29.696 0-50.688 25.088t-20.992 60.928 20.992 61.44 50.688 25.6 50.176-25.6 20.48-61.44-20.48-60.928-50.176-25.088zM520.192 602.112q-51.2 0-97.28 9.728t-82.944 27.648-62.464 41.472-35.84 51.2q-1.024 1.024-1.024 2.048-1.024 3.072-1.024 8.704t2.56 11.776 7.168 11.264 12.8 6.144q25.6-27.648 62.464-50.176 31.744-19.456 79.36-35.328t114.176-15.872q67.584 0 116.736 15.872t81.92 35.328q37.888 22.528 63.488 50.176 17.408-5.12 19.968-18.944t0.512-18.944-3.072-7.168-1.024-3.072q-26.624-55.296-100.352-88.576t-176.128-33.28z" />
      </svg>
    );
  };

  return (
    <>
      <header className="bg-background sticky top-0 z-40 w-full">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 mt-4">
          <MainNav />
        </div>
      </header>
      <section className="container grid items-center gap-10 pb-8 md:pb-10">
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="leading-tight mb-6 flex flex-col items-center">
            <span className="font-semibold text-3xl" style={{ backgroundImage: 'linear-gradient(135deg, #3e61c1, #a6b6e2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pre-recorded Video</span>
          </span>

          <div className="flex flex-row items-center justify-center gap-6">
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="max-w-[700px] text-md text-muted-foreground mb-1">
                Upload a reference video MP4 dancing file:
              </p>
              <Input id="reference" type="file" className="w-[500px]" onChange={handleReferenceChange} />
              {selectedReference && selectedReference.type === 'video/mp4' && (
                <VideoPreview file={selectedReference} />
              )}
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="max-w-[700px] text-md text-muted-foreground mb-1">
                Upload a video MP4 file of you dancing:
              </p>
              <Input id="file" type="file" className="w-[500px]" onChange={handleFileChange} />
              {selectedFile && selectedFile.type === 'video/mp4' && (
                <VideoPreview file={selectedFile} />
              )}
            </div>
          </div>



          <Button variant="secondary" className="w-[200px] mt-3" onClick={handleClick} disabled={!selectedFile || !selectedReference}>
            {generating ? 'Loading...' : 'Get Feedback'}
          </Button>
          {responseData != '' && (
            <Video videoUrl={responseData} />
          )}
        </div>
      </section>
      {isChartVisible && (
        <div style={{ display: 'flex', width: '80%' }}>
          <div className="flex flex-col items-center justify-center mb-10">
                    <Label className="text-md mb-2 font-semibold"> Your Dance Performance </Label>
                    <AreaChart
                        width={800}
                        height={400}
                        data={seriesData.map((value, index) => ({ name: xAxisData[index], uv: value }))}
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
        </div >
      )
      }
    </>
  )
}

interface VideoPreviewProps {
  file: File;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ file }) => {
  const videoUrl = URL.createObjectURL(file);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <video controls className="max-w-[500px]">
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
