const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (file) => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    console.log('Uploading to S3 with params:', params); // Debug
    const result = await s3.upload(params).promise();
    console.log('S3 upload result:', result); // Debug
    return result; // Returns { Key, Location, ... }
  } catch (err) {
    console.error('S3 upload error:', err);
    throw err;
  }
};

module.exports = uploadToS3;