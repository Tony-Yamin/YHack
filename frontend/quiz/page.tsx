"use client"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Search } from "@/components/search"
import { useSearchParams } from 'next/navigation'
import { useState } from "react"
import { Question } from "@/components/quiz/question"
import Link from "next/link"
import { Button } from "@/components/ui/button"


const quizQuestions = [
    {
      "question": "What is the capital of France?",
      "choices": {
        "A": "London",
        "B": "Paris",
        "C": "Berlin",
        "D": "Rome"
      },
      "correct_answer": "B",
      "explanations": {
        "A": "Incorrect. London is the capital of the United Kingdom.",
        "B": "Correct! Paris is the capital of France.",
        "C": "Incorrect. Berlin is the capital of Germany.",
        "D": "Incorrect. Rome is the capital of Italy."
      }
    },
    {
      "question": "Which planet is closest to the sun?",
      "choices": {
        "A": "Mars",
        "B": "Venus",
        "C": "Mercury",
        "D": "Earth"
      },
      "correct_answer": "C",
      "explanations": {
        "A": "Incorrect. Mars is the fourth planet from the sun.",
        "B": "Incorrect. Venus is the second planet from the sun.",
        "C": "Correct! Mercury is the closest planet to the sun.",
        "D": "Incorrect. Earth is the third planet from the sun."
      }
    },
    {
      "question": "Who painted the Mona Lisa?",
      "choices": {
        "A": "Vincent van Gogh",
        "B": "Leonardo da Vinci",
        "C": "Pablo Picasso",
        "D": "Michelangelo"
      },
      "correct_answer": "B",
      "explanations": {
        "A": "Incorrect. Vincent van Gogh was a Dutch post-impressionist painter.",
        "B": "Correct! Leonardo da Vinci painted the Mona Lisa.",
        "C": "Incorrect. Pablo Picasso was a Spanish painter known for cubism.",
        "D": "Incorrect. Michelangelo was an Italian sculptor and painter."
      }
    },
    {
      "question": "What is the powerhouse of the cell?",
      "choices": {
        "A": "Nucleus",
        "B": "Mitochondria",
        "C": "Cytoplasm",
        "D": "Ribosomes"
      },
      "correct_answer": "B",
      "explanations": {
        "A": "Incorrect. The nucleus contains genetic material, but it is not the powerhouse of the cell.",
        "B": "Correct! Mitochondria are the powerhouse of the cell, producing energy.",
        "C": "Incorrect. Cytoplasm is the fluid that fills the cell, but it is not the powerhouse.",
        "D": "Incorrect. Ribosomes are involved in protein synthesis, but they are not the powerhouse of the cell."
      }
    },
    {
      "question": "What is the largest ocean in the world?",
      "choices": {
        "A": "Indian Ocean",
        "B": "Atlantic Ocean",
        "C": "Pacific Ocean",
        "D": "Arctic Ocean"
      },
      "correct_answer": "C",
      "explanations": {
        "A": "Incorrect. The Indian Ocean is the third largest ocean.",
        "B": "Incorrect. The Atlantic Ocean is the second largest ocean.",
        "C": "Correct! The Pacific Ocean is the largest ocean in the world.",
        "D": "Incorrect. The Arctic Ocean is the smallest and shallowest of the world's oceans."
      }
    }
  ]


export default function IndexPage() {
    const params = useSearchParams()
    const id = params.get('id')

    return (
        <>
        <section className="container grid items-center gap-10 pb-8 pt-6 md:py-10">
        <div className="flex flex-col items-center gap-2">
            <Question questionData={quizQuestions}
            />
            <Link href="/video">
                <Button className="mt-4 bg-purple-500 hover:bg-purple-400">Back to Video</Button>
            </Link>
        </div>
        </section>
        </>
    )
}
