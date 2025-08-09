import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertUserPhotoSchema,
  insertUserMusicClipSchema,
  insertMatchSchema,
  insertMessageSchema,
  insertVibeboardPostSchema,
  insertPostLikeSchema,
  insertPostCommentSchema,
  insertUserReportSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updatedUser = await storage.updateUserProfile(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/profile/photos', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const photos = await storage.getUserPhotos(userId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  app.post('/api/profile/photos', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const photoData = insertUserPhotoSchema.parse({ ...req.body, userId });
      const photo = await storage.addUserPhoto(photoData);
      res.json(photo);
    } catch (error) {
      console.error("Error adding photo:", error);
      res.status(500).json({ message: "Failed to add photo" });
    }
  });

  app.delete('/api/profile/photos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verify the photo belongs to the authenticated user
      const userPhotos = await storage.getUserPhotos(userId);
      const photoExists = userPhotos.some(photo => photo.id === req.params.id);
      
      if (!photoExists) {
        return res.status(403).json({ message: "Unauthorized: Photo does not belong to user" });
      }
      
      await storage.deleteUserPhoto(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  app.get('/api/profile/music', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const clips = await storage.getUserMusicClips(userId);
      res.json(clips);
    } catch (error) {
      console.error("Error fetching music clips:", error);
      res.status(500).json({ message: "Failed to fetch music clips" });
    }
  });

  app.post('/api/profile/music', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const clipData = insertUserMusicClipSchema.parse({ ...req.body, userId });
      const clip = await storage.addUserMusicClip(clipData);
      res.json(clip);
    } catch (error) {
      console.error("Error adding music clip:", error);
      res.status(500).json({ message: "Failed to add music clip" });
    }
  });

  // Discovery routes
  app.get('/api/discover', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const profiles = await storage.getDiscoverProfiles(userId, limit);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching discover profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  // Matching routes
  app.post('/api/matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { targetUserId, liked } = req.body;

      // Check if match already exists
      let existingMatch = await storage.getMatch(userId, targetUserId);
      
      if (!existingMatch) {
        // Create new match record
        const matchData = insertMatchSchema.parse({
          user1Id: userId,
          user2Id: targetUserId,
          user1Liked: liked,
        });
        existingMatch = await storage.createMatch(matchData);
      } else {
        // Update existing match
        const isUser1 = existingMatch.user1Id === userId;
        const updateData: any = isUser1 
          ? { user1Liked: liked }
          : { user2Liked: liked };
        
        // Check if it's a mutual match
        const isMatch = isUser1 
          ? liked && existingMatch.user2Liked
          : liked && existingMatch.user1Liked;
        
        if (isMatch) {
          updateData.isMatch = true;
        }
        
        existingMatch = await storage.updateMatch(existingMatch.id, updateData);
      }

      res.json({ match: existingMatch, isNewMatch: existingMatch.isMatch });
    } catch (error) {
      console.error("Error creating match:", error);
      res.status(500).json({ message: "Failed to create match" });
    }
  });

  app.get('/api/matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await storage.getUserMatches(userId);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Messaging routes
  app.get('/api/messages/:matchId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { matchId } = req.params;
      const messages = await storage.getMatchMessages(matchId);
      
      // Mark messages as read
      await storage.markMessagesAsRead(matchId, userId);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({ ...req.body, senderId: userId });
      
      // Check message limit for non-premium users
      const user = await storage.getUser(userId);
      if (!user?.isPremium) {
        const messageCount = await storage.getUserMessageCount(userId);
        if (messageCount >= 30) {
          return res.status(403).json({ 
            message: "Message limit reached", 
            requiresPremium: true 
          });
        }
      }
      
      const message = await storage.createMessage(messageData);
      
      // Increment user message count if not premium
      if (!user?.isPremium) {
        await storage.incrementUserMessageCount(userId);
      }
      
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // VibeBoard routes
  app.get('/api/vibeboard', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const posts = await storage.getVibeboardPosts(limit);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching vibeboard posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post('/api/vibeboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertVibeboardPostSchema.parse({ ...req.body, userId });
      const post = await storage.createVibeboardPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.post('/api/vibeboard/:postId/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      const likeData = insertPostLikeSchema.parse({ postId, userId });
      const like = await storage.likePost(likeData);
      res.json(like);
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete('/api/vibeboard/:postId/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      await storage.unlikePost(postId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  app.get('/api/vibeboard/:postId/comments', async (req, res) => {
    try {
      const { postId } = req.params;
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/vibeboard/:postId/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      const commentData = insertPostCommentSchema.parse({ 
        ...req.body, 
        postId, 
        userId 
      });
      const comment = await storage.createPostComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Safety routes
  app.post('/api/report', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reportData = insertUserReportSchema.parse({ 
        ...req.body, 
        reporterId: userId 
      });
      const report = await storage.reportUser(reportData);
      res.json(report);
    } catch (error) {
      console.error("Error reporting user:", error);
      res.status(500).json({ message: "Failed to report user" });
    }
  });

  app.post('/api/block', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const blockData = insertUserReportSchema.parse({ 
        ...req.body, 
        reporterId: userId,
        type: "block"
      });
      const block = await storage.blockUser(blockData);
      res.json(block);
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ message: "Failed to block user" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket connection established');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Broadcast message to relevant users
        // In a production app, you'd want to maintain user-to-socket mappings
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
