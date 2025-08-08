import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import AudioVisualizer from "@/components/audio-visualizer";

interface AudioPlayerProps {
  title: string;
  artist: string;
  audioUrl?: string;
  className?: string;
  compact?: boolean;
}

export default function AudioPlayer({ 
  title, 
  artist, 
  audioUrl, 
  className = "",
  compact = false 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (values: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = values[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (values: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = values[0];
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <audio ref={audioRef} src={audioUrl} />
        <button 
          onClick={togglePlay}
          className="w-10 h-10 bg-vibe-pink rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
        >
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-sm`}></i>
        </button>
        <div className="flex-1">
          <p className="text-white text-sm font-medium truncate">{title}</p>
          <p className="text-gray-300 text-xs truncate">{artist}</p>
        </div>
        <AudioVisualizer isPlaying={isPlaying} />
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-xl p-4 ${className}`}>
      <audio ref={audioRef} src={audioUrl} />
      
      {/* Track Info */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-vibe-pink to-vibe-purple rounded-lg flex items-center justify-center">
          <i className="fas fa-music text-white"></i>
        </div>
        <div className="flex-1">
          <p className="text-white font-medium">{title}</p>
          <p className="text-gray-400 text-sm">{artist}</p>
        </div>
        <AudioVisualizer isPlaying={isPlaying} />
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            onClick={togglePlay}
            className="w-10 h-10 bg-vibe-pink rounded-full p-0 hover:scale-110 transition-transform"
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-sm`}></i>
          </Button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <i className="fas fa-redo text-sm"></i>
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <i className="fas fa-volume-down text-gray-400 text-sm"></i>
          <Slider
            value={[volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
          <i className="fas fa-volume-up text-gray-400 text-sm"></i>
        </div>
      </div>
    </div>
  );
}
