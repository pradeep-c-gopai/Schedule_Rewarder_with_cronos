const fs = require('fs').promises;

// Function to read the JSON file
async function readJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        throw err;
    }
}

// Function to write the JSON object back to the file
async function writeJsonFile(filePath, jsonData) {
    try {
        await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
    } catch (err) {
        throw err;
    }
}

// Exporting the functions
module.exports = {
    readJsonFile,
    writeJsonFile
};
