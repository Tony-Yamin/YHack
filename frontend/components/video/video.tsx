"use client"

import * as React from "react"
import ReactPlayer from 'react-player';
import { Button } from "../ui/button";
import { useState } from "react";
import useDownloader from "react-use-downloader"

export interface VideoProps {
    videoUrl: string;
}

export function Video({videoUrl}: VideoProps) {
    const { download } = useDownloader()
    const [vidDone, setVidDone] = useState(false);

    const handleDownload = () => {
        download(videoUrl, 'generated-video.mp4')
    }

    return (
        
            <div className="flex flex-col gap-8 mt-10 justify-center items-center">
                <div className="flex flex-row gap-4 justify-start items-start">
                    <ReactPlayer
                        url={videoUrl}
                        controls={true}
                        width="210%"
                        height="100%"
                        onReady={() => {setVidDone(true)}}
                    />
                </div>
                { vidDone && 
                <Button className="min-w-[200px]" variant="secondary" onClick={handleDownload}>Download Video</Button>
                }
            </div>

    )
  }
