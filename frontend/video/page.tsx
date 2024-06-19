"use client"
import { useSearchParams } from 'next/navigation'
import { Video } from "@/components/video/video"

export default function IndexPage() {
    const params = useSearchParams()
    const id = params.get('id')
    const videoUrl = '/video.mp4';
    const videoTitle = "What is Newton's Third Law of Motion?"
    const videoScript = "Newton's Third Law of Motion is your mother."

    return (
        <>
        <section className="container grid items-center gap-10 pb-8 pt-6 md:py-6">
        <div className="flex flex-col items-center gap-2">
            <Video videoUrl={videoUrl} videoTitle={videoTitle} videoScript={videoScript}/>
        </div>
        </section>
        </>
    )
}
