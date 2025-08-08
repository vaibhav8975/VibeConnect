import { Button } from "@/components/ui/button";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    // In a real app, this would integrate with a payment processor
    console.log("Upgrade to premium");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="glassmorphism rounded-2xl max-w-md w-full p-6 relative">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <i className="fas fa-times text-xl"></i>
        </button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-vibe-pink to-vibe-purple rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-crown text-white text-2xl"></i>
          </div>
          
          <h3 className="text-2xl font-bold gradient-text mb-2">VibeConnect+</h3>
          <p className="text-gray-300 text-sm mb-6">
            🎉 You've hit 30 free messages! Upgrade to unlock unlimited chats, calls, and VIP features.
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3">
              <i className="fas fa-infinity text-vibe-pink"></i>
              <span className="text-white">Unlimited messaging</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="fas fa-video text-vibe-teal"></i>
              <span className="text-white">Video & audio calls</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="fas fa-star text-vibe-purple"></i>
              <span className="text-white">VIP profile visibility</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="fas fa-heart text-vibe-pink"></i>
              <span className="text-white">Unlimited likes</span>
            </div>
          </div>
          
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-vibe-pink to-vibe-purple text-white font-semibold py-4 px-8 rounded-full neon-glow mb-3 hover:scale-105 transition-all"
          >
            Upgrade for ₹199/week
          </Button>
          
          <p className="text-xs text-gray-400">Cancel anytime. Terms apply.</p>
        </div>
      </div>
    </div>
  );
}
