import React, { useRef, useState, useEffect } from 'react';

export default function VideoPlayer({ id }: { id: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [rotation, setRotation] = useState(0);

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const { videoWidth, videoHeight } = videoRef.current;

            // Determine orientation and set rotation
            if (videoWidth < videoHeight) {
                setRotation(-90);
            } else {
                setRotation(0);
            }
        }
    };

    useEffect(() => {
        handleLoadedMetadata();
    }, []);

    useEffect(() => {
        if (videoRef.current) {
            // Apply rotation using CSS
            console.log(`rotate(${rotation}deg)`);
        }
    }, [rotation]);

    return (
        <div className='w-[80%] h-[80%] flex place-items-center justify-center' style={{rotate: String(rotation + 'deg')}}>
            <video
                ref={videoRef}
                src={"/api/videos?videoid=" + id}
                controls
                autoPlay
                id='video-player'
                className={`rounded-md`}
                // style={rotation == -90 ? {height: "100%", width: "100%"} : {width: "100%", height: "100%"}}
                onLoadedMetadata={handleLoadedMetadata}
            ></video>

        </div>
    );
}
