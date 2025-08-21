// Import the Node.js 'fs' module for file system operations (synchronous and callback-based).
// Search query: "Node.js fs module file operations"
const fs = require('fs');

// Import the 'fs.promises' module for Promise-based file system operations.
// Search query: "Node.js fs.promises async file operations"
const fsPromises = require('fs').promises;

// Define the path to the log file to monitor ('test.txt' in the same directory).
// Search query: "Node.js file path conventions"
const filePath = './test.txt';

// Initialize an array to store the last 10 lines of the log file.
// Search query: "Node.js array store last n elements"
let last_10 = [];

// Initialize an object to store active SSE client responses, keyed by request ID.
// Search query: "Node.js store SSE client connections"
let pool = {};

// Initialize an array to store request IDs of active SSE clients.
// Search query: "Node.js track client connections array"
let reqIds = [];

// **Imports fs and fs.promises for file operations.
// Defines filePath as test.txt, the log file to monitor.
// Initializes last_10 (array for last 10 lines), pool (object for client responses), and reqIds (array for client IDs).**

// Define an async function to read the last 10 lines from the log file.
// Search query: "Node.js read last n lines of file"


//Alternative Way if we dont have fixed size -


// const stats = await fsPromises.stat(filePath);

//         // Start with an initial chunk size of 1 KB (1024 bytes)
//         let chunkSize = 1024;

//         // Start reading from the end of the file
//         let position = stats.size;

//         // This will hold all lines we extract
//         let lines = [];

//         // Keep looping until we collect at least 10 lines
//         // or until we've read the whole file
//         while (lines.length < 10 && position > 0) {
//             // Decide how many bytes to read in this iteration
//             // (if file is smaller than chunkSize, just read the whole file)
//             const readSize = Math.min(chunkSize, position);

//             // Allocate a buffer of `readSize` bytes
//             const buffer = Buffer.alloc(readSize);

//             // Open the file for reading
//             const fd = await fsPromises.open(filePath, 'r');

//             // Read `readSize` bytes starting from (position - readSize)
//             await fd.read(buffer, 0, readSize, position - readSize);

//             // Close the file to free resources
//             await fd.close();

//             // Convert buffer (raw bytes) into a UTF-8 string
//             const chunk = buffer.toString('utf8');

//             // Merge this new chunk with already collected lines
//             // (prepend chunk before previously read content)
//             lines = (chunk + lines.join("\n"))
//                 .split("\n")                // break into lines
//                 .filter(l => l.trim() !== ""); // remove empty lines

//             // Move our "read pointer" backwards in the file
//             position -= readSize;

//             // Double the chunk size for the next loop iteration
//             // (so we read bigger chunks if 10 lines aren’t found yet)
//             chunkSize *= 2;
//         }

//         // Store only the last 10 lines in the global variable
//         last_10 = lines.slice(-10);




