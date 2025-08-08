import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import GlassmorphismCard from "@/components/glassmorphism-card";
import { type User, type UserPhoto, type UserMusicClip } from "@shared/schema";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: "",
    age: "",
    interests: [] as string[],
    musicGenres: [] as string[],
    lookingFor: [] as string[],
  });

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

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        bio: user.bio || "",
        age: user.age?.toString() || "",
        interests: user.interests || [],
        musicGenres: user.musicGenres || [],
        lookingFor: user.lookingFor || [],
      });
    }
  }, [user]);

  const { data: photos } = useQuery<UserPhoto[]>({
    queryKey: ["/api/profile/photos"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: musicClips } = useQuery<UserMusicClip[]>({
    queryKey: ["/api/profile/music"],
    enabled: isAuthenticated,
    retry: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setEditMode(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
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
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const interestOptions = ["Dating", "Friendship", "Music Partners", "Creative Collabs"];
  const musicGenres = ["Pop", "Rock", "Hip-Hop", "Electronic", "Jazz", "Indie", "Classical", "R&B", "Folk", "Alternative"];
  const lookingForOptions = ["Dating", "Friendship", "Music Partners", "Creative Collabs"];

  const handleSaveProfile = () => {
    const updateData = {
      ...profileData,
      age: profileData.age ? parseInt(profileData.age) : null,
      isProfileComplete: true,
    };
    updateProfileMutation.mutate(updateData);
  };

  const handleInterestToggle = (interest: string, type: 'interests' | 'musicGenres' | 'lookingFor') => {
    setProfileData(prev => ({
      ...prev,
      [type]: prev[type].includes(interest)
        ? prev[type].filter(item => item !== interest)
        : [...prev[type], interest]
    }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibe-pink mx-auto mb-4"></div>
          <p>Loading profile...</p>
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
            <h2 className="text-2xl font-bold gradient-text">Profile</h2>
          </div>
          <div className="flex items-center space-x-3">
            {editMode ? (
              <>
                <Button
                  onClick={() => setEditMode(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="bg-gradient-to-r from-vibe-pink to-vibe-purple"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setEditMode(true)}
                className="bg-gradient-to-r from-vibe-teal to-vibe-blue"
              >
                <i className="fas fa-edit mr-2"></i>
                Edit Profile
              </Button>
            )}
            <button 
              className="text-gray-400 hover:text-white"
              onClick={() => window.location.href = "/api/logout"}
            >
              <i className="fas fa-sign-out-alt text-xl"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Profile Header */}
        <GlassmorphismCard className="p-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img
                src={user?.profileImageUrl || `https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&size=120&background=random`}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-vibe-pink"
              />
              {editMode && (
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-vibe-pink rounded-full flex items-center justify-center text-white hover:scale-110 transition-all">
                  <i className="fas fa-camera text-sm"></i>
                </button>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-1">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-gray-400 mb-2">{user?.email}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-vibe-teal rounded-full"></div>
                  <span className="text-sm text-gray-300">Level {user?.vibeLevel || 1}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="fas fa-heart text-vibe-pink text-sm"></i>
                  <span className="text-sm text-gray-300">12 Matches</span>
                </div>
                {user?.isPremium && (
                  <div className="bg-gradient-to-r from-vibe-pink to-vibe-purple px-3 py-1 rounded-full text-xs font-semibold">
                    <i className="fas fa-crown mr-1"></i>
                    Premium
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassmorphismCard>

        {/* Basic Info */}
        <GlassmorphismCard className="p-6">
          <h4 className="text-xl font-semibold text-white mb-4">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 mb-2 block">Age</Label>
              {editMode ? (
                <Input
                  type="number"
                  min="18"
                  max="100"
                  value={profileData.age}
                  onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              ) : (
                <p className="text-white py-2">{user?.age || "Not specified"}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <Label className="text-gray-300 mb-2 block">Bio</Label>
              {editMode ? (
                <Textarea
                  placeholder="Tell people about yourself..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={3}
                />
              ) : (
                <p className="text-white py-2">{user?.bio || "No bio yet"}</p>
              )}
            </div>
          </div>
        </GlassmorphismCard>

        {/* What I'm Looking For */}
        <GlassmorphismCard className="p-6">
          <h4 className="text-xl font-semibold text-white mb-4">What I'm Looking For</h4>
          {editMode ? (
            <div className="grid grid-cols-2 gap-3">
              {lookingForOptions.map(option => (
                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={profileData.lookingFor.includes(option)}
                    onCheckedChange={(checked) => handleInterestToggle(option, 'lookingFor')}
                    className="border-vibe-pink data-[state=checked]:bg-vibe-pink"
                  />
                  <span className="text-white">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user?.lookingFor?.map(item => (
                <span key={item} className="bg-vibe-teal bg-opacity-20 text-vibe-teal px-3 py-1 rounded-full text-sm">
                  {item}
                </span>
              )) || <span className="text-gray-400">Not specified</span>}
            </div>
          )}
        </GlassmorphismCard>

        {/* Music Preferences */}
        <GlassmorphismCard className="p-6">
          <h4 className="text-xl font-semibold text-white mb-4">Music Preferences</h4>
          {editMode ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {musicGenres.map(genre => (
                <button
                  key={genre}
                  onClick={() => handleInterestToggle(genre, 'musicGenres')}
                  className={`py-2 px-4 rounded-lg text-sm transition-colors ${
                    profileData.musicGenres.includes(genre)
                      ? 'bg-vibe-purple text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-vibe-purple hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user?.musicGenres?.map(genre => (
                <span key={genre} className="bg-vibe-purple bg-opacity-20 text-vibe-purple px-3 py-1 rounded-full text-sm">
                  {genre}
                </span>
              )) || <span className="text-gray-400">No preferences set</span>}
            </div>
          )}
        </GlassmorphismCard>

        {/* Photos */}
        <GlassmorphismCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-white">Photos</h4>
            <Button
              size="sm"
              className="bg-gradient-to-r from-vibe-pink to-vibe-purple"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Photo
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos?.slice(0, 8).map((photo, index) => (
              <div key={photo.id} className="relative">
                <img
                  src={photo.photoUrl}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-xl"
                />
                {editMode && (
                  <button className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:scale-110 transition-all">
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 8 - (photos?.length || 0)) }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="w-full h-32 bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center cursor-pointer hover:border-vibe-pink transition-colors"
              >
                <i className="fas fa-plus text-gray-500 text-xl"></i>
              </div>
            ))}
          </div>
        </GlassmorphismCard>

        {/* Music Clips */}
        <GlassmorphismCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-semibold text-white">Music Clips</h4>
            <Button
              size="sm"
              className="bg-gradient-to-r from-vibe-teal to-vibe-blue"
            >
              <i className="fas fa-music mr-2"></i>
              Add Music
            </Button>
          </div>
          <div className="space-y-3">
            {musicClips?.map((clip) => (
              <div key={clip.id} className="bg-gray-800 rounded-xl p-4 flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-vibe-teal to-vibe-blue rounded-lg flex items-center justify-center">
                  <i className="fas fa-music text-white"></i>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{clip.title}</p>
                  <p className="text-gray-400 text-sm">{clip.artist}</p>
                </div>
                <button className="w-10 h-10 bg-vibe-teal rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                  <i className="fas fa-play text-sm"></i>
                </button>
                {editMode && (
                  <button className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all">
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                )}
              </div>
            )) || (
              <div className="text-center py-8">
                <i className="fas fa-music text-4xl text-gray-600 mb-2"></i>
                <p className="text-gray-400">No music clips added yet</p>
              </div>
            )}
          </div>
        </GlassmorphismCard>

        {/* Settings */}
        <GlassmorphismCard className="p-6">
          <h4 className="text-xl font-semibold text-white mb-4">Settings</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Show me on VibeBoard</Label>
                <p className="text-gray-400 text-sm">Allow others to see your posts</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Distance visibility</Label>
                <p className="text-gray-400 text-sm">Show distance in your profile</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Online status</Label>
                <p className="text-gray-400 text-sm">Show when you're online</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </GlassmorphismCard>

        {/* Danger Zone */}
        <GlassmorphismCard className="p-6 border border-red-500/20">
          <h4 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h4>
          <div className="space-y-3">
            <Button
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <i className="fas fa-user-slash mr-2"></i>
              Delete Account
            </Button>
          </div>
        </GlassmorphismCard>
      </div>
    </div>
  );
}
