import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // VibeConnect specific fields
  bio: text("bio"),
  age: integer("age"),
  interests: text("interests").array(),
  musicGenres: text("music_genres").array(),
  lookingFor: text("looking_for").array(), // dating, friendship, music_partners, creative_collabs
  personalityTraits: jsonb("personality_traits"), // quiz results
  location: varchar("location"),
  isProfileComplete: boolean("is_profile_complete").default(false),
  isPremium: boolean("is_premium").default(false),
  messageCount: integer("message_count").default(0),
  vibeLevel: integer("vibe_level").default(1),
});

// User photos table
export const userPhotos = pgTable("user_photos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  photoUrl: text("photo_url").notNull(),
  isMain: boolean("is_main").default(false),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User music clips table
export const userMusicClips = pgTable("user_music_clips", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  artist: varchar("artist").notNull(),
  audioUrl: text("audio_url"),
  spotifyUrl: text("spotify_url"),
  soundcloudUrl: text("soundcloud_url"),
  isMain: boolean("is_main").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Matches table
export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").references(() => users.id).notNull(),
  user2Id: varchar("user2_id").references(() => users.id).notNull(),
  user1Liked: boolean("user1_liked").default(false),
  user2Liked: boolean("user2_liked").default(false),
  isMatch: boolean("is_match").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: uuid("match_id").references(() => matches.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text"), // text, music, image
  attachmentUrl: text("attachment_url"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// VibeBoard posts table
export const vibeboardPosts = pgTable("vibeboard_posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  musicTitle: varchar("music_title"),
  musicArtist: varchar("music_artist"),
  musicUrl: text("music_url"),
  imageUrl: text("image_url"),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Post likes table
export const postLikes = pgTable("post_likes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: uuid("post_id").references(() => vibeboardPosts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("u_post_likes_post_user").on(table.postId, table.userId),
]);

// Post comments table
export const postComments = pgTable("post_comments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: uuid("post_id").references(() => vibeboardPosts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User blocks/reports table
export const userReports = pgTable("user_reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").references(() => users.id).notNull(),
  reportedId: varchar("reported_id").references(() => users.id).notNull(),
  reason: varchar("reason").notNull(),
  type: varchar("type").notNull(), // block, report
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const upsertUserSchema = createInsertSchema(users);
export const insertUserPhotoSchema = createInsertSchema(userPhotos).omit({ id: true, createdAt: true });
export const insertUserMusicClipSchema = createInsertSchema(userMusicClips).omit({ id: true, createdAt: true });
export const insertMatchSchema = createInsertSchema(matches).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertVibeboardPostSchema = createInsertSchema(vibeboardPosts).omit({ id: true, createdAt: true });
export const insertPostLikeSchema = createInsertSchema(postLikes).omit({ id: true, createdAt: true });
export const insertPostCommentSchema = createInsertSchema(postComments).omit({ id: true, createdAt: true });
export const insertUserReportSchema = createInsertSchema(userReports).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserPhoto = typeof userPhotos.$inferSelect;
export type UserMusicClip = typeof userMusicClips.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type VibeboardPost = typeof vibeboardPosts.$inferSelect;
export type PostLike = typeof postLikes.$inferSelect;
export type PostComment = typeof postComments.$inferSelect;
export type UserReport = typeof userReports.$inferSelect;

export type InsertUserPhoto = z.infer<typeof insertUserPhotoSchema>;
export type InsertUserMusicClip = z.infer<typeof insertUserMusicClipSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertVibeboardPost = z.infer<typeof insertVibeboardPostSchema>;
export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type InsertUserReport = z.infer<typeof insertUserReportSchema>;
