import Link from "next/link"

import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Search } from "@/components/search"

export default function IndexPage() {
  return (
    <>
      <section className="container grid items-center gap-10 pb-8 pt-6 md:py-10">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-normal md:text-4xl">
            Comprehensive <span className="text-orange-500">Knowledge</span> at Your <span className="text-purple-500">Fingertips</span>
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground">
            Welcome to the new frontier of educational video generation.
          </p>
        </div>
        <Search />
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            top: 250,
            width: "100%",
            height:
              "100%" /* Adjust this percentage to control the height of the SVG background */,
            backgroundImage: `url('/wave.svg')`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            zIndex: -1,
          }}
        />
      </section>
    </>
  )
}
