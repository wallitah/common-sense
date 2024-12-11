'use client';

import {useState} from 'react';
import Image from "next/image";
import SpeechBubble from "@/components/SpeechBubble";
import InputField from "@/components/InputField";
import {getRandomActivity, getRandomTime, parseResponse} from "@/lib/utils";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function DynamicComicGenerator() {
    const numberOfImages = 9;
    const [basePrompt1, setBasePrompt1] = useState('');
    const [basePrompt2, setBasePrompt2] = useState('');
    const [images, setImages] = useState([]);
    const [bubbleTexts, setBubbleTexts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [error, setError] = useState('');

    const saveImageToServer = async (imageUrl, index) => {
        try {
            const res = await fetch('/api/uploadImage', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    imageUrl,
                    fileName: `comic-frame-${index + 1}.png`,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await res.json();
            console.log(`Image uploaded to: ${data.url}`); // Log the Spaces URL
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/textGeneration", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({prompt: basePrompt1}),
            });

            if (!res.ok) {
                throw new Error("Failed to fetch Replicate response");
            }
            const data = await res.json();
            console.log(parseResponse(data.result));
            return parseResponse(data.result); // Return the parsed dialog
        } catch (error) {
            console.error("Error:", error.message);
        } finally {
            // setLoading(false);
        }
    };

    const generatePDF = async () => {
        const container = document.getElementById("comic-container");

        if (!container) {
            console.error("Comic container not found");
            return;
        }

        try {
            console.log(container.innerHTML);
            setLoading(true);

            // Render the container div to a canvas
            const canvas = await html2canvas(container, {
                scale: 2, // Higher scale for better quality
                useCORS: true, // To handle cross-origin images
                logging: true, // Enable logging to troubleshoot issues
            });

            // Convert the canvas to a base64 image
            const imgData = canvas.toDataURL("image/png");

            console.log("Generated Image Data:", imgData); // Log to check if it's valid

            // Create a PDF and add the image
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm", // Use millimeters for sizing
                format: "a4", // Standard A4 size
            });

            // Scale the image to fit the PDF
            const scaledWidth = 190; // A4 width in mm
            const aspectRatio = canvas.height / canvas.width;
            const scaledHeight = scaledWidth * aspectRatio;

            doc.addImage(imgData, "PNG", 10, 10, scaledWidth, scaledHeight); // Position the image on the PDF

            // Convert the PDF to a Blob
            const pdfBlob = doc.output("blob");

            // Upload to the server route
            const formData = new FormData();
            formData.append("file", pdfBlob, "comic.pdf");

            const response = await fetch("/api/uploadPDF", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to upload PDF to the server");
            }

            const data = await response.json();
            console.log("PDF uploaded successfully! File URL:", data.url);

            setLoading(false); // Mark loading as complete
        } catch (error) {
            console.error("Error generating PDF:", error.message);
            setLoading(false);
        }
    };

    const generateComic = async () => {
        setLoading(true);
        setImages([]);
        setError('');
        setCurrentImage(null);

        try {
            const time = getRandomTime();
            const generatedTexts = [];
            const dialog = await handleGenerate();
            console.log("dialog", dialog.dialogue);
            for (let i = 0; i < numberOfImages; i++) {
                const activity = getRandomActivity()
                // Construct the dynamic prompt by modifying the base prompts
                const dynamicPrompt = `${basePrompt1.trim().toLowerCase()} together and ${activity} at the ${basePrompt2.trim().toLowerCase()} ${time} CHOCHOCA style, comics flat style`;
                console.log(dynamicPrompt);
                // Call the API for each dynamic prompt
                const res = await fetch('/api/predict', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({prompt: dynamicPrompt}),
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log(data)
                    const imageUrl = data.output[0]; // Assuming API returns image URL in `output`
                    saveImageToServer(imageUrl, i);
                    // Add the generated image to the list
                    setImages((prev) => [...prev, imageUrl]);
                    // Generate bubble text dynamically
                    console.log(dialog.dialogue[i], dialog.dialogue[i].speaker)
                    const name = `${dialog.dialogue[i].speaker}:`
                    console.log(name, dialog.dialogue[i].speaker)
                    const bubbleType = name === 'June:' ? 0 : 1;
                    const bubbleText = dialog.dialogue[i].line;
                    const bubbleObj = {bubbleText: bubbleText, bubbleType: bubbleType, name: name};
                    generatedTexts.push(bubbleObj);
                } else {
                    throw new Error(`Error with word "${activity}": ${data.error}`);
                }
                setBubbleTexts(generatedTexts);
            }
        } catch (err) {
            setError(err.message || 'Something went wrong!');
        } finally {
            await new Promise((resolve) => {
                setTimeout(async () => {
                    await generatePDF(); // Wait for PDF generation to complete
                    resolve(); // Resolve the promise after the function finishes
                }, 500);
            }); // Delay to allow React to complete rendering
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-4xl">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        generateComic();
                    }}
                    className="w-full"
                >
                    <div className="flex self-start mb-8 mt-8">
                        <h1 className="my-4 text-2xl font-bold text-black">COMMON SENSE</h1>
                    </div>
                    <div>
                        <input
                            type="text"
                            id="basePrompt1"
                            value={basePrompt1}
                            onChange={(e) => setBasePrompt1(e.target.value)}
                            className="w-full px-10 text-black border-t-2 border-l-2 border-r-2 border-b border-black h-20 focus:outline-none placeholder:text-black"
                            placeholder="WHAT ARE THEY DOING |"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            id="basePrompt2"
                            value={basePrompt2}
                            onChange={(e) => setBasePrompt2(e.target.value)}
                            className="w-full px-10 text-black border-b-2 border-l-2 border-r-2 border-black h-20 focus:outline-none placeholder:text-black"
                            placeholder="WHERE ARE THEY |"
                        />
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            type="submit"
                            className="w-1/5 px-4 py-2 text-white bg-black h-14 font-semibold"
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'GENERATE'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-4 p-4 text-red-700 bg-red-100 rounded">{error}</div>
                )}
                <div id='comic-container'
                     className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5 my-32 w-full">
                    {images.map((image, index) => (
                        <div key={index} className="relative border-2 border-black overflow-hidden aspect-[3/4]">
                            <Image
                                src={image}
                                alt={`Comic frame ${index + 1}`}
                                className="object-cover"
                                fill={true}
                            />
                            {/* Speech Bubble Component */}
                            <SpeechBubble
                                text={bubbleTexts[index].bubbleText || ""}
                                bubbleType={bubbleTexts[index].bubbleType}
                                name={bubbleTexts[index].name}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
