import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "REPAIRING", "BUILDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    progress: {
      type: Number,
      default: 0,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    blueprint: {
      type: mongoose.Schema.Types.Mixed,
    },
    plan: {
      type: mongoose.Schema.Types.Mixed,
    },
    scenePlan: {
      type: mongoose.Schema.Types.Mixed,
    },
    assets: {
      type: mongoose.Schema.Types.Mixed,
    },
    generatedCode: {
      type: mongoose.Schema.Types.Mixed,
    },
    failedStage: {
      type: String,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    buildStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    buildLogs: {
      type: String,
    },
    buildStartedAt: {
      type: Date,
    },
    buildCompletedAt: {
      type: Date,
    },
    buildDiagnostics: {
      type: mongoose.Schema.Types.Mixed,
    },
    artifact: {
      type: mongoose.Schema.Types.Mixed,
    },
    repair: {
      attempts: [
        {
          attempt: Number,
          category: String,
          summary: String,
          prompt: String,
          aiProvider: String,
          model: String,
          rawResponse: String,
          parsedPatch: mongoose.Schema.Types.Mixed,
          validation: {
            passed: Boolean,
            errors: [String],
          },
          applyStatus: Boolean,
          rebuildStatus: Boolean,
          durationMs: Number,
          repairDuration: Number,
          aiGenerationDuration: Number,
          validationDuration: Number,
          patchApplyDuration: Number,
          rebuildDuration: Number,
          startedAt: Date,
          completedAt: Date,
          timestamp: Date,
        },
      ],
      retryHistory: [
        {
          attempt: Number,
          reason: String,
          backoffMs: Number,
          timestamp: Date,
        },
      ],
      analytics: {
        totalRepairDuration: { type: Number, default: 0 },
        totalAiGenerationDuration: { type: Number, default: 0 },
        totalValidationDuration: { type: Number, default: 0 },
        totalPatchApplyDuration: { type: Number, default: 0 },
        totalRebuildDuration: { type: Number, default: 0 },
      },
      totalAttempts: { type: Number, default: 0 },
      success: { type: Boolean, default: false },
      failureReason: String,
      finalCategory: String,
      rollbackPerformed: { type: Boolean, default: false },
      rollbackSuccess: { type: Boolean, default: false },
      completedAt: Date,
    },
    error: {
      message: String,
      errorType: String,
      code: String,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;
