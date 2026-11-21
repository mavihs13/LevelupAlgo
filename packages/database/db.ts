import mongoose, { model } from "mongoose";
import type { InferSchemaType } from "mongoose";
import { Schema } from "mongoose";

//   USER SCHEMA 
const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },  
    password: {
        type: String,
        required: true
    },
    isVerified:{
        type: Boolean,
        required: true
    },
    sheets:[
      {
        type : Schema.Types.ObjectId,
        ref: "Sheets"
      }
    ],
}, { timestamps: true });



// USER OTP SCHEMA
const UserOtpSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
}, { timestamps: true });




// SHEET SCHEMA
const SheetsSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "users",
    default: null
  }
}, { timestamps: true });





// FOLDER SCHEMA 
const FolderSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  sheetId: {
    type: Schema.Types.ObjectId,
    ref: "Sheets",
    required: true
  },
  parentFolderId: {
    type: Schema.Types.ObjectId,
    ref: "Folders",
    default: null 
  },
  order: {
    type: Number,
    default: 0
  },
  createdBy: {
	  type: Schema.Types.ObjectId,
	  ref: "users"
  }
}, { timestamps: true });



// QUESTION SCHEMA 
const QuestionSchema = new Schema({
    title: {
      type: String,
      required: true
    },
    type:{
      type: String,
      enum: ["Custom","Normal"]
    },
    link: {
      type: String,
      required: (function(this:any){
        return this.type === "Normal";
      })
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
    },
    done:{
      type:Boolean,
      default: false
    },
    platform: {
      type: String,
    },
    sheetId: {
      type: Schema.Types.ObjectId,
      ref: "Sheets",
      required: true
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: "Folders",
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
      default: null
    },
    notes: {
      type: String,
      default: ""
    },
    resourceLink:{
      type: String,
      default: ""
    },
    problemStatement:{
      type: String,
      required: (function(this: any){
        return this.type === "Custom";
      })
    },
    inputs:{
      type:[
        {
          input: String,
          output: String
        }
      ],
      required: (function(this:any){
        return this.type === "Custom";
      }),
      default: []
    },
    solvedAt:{
      type: Date,
      default: null
    }
}, { timestamps: true });




// Snippets
const SnippetSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true
  }
}, { timestamps: true });



// REVISION RECORD — one per question added to the user's revision tracker
const RevisionRecordSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: true
    },
    // Denormalized snapshots so the revision tracker stays self-contained
    questionTitle: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        default: null
    },
    difficulty: {
        type: String,
        default: null
    },
    folderId: {
        type: String,
        default: null
    },
    folderName: {
        type: String,
        default: null
    },
    sheetId: {
        type: String,
        default: null
    },
    questionLink: {
        type: String,
        default: null
    },
    originalSolvedAt: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["active", "paused"],
        default: "active"
    },
    // Raw legacy values from imported Excel files, preserved as-is
    legacyStatus: {
        type: String,
        default: null
    }
}, { timestamps: true });

RevisionRecordSchema.index({ userId: 1, questionId: 1 }, { unique: true });
RevisionRecordSchema.index({ userId: 1, status: 1 });

// REVISION SCHEDULE — one per revision number (1..6) of a RevisionRecord
const RevisionScheduleSchema = new Schema({
    revisionRecordId: {
        type: Schema.Types.ObjectId,
        ref: "RevisionRecord",
        required: true
    },
    revisionNumber: {
        type: Number,
        min: 1,
        max: 6,
        required: true
    },
    intervalDays: {
        type: Number,
        required: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    completedAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },
    rescheduledFrom: {
        type: Date,
        default: null
    }
}, { timestamps: true });

RevisionScheduleSchema.index({ revisionRecordId: 1, status: 1 });

// REVISION ATTEMPT — performance capture per completed revision
const RevisionAttemptSchema = new Schema({
    revisionScheduleId: {
        type: Schema.Types.ObjectId,
        ref: "RevisionSchedule",
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    confidenceRating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    solvingMethod: {
        type: String,
        enum: ["independent", "hints", "solution", "could_not_solve"],
        required: true
    },
    timeTaken: {
        type: Number,
        default: null // minutes
    },
    notes: {
        type: String,
        default: ""
    },
    attemptedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

RevisionAttemptSchema.index({ revisionScheduleId: 1 });
RevisionAttemptSchema.index({ userId: 1, createdAt: -1 });

// MODELS
const Question = model('Question', QuestionSchema);
const Users = model('users', UserSchema);
const OTP = model('otp', UserOtpSchema);
const Sheets = model('Sheets', SheetsSchema);
const Folders = model('Folders', FolderSchema);
const Snippet = model('Snippet', SnippetSchema);
const RevisionRecord = model('RevisionRecord', RevisionRecordSchema);
const RevisionSchedule = model('RevisionSchedule', RevisionScheduleSchema);
const RevisionAttempt = model('RevisionAttempt', RevisionAttemptSchema);

// Document types for the revision models (the models are values; their document types are the InferSchemaType of their schemas)
export type RevisionRecord = InferSchemaType<typeof RevisionRecordSchema>;
export type RevisionSchedule = InferSchemaType<typeof RevisionScheduleSchema>;
export type RevisionAttempt = InferSchemaType<typeof RevisionAttemptSchema>;

// EXPORTS
export {
    Users,
    OTP,
    Sheets,
    Question,
    Folders,
    Snippet,
    RevisionRecord,
    RevisionSchedule,
    RevisionAttempt
};