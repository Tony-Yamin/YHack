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



// Example usage
const PersonAPose1 = [
  {x: 230, y: 220, score: 0.9, name: "nose"},
  {x: 212, y: 190, score: 0.8, name: "left_eye"},
  {x: 212, y: 190, score: 0.75, name: "right_eye"}
];
const PersonAPose2 = [
  {x: 330, y: 320, score: 0.9, name: "nose"},
  {x: 312, y: 290, score: 0.8, name: "left_eye"},
  {x: 212, y: 190, score: 0.75, name: "right_eye"}
];
const PersonAPose3 = [
  {x: 130, y: 120, score: 0.9, name: "nose"},
  {x: 112, y: 490, score: 0.8, name: "left_eye"},
  {x: 212, y: 190, score: 0.75, name: "right_eye"}
];

const PersonBPose1 = [
  {x: 230, y: 220, score: 0.85, name: "nose"},
  {x: 212, y: 190, score: 0.75, name: "left_eye"},
  {x: 212, y: 190, score: 0.75, name: "right_eye"}
];

const PersonBPose2 = [
  {x: 320, y: 330, score: 0.85, name: "nose"},
  {x: 292, y: 556, score: 0.75, name: "left_eye"},
  {x: 212, y: 190, score: 0.75, name: "right_eye"}
];

const PersonBPose3 = [
  {x: 130, y: 120, score: 0.9, name: "nose"},
  {x: 112, y: 2342, score: 0.8, name: "left_eye"},
  {x: 212, y: 2342, score: 0.75, name: "right_eye"}
];

const PersonA = [PersonAPose1, PersonAPose2, PersonAPose3];
const PersonB = [PersonBPose1, PersonBPose2, PersonBPose3];

//EXAMPLE FOR ONE DTW VALUE!
// const DTWValue = dtwDistance(PersonA, PersonB); // USE THIS!!!!

// THIS CODE COMPUTES DTW, LIKE A MAIN FUNCTION!
DTW_scores_array = []
// Calculate average DTW for increasing number of poses
for (let i = 1; i <= Math.min(PersonA.length, PersonB.length); i++) {
  const DTW_value = dtwDistance(PersonA.slice(0, i), PersonB.slice(0, i));
  // console.log(`DTW for first ${i} poses: ${DTW_value}`);
  DTW_scores_array.push(DTW_value)
}
const DTW_value = dtwDistance(PersonA, PersonB);
  // console.log(`DTW for first ${i} poses: ${DTW_value}`);
if (PersonA.length != PersonB.length){
  DTW_scores_array.push(DTW_value)
}
console.log("DTW_scores_array: ", DTW_scores_array); // ORIGINAL VALUE!


function adjustedDTWScores(DTW_scores_array) {
  const highScore = Math.max(...DTW_scores_array);
  // Adjust each element in DTW_scores_array
  for (let i = 0; i < DTW_scores_array.length; i++) {
      // DTW_scores_array[i] = highScore - DTW_scores_array[i]; // OLDER ADJUSTENT (max(values) - value)
      DTW_scores_array[i] = 100 - DTW_scores_array[i] * (100 / highScore); // NEWER ADJUSTMENT (1 - (value / max(values)))
  }

  return DTW_scores_array; // Return the adjusted array
}

console.log("Adjusted DTW score array: ", adjustedDTWScores(DTW_scores_array)); // USE THIS VALUE!!!

console.log("\n\nData Visualizations......")

function functionHighestWindowTotalScore(array, windowSize, totalToGet, distanceFactor, adjustDTWarray) {
  distanceSums = [];
  result = [];
  currentSum = 0;

  for (let i = 0; i <= array.length - windowSize; i++) {
      if (i === 0) {
          result = array.slice(i, i + windowSize);
          currentSum = result.reduce((a, b) => a + b, 0);
          distanceSums.push(currentSum);
      }
      else {
          currentSum = currentSum - array[i - 1] + array[i + windowSize - 1]; // updates our sum
          distanceSums.push(currentSum);
      }
  }
  // console.log("distanceSums: ", distanceSums);
  //sort distanceSums but record their original indexes before sorting and get the top 2 highest window scores
  let sortedDistanceSums = distanceSums.map((item, index) => [item, index])
      .sort(([count1], [count2]) => count2 - count1)
      // .slice(0, 2);
  let answer = [sortedDistanceSums.slice(0,1)]
  // const totalToGet = 3;
  // const distanceFactor = 0.5;

  const distance = windowSize * distanceFactor;
  let left = totalToGet - 1;
  let coords = []
  coords.push(sortedDistanceSums[0][1]);
  for(let i = 1; i < sortedDistanceSums.length && left > 0; i++){
      let val = sortedDistanceSums[i][1]
      //check if val is within 2 of any of the coordinates in coords
      let flag = false;
      for(let j = 0; j < coords.length; j++){
          if(Math.abs(val - coords[j]) < distance){
              flag = true;
              break;
          }
      }
      if(!flag){
          answer.push(sortedDistanceSums[i]);
          coords.push(val);
          left--;
      }
  }
  // console.log("sortedDistanceSums: ", sortedDistanceSums);
  let transformedAnswer = answer.map(item => {
      if(Array.isArray(item[0])) {
          return item[0];
      } else {
          return item;
      }
  });
  transformedAnswer.sort((a, b) => a[1] - b[1]);

  // REPLACING THE DTW SCORES WITH THE ADJUSTED DTW SCORES
  distanceSums = [];
  result = [];
  currentSum = 0;

  for (let i = 0; i <= adjustDTWarray.length - windowSize; i++) {
      if (i === 0) {
          result = adjustDTWarray.slice(i, i + windowSize);
          currentSum = result.reduce((a, b) => a + b, 0);
          distanceSums.push(currentSum);
      }
      else {
          currentSum = currentSum - adjustDTWarray[i - 1] + adjustDTWarray[i + windowSize - 1]; // updates our sum
          distanceSums.push(currentSum);
      }
  }
  console.log("transformedAnswer: ", transformedAnswer);
  console.log("distanceSums: ", distanceSums);
  const updated_DTW_array = transformedAnswer.map(([_, index]) => {
      const value = distanceSums[index];
      return [value, index];
  });

  return updated_DTW_array;
}

const array_dummy = [45, 23, 78, 12, 91, 8, 35, 67, 54, 3, 99, 17, 62, 87, 29];

const adjusted_array_dummy = [67, 29, 62, 12, 35, 3, 54, 8, 17, 78, 45, 91, 23, 87, 99]

console.log("Highest Window Total Score across 5 seconds", functionHighestWindowTotalScore(array_dummy, 5, 3, 0.5, adjusted_array_dummy)) // USE THIS VALUE!!!
// sum is listed FIRST, index is listed SECOND


function highestTwoScores(array) {
  // Create a copy of the original array
  const copyArray = array.slice();
  const sortedArray = copyArray.sort((a, b) => b - a);
  return sortedArray.slice(0, 2);
}

console.log("Highest scores in general", highestTwoScores(array_dummy)); // USE THIS VALUE!!!
