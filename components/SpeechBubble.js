'use client';

export default function SpeechBubble({ text, bubbleType, name }) {
    const bubbleStyle = bubbleType === 0 ? `mb-4 bottom-0 rounded-tr-3xl rounded-br-none w-10/12 left-1/2 transform -translate-x-1/2` : `mt-4 top-0 rounded-tr-none rounded-br-3xl w-7/12 right-0 mr-4`;
    const textStyle = bubbleType === 0 ? `` : `w-full`;
    return (
        <div className={`absolute bg-white border-2 border-black rounded-bl-3xl rounded-tl-3xl px-6 py-4 text-left text-xs ${bubbleStyle}`}>
            <p className={`text-black ${textStyle}`}><span className="font-bold">{name} </span>{text}</p>
        </div>
    );
}