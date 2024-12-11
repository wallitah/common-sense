import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { prompt, seed = 23 } = await req.json();
        console.log("starting");
        const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
        const MODEL_VERSION = process.env.MODEL_VERSION;

        // Create the prediction
        const response = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                Authorization: `Token ${REPLICATE_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                version: MODEL_VERSION,
                input: {
                    seed: 23,
                    model: "dev",
                    prompt: prompt,
                    go_fast: false,
                    lora_scale: 1,
                    megapixels: "1",
                    num_outputs: 1,
                    aspect_ratio: "1:1",
                    output_format: "webp",
                    guidance_scale: 3,
                    output_quality: 80,
                    prompt_strength: 0.8,
                    extra_lora_scale: 1,
                    num_inference_steps: 28,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Replicate API Error: ${response.statusText}`);
        }

        const prediction = await response.json();

        // Poll the prediction status until it's completed
        let finalResponse;
        while (true) {
            finalResponse = await fetch(prediction.urls.get, {
                method: 'GET',
                headers: {
                    Authorization: `Token ${REPLICATE_API_TOKEN}`,
                },
            });

            if (!finalResponse.ok) {
                const errorText = await finalResponse.text();
                console.error('Polling Response Error:', errorText);
                throw new Error(`Replicate Polling Error: ${finalResponse.statusText}`);
            }

            const finalData = await finalResponse.json();

            if (finalData.status === 'succeeded') {
                // Image generation succeeded
                console.log('Prediction succeeded:', finalData.output);
                return new Response(JSON.stringify({ output: finalData.output }), { status: 200 });
            } else if (finalData.status === 'failed') {
                throw new Error('Prediction failed.');
            }

            // Wait before polling again
            await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay
        }

        // Return the output (usually contains the image URLs)
        // return NextResponse.json(finalResponse.output);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}