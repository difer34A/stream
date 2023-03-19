import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const videoId = req.query.videoid;

    try {
        // Load the video file using fluent-ffmpeg
        const screenshotPath = path.join(
            process.cwd(),
            'public',
            'screenshots',
            `screenshot-${videoId}.jpg`
        );
        await new Promise<void>((resolve, reject) => {
            ffmpeg(`F:/Medal/Clips/${videoId}.mp4`)
                .screenshots({
                    count: 1,
                    timemarks: ['00:00:01'], // Specify the time of the screenshot here
                    size: '640x360',
                })
                .on('error', reject)
                .on('end', () => resolve());
        });

        // Return the URL of the created screenshot
        const screenshotUrl = `/screenshots/screenshot-${videoId}.jpg`;
        res.status(200).json({ screenshotUrl });
    } catch (error) {
        console.error(error);
        // @ts-ignore
        res.status(500).send(error.message);
    }
}
