export default function Form() {
    return (
        <div className="flex items-center justify-center">
            <div className="mb-4">
                <label
                    htmlFor="input1"
                    className="block mb-2 text-sm font-medium text-gray-600"
                >
                    What Are they Doing?
                </label>
                <input
                    type="text"
                    id="input1"
                    className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    placeholder="Whay do you think they are doing?"
                />
            </div>
            <div className="mb-4">
                <label
                    htmlFor="input2"
                    className="block mb-2 text-sm font-medium text-gray-600"
                >
                    Where are they?
                </label>
                <input
                    type="text"
                    id="input2"
                    className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                    placeholder="Where do you think are they?"
                />
            </div>
            <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-indigo-500 rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
                Generate
            </button>
        </div>
    );
}
