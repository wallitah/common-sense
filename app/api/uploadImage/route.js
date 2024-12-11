import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";

// Initialize the S3 client
const s3Client = new S3Client({
    endpoint: process.env.DO_SPACE_ENDPOINT, // DigitalOcean Spaces endpoint
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.BUKET_ACCESS_KEY,
        secretAccessKey: process.env.BUKET_SECRET_KEY,
    },
});

export async function POST(req) {
    try {
        const { imageUrl, fileName } = await req.json();

        // Generate a unique file name
        const uniqueFileName = `${uuidv4()}-${fileName}`;

        // Fetch the image data
        const response = await fetch(imageUrl);
        const imageBuffer = await response.arrayBuffer();

        // Upload to DigitalOcean Spaces
        const params = {
            Bucket: process.env.DO_SPACES_BUCKET_NAME,
            Key: uniqueFileName, // File name in the bucket
            Body: Buffer.from(imageBuffer),
            ContentType: "image/png", // Adjust based on the image type
            ACL: "public-read", // Makes the file publicly accessible
        };

        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        const fileUrl = `https://${process.env.DO_SPACES_BUCKET_NAME}.${process.env.DO_SPACE_ENDPOINT.replace(
            "https://",
            ""
        )}/${uniqueFileName}`;

        // Respond with the Spaces file URL
        return NextResponse.json({ message: "Image uploaded successfully!", url: fileUrl });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }
}
