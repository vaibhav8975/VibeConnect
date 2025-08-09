import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-vibe-pink via-vibe-purple to-vibe-teal opacity-90"></div>
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-vibe-pink rounded-full opacity-20 animate-bounce-subtle"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-vibe-teal rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-12 h-12 bg-vibe-purple rounded-full opacity-25 animate-bounce-subtle"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-6xl font-bold gradient-text mb-4">VibeConnect</h1>
          <p className="text-xl text-gray-200 font-light">Find Your Vibe, Not Just a Face</p>
        </div>

        {/* Features Preview */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <Card className="glassmorphism p-6 rounded-2xl text-center border-0 bg-transparent">
            <i className="fas fa-music text-3xl text-vibe-pink mb-3"></i>
            <h3 className="text-lg font-semibold mb-2">Music Vibes</h3>
            <p className="text-sm text-gray-300">Connect through shared music taste</p>
          </Card>
          <Card className="glassmorphism p-6 rounded-2xl text-center border-0 bg-transparent">
            <i className="fas fa-heart text-3xl text-vibe-teal mb-3"></i>
            <h3 className="text-lg font-semibold mb-2">Real Connections</h3>
            <p className="text-sm text-gray-300">Personality-based matching</p>
          </Card>
          <Card className="glassmorphism p-6 rounded-2xl text-center border-0 bg-transparent">
            <i className="fas fa-video text-3xl text-vibe-purple mb-3"></i>
            <h3 className="text-lg font-semibold mb-2">Video Calls</h3>
            <p className="text-sm text-gray-300">Face-to-face conversations</p>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 w-full max-w-md">
          <Button 
            className="w-full bg-gradient-to-r from-vibe-pink to-vibe-purple text-white font-semibold py-4 px-8 rounded-full neon-glow transition-all duration-300 hover:scale-105"
            onClick={() => setLocation("/login")}
          >
            Start Your Journey
          </Button>
          <Button 
            variant="outline"
            className="w-full border-2 border-white text-white font-semibold py-4 px-8 rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300"
            onClick={() => setLocation("/discover")}
          >
            Try Without Signup
          </Button>
          <p className="text-center text-gray-300 text-sm">
            Already have an account? 
            <button 
              className="text-vibe-teal hover:underline ml-1"
              onClick={() => setLocation("/signup")}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