async function getLast10Lines() {
    // Use a try-catch block to handle potential file access errors.
    // Search query: "Node.js try-catch async await"
    try {
        // Get file metadata (e.g., size) using Promise-based stat.
        // Search query: "Node.js fs.promises.stat file size"
        const stats = await fsPromises.stat(filePath);
        // Create a read stream starting from the last ~1000 bytes to optimize for large files.
        // Search query: "Node.js fs.createReadStream read last bytes"
        const stream = fs.createReadStream(filePath, {
            // Ensure start is not negative; read last 1000 bytes (adjustable for larger files).
            // Search query: "Node.js read stream start position"
            start: Math.max(0, stats.size - 1000),
            // Set encoding to 'utf8' to read as text.
            // Search query: "Node.js read stream encoding utf8"
            encoding: 'utf8'
        });
        // Initialize a string to accumulate file data.
        // Search query: "Node.js accumulate stream data"
        let data = '';
        // Iterate over stream chunks asynchronously to build the data string.
        // Search query: "Node.js async iterator read stream"
        for await (const chunk of stream) {
            // Append each chunk to the data string.
            // Search query: "Node.js append stream chunk to string"
            data += chunk;
        }
        // Split data into lines, filter out empty lines, and take the last 10.
        // Search query: "Node.js split string into lines filter empty"
        const lines = data.split('\n').filter(line => line.trim() !== '').slice(-10);
        // Store the last 10 lines in the global last_10 array.
        // Search query: "Node.js update global array"
        last_10 = lines;
    // Catch any errors (e.g., file not found) and log them.
    } catch (err) {
        // Log the error for debugging.
        // Search query: "Node.js handle file not found error"
        console.error('Error reading last 10 lines:', err);
        // Reset last_10 to empty array to avoid breaking the app.
        // Corner case: If the file is empty or doesn’t exist, last_10 is set to empty.
        last_10 = [];
    }



 /*   const stats = await fsPromises.stat(filePath);

// Decide how many bytes to read: 1024 bytes (1 KB) or less if the file is smaller
const bufferSize = Math.min(1024, stats.size); // ensures we don't read more than the file size

// Allocate a buffer in memory to hold the bytes we'll read
const buffer = Buffer.alloc(bufferSize);

// Open the file for reading
const fd = await fsPromises.open(filePath, 'r');

// Read from the file into the buffer
// Parameters:
// buffer → the memory buffer to fill
// 0 → start writing at the beginning of the buffer
// bufferSize → number of bytes to read
// stats.size - bufferSize → start reading this many bytes from the end of the file
await fd.read(buffer, 0, bufferSize, stats.size - bufferSize);

// Close the file descriptor to free resources
await fd.close();

// Convert the buffer from bytes to a UTF-8 string
const data = buffer.toString('utf8');

// Split the data into lines, remove empty lines, and take only the last 10 lines
last_10 = data.split('\n').filter(line => line.trim() !== '').slice(-10);
*/
}

// **Reading Last 10 Lines (getLast10Lines):
// Uses fsPromises.stat to get the file size.
// Creates a read stream starting from the last ~1000 bytes to optimize for large files (avoids reading the entire file).
// Accumulates data, splits it into lines, filters out empty lines, and takes the last 10 to store in last_10.
// Handles errors (e.g., file not found) by setting last_10 to an empty array.**

// Define a function to send an SSE message to a client.
// Search query: "Node.js SSE format message"
function emitSSE(res, data) {
    // Write the data in SSE format (data: <message>\n\n).
    // Search query: "SSE data format specification"
    res.write(`data: ${data}\n\n`);
}

// Define a function to send the last 10 lines to a client.
// Search query: "Node.js send multiple SSE messages"
function emitLastLines(res) {
    // Iterate over last_10 array and send each line as an SSE event.
    // Search query: "Node.js iterate array send SSE"
    last_10.forEach(line => emitSSE(res, line));
}

// **SSE Formatting (emitSSE and emitLastLines):
// emitSSE formats data in SSE format (data: <message>\n\n) and sends it to a client.
// emitLastLines sends all lines in last_10 to a client on initial connection.**

