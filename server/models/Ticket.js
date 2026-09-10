import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    url: {
      type: String,
      required: true
    },

    type: {
      type: String,
      required: true
    },

    size: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  message: {
    type: String,
    trim: true,
    default: ""
  },

  attachments: {
    type: [attachmentSchema],
    default: []
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const activitySchema = new mongoose.Schema({
  action: String,

  by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: Number,
    unique: true,
    index: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Urgent"],
    default: "Medium"
  },

  status: {
    type: String,
    enum: ["Open", "In Progress", "Resolved", "Closed"],
    default: "Open"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  comments: [commentSchema],

  activity: [activitySchema],

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  resolvedAt: Date
});

ticketSchema.pre("save", async function(next) {
  if (!this.ticketNumber) {
    const last = await mongoose
      .model("Ticket")
      .findOne()
      .sort({ ticketNumber: -1 })
      .select("ticketNumber");

    this.ticketNumber = last?.ticketNumber
      ? last.ticketNumber + 1
      : 1001;
  }

  this.updatedAt = new Date();

  next();
});

export default mongoose.model("Ticket", ticketSchema);