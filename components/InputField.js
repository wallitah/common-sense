'use client';

export default function InputField({ value, onChange, placeholder }) {
    return (
        <div className="w-full mb-4">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-4 text-black border border-black rounded-md focus:outline-none placeholder:text-black"
                placeholder={placeholder}
            />
        </div>
    );
}
