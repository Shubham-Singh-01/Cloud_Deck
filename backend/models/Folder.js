const mongoose = require('mongoose');
const { Schema } = mongoose;

const FolderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#3b82f6',
  },
  icon: {
    type: String,
    default: 'folder',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  parentFolder: {
    type: String,
    default: null, // For nested folders in the future
  },
});

// Ensure unique folder names per user
FolderSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('folder', FolderSchema);
