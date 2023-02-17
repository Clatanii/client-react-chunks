// Init variabes, like a config :)
const ALLOWED_FILE_MIME = ["application/zip", "application/x-zip-compressed", "application/octet-stream"] // Allowed input types, only compressed formats.
const ChunkSize = (1024 * 1024) * 50 // One chunk consists of max 50mb data, In bytes.

// Don't trust this, but can provide some nice client-feedback before sending request to the backend.
export function CheckFormat(FileMime) {
    if (ALLOWED_FILE_MIME.includes(FileMime)) return true;

    return false;
}

// Generate chunks based on $ChunkSize so all bytes fit
export function GetTotal(FileInput) {
    if (!FileInput instanceof File) return [null, "NOT_VALID_OBJECT"];
    if (!CheckFormat(FileInput.type)) return [null, "NOT_VALID_FILE_MIME"];

    const FileSize = FileInput.size; // In bytes, binary *usually* 8bits. 1kb is 1*1024 bytes.
    const TotalChunks = Math.ceil(FileSize/ChunkSize); // The amount of chunks required for the total file lenght, will be rounded UP for the closest integer.

    return [TotalChunks, null];
}

// Create the actual chunk slices of the file.
export async function Create(FileInput, TotalChunks, Callback) {
    if (!FileInput instanceof File) return [null, "NOT_VALID_OBJECT"];
    if (!CheckFormat(FileInput.type)) return [null, "NOT_VALID_FILE_MIME"];
    if (!typeof TotalChunks === "bigint") throw new Error("'TotalChunks' is not specified as a 'integer'.");
    if (!typeof Callback === "function") throw new Error("'Callback' is not specified as a 'function'.");

    console.log(TotalChunks)

    // Store all chunks of data here.
    let DataDeconstructed = [];

    // Time to enumerate each number of $TotalChunks.
    for (let Index = 0; Index < TotalChunks; Index++) {
        console.log("Chunk " + Index)
        const StartOfChunk = Index * ChunkSize; // The new chunk, depending on index.
        let EndOfChunk = Math.min(StartOfChunk + ChunkSize, FileInput.size); // The end of the chunk.

        const Blob = FileInput.slice(StartOfChunk, EndOfChunk); // Perform the slice of the file input.

        DataDeconstructed.push(Blob); // Push to the $DataDeconstructed array.

        await Callback(Blob, Index); // Callback for each loop, To handle each slice, Awaits your callback, Use async in requests etc.
    };

    // Return all the chunks in an array.
    return [DataDeconstructed, null];
}