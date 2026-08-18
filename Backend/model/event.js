const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    default: "Project Deadline" 
  },
  targetDate: { 
    type: String, 
    default: "" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
