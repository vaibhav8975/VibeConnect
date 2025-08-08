import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AudioVisualizer from "@/components/audio-visualizer";
import { type VibeboardPost, type User } from "@shared/schema";

export default function VibeBoard() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: "",
    musicTitle: "",
    musicArtist: "",
    musicUrl: "",
  });

  const { data: posts, isLoading } = useQuery<(VibeboardPost & { user: User })[]>({
    queryKey: ["/api/vibeboard"],
    retry: false,
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: typeof newPost) => {
      const response = await apiRequest("POST", "/api/vibeboard", postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vibeboard"] });
      setShowCreatePost(false);
      setNewPost({ content: "", musicTitle: "", musicArtist: "", musicUrl: "" });
      toast({
        title: "Success",
        description: "Your vibe has been shared!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to share your vibe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest("POST", `/api/vibeboard/${postId}/like`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vibeboard"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to like posts.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "Failed to like post.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = () => {
    if (!newPost.content.trim()) return;
    createPostMutation.mutate(newPost);
  };

  const handleLikePost = (postId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to like posts.",
        variant: "destructive",
      });
      return;
    }
    likePostMutation.mutate(postId);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900 bg-opacity-95 backdrop-blur-sm border-b border-gray-800 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <button 
              className="text-gray-400 hover:text-white"
              onClick={() => setLocation(isAuthenticated ? "/" : "/discover")}
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <h2 className="text-2xl font-bold gradient-text">VibeBoard</h2>
          </div>
          {isAuthenticated && (
            <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-vibe-pink to-vibe-purple text-white px-6 py-2 rounded-full text-sm font-semibold hover:scale-105 transition-all">
                  Share Vibe
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle className="gradient-text">Share Your Vibe</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="What's your vibe today?"
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Song title"
                      value={newPost.musicTitle}
                      onChange={(e) => setNewPost(prev => ({ ...prev, musicTitle: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Input
                      placeholder="Artist"
                      value={newPost.musicArtist}
                      onChange={(e) => setNewPost(prev => ({ ...prev, musicArtist: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <Input
                    placeholder="Music URL (optional)"
                    value={newPost.musicUrl}
                    onChange={(e) => setNewPost(prev => ({ ...prev, musicUrl: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button
                    onClick={handleCreatePost}
                    disabled={createPostMutation.isPending || !newPost.content.trim()}
                    className="w-full bg-gradient-to-r from-vibe-pink to-vibe-purple"
                  >
                    {createPostMutation.isPending ? "Sharing..." : "Share Vibe"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibe-pink mx-auto mb-4"></div>
            <p className="text-gray-400">Loading vibes...</p>
          </div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id} className="glassmorphism rounded-2xl p-6 border-0 bg-transparent">
              <div className="flex items-start space-x-4 mb-4">
                <img 
                  src={post.user.profileImageUrl || `https://ui-avatars.com/api/?name=${post.user.firstName || 'User'}&background=random`}
                  alt="User avatar" 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-white">
                      {post.user.firstName || "Anonymous"}
                    </h4>
                    <span className="text-gray-400 text-sm">
                      {formatTimeAgo(post.createdAt!)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{post.content}</p>
                </div>
              </div>
              
              {/* Music Attachment */}
              {post.musicTitle && (
                <div className="bg-gray-800 rounded-xl p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-vibe-pink to-vibe-purple rounded-lg flex items-center justify-center">
                      <i className="fas fa-music text-white"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{post.musicTitle}</p>
                      <p className="text-gray-400 text-sm">{post.musicArtist}</p>
                    </div>
                    <button className="w-10 h-10 bg-vibe-pink rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                      <i className="fas fa-play text-sm"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Interactions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={() => handleLikePost(post.id)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-vibe-pink transition-colors"
                  >
                    <i className="fas fa-heart"></i>
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-vibe-teal transition-colors">
                    <i className="fas fa-comment"></i>
                    <span className="text-sm">{post.comments}</span>
                  </button>
                  <button className="text-gray-400 hover:text-vibe-purple transition-colors">
                    <i className="fas fa-share"></i>
                  </button>
                </div>
                <AudioVisualizer isPlaying={false} />
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <i className="fas fa-music text-6xl text-gray-600 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">No vibes yet</h3>
            <p className="text-gray-400 mb-6">Be the first to share your vibe!</p>
            {isAuthenticated && (
              <Button 
                onClick={() => setShowCreatePost(true)}
                className="bg-gradient-to-r from-vibe-pink to-vibe-purple"
              >
                Share Your Vibe
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
