const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

export async function suggestedVideos(query){
  const completion = await openai.chat.completions.create({
    messages: [{
      role: "user",
      content: "Given the educational topic " + query + ", suggest 5 related topics for further study. List solely the topic titles. Be concise. Return in JSON Format" }
    ],
    model: "gpt-3.5-turbo"
  });

  return completion.choices[0].message.content;
}

export async function POST(request) {
  const req = await request.json()
  const res = await suggestedVideos(req)
  return Response.json(res)
}
