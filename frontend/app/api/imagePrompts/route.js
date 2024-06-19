// const API_URL = "https://api.openai.com/v1/chat/completions";
// const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});


// Usage example in another file:
// import { getImagePrompts } from 'path_to_the_file';
// getImagePrompts("Your prompt here").then(prompts => {
//     //console.log(prompts);
// });
// given a query and a script part, returns the 2 images
async function get2ImagePrompts(query, scriptPart) {
  //console.log("IMAGE 2 PROMPTS")
  let imagePromptScript = "You will be given a part of a script for an educational video about " + query + ". Your goal is to generate a simple prompt for a text-to-image generation AI."
    + "\nYour prompt must be very descriptive, and provide the most relevant visual information to accompany the script. It must make sense (create a believable picture of the script). Stick primarily to using nouns and verbs and describe everything in the image to make a complete scene. Avoid making it conceptual, as the image generation AI isn't too smart."
    // +  " You must ouput exactly in this format PROMPT 1: <your prompt here>\n" \
    + " You must ouput exactly in a JSON format with two variables, prompt1 and prompt 2, each containing a string\n"
    + "Try to get the first prompt to relate to the first part of the script and the second prompt for the script's different second half. DO NOT mention kids or anything that will violate OpenAI guidelines. Specify that images should be animated. Please keep it appropriate and very relevant to " + query
  // + "\nTo aid you, here are example prompts that work well (make yours longer):\n"

  let examplePrompts = [
    "Animated picture of ball rolling down a hill",
    "Animated picture of apple falling from a tree",
    "Animated picture of graph of parabola",
    "Animated picture of George Washington crossing the Delaware",
    "Animated picture of Capitol Hill",
  ]
  for (let i = 0; i < examplePrompts.length; i++) {
    // imagePromptScript += "'" + examplePrompts[i] + "'\n"
  }
  imagePromptScript += "\nHere is the script part:\n" + scriptPart
  //console.log(imagePromptScript)
  const result = await openai.chat.completions.create({
    messages: [{ role: 'user', content: imagePromptScript },],
    model: 'gpt-3.5-turbo-1106',
    response_format: { type: 'json_object' }
  });
  let prompts = result.choices[0].message.content;

  // console.log("Generated prompts: ", prompts)
  // return [prompts.prompt1, prompts.prompt2]
  return prompts
}

async function getAllImagePrompts(query, scriptParts) {
  try {
    // Create an array of promises calling getImagePrompts three times
    const imagePrompts = scriptParts.map((scriptPart) => get2ImagePrompts(query, scriptPart));

    // console.log("TONY:", imagePrompts)

    return Promise.all(imagePrompts).then((results) => {
      // JSON.parse(scriptParts).parts
      // console.log("Got imageprompts: ", results)
      let imagePromptsResult = []
      results.forEach(jsonString => {
        try {
          const jsonObject = JSON.parse(jsonString);
          imagePromptsResult.push(jsonObject.prompt1, jsonObject.prompt2);
        } catch (error) {
          console.error('Error parsing JSON string:', error);
        }
      });

      // const imagePromptsResult = [].concat(...results);

      console.log(imagePromptsResult);
      return imagePromptsResult;
    }).catch(error => {
      console.error('Error fetching image prompts:', error);
    });
    // const imagePrompts = scriptParts.map((scriptPart) => get2ImagePrompts(query, scriptPart));
    // // Await all promises simultaneously
    // await Promise.all(imagePrompts).then((results) => {
    //   console.log("Got imageprompts: ", results)

    //   // Merge the results into a single array
    //   const imagePromptsResult = [].concat(...results);

    //   console.log(imagePromptsResult);
    //   return imagePromptsResult;
    // })
  } catch (error) {
    console.error('Error fetching image prompts:', error);
  }
}


export async function POST(request) {
  const req = await request.json()
  //console.log("REQUEST: ", req)
  //console.log("REQUEST2 : ", req.extractedTopic, req.scriptParts)
  const res = await getAllImagePrompts(req.extractedTopic, req.scriptParts)
  //console.log("RESPONSE ", res)
  return Response.json(res)
}
