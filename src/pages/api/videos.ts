import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import rangeParser from "range-parser";
import pump from "pump";
import path from 'path';
import ffmpeg from "fluent-ffmpeg";

function generateThumbnail(videoPath: string, outputPath: string, fileName: string) {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            // @ts-ignore
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .takeScreenshots({
                count: 1,
                timemarks: ['00:00:01'], // number of seconds
                filename: fileName,
                folder: outputPath,
                size: '640x360'
            });
    });
}

async function getVideoStream(req: NextApiRequest, res: NextApiResponse) {
    const videoId = req.query.videoid;
    const videoPath = `E:/2023 namriin sags/${videoId}.mp4`;
    const screenshotPath = path.join(
        process.cwd(),
        'public',
        'screenshots',
    );
    const fileName = `screenshot-${videoId}.jpg`

    if (!fs.existsSync(videoPath) || !fs.statSync(videoPath).isFile())
        return res.status(404).json({ res: "file not found" });

    const videoSizeInBytes = fs.statSync(videoPath).size;

    const range = req.headers.range;
    if (!range) return res.status(400).end();

    const ranges = rangeParser(videoSizeInBytes, range);
    // @ts-ignore
    if (!ranges || ranges.type === "error") {
        return res.status(416).end();
    }

    const headers = {
        "Accept-Ranges": "bytes",
        "Content-Type": "video/mp4",
    };
    // @ts-ignore
    if (ranges.length === 1) {
        // @ts-ignore
        const start = ranges[0].start;
        // @ts-ignore
        const end = ranges[0].end;
        // @ts-ignore
        headers["Content-Range"] = `bytes ${start}-${end}/${videoSizeInBytes}`;
        // @ts-ignore
        headers["Content-Length"] = end - start + 1;
        res.writeHead(206, headers);

        const videoStream = fs.createReadStream(videoPath, {
            start,
            end,
        });
        pump(videoStream, res);

        // Generate Thumbnail asynchronously
        try {
            await generateThumbnail(videoPath, screenshotPath, fileName);
        } catch (error) {
            console.error('Thumbnail generation error:', error);
        }
    } else {
        res.writeHead(206, headers);
        const videoStream = fs.createReadStream(videoPath, {
            // @ts-ignore
            start: ranges[0].start,
            // @ts-ignore
            end: ranges[0].end,
        });

        pump(videoStream, res);

        // Generate Thumbnail asynchronously
        try {
            await generateThumbnail(videoPath, screenshotPath, fileName);
        } catch (error) {
            console.error('Thumbnail generation error:', error);
        }
    }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        getVideoStream(req, res);
    } else {
        return res.status(405).json({ error: "method not supported" });
    }
}
