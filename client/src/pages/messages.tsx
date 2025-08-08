import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { type Match } from "@shared/schema";

export default function Messages() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  const { data: matches, isLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
    enabled: isAuthenticated,
    retry: false,
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibe-pink mx-auto mb-4"></div>
          <p>Loading your conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900 bg-opacity-95 backdrop-blur-sm border-b border-gray-800 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <button 
              className="text-gray-400 hover:text-white"
              onClick={() => setLocation("/")}
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <h2 className="text-2xl font-bold gradient-text">Messages</h2>
          </div>
          <button className="text-gray-400 hover:text-vibe-pink">
            <i className="fas fa-search text-xl"></i>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {matches && matches.length > 0 ? (
          <>
            {/* New Matches Section */}
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-vibe-teal mb-3">New Matches</h3>
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {matches.slice(0, 5).map((match) => (
                  <div 
                    key={match.id}
                    className="flex-shrink-0 text-center cursor-pointer"
                    onClick={() => setLocation(`/chat/${match.id}`)}
                  >
                    <div className="relative">
                      <img 
                        src={`https://ui-avatars.com/api/?name=User&background=random`}
                        alt="Match" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-vibe-pink"
                      />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-vibe-pink rounded-full flex items-center justify-center">
                        <i className="fas fa-heart text-white text-xs"></i>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">New Match</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversations */}
            <div className="space-y-0">
              {matches.map((match) => (
                <div 
                  key={match.id}
                  className="flex items-center space-x-4 p-4 hover:bg-gray-800 hover:bg-opacity-50 cursor-pointer border-b border-gray-800"
                  onClick={() => setLocation(`/chat/${match.id}`)}
                >
                  <img 
                    src={`https://ui-avatars.com/api/?name=User&background=random`}
                    alt="Chat participant" 
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">New Match</h4>
                      <span className="text-xs text-gray-400">Now</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      You matched! Start the conversation.
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-vibe-teal">0 messages</span>
                      <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">30 free messages available</span>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-vibe-pink rounded-full"></div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 px-4">
            <i className="fas fa-comments text-6xl text-gray-600 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
            <p className="text-gray-400 mb-6">
              Start discovering and matching with people to begin chatting!
            </p>
            <Button 
              onClick={() => setLocation("/discover")}
              className="bg-gradient-to-r from-vibe-pink to-vibe-purple"
            >
              Start Discovering
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
