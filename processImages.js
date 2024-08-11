const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

// Define input and output folders
const inputFolder = path.join(__dirname, 'input');
const outputFolder = path.join(__dirname, 'output');

// Ensure the output folder exists
fs.ensureDirSync(outputFolder);

// Function to generate a random number within a range
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

// Function to process an image
async function processImage(inputPath, outputPath) {
    try {
        // Get the metadata of the image to determine its original size
        const metadata = await sharp(inputPath).metadata();

        // Calculate the crop dimensions based on the rotation
        const angle = 4; // Rotate by 4 degrees
        const radians = (Math.PI / 180) * angle;

        // New dimensions after rotation
        const newWidth = Math.abs(metadata.width * Math.cos(radians)) + Math.abs(metadata.height * Math.sin(radians));
        const newHeight = Math.abs(metadata.width * Math.sin(radians)) + Math.abs(metadata.height * Math.cos(radians));

        // Calculate the crop size to remove black borders
        const cropWidth = Math.floor(metadata.width * (metadata.width / newWidth));
        const cropHeight = Math.floor(metadata.height * (metadata.height / newHeight));

        // Generate more noticeable random color adjustments
        const brightness = getRandomNumber(0.7, 1.3); // Adjust brightness more significantly
        const saturation = getRandomNumber(0.7, 1.3); // Adjust saturation more significantly
        const hue = Math.round(getRandomNumber(-30, 30)); // Adjust hue more significantly

        await sharp(inputPath)
            .rotate(angle) // Rotate the image
            .extract({
                left: Math.floor((newWidth - cropWidth) / 2),
                top: Math.floor((newHeight - cropHeight) / 2),
                width: cropWidth,
                height: cropHeight,
            }) // Crop to remove the black borders
            .modulate({
                brightness: brightness,
                saturation: saturation,
                hue: hue,
            }) // Apply more noticeable random color adjustments
            .withMetadata({ orientation: null }) // Clear metadata
            .toFile(outputPath);

        console.log(`Processed: ${outputPath}`);
    } catch (error) {
        console.error(`Error processing ${inputPath}:`, error);
    }
}

// Function to process all images in the input folder
async function processImages() {
    try {
        const files = await fs.readdir(inputFolder);

        // Process each image file
        for (const file of files) {
            const inputPath = path.join(inputFolder, file);
            const outputPath = path.join(outputFolder, file);

            // Process only image files (e.g., .jpg, .png)
            if (/\.(jpg|jpeg|png|tiff|bmp|gif)$/i.test(file)) {
                await processImage(inputPath, outputPath);
            }
        }

        console.log('All images have been processed.');
    } catch (error) {
        console.error('Error reading input folder:', error);
    }
}

// Run the processing function
processImages();