// Define an async function to monitor the log file for changes.
// Search query: "Node.js fs.watchFile monitor file changes"
async function watchFile() {
    // Use a try-catch block to handle file watching errors.
    // Search query: "Node.js handle fs.watchFile errors"
    try {
        // Initialize last_10 by reading the last 10 lines of the file.
        // Search query: "Node.js call async function on startup"
        await getLast10Lines();

        // Watch the file for changes, polling every 100ms.
        // Search query: "Node.js fs.watchFile polling interval"
        fs.watchFile(filePath, { interval: 100 }, async (curr, prev) => {
            // Skip if file size hasn’t increased (e.g., no new data or file truncated).
            // Corner case: If the file shrinks, updates are skipped (curr.size <= prev.size).
            // Search query: "Node.js fs.watchFile handle file shrink"
            if (curr.size <= prev.size) return;
            // Create a read stream to read only new data (from prev.size to curr.size).
            // Search query: "Node.js read new data from file stream"
            const stream = fs.createReadStream(filePath, {
                // Start reading from the previous file size.
                // Search query: "Node.js read stream start end position"
                start: prev.size,
                // Read up to the current file size.
                end: curr.size,
                // Set encoding to 'utf8' for text.
                // Search query: "Node.js read stream encoding utf8"
                encoding: 'utf8'
            });
            // Initialize a string to accumulate new data.
            // Search query: "Node.js accumulate stream data"
            let newData = '';
            // Iterate over stream chunks to build new data.
            // Search query: "Node.js async iterator read stream"
            for await (const chunk of stream) {
                // Append each chunk to newData.
                // Search query: "Node.js append stream chunk to string"
                newData += chunk;
            }
            // Split new data into lines, filtering out empty lines.
            // Corner case: Empty lines are filtered out to ensure clean output.
            // Search query: "Node.js filter empty lines from string"
            const newLines = newData.split('\n').filter(line => line.trim() !== '');
            // Add new lines to last_10 array.
            // Search query: "Node.js push to array"
            last_10.push(...newLines);
            // Keep only the last 10 lines if the array exceeds 10.
            // Search query: "Node.js keep last n elements in array"
            if (last_10.length > 10) {
                last_10 = last_10.slice(-10);
            }
            // Send each new line to all connected clients.
            // Search query: "Node.js broadcast SSE to all clients"
            newLines.forEach(line => {
                // Iterate over all client IDs and send the line via SSE.
                // Search query: "Node.js iterate array send SSE"
                reqIds.forEach(id => emitSSE(pool[id], line));
            });
        });
    // Catch any errors during file watching and log them.
    } catch (err) {
        // Search query: "Node.js handle file watching errors"
        console.error('Error watching file:', err);
    }
    
}

// **File Monitoring (watchFile):
// Calls getLast10Lines to initialize last_10.
// Uses fs.watchFile to poll test.txt every 100ms for changes.
// When the file grows (curr.size > prev.size), reads only new data using a stream (start: prev.size, end: curr.size).
// Splits new data into lines, updates last_10 (keeping only the last 10), and sends new lines to all clients via emitSSE.**

// Define the SSE handler for /log endpoint.
// Search query: "Node.js SSE server implementation"
const handleSSE = (req, res) => {
    // Handle client disconnection to clean up resources.
    // Search query: "Node.js handle client disconnect SSE"
    req.on('close', () => {
        // Log disconnection with the client’s ID.
        // Search query: "Node.js log client disconnection"
        console.log('SSE client disconnected:', req.id);
        // Remove the client’s ID from reqIds array.
        // Search query: "Node.js remove element from array"
        reqIds = reqIds.filter(id => id !== req.id);
        // Remove the client’s response object from pool.
        // Search query: "Node.js delete object property"
        delete pool[req.id];
        // End the response to close the connection.
        // Search query: "Node.js res.end close connection"
        res.end();
    });

    // Log new client connection for debugging.
    // Search query: "Node.js log client connection"
    console.log('New /log request');
    // Set HTTP headers for SSE.
    // Search query: "SSE HTTP headers Node.js"
    res.writeHead(200, {
        // Set content type to text/event-stream for SSE.
        // Search query: "SSE content-type text/event-stream"
        'Content-Type': 'text/event-stream',
        // Disable caching to ensure real-time updates.
        // Search query: "Node.js disable cache HTTP headers"
        'Cache-Control': 'no-cache',
        // Keep the connection open for continuous updates.
        // Search query: "Node.js keep-alive connection"
        'Connection': 'keep-alive'
    });

    // Send the last 10 lines to the new client.
    // Search query: "Node.js send initial SSE data"
    emitLastLines(res);
    // Assign a unique ID to the request using the current timestamp.
    // Search query: "Node.js generate unique ID"
    req.id = Date.now();
    // Add the client’s ID to reqIds array.
    // Search query: "Node.js push to array"
    reqIds.push(req.id);
    // Store the response object in pool for sending updates.
    // Search query: "Node.js store response object SSE"
    pool[req.id] = res;
    // Log the total number of connected clients.
    // Search query: "Node.js log number of clients"
    console.log('Total clients:', reqIds.length);
};

// **SSE Handler (handleSSE):
// Sets up an SSE connection with appropriate headers (text/event-stream, no-cache, keep-alive).
// Sends the last 10 lines to the new client.
// Assigns a unique ID to the client, stores it in reqIds, and saves the response object in pool.
// Handles client disconnection by removing the client’s ID and response from reqIds and pool.
// Logs connection and disconnection events for debugging.**

