// const fetch = require('node-fetch');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

// const API_URL = "https://api.openai.com/v1/chat/completions";
// const OPEN_AI_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

// given a query, generate a video script, and return it in 3 parts
async function getVideoScript(query) {
    let prompt = "You will be creating an educational video for someone to learn about " + query +
        ". Your goal is to generate the text for a video that is about 1 minute long, and 120 words."

    prompt += "Please write an informative, understandable, educational essay about " + query + " that is 120 words long for someone new to the topic."

    // const result = await fetch(API_URL, {
    const result = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt },],
      model: 'gpt-4'
    });
    let script = result.choices[0].message.content;
    console.log("SCRIPT :", script)

    let prompt2 = "You will be given the text for a video. Please separate it into 3 parts of approximately equal length. Keep sentences together" +
        "ONLY return the raw original content, don't include 'Part 1:'. Return it in a JSON Format as 1 list named 'parts' of 3 strings, each string being a part of the script."
        + "Here is the text: " + script

    const result2 = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt2 },],
        model: 'gpt-3.5-turbo-1106',
        response_format: {type: 'json_object'}
    });
    console.log("Result 2 done")

    let jsonParts = result2.choices[0].message.content;
    // console.log(jsonParts)

    // let scriptParts = []
    // for (let i = 0; i < jsonParts.length; i++) {
    //     scriptParts.push(jsonParts[i])
    // }

    // console.log(scriptParts)
    return jsonParts
}

export async function POST(request) {
  const req = await request.json()
  const res = await getVideoScript(req)
  return Response.json(res)
}
