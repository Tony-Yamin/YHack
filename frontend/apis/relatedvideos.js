require('dotenv').config({ path: '../.env' });

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPEN_AI
});

async function suggestedVideos(query) {
  const completion = await openai.chat.completions.create({
    messages: [{
      role: "user",
      content: "Given the educational topic " + query.text + ", suggest 5 related topics for further study. List solely the topic titles. Be concise. Return in JSON Format" }
    ],
    model: "gpt-3.5-turbo"
  });

  return completion.choices[0].message.content;
}

const query = { text: 'Newton Law of Motion' };
suggestedVideos(query).then(response => {
  console.log('GPT-4 Response:', response);
});
