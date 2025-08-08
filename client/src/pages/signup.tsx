import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    interests: [] as string[],
    musicGenres: [] as string[],
  });

  const interestOptions = ["Dating", "Friendship", "Music Partners", "Creative Collabs"];
  const musicGenres = ["Pop", "Rock", "Hip-Hop", "Electronic", "Jazz", "Indie"];

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }));
  };

  const handleMusicGenreClick = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      musicGenres: prev.musicGenres.includes(genre)
        ? prev.musicGenres.filter(g => g !== genre)
        : [...prev.musicGenres, genre]
    }));
  };

  const handleContinue = () => {
    // In a real app, this would save the data
    setLocation("/personality-quiz");
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 text-white">
      <div className="max-w-md mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <button 
            className="absolute top-6 left-6 text-gray-400 hover:text-white"
            onClick={() => setLocation("/")}
          >
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h2 className="text-3xl font-bold gradient-text mb-2">Join VibeConnect</h2>
          <p className="text-gray-400">Create your profile and find your vibe</p>
        </div>

        {/* Profile Setup */}
        <div className="space-y-6">
          {/* Photo Upload */}
          <div className="text-center">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-vibe-pink to-vibe-purple rounded-full flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition-all">
              <i className="fas fa-camera text-3xl text-white"></i>
            </div>
            <p className="text-sm text-gray-400">Upload your best photo</p>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <Input 
              type="text" 
              placeholder="Your name" 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-800 text-white p-4 rounded-xl border border-gray-700 focus:border-vibe-pink"
            />
            <Input 
              type="email" 
              placeholder="Email address" 
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-gray-800 text-white p-4 rounded-xl border border-gray-700 focus:border-vibe-pink"
            />
            <Input 
              type="number" 
              placeholder="Age" 
              min="18" 
              max="100" 
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              className="w-full bg-gray-800 text-white p-4 rounded-xl border border-gray-700 focus:border-vibe-pink"
            />
          </div>

          {/* Interests */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-vibe-teal">What are you looking for?</h3>
            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map(interest => (
                <label key={interest} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox 
                    checked={formData.interests.includes(interest)}
                    onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                    className="text-vibe-pink focus:ring-vibe-pink"
                  />
                  <span className="text-sm">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Music Preference */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-vibe-purple">Your Music Vibe</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {musicGenres.map(genre => (
                <button 
                  key={genre}
                  onClick={() => handleMusicGenreClick(genre)}
                  className={`py-2 px-4 rounded-lg transition-colors ${
                    formData.musicGenres.includes(genre)
                      ? 'bg-vibe-pink text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-vibe-pink hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <Button 
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-vibe-pink to-vibe-purple text-white font-semibold py-4 px-8 rounded-full neon-glow transition-all duration-300 hover:scale-105"
            disabled={!formData.name || !formData.email || !formData.age}
          >
            Continue to Personality Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}
