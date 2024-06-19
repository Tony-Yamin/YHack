const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

// //inputs: videoScript string and user query string, outputs: JSON 10 questions
async function generateQuizQuestions(videoScriptArray, givenQuery) {
    const videoScript = videoScriptArray.join(" ");
    const prompt = `
Write 5 quiz questions, each question having 4 choices (A, B, C, D) and the correct answer, along with 4 explanations explaining each answer choice, in JSON format based on the given video script and the overall topic. Don't have duplicate questions. Use the provided variables as follows:
- videoScript: ${videoScript}
- query: ${givenQuery}

The JSON format should be as follows:

{
  "quiz_questions": [
    {
      "question": "[Your question here]",
      "choices": {
        "A": "[Choice A]",
        "B": "[Choice B]",
        "C": "[Choice C]",
        "D": "[Choice D]"
      },
      "correct_answer": "[Correct choice]",
      "explanations": {
        "A": "[Explanation for Choice A]",
        "B": "[Explanation for Choice B]",
        "C": "[Explanation for Choice C]",
        "D": "[Explanation for Choice D]"
      }
    },
    {
      "question": "[Your question here]",
      "choices": {
        "A": "[Choice A]",
        "B": "[Choice B]",
        "C": "[Choice C]",
        "D": "[Choice D]"
      },
      "correct_answer": "[Correct choice]",
      "explanations": {
        "A": "[Explanation for Choice A]",
        "B": "[Explanation for Choice B]",
        "C": "[Explanation for Choice C]",
        "D": "[Explanation for Choice D]"
      }
    },
    {
      "question": "[Your question here]",
      "choices": {
        "A": "[Choice A]",
        "B": "[Choice B]",
        "C": "[Choice C]",
        "D": "[Choice D]"
      },
      "correct_answer": "[Correct choice]",
      "explanations": {
        "A": "[Explanation for Choice A]",
        "B": "[Explanation for Choice B]",
        "C": "[Explanation for Choice C]",
        "D": "[Explanation for Choice D]"
      }
    },
    {
      "question": "[Your question here]",
      "choices": {
        "A": "[Choice A]",
        "B": "[Choice B]",
        "C": "[Choice C]",
        "D": "[Choice D]"
      },
      "correct_answer": "[Correct choice]",
      "explanations": {
        "A": "[Explanation for Choice A]",
        "B": "[Explanation for Choice B]",
        "C": "[Explanation for Choice C]",
        "D": "[Explanation for Choice D]"
      }
    },
    {
      "question": "[Your question here]",
      "choices": {
        "A": "[Choice A]",
        "B": "[Choice B]",
        "C": "[Choice C]",
        "D": "[Choice D]"
      },
      "correct_answer": "[Correct choice]",
      "explanations": {
        "A": "[Explanation for Choice A]",
        "B": "[Explanation for Choice B]",
        "C": "[Explanation for Choice C]",
        "D": "[Explanation for Choice D]"
      }
    }
  ]
}
`;
    const messages = [];
    const initial = {
    role: 'user', content: prompt
    };
    messages.push(initial);

    const completion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-3.5-turbo-1106",
        response_format: { type: "json_object" },
    });

 return completion.choices[0].message.content;
}

export async function POST(request) {
  const req = await request.json()
  const res = await generateQuizQuestions(req.scriptParts, req.textareaValue)
  return Response.json(res)
}


