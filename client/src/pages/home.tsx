import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

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
            <button 
              className="text-gray-400 hover:text-white"
              onClick={() => window.location.href = "/api/logout"}
            >
              <i className="fas fa-sign-out-alt text-xl"></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Welcome Section */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName || "Viber"}! 
          </h2>
          <p className="text-gray-400">Ready to discover your next vibe?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card 
            className="glassmorphism p-6 rounded-2xl cursor-pointer hover:scale-105 transition-all border-0 bg-transparent"
            onClick={() => setLocation("/discover")}
          >
            <div className="text-center">
              <i className="fas fa-heart text-4xl text-vibe-pink mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Discover</h3>
              <p className="text-gray-400 text-sm">Find new vibes and connections</p>
            </div>
          </Card>

          <Card 
            className="glassmorphism p-6 rounded-2xl cursor-pointer hover:scale-105 transition-all border-0 bg-transparent"
            onClick={() => setLocation("/messages")}
          >
            <div className="text-center">
              <i className="fas fa-comments text-4xl text-vibe-teal mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Messages</h3>
              <p className="text-gray-400 text-sm">Chat with your matches</p>
            </div>
          </Card>

          <Card 
            className="glassmorphism p-6 rounded-2xl cursor-pointer hover:scale-105 transition-all border-0 bg-transparent"
            onClick={() => setLocation("/vibeboard")}
          >
            <div className="text-center">
              <i className="fas fa-compass text-4xl text-vibe-purple mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">VibeBoard</h3>
              <p className="text-gray-400 text-sm">Explore the community</p>
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
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
      </div>
    </div>
  );
}
