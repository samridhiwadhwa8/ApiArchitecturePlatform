const mongoose = require('mongoose');

const flowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  nodes: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['endpoint', 'start', 'process'],
      default: 'endpoint'
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 }
    },
    data: {
      label: { type: String, required: true },
      method: { type: String },
      url: { type: String },
      description: { type: String }
    }
  }],
  edges: [{
    id: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true
    },
    target: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'default'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Flow', flowSchema);
