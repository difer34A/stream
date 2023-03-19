import VideoPlayer from "@/components/videoPlayer"
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Home() {
    const router = useRouter();
    const { id } = router.query as { id: string };
    return (
        <div className="w-screen h-screen flex justify-center items-center bg-black bg-opacity-[97%] overflow-hidden">
            <Head>
                <meta property="og:title" content={id} />
                <meta property="og:image" content={`/screenshots/screenshot-${id}.jpg`}></meta>
                <meta property="og:image" content={`/screenshots/screenshot-${id}.png`}></meta>
                <meta property="og:type" content="video"></meta>
            </Head>
            <VideoPlayer id={id} />
        </div> 
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    return {
        props: { query: context.query }
    }
}