// Start watching the file immediately when the module is loaded.
// Search query: "Node.js start function on module load"
watchFile();

// Export the handleSSE function for use in server.js.
// Search query: "Node.js module exports"
module.exports = { handleSSE };

// **Corner Cases:
// “If the file is empty or doesn’t exist, last_10 is set to empty.”
// “If the file shrinks, updates are skipped (curr.size <= prev.size).”
// “Empty lines are filtered out to ensure clean output.”**

















// mport express from 'express';
// import cors from 'cors';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import {promises as fsPromises} from "fs";


// const filename= fileURLToPath(import.meta.url);
// const dirname= path.dirname(filename);

// const app = express();
// const log_file_path= path.join(dirname, 'app.log');
// const port=3000;

// let clients=[];

// if(!fs.existsSync(log_file_path)){
//     fs.writeFileSync(log_file_path, Array.from({length: 15}, (_, i) => Initiating line ${i+1}).join('\n')+'\n');

// }

// app.use(cors());
// app.use(express.static('public'));


// function sendLastLines(res){
//    fs.readFile(log_file_path, 'utf-8', (err,data) =>{
//      if(err){
//         console.error('error reading file: ', err);
//         res.write(data : ${JSON.stringify("error reading log file.")} \n\n);
//         return 
//     }

//     const lines = data.trim().split('\n');
//     const last10lines= lines.slice(-10).join('\n');

//     res.write(data: ${JSON.stringify(last10lines)}\n\n);

//    })
// }


// async function readLastLines(filePath, n){
//     try {
//         const stats = await fsPromises.stat(filePath);
//         const fileHandle = await fsPromises.open(filePath, 'r');
//         const chunkSize= 4096;
//         let buffer = Buffer.alloc(chunkSize);
//         let lines= '';
//         let linesCount= 0;
//         let position = stats.size;


//         while(position > 0 && linesCount<=n){
//             const readPosition = Math.max(0, position-chunkSize);
//             const byteToRead = position-readPosition;

//             await fileHandle.read(buffer, 0, byteToRead, readPosition);

//             lines = buffer.toString('utf-8', 0, byteToRead)+lines;

//             position= readPosition;

//             linesCount= (lines.match(/\n/g) || []).length;
//         }

//         await fileHandle.close();

//         const resultLines= lines.trim().split('\n').slice(-n);
//         return resultLines.join('\n');
//     } catch (error) {
//         console.error("Error reading last lines:", err);
//         return Error reading file: ${error.message};
        
//     }
// }

// app.get('/log', (req,res)=>{
    
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');
//     res.flushHeaders();

//     const clientId= Date.now();
//     const newClient = {id: clientId, res};
//     clients.push(newClient);
//     console.log(Client ${clientId} connected. Total :${clients.length});

//     readLastLines(log_file_path, 10)
//         .then(last10lines => {
//             res.write(data: ${JSON.stringify(last10lines)}\n\n);
//         })
//         .catch(err => {

//             console.error(err);
//             res.write(data: ${JSON.stringify("Error reading file.")}\n\n);
//         })


//     req.on('close', ()=>{
//         clients= clients.filter(client => client.id !== clientId);
//         console.log(Client ${clientId} diconnected. Total :${clients.length});
//     })


// });




// let lastSize= fs.statSync(log_file_path).size;
// fs.watch(log_file_path, (eventType, filename)=>{
//     if(filename && eventType === 'change'){
//            const newStats = fs.statSync(log_file_path);

//            if(newStats.size > lastSize){
//             const stream= fs.createReadStream(log_file_path, {start: lastSize, end: newStats.size});
//             stream.on('data', (chunk)=>{
//                broadcast(chunk.toString());
//             });
//             lastSize= newStats.size;
//            }
//     }
// })

// function broadcast(data){
//     if(!data.trim()) return;
//     console.log(Broadcasting Update: ${data.trim()});
//     for(const client of clients){
//         client.res.write(data: ${JSON.stringify(data)}\n\n);
//     }
// }

// app.listen(port, ()=>{
//     console.log(server running at http://localhost:${port});
//     console.log(watching log file: ${log_file_path});
// })