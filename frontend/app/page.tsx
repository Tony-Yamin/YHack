"use client"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button, buttonVariants } from "@/components/ui/button"
import { Search } from "@/components/search"
import webGLFluidEnhanced from 'webgl-fluid-enhanced';
import { useRef, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import ReactPlayer from "react-player"

export default function IndexPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    webGLFluidEnhanced.simulation(canvasRef.current, {
      SIM_RESOLUTION: 256,
      DENSITY_DISSIPATION: 0.98,
      VELOCITY_DISSIPATION: 0.99,
      PRESSURE: 0.8,
      PRESSURE_ITERATIONS: 20,
      COLOR_PALETTE: ['#3e61c1', '#a6b6e2'],
      START_SPLATS: 50,
      TRANSPARENT: false,
    });
  }, []);
  
  return (
    <>
      <section className="container grid items-center gap-10 pb-8 pt-6 md:py-10 relative z-10 mt-5">
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl leading-tight mb-2">
          <span style={{ backgroundImage: 'linear-gradient(135deg, #3e61c1, #a6b6e2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>YGroove</span>
          </span>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            Your AI <span className="font-bold">Dancing Coach</span>.
          </p>
          <div className="flex flex-row gap-6 mt-10">
            <Card className="w-[500px] flex flex-col justify-center items-center">
              <CardHeader>
                <CardTitle>Pre-recorded Video</CardTitle>
                <CardDescription>Upload a reference MP4 video and an MP4 of yourself dancing. AI will do the rest and provide helpful feedback.</CardDescription>
              </CardHeader>
              <CardContent>
                    <ReactPlayer
                        url={'/gen.mp4'}
                        controls={true}
                        width="100%"
                        height="100%"
                    />
              </CardContent>
              <CardFooter>
              <Button variant="secondary" className="min-w-[200px]">
              <Link href="/choreo">Continue</Link>
              </Button>
              </CardFooter>
            </Card>
            <Card className="w-[500px] flex flex-col justify-center items-center">
              <CardHeader>
                <CardTitle>Live Coach</CardTitle>
                <CardDescription>Uploading a reference MP4 dance video and use your webcam to get AI feedback in real-time.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center">
                    <ReactPlayer
                        url={'/coach.mov'}
                        controls={true}
                        width="85%"
                        height="100%"
                    />
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="min-w-[200px]">
                  <Link href="/coach">Continue</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      <canvas ref={canvasRef} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw', // Full viewport width
          height: '100vh', // Full viewport height
      }} />
    </>
  )
}
