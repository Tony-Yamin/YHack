"use client"

import * as React from "react"
import { ChangeEvent, useEffect, useState } from "react"
import Link from "next/link"
import { Icons } from "@/components/icons"

import { Button } from "@/components/ui/button"
import { TextInput } from "@/components/ui/input"
import { useWindowSize } from "usehooks-ts"
import { Card } from "./ui/card"
import { Video } from "./video/video"
import { QuizQuestion } from "./quiz/question"

export interface SearchProps {
  showVideo: boolean;
  setShow: (value: boolean) => void;
}

export function Search({showVideo, setShow}: SearchProps) {
  const { width } = useWindowSize()
  const [textareaValue, setTextareaValue] = useState("")
  const [disabled, setDisable] = useState(false)
  const [noSubmit, setNoSubmit] = useState(true)
  const [scriptPart, setScriptPart] = useState("")
  const [questionsTrue, setQuestions] = useState<QuizQuestion[]>([]);
  const [callApiFlag, setCallApiFlag] = useState(false);


  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNoSubmit(event.target.value.length <= 0)
    setTextareaValue(event.target.value)
  }

  const clearPrompt = () => {
    setNoSubmit(true)
    setTextareaValue("")
  }

  const callAPI = async () => {
    if (noSubmit) {
      return
    }
    setDisable(true)
    console.log("Calling API")
  }


  const callAPI2 = async () => {
    setDisable(true)
    await callAPI().then(() => {
      setDisable(false)
      setShow(true)
    })
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter" && !event.shiftKey) {
      callAPI2()
    }
  }

  if (showVideo){
    return (
      <>
      <section className="container grid items-center gap-10 pb-8 pt-6 md:py-6">
      <div className="flex flex-col items-center gap-2">
          <Video videoUrl={"/video.mp4"} videoTitle={textareaValue} videoScript={scriptPart} questions={questionsTrue}/>
      </div>
      </section>
      </>
    )
  }else {



  return (
    <React.Fragment>
      <div className="relative mt-2 flex w-full items-end gap-4">
        <Icons.search className="absolute left-4 top-7 md:top-10 h-6 w-6 md:h-8 md:w-8 -translate-y-1/2" />
        {width < 600 &&
          <TextInput
            className="resize-none overflow-hidden pb-4 md:pb-2 pr-20 pt-4 md:pt-6"
            placeholder="What is Newton's Third Law of Motion?"
            id="prompt"
            disabled={disabled}
            value={textareaValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            rows={1}
            mobile={true}
          />
        }
        {width >= 600 &&
          <TextInput
            className="resize-none overflow-hidden pb-4 md:pb-2 pr-20 pt-4 md:pt-6"
            placeholder="What is Newton's Third Law of Motion?"
            id="prompt"
            disabled={disabled}
            value={textareaValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            rows={1}
            mobile={false}
          />
        }
        <Button
          disabled={noSubmit || disabled}
          className="absolute right-3 top-7 md:top-10 h-10 w-12 md:h-14 md:w-14 -translate-y-1/2 rounded-lg bg-antimetal hover:bg-antimetal-dark"
          onClick={callAPI2}
        >
          <Icons.in />
        </Button>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Link
          href=""
          className="-translate-y-1/3 pr-4 font-semibold text-antimetal text-sm md:text-md -mt-4"
          onClick={clearPrompt}
        >
          Clear Prompt
        </Link>
      </div>
    </React.Fragment>
  )

  }
}
