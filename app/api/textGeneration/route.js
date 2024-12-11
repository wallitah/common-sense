import Replicate from "replicate";
import { NextResponse } from "next/server";

const systemPrompt = "You are an AI that writes snappy comic book dialogue between best friends April and June.\n\n" +
    "Generate ONLY direct speech with these rules:\n" +
    "Generate exactly 9 lines of dialogue TOTAL\n" +
    "Each line must be under 12 words\n" +
    "No action descriptions or brackets\n" +
    "Alternate between April and June speaking\n\n" +
    "CHARACTER VOICES:\n" +
    "April (30, MFA student):\n" +
    "- Deadpan humor\n" +
    "- Outwardly chill\n" +
    "- Secretly overthinking everything\n" +
    "- Speaks in short, dry observations\n\n" +
    "June (33, PhD student):\n" +
    "- Sharp wit\n" +
    "- Anxious planner\n" +
    "- Makes everything existential\n" +
    "- Quick with comebacks\n\n" +
    "DIALOGUE STYLE:\n" +
    "- Pure back-and-forth conversation\n" +
    "- Mix one-word reactions with longer observations\n" +
    "- Use dry humor and sarcasm\n" +
    "- No explaining backstory\n" +
    "- Natural speech patterns\n" +
    "- Each speaker should be indicated simply as 'April:' or 'June:'\n\n" +
    "Topics: regular fears of young-adulting, future plans after graduating, missing home and friends, friendship\n\n" +
    "OUTPUT FORMAT:\n" +
    "Return the dialogue in a structured JSON format as follows:\n\n" +
    "{\n" +
    "    \"dialogue\": [\n" +
    "        {\"speaker\": \"April\", \"line\": \"First line of April's dialogue.\"},\n" +
    "        {\"speaker\": \"June\", \"line\": \"First line of June's dialogue.\"},\n" +
    "        {\"speaker\": \"April\", \"line\": \"Second line of April's dialogue.\"},\n" +
    "        {\"speaker\": \"June\", \"line\": \"Second line of June's dialogue.\"},\n" +
    "        ...\n" +
    "    ]\n" +
    "}\n\n" +
    "Generate the JSON object only. Do not add any additional explanations or comments.";

// Initialize Replicate client
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN_LLAMA,
});

export async function POST(req) {
    console.log("starting text generation");
    try {
        const { prompt } = await req.json();

        // Define input parameters for the model
        const input = {
            prompt,
            top_k: 0,
            top_p: 0.92,
            max_tokens: 200,
            temperature: 0.85,
            system_prompt: systemPrompt,
            length_penalty: 0.8,
            stop_sequences: "<|end_of_text|>,<|eot_id|>",
            // prompt_template:
            //     "<|begin_of_text|><|start_header_id|>system<|end_header_id|>",
            presence_penalty: 0.3,
            // log_performance_metrics: false,
        };

        // Run the model and get the full response
        const output = await replicate.run("meta/meta-llama-3-8b-instruct", {
            input,
        });
        console.log(output)
        return NextResponse.json({ result: output });
    } catch (error) {
        console.error("Error calling Replicate API:", error);
        return NextResponse.json(
            { error: "Failed to fetch response from Replicate" },
            { status: 500 }
        );
    }
}
