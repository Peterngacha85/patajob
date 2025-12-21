import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file before upload
 * @param {File} imageFile - The original image file
 * @returns {Promise<File>} - The compressed image file
 */
export const compressImage = async (imageFile) => {
    const options = {
        maxSizeMB: 1, // Max size 1MB
        maxWidthOrHeight: 1920, // Max dimensions 1920px
        useWebWorker: true,
        initialQuality: 0.8,
    };

    try {
        console.log(`Original size: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`);
        const compressedFile = await imageCompression(imageFile, options);
        console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
        
        // Return original if compression didn't help much or if it's already small
        if (compressedFile.size >= imageFile.size) return imageFile;
        
        return compressedFile;
    } catch (error) {
        console.error('Image compression failed:', error);
        return imageFile; // Fallback to original
    }
};
