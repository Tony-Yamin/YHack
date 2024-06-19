import cv from 'opencv.js';

function onOpenCvReady() {
  cv['onRuntimeInitialized'] = () => {
      console.log("OpenCV ready");

      document.getElementById('video').addEventListener('play', () => {
        setTimeout(convertFrameToGrayscale, 5000);
    });
  };
}

function convertFrameToGrayscale() {
  // Implementation of the function
  let video = document.getElementById('video');
  let canvas = document.getElementById('canvas');
  let context = canvas.getContext('2d');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  let src = cv.imread(canvas);
  let dst = new cv.Mat();
  cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
  cv.imshow(canvas, dst);
  src.delete();
  dst.delete();
}