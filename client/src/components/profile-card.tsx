import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AudioPlayer from "@/components/audio-player";
import AudioVisualizer from "@/components/audio-visualizer";
import { type User } from "@shared/schema";

interface ProfileCardProps {
  profile: User;
  onLike: () => void;
  onPass: () => void;
  onSuperLike: () => void;
}

export default function ProfileCard({ profile, onLike, onPass, onSuperLike }: ProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Mock photos for demo - in real app these would come from profile.photos
  const mockPhotos = [
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000"
  ];

  const calculateMatchPercentage = () => {
    // Simple mock calculation based on shared interests
    const sharedInterests = profile.interests?.length || 0;
    const musicMatch = profile.musicGenres?.length || 0;
    return Math.min(95, 60 + sharedInterests * 5 + musicMatch * 3);
  };

  const getPersonalityTraits = () => {
    // Mock personality traits based on user data
    const traits = [];
    if (profile.musicGenres?.includes("Pop")) traits.push({ name: "Outgoing", color: "vibe-pink" });
    if (profile.musicGenres?.includes("Jazz")) traits.push({ name: "Creative", color: "vibe-teal" });
    if (profile.interests?.includes("Dating")) traits.push({ name: "Adventurous", color: "vibe-purple" });
    if (profile.lookingFor?.includes("Friendship")) traits.push({ name: "Genuine", color: "vibe-blue" });
    
    // Fill with default traits if needed
    while (traits.length < 4) {
      const defaultTraits = [
        { name: "Friendly", color: "vibe-pink" },
        { name: "Musical", color: "vibe-teal" },
        { name: "Fun", color: "vibe-purple" },
        { name: "Kind", color: "vibe-blue" }
      ];
      const randomTrait = defaultTraits[Math.floor(Math.random() * defaultTraits.length)];
      if (!traits.find(t => t.name === randomTrait.name)) {
        traits.push(randomTrait);
      }
    }
    
    return traits.slice(0, 4);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % mockPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + mockPhotos.length) % mockPhotos.length);
  };

  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
  };

  const matchPercentage = calculateMatchPercentage();
  const personalityTraits = getPersonalityTraits();

  return (
    <div className="relative mb-6">
      {/* Card Stack Effect */}
      <div className="absolute -z-10 top-2 left-2 right-2 bottom-2 bg-gray-800 rounded-2xl opacity-30"></div>
      <div className="absolute -z-20 top-4 left-4 right-4 bottom-4 bg-gray-700 rounded-2xl opacity-20"></div>
      
      {/* Main Card */}
      <Card className="glassmorphism rounded-2xl overflow-hidden card-swipe border-0 bg-transparent">
        {/* Profile Images */}
        <div className="relative h-96">
          <img 
            src={profile.profileImageUrl || mockPhotos[currentPhotoIndex]}
            alt="Profile photo" 
            className="w-full h-full object-cover"
          />
          
          {/* Photo Navigation */}
          <button 
            onClick={prevPhoto}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all"
          >
            <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <button 
            onClick={nextPhoto}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all"
          >
            <i className="fas fa-chevron-right text-sm"></i>
          </button>
          
          {/* Music Player Overlay */}
          <div className="absolute bottom-4 left-4 right-4 glassmorphism rounded-xl p-3">
            <div className="flex items-center space-x-3">
              <button 
                onClick={toggleAudio}
                className="w-10 h-10 bg-vibe-pink rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
              >
                <i className={`fas ${isAudioPlaying ? 'fa-pause' : 'fa-play'} text-sm`}></i>
              </button>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Blinding Lights</p>
                <p className="text-gray-300 text-xs">The Weeknd</p>
              </div>
              <AudioVisualizer isPlaying={isAudioPlaying} />
            </div>
          </div>

          {/* Photo Counter */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
            {currentPhotoIndex + 1} / {mockPhotos.length}
          </div>
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-2xl font-bold text-white">
              {profile.firstName || "User"}, {profile.age || "??"}
            </h3>
            <div className="bg-vibe-teal bg-opacity-20 text-vibe-teal px-3 py-1 rounded-full text-sm">
              {matchPercentage}% Match
            </div>
          </div>
          
          <p className="text-gray-300 text-sm mb-4">
            {profile.bio || "Music lover, coffee enthusiast, and adventure seeker. Let's discover new songs together! 🎵✨"}
          </p>
          
          {/* Interests Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.musicGenres?.slice(0, 3).map((genre, index) => (
              <span key={genre} className={`bg-vibe-${index % 2 === 0 ? 'pink' : 'purple'} bg-opacity-20 text-vibe-${index % 2 === 0 ? 'pink' : 'purple'} px-3 py-1 rounded-full text-xs`}>
                {genre}
              </span>
            ))}
            {profile.lookingFor?.slice(0, 2).map((interest, index) => (
              <span key={interest} className="bg-vibe-teal bg-opacity-20 text-vibe-teal px-3 py-1 rounded-full text-xs">
                {interest}
              </span>
            ))}
          </div>

          {/* Personality Traits */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {personalityTraits.map((trait, index) => (
              <div key={trait.name} className="flex items-center space-x-2">
                <div className={`w-2 h-2 bg-${trait.color} rounded-full`}></div>
                <span className="text-gray-300">{trait.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-6 mt-6">
        <Button
          onClick={onPass}
          className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400 hover:bg-opacity-20 transition-all hover:scale-110 border-0"
        >
          <i className="fas fa-times text-xl"></i>
        </Button>
        <Button
          onClick={onLike}
          className="w-20 h-20 bg-gradient-to-r from-vibe-pink to-vibe-purple rounded-full flex items-center justify-center text-white neon-glow hover:scale-110 transition-all border-0"
        >
          <i className="fas fa-heart text-2xl"></i>
        </Button>
        <Button
          onClick={onSuperLike}
          className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-vibe-teal hover:bg-vibe-teal hover:bg-opacity-20 transition-all hover:scale-110 border-0"
        >
          <i className="fas fa-star text-xl"></i>
        </Button>
      </div>
    </div>
  );
}
