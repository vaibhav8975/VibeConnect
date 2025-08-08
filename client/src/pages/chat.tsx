import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PremiumModal from "@/components/premium-modal";
import { type Message } from "@shared/schema";

export default function Chat() {
  const { matchId } = useParams<{ matchId: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

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

  // WebSocket connection for real-time messaging
  useEffect(() => {
    if (!isAuthenticated || !matchId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_message" && data.matchId === matchId) {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", matchId] });
      }
    };
    
    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isAuthenticated, matchId, queryClient]);

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", matchId],
    enabled: isAuthenticated && !!matchId,
    retry: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { matchId: string; receiverId: string; content: string }) => {
      const response = await apiRequest("POST", "/api/messages", messageData);
      return response.json();
    },
    onSuccess: (newMessage) => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", matchId] });
      setMessage("");
      
      // Send real-time update via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "new_message",
          matchId,
          message: newMessage
        }));
      }
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
      
      const errorMessage = error.message || "Failed to send message";
      if (errorMessage.includes("limit")) {
        setShowPremiumModal(true);
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !matchId) return;

    // For demo purposes, use a placeholder receiver ID
    sendMessageMutation.mutate({
      matchId,
      receiverId: "placeholder-receiver-id",
      content: message,
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibe-pink mx-auto mb-4"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Chat Header */}
      <div className="bg-gray-900 bg-opacity-95 backdrop-blur-sm border-b border-gray-800 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <button 
              className="text-gray-400 hover:text-white"
              onClick={() => setLocation("/messages")}
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <img 
              src={`https://ui-avatars.com/api/?name=User&background=random`}
              alt="Chat partner" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-white">Your Match</h3>
              <p className="text-xs text-green-400">Online now</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-vibe-teal transition-colors">
              <i className="fas fa-phone text-lg"></i>
            </button>
            <button className="text-gray-400 hover:text-vibe-purple transition-colors">
              <i className="fas fa-video text-lg"></i>
            </button>
            <button className="text-gray-400 hover:text-red-400 transition-colors">
              <i className="fas fa-ellipsis-v text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full space-y-4">
        {/* Match Notification */}
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-vibe-pink to-vibe-purple rounded-full mb-3">
            <i className="fas fa-heart text-white text-xl"></i>
          </div>
          <h4 className="text-lg font-semibold text-white mb-1">You Just Vibed!</h4>
          <p className="text-sm text-gray-400">You and your match connected. Start the conversation!</p>
        </div>

        {/* Messages */}
        {messages && messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.senderId === user?.id ? 'justify-end' : ''
            }`}
          >
            {msg.senderId !== user?.id && (
              <img 
                src={`https://ui-avatars.com/api/?name=User&background=random`}
                alt="Chat partner" 
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <div 
              className={`rounded-2xl p-3 max-w-xs ${
                msg.senderId === user?.id 
                  ? 'bg-gradient-to-r from-vibe-pink to-vibe-purple rounded-br-sm' 
                  : 'bg-gray-800 rounded-bl-sm'
              }`}
            >
              <p className="text-white text-sm">{msg.content}</p>
              <p className={`text-xs mt-1 ${
                msg.senderId === user?.id 
                  ? 'text-white text-opacity-70' 
                  : 'text-gray-400'
              }`}>
                {formatTime(msg.createdAt!)}
              </p>
            </div>
          </div>
        ))}

        {/* Message Counter Alert */}
        {user && !user.isPremium && user.messageCount && user.messageCount > 20 && (
          <div className="bg-gradient-to-r from-vibe-pink to-vibe-purple rounded-xl p-4 text-center">
            <h4 className="text-white font-semibold mb-1">
              {30 - user.messageCount} messages remaining
            </h4>
            <p className="text-white text-sm opacity-90 mb-3">
              You're getting close to your 30 message limit!
            </p>
            <Button 
              onClick={() => setShowPremiumModal(true)}
              className="bg-white text-vibe-pink font-semibold px-6 py-2 rounded-full text-sm hover:scale-105 transition-all"
            >
              Upgrade to VibeConnect+
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-800 p-4">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <button 
              type="button"
              className="text-gray-400 hover:text-vibe-pink transition-colors"
            >
              <i className="fas fa-music text-xl"></i>
            </button>
            <div className="flex-1 relative">
              <Input 
                type="text" 
                placeholder="Send a message..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-gray-800 text-white p-3 rounded-full border border-gray-700 focus:border-vibe-pink pr-12"
              />
              <button 
                type="submit"
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-vibe-pink rounded-full flex items-center justify-center text-white hover:scale-110 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                <i className="fas fa-paper-plane text-sm"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Premium Modal */}
      <PremiumModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}
