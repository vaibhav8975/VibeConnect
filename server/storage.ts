import {
  users,
  userPhotos,
  userMusicClips,
  matches,
  messages,
  vibeboardPosts,
  postLikes,
  postComments,
  userReports,
  type User,
  type UpsertUser,
  type UserPhoto,
  type UserMusicClip,
  type Match,
  type Message,
  type VibeboardPost,
  type PostLike,
  type PostComment,
  type UserReport,
  type InsertUserPhoto,
  type InsertUserMusicClip,
  type InsertMatch,
  type InsertMessage,
  type InsertVibeboardPost,
  type InsertPostLike,
  type InsertPostComment,
  type InsertUserReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql, ne, inArray, not } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  updateUserProfile(id: string, data: Partial<User>): Promise<User>;
  getUserPhotos(userId: string): Promise<UserPhoto[]>;
  addUserPhoto(photo: InsertUserPhoto): Promise<UserPhoto>;
  deleteUserPhoto(id: string): Promise<void>;
  getUserMusicClips(userId: string): Promise<UserMusicClip[]>;
  addUserMusicClip(clip: InsertUserMusicClip): Promise<UserMusicClip>;
  deleteUserMusicClip(id: string): Promise<void>;
  
  // Matching operations
  getDiscoverProfiles(userId: string, limit?: number): Promise<User[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  getMatch(user1Id: string, user2Id: string): Promise<Match | undefined>;
  updateMatch(id: string, data: Partial<Match>): Promise<Match>;
  getUserMatches(userId: string): Promise<Match[]>;
  
  // Messaging operations
  getMatchMessages(matchId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(matchId: string, userId: string): Promise<void>;
  getUserMessageCount(userId: string): Promise<number>;
  incrementUserMessageCount(userId: string): Promise<void>;
  
  // VibeBoard operations
  getVibeboardPosts(limit?: number): Promise<(VibeboardPost & { user: User })[]>;
  createVibeboardPost(post: InsertVibeboardPost): Promise<VibeboardPost>;
  likePost(like: InsertPostLike): Promise<PostLike>;
  unlikePost(postId: string, userId: string): Promise<void>;
  getPostComments(postId: string): Promise<(PostComment & { user: User })[]>;
  createPostComment(comment: InsertPostComment): Promise<PostComment>;
  
  // Safety operations
  reportUser(report: InsertUserReport): Promise<UserReport>;
  blockUser(report: InsertUserReport): Promise<UserReport>;
  getBlockedUsers(userId: string): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Profile operations
  async updateUserProfile(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserPhotos(userId: string): Promise<UserPhoto[]> {
    return await db
      .select()
      .from(userPhotos)
      .where(eq(userPhotos.userId, userId))
      .orderBy(userPhotos.order);
  }

  async addUserPhoto(photo: InsertUserPhoto): Promise<UserPhoto> {
    const [userPhoto] = await db
      .insert(userPhotos)
      .values(photo)
      .returning();
    return userPhoto;
  }

  async deleteUserPhoto(id: string): Promise<void> {
    await db.delete(userPhotos).where(eq(userPhotos.id, id));
  }

  async getUserMusicClips(userId: string): Promise<UserMusicClip[]> {
    return await db
      .select()
      .from(userMusicClips)
      .where(eq(userMusicClips.userId, userId));
  }

  async addUserMusicClip(clip: InsertUserMusicClip): Promise<UserMusicClip> {
    const [musicClip] = await db
      .insert(userMusicClips)
      .values(clip)
      .returning();
    return musicClip;
  }

  async deleteUserMusicClip(id: string): Promise<void> {
    await db.delete(userMusicClips).where(eq(userMusicClips.id, id));
  }

  // Matching operations
  async getDiscoverProfiles(userId: string, limit = 10): Promise<User[]> {
    // 1. Gather IDs that should be excluded from discovery results.
    const blockedUsers = await this.getBlockedUsers(userId);

    // Users that the current user has already interacted with (liked / disliked)
    const seenUsers = await db
      .select({ userId: matches.user2Id })
      .from(matches)
      .where(eq(matches.user1Id, userId));

    const seenUserIds = seenUsers.map((u) => u.userId);

    // Always exclude the current user as well.
    const excludeIds = [...blockedUsers, ...seenUserIds, userId];

    /*
      Instead of excluding only the first ID (the previous, buggy behaviour),
      we now exclude ALL IDs using a NOT IN clause when there are any IDs to
      exclude.  Drizzle-ORM does not provide a dedicated helper for NOT IN, but
      we can achieve the same with `not(inArray())`.
    */

    // Base condition: profile must be complete
    const baseCondition = eq(users.isProfileComplete, true);

    // If there are IDs to exclude, add a NOT IN condition. Otherwise, use the
    // base condition by itself to avoid invoking `and()` with a single param.
    const finalCondition = excludeIds.length > 0
      ? and(baseCondition, not(inArray(users.id, excludeIds)))
      : baseCondition;

    return await db
      .select()
      .from(users)
      .where(finalCondition)
      .limit(limit);
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [newMatch] = await db
      .insert(matches)
      .values(match)
      .returning();
    return newMatch;
  }

  async getMatch(user1Id: string, user2Id: string): Promise<Match | undefined> {
    const [match] = await db
      .select()
      .from(matches)
      .where(
        or(
          and(eq(matches.user1Id, user1Id), eq(matches.user2Id, user2Id)),
          and(eq(matches.user1Id, user2Id), eq(matches.user2Id, user1Id))
        )
      );
    return match;
  }

  async updateMatch(id: string, data: Partial<Match>): Promise<Match> {
    const [match] = await db
      .update(matches)
      .set(data)
      .where(eq(matches.id, id))
      .returning();
    return match;
  }

  async getUserMatches(userId: string): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(
        and(
          or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)),
          eq(matches.isMatch, true)
        )
      )
      .orderBy(desc(matches.createdAt));
  }

  // Messaging operations
  async getMatchMessages(matchId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.matchId, matchId))
      .orderBy(messages.createdAt);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async markMessagesAsRead(matchId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.matchId, matchId),
          eq(messages.receiverId, userId)
        )
      );
  }

  async getUserMessageCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(eq(messages.senderId, userId));
    return result?.count || 0;
  }

  async incrementUserMessageCount(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ messageCount: sql`${users.messageCount} + 1` })
      .where(eq(users.id, userId));
  }

  // VibeBoard operations
  async getVibeboardPosts(limit = 20): Promise<(VibeboardPost & { user: User })[]> {
    const result = await db
      .select({
        id: vibeboardPosts.id,
        userId: vibeboardPosts.userId,
        content: vibeboardPosts.content,
        musicTitle: vibeboardPosts.musicTitle,
        musicArtist: vibeboardPosts.musicArtist,
        musicUrl: vibeboardPosts.musicUrl,
        imageUrl: vibeboardPosts.imageUrl,
        likes: vibeboardPosts.likes,
        comments: vibeboardPosts.comments,
        createdAt: vibeboardPosts.createdAt,
        user: users,
      })
      .from(vibeboardPosts)
      .leftJoin(users, eq(vibeboardPosts.userId, users.id))
      .orderBy(desc(vibeboardPosts.createdAt))
      .limit(limit);

    return result.map(row => ({
      ...row,
      user: row.user!,
    }));
  }

  async createVibeboardPost(post: InsertVibeboardPost): Promise<VibeboardPost> {
    const [newPost] = await db
      .insert(vibeboardPosts)
      .values(post)
      .returning();
    return newPost;
  }

  async likePost(like: InsertPostLike): Promise<PostLike> {
    const [newLike] = await db
      .insert(postLikes)
      .values(like)
      .returning();
    
    // Increment like count
    await db
      .update(vibeboardPosts)
      .set({ likes: sql`${vibeboardPosts.likes} + 1` })
      .where(eq(vibeboardPosts.id, like.postId));
    
    return newLike;
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    // Remove the like entry first.
    await db
      .delete(postLikes)
      .where(
        and(
          eq(postLikes.postId, postId),
          eq(postLikes.userId, userId)
        )
      );

    /*
      Safely decrement the like counter without allowing it to become negative.
      We utilise SQL's `GREATEST` function to ensure the value bottoms out at 0.
    */
    await db
      .update(vibeboardPosts)
      .set({ likes: sql`GREATEST(${vibeboardPosts.likes} - 1, 0)` })
      .where(eq(vibeboardPosts.id, postId));
  }

  async getPostComments(postId: string): Promise<(PostComment & { user: User })[]> {
    const result = await db
      .select({
        id: postComments.id,
        postId: postComments.postId,
        userId: postComments.userId,
        content: postComments.content,
        createdAt: postComments.createdAt,
        user: users,
      })
      .from(postComments)
      .leftJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(postComments.createdAt);

    return result.map(row => ({
      ...row,
      user: row.user!,
    }));
  }

  async createPostComment(comment: InsertPostComment): Promise<PostComment> {
    const [newComment] = await db
      .insert(postComments)
      .values(comment)
      .returning();
    
    // Increment comment count
    await db
      .update(vibeboardPosts)
      .set({ comments: sql`${vibeboardPosts.comments} + 1` })
      .where(eq(vibeboardPosts.id, comment.postId));
    
    return newComment;
  }

  // Safety operations
  async reportUser(report: InsertUserReport): Promise<UserReport> {
    const [newReport] = await db
      .insert(userReports)
      .values(report)
      .returning();
    return newReport;
  }

  async blockUser(report: InsertUserReport): Promise<UserReport> {
    const [newBlock] = await db
      .insert(userReports)
      .values({ ...report, type: "block" })
      .returning();
    return newBlock;
  }

  async getBlockedUsers(userId: string): Promise<string[]> {
    const blocks = await db
      .select({ reportedId: userReports.reportedId })
      .from(userReports)
      .where(
        and(
          eq(userReports.reporterId, userId),
          eq(userReports.type, "block")
        )
      );
    
    return blocks.map(b => b.reportedId);
  }
}

export const storage = new DatabaseStorage();
