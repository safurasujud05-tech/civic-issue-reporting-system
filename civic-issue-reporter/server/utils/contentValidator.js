// server/utils/contentValidator.js
// Validates content (text, images) for inappropriate/rubbish uploads

const INAPPROPRIATE_KEYWORDS = [
  'spam', 'test', 'random', 'rubbish', 'garbage', 'nonsense',
  'xxx', 'adult', 'hate', 'violence', 'abuse'
];

// Detect if text is rubbish/spam based on keywords and patterns
function isRubbishText(text) {
  if (!text || text.trim().length < 10) return true; // Too short
  
  const lowerText = text.toLowerCase();
  const rubbishCount = INAPPROPRIATE_KEYWORDS.filter(keyword => 
    lowerText.includes(keyword)
  ).length;
  
  // If contains 2+ inappropriate keywords, mark as rubbish
  if (rubbishCount >= 2) return true;
  
  return false;
}

// Detect if image is potentially tampered/fake based on metadata
// In a production app, use libraries like 'jimp' or 'sharp' for pixel analysis
function isValidImage(buffer, filename) {
  if (!buffer || buffer.length < 1000) return false; // Too small
  if (buffer.length > 50 * 1024 * 1024) return false; // Too large (>50MB)
  
  // Check file extension and magic bytes
  const ext = filename.split('.').pop().toLowerCase();
  const allowedExts = ['jpg', 'jpeg', 'png', 'gif'];
  if (!allowedExts.includes(ext)) return false;
  
  // Basic magic byte check for JPEG
  if (ext === 'jpg' || ext === 'jpeg') {
    if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) return false;
  }
  
  // Basic magic byte check for PNG
  if (ext === 'png') {
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
    if (!buffer.subarray(0, 4).equals(pngSignature)) return false;
  }
  
  return true;
}

// Validate complaint description for legitimate issue reporting
function isValidComplaintDescription(description) {
  if (!description || description.trim().length < 15) return false;
  if (isRubbishText(description)) return false;
  
  return true;
}

module.exports = {
  isRubbishText,
  isValidImage,
  isValidComplaintDescription,
  INAPPROPRIATE_KEYWORDS
};
