//REQUIREMENTS:
const fetch = require('node-fetch').default;
const axios = require('axios')
const fs = require('fs');
const path = require('path');
const engineId = 'stable-diffusion-xl-1024-v1-0';
const apiHost = 'https://api.stability.ai';

//MAIN FUNCTION
async function generateImage(promptText, idx) {
  console.log("        ==========          ==========        Gennerating: " + promptText + " ")
  const url = 'https://api.openai.com/v1/images/generations';
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY; // Assuming the API key is stored in an environment variable

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  const data = {
    model: "dall-e-3",
    prompt: promptText,
    n: 1,
    size: "1792x1024"
  };

  fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(async data => {
      console.log('Success:', data);
      let image_url = data.data[0].url;
      // console.log(image_url);

      console.log("HEREEEEEE: ")
      const directoryPath = path.join(__dirname, '../../../output');
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      console.log("Downloading from", image_url)
      const res = await fetch(image_url);
      const imageBuffer = await res.buffer();
      const filePath = path.join(directoryPath, `img_${idx}.jpg`);
      console.log("done downloading ====================================================================")

      fs.writeFile(filePath, imageBuffer, (err) => {
        if (err) {
          console.log('Error writing image file:', err);
        } else {
          console.log(`Image saved as ${filePath}`);
        }
      });
    })

  return "";
}

export async function getAudio(scriptPart) {
  // Set the API key for ElevenLabs API.
  const API_KEY = process.env.NEXT_PUBLIC_ELEVEN_LABS
  const VOICE_ID = process.env.NEXT_PUBLIC_VOICE_ID

  // Set options for the API request.
  const options = {
    method: 'POST',
    url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    headers: {
      accept: 'audio/mpeg', // Set the expected response type to audio/mpeg.
      'content-type': 'application/json', // Set the content type to application/json.
      'xi-api-key': `${API_KEY}`, // Set the API key in the headers.
    },
    data: {
      text: scriptPart, // Pass in the inputText as the text to be converted to speech.
      // model_id: "eleven_multilingual_v1",
      // stability: 0.41,
      // similarity_boost: 0.85, // Set the similarity boost to 0.5.
    },
    responseType: 'arraybuffer', // Set the responseType to arraybuffer to receive binary data as response.
  };

  const speechDetails = await axios.request(options);
  console.log("Audio Generation progress")

  // Return the binary audio data received from the API response.
  return speechDetails.data;
};

async function generateImagesAndAudios(imagePrompts, scriptParts) {
  try {
    // Creating an array of promises for generateImage
    // const imagePromises = imagePrompts.slice(0,3).map((prompt, idx) => generateImage(prompt, idx));
    imagePrompts.splice(1, 1);
    const imagePromises = imagePrompts.map((prompt, idx) => generateImage(prompt, idx));
    // const imagePromises = []
    // Creating an array of promises for getAudio
    const audioPromises = scriptParts.map((part) => getAudio(part));

    // Concatenating both arrays of promises
    const allPromises = imagePromises.concat(audioPromises);
    // console.log("HERE is ALL PROMISES: ", allPromises)

    console.log("WAiting on results ===================")

    // Executing all promises simultaneously and handling the results
    const allResults = await Promise.all(allPromises);

    // Separating the results back into images and audios

    const imageResults = allResults.slice(0, imagePromises.length);
    const audioResults = allResults.slice(imagePromises.length);

    const directoryPath = path.join(__dirname, '../../../output');
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    // Your loop to write files
    for (let i = 0; i < audioResults.length; i++) {
      let audioBuffer = Buffer.from(audioResults[i], 'binary'); // Adjust according to actual data format
      fs.writeFile(`${directoryPath}/output-${i}.mp3`, audioBuffer, (err) => {
        if (err) {
          console.error('Error writing audio file:', err);
        } else {
          console.log(directoryPath)
          console.log(`Audio file saved as output-${i}.mp3`);
        }
      });
    }

    // You can now handle imageResults and audioResults separately
    // For now, let's just log them to the console
    console.log("Image Results:", imageResults);
    console.log("Audio Results:", audioResults);

    // Returning the results (you can modify this as needed)
    return audioResults, imageResults;
  } catch (error) {
    console.error('Error in generating images and audios:', error);
  }
}


// Usage example


export async function POST(request) {
  const req = await request.json()
  const res = await generateImagesAndAudios(req.imagePrompts, req.scriptParts)
  return Response.json(res)
}

