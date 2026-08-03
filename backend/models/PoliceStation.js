const mongoose = require('mongoose');

const policeStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Police station name is required'],
    unique: true,
    trim: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required']
  }
});

module.exports = mongoose.model('PoliceStation', policeStationSchema);
