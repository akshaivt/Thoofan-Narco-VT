const mongoose = require('mongoose');
const { generateRandomComplaintId } = require('../utils/helpers');

const noteSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  note: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const timelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      index: true
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Citizen reference is required']
    },
    activityType: {
      type: String,
      required: [true, 'Drug activity type is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      trim: true
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true
    },
    place: {
      type: String,
      required: [true, 'Place is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    nearestPoliceStation: {
      type: String,
      default: ''
    },
    incidentDate: {
      type: Date,
      required: [true, 'Incident date is required']
    },
    incidentTime: {
      type: String,
      required: [true, 'Incident time is required']
    },
    evidenceImages: {
      type: [String],
      default: []
    },
    evidenceVideos: {
      type: [String],
      default: []
    },
    isConfidential: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Investigation', 'Resolved', 'Rejected'],
      default: 'Pending'
    },
    priority: {
      type: String,
      enum: ['Waiting for AI', 'Low', 'Medium', 'High'],
      default: 'Waiting for AI'
    },
    // Array of official notes
    notes: [noteSchema],
    // Timeline of status updates
    timeline: [timelineSchema],
    
    // Future AI fields (Initialized as null)
    aiSummary: {
      type: String,
      default: null
    },
    aiCategory: {
      type: String,
      default: null
    },
    aiPriority: {
      type: String,
      default: null
    },
    riskLevel: {
      type: String,
      default: null
    },
    aiSuggestions: {
      type: String,
      default: null
    },
    duplicateScore: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to generate secure random Complaint ID (OTF-YY-XXXXXX)
complaintSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  try {
    let uniqueIdGenerated = false;
    let attempts = 0;
    
    while (!uniqueIdGenerated && attempts < 10) {
      const generatedId = generateRandomComplaintId();
      
      // Ensure it is truly unique in DB
      const existing = await this.constructor.findOne({ complaintId: generatedId });
      if (!existing) {
        this.complaintId = generatedId;
        uniqueIdGenerated = true;
      }
      attempts++;
    }
    
    if (!uniqueIdGenerated) {
      throw new Error('Failed to generate a unique random Complaint ID after multiple attempts');
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);
