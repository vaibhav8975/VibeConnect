import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import ProfileCard from "@/components/profile-card";
import MatchModal from "@/components/match-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type User } from "@shared/schema";

export default function Discover() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);

  const { data: profiles, isLoading } = useQuery<User[]>({
    queryKey: ["/api/discover"],
    enabled: isAuthenticated,
    retry: false,
  });

  const likeMutation = useMutation({
    mutationFn: async (data: { targetUserId: string; liked: boolean }) => {
      const response = await apiRequest("POST", "/api/matches", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.isNewMatch && profiles && profiles[currentProfileIndex]) {
        setMatchedUser(profiles[currentProfileIndex]);
        setShowMatchModal(true);
      }
      nextProfile();
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
        description: "Failed to save your choice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const nextProfile = () => {
    if (profiles && currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      // Load more profiles
      queryClient.invalidateQueries({ queryKey: ["/api/discover"] });
      setCurrentProfileIndex(0);
    }
  };

  const handleLike = () => {
    if (!profiles || !profiles[currentProfileIndex]) return;
    likeMutation.mutate({
      targetUserId: profiles[currentProfileIndex].id,
      liked: true,
    });
  };

  const handlePass = () => {
    if (!profiles || !profiles[currentProfileIndex]) return;
    if (isAuthenticated) {
      likeMutation.mutate({
        targetUserId: profiles[currentProfileIndex].id,
        liked: false,
      });
    } else {
      nextProfile();
    }
  };

  const handleSuperLike = () => {
    if (!profiles || !profiles[currentProfileIndex]) return;
    // For now, treat super like the same as regular like
    handleLike();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibe-pink mx-auto mb-4"></div>
          <p>Finding your perfect vibes...</p>
        </div>
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center">
          <i className="fas fa-heart text-6xl text-gray-600 mb-4"></i>
          <h2 className="text-2xl font-bold mb-2">No more profiles</h2>
          <p className="text-gray-400 mb-6">Check back later for more vibes!</p>
          <Button 
            onClick={() => setLocation("/")}
            className="bg-gradient-to-r from-vibe-pink to-vibe-purple"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentProfileIndex];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-gray-900 bg-opacity-95 backdrop-blur-sm border-b border-gray-800 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold gradient-text">VibeConnect</h1>
          <div className="flex items-center space-x-6">
            <button 
              className="text-gray-400 hover:text-vibe-pink transition-colors"
              onClick={() => setLocation("/vibeboard")}
            >
              <i className="fas fa-compass text-xl"></i>
            </button>
            {isAuthenticated && (
              <>
                <button 
                  className="text-gray-400 hover:text-vibe-teal transition-colors relative"
                  onClick={() => setLocation("/messages")}
                >
                  <i className="fas fa-comments text-xl"></i>
                  <span className="absolute -top-1 -right-1 bg-vibe-pink text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
                </button>
                <button 
                  className="text-gray-400 hover:text-vibe-purple transition-colors"
                  onClick={() => setLocation("/profile")}
                >
                  <i className="fas fa-user text-xl"></i>
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Card Stack Interface */}
      <div className="p-4 max-w-md mx-auto">
        <ProfileCard 
          profile={currentProfile} 
          onLike={handleLike}
          onPass={handlePass}
          onSuperLike={handleSuperLike}
        />

        {/* Quick Stats */}
        {isAuthenticated && (
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <Card className="glassmorphism p-4 rounded-xl border-0 bg-transparent">
              <p className="text-2xl font-bold text-vibe-pink">12</p>
              <p className="text-xs text-gray-400">Matches</p>
            </Card>
            <Card className="glassmorphism p-4 rounded-xl border-0 bg-transparent">
              <p className="text-2xl font-bold text-vibe-teal">89</p>
              <p className="text-xs text-gray-400">Vibes Sent</p>
            </Card>
            <Card className="glassmorphism p-4 rounded-xl border-0 bg-transparent">
              <p className="text-2xl font-bold text-vibe-purple">7</p>
              <p className="text-xs text-gray-400">Vibe Level</p>
            </Card>
          </div>
        )}
      </div>

      {/* Match Modal */}
      <MatchModal 
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        matchedUser={matchedUser}
        onSendMessage={() => {
          setShowMatchModal(false);
          setLocation("/messages");
        }}
        onKeepSwiping={() => setShowMatchModal(false)}
      />
    </div>
  );
}
