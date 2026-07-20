// models/index.ts
// All MongoDB schemas for the Bags Bro Twitter Engagement Farmer

import mongoose, { Schema, Document, Model } from 'mongoose';

// ─────────────────────────────────────────────
// LINGO
// ─────────────────────────────────────────────
export interface ILingo extends Document {
  term: string;
  definition: string;
  examples: string[];
  usageContext: ('post' | 'reply' | 'both')[];
  weight: number; // 1-10, higher = used more often
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LingoSchema = new Schema<ILingo>({
  term: { type: String, required: true, unique: true },
  definition: { type: String, required: true },
  examples: [{ type: String }],
  usageContext: [{ type: String, enum: ['post', 'reply', 'both'], default: 'both' }],
  weight: { type: Number, default: 5, min: 1, max: 10 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

// ─────────────────────────────────────────────
// TARGET ACCOUNTS
// ─────────────────────────────────────────────
export interface ITarget extends Document {
  handle: string;
  displayName?: string;
  tier: 'S' | 'A' | 'B' | 'C';
  followerCount?: number;
  bio?: string;
  discoverySource: string; // 'manual' | parent handle
  lastReplied?: Date;
  totalReplies: number;
  replySuccessRate: number; // 0-1
  active: boolean;
  tags: string[]; // ['nft', 'crypto', 'degen', etc]
  createdAt: Date;
  updatedAt: Date;
}

const TargetSchema = new Schema<ITarget>({
  handle: { type: String, required: true, unique: true },
  displayName: String,
  tier: { type: String, enum: ['S', 'A', 'B', 'C'], required: true },
  followerCount: Number,
  bio: String,
  discoverySource: { type: String, default: 'manual' },
  lastReplied: Date,
  totalReplies: { type: Number, default: 0 },
  replySuccessRate: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  tags: [String],
}, { timestamps: true });

// ─────────────────────────────────────────────
// MEDIA (GIF / IPFS / MP4)
// ─────────────────────────────────────────────
export interface IMedia extends Document {
  name: string;
  type: 'gif' | 'ipfs_image' | 'mp4';
  url: string; // Giphy URL, IPFS gateway URL, or Cloudinary URL
  cloudinaryPublicId?: string; // for MP4s only
  cloudinaryMetadata?: {
    duration?: number;
    width?: number;
    height?: number;
    format?: string;
    bytes?: number;
  };
  tags: string[]; // ['bullish', 'rekt', 'moon', 'celebration', etc]
  sentiment: 'bullish' | 'bearish' | 'neutral' | 'chaotic';
  usageCount: number;
  lastUsed?: Date;
  cooldownHours: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>({
  name: { type: String, required: true },
  type: { type: String, enum: ['gif', 'ipfs_image', 'mp4'], required: true },
  url: { type: String, required: true },
  cloudinaryPublicId: String,
  cloudinaryMetadata: {
    duration: Number,
    width: Number,
    height: Number,
    format: String,
    bytes: Number,
  },
  tags: [String],
  sentiment: { type: String, enum: ['bullish', 'bearish', 'neutral', 'chaotic'], default: 'neutral' },
  usageCount: { type: Number, default: 0 },
  lastUsed: Date,
  cooldownHours: { type: Number, default: 72 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

// ─────────────────────────────────────────────
// POST LOG
// ─────────────────────────────────────────────
export interface IPost extends Document {
  content: string;
  type: 'hot_take' | 'shitpost' | 'nft_image' | 'gif' | 'mp4' | 'bag_tech';
  mediaId?: mongoose.Types.ObjectId;
  tweetId?: string;
  status: 'scheduled' | 'posted' | 'failed' | 'skipped';
  scheduledFor?: Date;
  postedAt?: Date;
  trendingTopicUsed?: string;
  impressions: number;
  likes: number;
  retweets: number;
  replies: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
  content: { type: String, required: true },
  type: { type: String, enum: ['hot_take', 'shitpost', 'nft_image', 'gif', 'mp4', 'bag_tech'], required: true },
  mediaId: { type: Schema.Types.ObjectId, ref: 'Media' },
  tweetId: String,
  status: { type: String, enum: ['scheduled', 'posted', 'failed', 'skipped'], default: 'scheduled' },
  scheduledFor: Date,
  postedAt: Date,
  trendingTopicUsed: String,
  impressions: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  retweets: { type: Number, default: 0 },
  replies: { type: Number, default: 0 },
  errorMessage: String,
}, { timestamps: true });

// ─────────────────────────────────────────────
// REPLY LOG
// ─────────────────────────────────────────────
export interface IReply extends Document {
  targetHandle: string;
  targetTweetId: string;
  targetTweetText: string;
  content: string;
  tweetId?: string;
  status: 'pending_approval' | 'approved' | 'posted' | 'skipped' | 'failed';
  relevanceScore: number; // 0-1
  approvedBy?: 'auto' | 'manual';
  postedAt?: Date;
  likes: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReplySchema = new Schema<IReply>({
  targetHandle: { type: String, required: true },
  targetTweetId: { type: String, required: true },
  targetTweetText: { type: String, required: true },
  content: { type: String, required: true },
  tweetId: String,
  status: { 
    type: String, 
    enum: ['pending_approval', 'approved', 'posted', 'skipped', 'failed'], 
    default: 'pending_approval' 
  },
  relevanceScore: { type: Number, default: 0 },
  approvedBy: { type: String, enum: ['auto', 'manual'] },
  postedAt: Date,
  likes: { type: Number, default: 0 },
  errorMessage: String,
}, { timestamps: true });

// ─────────────────────────────────────────────
// BOT CONFIG (single document, key-value store)
// ─────────────────────────────────────────────
export interface IBotConfig extends Document {
  key: string;
  value: mongoose.Schema.Types.Mixed;
  label: string;
  description?: string;
  type: 'number' | 'string' | 'boolean' | 'array';
  updatedAt: Date;
}

const BotConfigSchema = new Schema<IBotConfig>({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  label: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['number', 'string', 'boolean', 'array'], required: true },
}, { timestamps: true });

// ─────────────────────────────────────────────
// ACTIVITY LOG
// ─────────────────────────────────────────────
export interface IActivityLog extends Document {
  action: 'post' | 'reply' | 'like' | 'follow' | 'error';
  relatedId?: mongoose.Types.ObjectId;
  twitterId?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  action: { type: String, enum: ['post', 'reply', 'like', 'follow', 'error'], required: true },
  relatedId: Schema.Types.ObjectId,
  twitterId: String,
  success: { type: Boolean, required: true },
  errorMessage: String,
  metadata: Schema.Types.Mixed,
}, { timestamps: true });

// ─────────────────────────────────────────────
// MODEL EXPORTS (safe re-init for Next.js HMR)
// ─────────────────────────────────────────────
export const Lingo: Model<ILingo> = 
  mongoose.models.Lingo || mongoose.model<ILingo>('Lingo', LingoSchema);

export const Target: Model<ITarget> = 
  mongoose.models.Target || mongoose.model<ITarget>('Target', TargetSchema);

export const Media: Model<IMedia> = 
  mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);

export const Post: Model<IPost> = 
  mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export const Reply: Model<IReply> = 
  mongoose.models.Reply || mongoose.model<IReply>('Reply', ReplySchema);

export const BotConfig: Model<IBotConfig> = 
  mongoose.models.BotConfig || mongoose.model<IBotConfig>('BotConfig', BotConfigSchema);

export const ActivityLog: Model<IActivityLog> = 
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
