// const ffmpeg = require('fluent-ffmpeg');
const videoshow = require('videoshow');
const fs = require('fs');
const path = require('path');



// function concatenateAudios(audioFiles, outputFile) {
//     const command = ffmpeg();

//     // Add each audio file to the FFmpeg command
//     audioFiles.forEach(file => {
//         command.input(file);
//     });

//     command
//         .on('error', (err) => {
//             console.error('Error:', err);
//         })
//         .on('end', () => {
//             console.log('Concatenation finished.');
//         })
//         .mergeToFile(outputFile); // Merges the inputs into a single output file
// }

var videoOptions = {
  fps: 25,
  loop: 5, // seconds
  transition: true,
  transitionDuration: 1, // seconds
  videoBitrate: 2000,
  videoCodec: 'libx264',
  size: '1280x720',
  audioBitrate: '256k',
  audioChannels: 2,
  format: 'mp4',
  pixelFormat: 'yuv420p'
}

async function videoGeneration() {

  console.log("Stp 1")
  const directoryPath = path.join(__dirname, '../../../output');


  const files = await fs.readdir(directoryPath);
  console.log("Stp 2")

  const jpgFiles = files.filter(file => path.extname(file).toLowerCase() === '.jpg').map(file => path.join(directoryPath, file));
  const audioFiles = files.filter(file => path.extname(file).toLowerCase() === '.mp3').map(file => path.join(directoryPath, file));

  const images = jpgFiles.map(filePath => ({ path: filePath, loop: 5 }));

  console.log("Stp 3", jpgFiles, audioFiles, images)



  // concatenateAudios(audioFiles, '../../../output/output.mp3')

  console.log("Stp 4");

  videoshow(images, videoOptions)
  .audio('../../../output/output.mp3')
    .save('../../../../public/video.mp4')
    .on('start', function (command) {
      console.log('ffmpeg process started:', command)
    })
    .on('error', function (err, stdout, stderr) {
      console.error('Error:', err)
      console.error('ffmpeg stderr:', stderr)
    })
    .on('end', function (output) {
      console.error('Video created in:', output)
    })

    console.log("Stp 5");
};

export async function POST(request) {
  const req = await request.json()
  const res = await videoGeneration()
  return Response.json(res)
}







