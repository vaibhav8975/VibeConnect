interface AudioVisualizerProps {
  isPlaying: boolean;
  className?: string;
}

export default function AudioVisualizer({ isPlaying, className = "" }: AudioVisualizerProps) {
  return (
    <div className={`audio-visualizer ${className}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={`audio-bar ${isPlaying ? '' : 'opacity-50'}`}
          style={{
            animationPlayState: isPlaying ? 'running' : 'paused',
            height: isPlaying ? undefined : '4px'
          }}
        />
      ))}
    </div>
  );
}
