import { Button } from "@/components/ui/button";
import { type User } from "@shared/schema";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: User | null;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export default function MatchModal({ 
  isOpen, 
  onClose, 
  matchedUser, 
  onSendMessage, 
  onKeepSwiping 
}: MatchModalProps) {
  if (!isOpen || !matchedUser) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-vibe-pink via-vibe-purple to-vibe-teal flex items-center justify-center z-50 p-4">
      <div className="text-center">
        <div className="animate-bounce-subtle mb-6">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto">
            <i className="fas fa-heart text-6xl text-vibe-pink"></i>
          </div>
        </div>
        
        <h2 className="text-4xl font-bold text-white mb-4">You Just Vibed!</h2>
        <p className="text-xl text-white mb-8">
          You and {matchedUser.firstName || "your match"} have matched!
        </p>
        
        <div className="flex justify-center items-center space-x-8 mb-8">
          {/* Current user profile image placeholder */}
          <div className="w-20 h-20 bg-gradient-to-br from-vibe-teal to-vibe-blue rounded-full flex items-center justify-center">
            <i className="fas fa-user text-white text-2xl"></i>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <i className="fas fa-heart text-vibe-pink text-xl"></i>
          </div>
          <img 
            src={matchedUser.profileImageUrl || `https://ui-avatars.com/api/?name=${matchedUser.firstName || 'User'}&background=random`}
            alt="Match profile" 
            className="w-20 h-20 rounded-full object-cover"
          />
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={onSendMessage}
            className="bg-white text-vibe-pink font-semibold py-3 px-8 rounded-full hover:scale-105 transition-all"
          >
            Send Message
          </Button>
          <Button 
            onClick={onKeepSwiping}
            variant="outline"
            className="text-white border-2 border-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-vibe-pink transition-all"
          >
            Keep Swiping
          </Button>
        </div>
      </div>
    </div>
  );
}
