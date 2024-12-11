import {activities, times} from "@/lib/words";

export const getRandomActivity = () => {
    const randomIndex = Math.floor(Math.random() * activities.length);
    return activities[randomIndex];
};

export const getRandomTime = () => {
    const randomIndex = Math.floor(Math.random() * times.length);
    return times[randomIndex];
};

export function parseResponse(rawResponse) {
    try {
        // Combine the fragments into a single string
        const combined = rawResponse.join('').trim();

        // Parse the JSON string
        const parsed = JSON.parse(combined);

        // Process the parsed JSON to remove colons from speaker names
        if (parsed && parsed.dialogue && Array.isArray(parsed.dialogue)) {
            parsed.dialogue = parsed.dialogue.map((entry) => {
                if (entry.speaker && entry.speaker.endsWith(':')) {
                    entry.speaker = entry.speaker.slice(0, -1); // Remove the trailing colon
                }
                return entry;
            });
        }

        console.log(parsed); // Log the cleaned parsed JSON
        return parsed; // Return the parsed JSON object
    } catch (error) {
        console.error("Failed to parse response:", error.message);
        return null; // Handle parsing failure
    }
}

