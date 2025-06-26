const mongoose = require('mongoose');
const { Schema } = mongoose;

const DocumentSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  tags: {
    type: [String],
    default: [],
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: String,
    required: true,
  },
  permissions: {
    type: String,
    default: 'owner',
  },
  folder: {
    type: String,
    default: 'Uncategorized',
  },
  version: {
    type: String,
    default: '1.0',
  },
  filePath: {
    type: String,
    required: false,
  },
  s3Key: {
    type: String,
    required: true, // This will be used to delete the file from S3
  },
});

module.exports = mongoose.model('document', DocumentSchema);
