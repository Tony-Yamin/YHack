"use client"

import * as React from "react"
import { ChangeEvent, useState } from "react"
import Link from "next/link"
import { Icons } from "@/components/icons"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useWindowSize } from "usehooks-ts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export interface QuizQuestion {
    question: string;
    choices: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    correct_answer: string;
    explanations: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
}

export interface QuestionProps {
    questionData: QuizQuestion[];
}

export function Question({questionData}: QuestionProps) {
    const [number, setNumber] = useState(0);
    const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

    return (
        <Card className="w-[1000px]">
        <CardHeader>
            <Label><span className="text-2xl font-bold">Question {number + 1}:</span> <span className="text-2xl ml-4">{questionData[number].question}</span></Label>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            <Button variant="secondary"
                className={selectedChoice === 'A' ? (selectedChoice === questionData[number].correct_answer ? 'bg-green-400 hover:bg-green-400 h-16' : 'bg-antimetal-light hover:bg-antimetal-light h-16') : 'h-16'}
                onClick={() => setSelectedChoice('A')}
            >
                <span className="text-xl font-bold">Choice A:</span>
                <span className="text-xl ml-4">{questionData[number].choices['A']}</span>
            </Button>
            <Button variant="secondary"
                className={selectedChoice === 'B' ? (selectedChoice === questionData[number].correct_answer ? 'bg-green-400 hover:bg-green-400 h-16' : 'bg-antimetal-light hover:bg-antimetal-light h-16') : 'h-16'}
                onClick={() => setSelectedChoice('B')}
            >
                <span className="text-xl font-bold">Choice B:</span>
                <span className="text-xl ml-4">{questionData[number].choices['B']}</span>
            </Button>
            <Button variant="secondary"
                className={selectedChoice === 'C' ? (selectedChoice === questionData[number].correct_answer ? 'bg-green-400 hover:bg-green-400 h-16' : 'bg-antimetal-light hover:bg-antimetal-light h-16') : 'h-16'}
                onClick={() => setSelectedChoice('C')}
            >
                <span className="text-xl font-bold">Choice C:</span>
                <span className="text-xl ml-4">{questionData[number].choices['C']}</span>
            </Button>
            <Button variant="secondary"
                className={selectedChoice === 'D' ? (selectedChoice === questionData[number].correct_answer ? 'bg-green-400 hover:bg-green-400 h-16' : 'bg-antimetal-light hover:bg-antimetal-light h-16') : 'h-16'}
                onClick={() => setSelectedChoice('D')}
            >
                <span className="text-xl font-bold">Choice D:</span>
                <span className="text-xl ml-4">{questionData[number].choices['D']}</span>
            </Button>
            {  selectedChoice &&
                <Label className="mt-4 mb-1">
                    <span className="text-xl font-bold">Explanation {selectedChoice}:</span>
                    <span className="text-xl ml-4">{(questionData[number].explanations as any)[selectedChoice]}</span>
                </Label>
            }
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="secondary" onClick={() => {
                setNumber(Math.max(0, number - 1))
                setSelectedChoice(null)
            }}>Previous Question</Button>
            <Button onClick={() => {
                setNumber(Math.min(questionData.length - 1, number + 1))
                setSelectedChoice(null)
            }}>Next Question</Button>
        </CardFooter>
        </Card>
    )
}