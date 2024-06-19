const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

async function UserQueryToPrompt(userQuery) {
  const messages = [];
  const initial = {
  role: 'user', content: "Extract the main topic from this user query: " + userQuery + "\n Be brief, and retain key words from the query. ONLY return the topic"
  };
  messages.push(initial);

  const completion = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message.content;
}

export async function POST(request) {
  const req = await request.json()
  const res = await UserQueryToPrompt(req)
  return Response.json(res)
}


