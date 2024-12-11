import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
    endpoint: process.env.DO_SPACE_ENDPOINT, // DigitalOcean Spaces endpoint
    region: "us-east-1", // Placeholder region
    credentials: {
        accessKeyId: process.env.BUKET_ACCESS_KEY,
        secretAccessKey: process.env.BUKET_SECRET_KEY,
    },
});

export async function POST(req) {
    try {
        const uniqueFileName = `${uuidv4()}-"comic.pdf"`;
        const formData = await req.formData();
        const file = formData.get("file");

        // Convert ReadableStream (file.stream()) to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const params = {
            Bucket: process.env.DO_SPACES_BUCKET_NAME,
            Key: uniqueFileName, // File name in the bucket
            Body: buffer,
            ContentType: "application/pdf",
            ACL: "public-read",
        };

        const command = new PutObjectCommand(params);
        const result = await s3Client.send(command);

        const fileUrl = `https://${process.env.DO_SPACES_BUCKET_NAME}.${process.env.DO_SPACE_ENDPOINT.replace(
            "https://",
            ""
        )}/comic.pdf`;

        return NextResponse.json({ message: "PDF uploaded successfully!", url: fileUrl });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to upload PDF" }, { status: 500 });
    }
}
