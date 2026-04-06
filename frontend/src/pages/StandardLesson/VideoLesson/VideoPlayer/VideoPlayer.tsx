import './VideoPlayer.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import play_button from '../../../../assets/icons/video-controls/blue-play-icon.svg';
import refreshRight from '../../../../assets/icons/video-controls/blue-refresh-right.svg';
import refreshLeft from '../../../../assets/icons/video-controls/blue-refresh-left.svg';
import volumeOn from '../../../../assets/icons/video-controls/blue-volume-on.svg';
import volumeOff from '../../../../assets/icons/video-controls/blue-mute.svg';

type VideoPlayerProps = {
    src: string;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isPlaying: boolean;
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    onPlay: () => void | Promise<void>;
    onPause?: () => void;
    onEnded?: () => void;
    onTimeUpdate: () => void | Promise<void>;
    poster?: string;
};

function formatTime(seconds: number) {
    if (!Number.isFinite(seconds)) return '00:00';

    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);

    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function VideoPlayer({
    src,
    videoRef,
    isPlaying,
    setIsPlaying,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    poster,
}: VideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [duration, setDuration] = useState(0);
    const [localCurrentTime, setLocalCurrentTime] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const hideTimeoutRef = useRef<number | null>(null);

    const progress = useMemo(() => {
        if (!duration) return 0;
        return (localCurrentTime / duration) * 100;
        }, [localCurrentTime, duration]);

        const handleLoadedMetadata = () => {
        const video = videoRef.current;
        if (!video) return;

        setDuration(video.duration || 0);
        setLocalCurrentTime(video.currentTime || 0);
        setVolume(video.volume ?? 1);
        setIsMuted(video.muted ?? false);
    };

    const progressRef = useRef<HTMLInputElement | null>(null);

    const handleInternalTimeUpdate = async () => {
        const video = videoRef.current;
        if (!video) return;

        setLocalCurrentTime(video.currentTime);
        await onTimeUpdate();
    };

    const togglePlayPause = async () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            await onPlay();
        } else {
            video.pause();
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
      
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      
        hideTimeoutRef.current = setTimeout(() => {
          if (isFullscreen && isPlaying) {
            setShowControls(false);
          }
        }, 2000);
      };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const nextTime = Number(e.target.value);
        video.currentTime = nextTime;
        setLocalCurrentTime(nextTime);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const nextVolume = Number(e.target.value);
        video.volume = nextVolume;
        video.muted = nextVolume === 0;

        setVolume(nextVolume);
        setIsMuted(video.muted);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = !video.muted;
            setIsMuted(video.muted);
        };

        const skip = (seconds: number) => {
        const video = videoRef.current;
        if (!video) return;

        const nextTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration || 0);
        video.currentTime = nextTime;
        setLocalCurrentTime(nextTime);
    };

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await containerRef.current?.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error('Fullscreen failed:', err);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

  return (
    <div className="custom-video-player" ref={containerRef} onMouseMove={handleMouseMove}>
 
        <div className="custom-video-shell" onClick={togglePlayPause}>
        <video
            ref={videoRef}
            src={src}
            poster={poster}
            preload="metadata"
            controls={false}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => {
            setIsPlaying(false);
            onPause?.();
            }}
            onEnded={() => {
            setIsPlaying(false);
            onEnded?.();
            }}
            onTimeUpdate={handleInternalTimeUpdate}
        />

        {!isPlaying && (
            <button
                type="button"
                className="custom-video-overlay-play"
                onClick={(e) => {
                    e.stopPropagation();
                    togglePlayPause();
                }}
                aria-label="Play video"
            >
                <img src={play_button}/>
            </button>
        )}
        </div>
 
    <div className={`custom-video-controls ${isFullscreen && !showControls ? "hidden" : "visible"}`}>
    
        <input
            ref={progressRef}
            className="custom-video-progress"
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={localCurrentTime}
            onChange={handleSeek}
            aria-label="Seek video"
            style={{ '--progress': `${((localCurrentTime / (duration || 1)) * 100).toFixed(2)}%` } as React.CSSProperties}
        />
 
        <div className="custom-video-controls-row">
 
            <div className="custom-video-controls-left">
 
                <button
                    type="button"
                    className={isPlaying ? 'is-playing' : ''}
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                {isPlaying ? 'Pause' : 'Play'}
                </button>
 
                <button
                    type="button"
                    onClick={() => skip(-10)}
                    aria-label="Skip back 10 seconds"
                >
                    <img src={refreshLeft} />
                    -10s
                </button>
 
                <button
                    type="button"
                    onClick={() => skip(10)}
                    aria-label="Skip forward 10 seconds"
                >   
                    <img src={refreshRight} />
                    +10s
                </button>
 
                <button
                    type="button"
                    className={isMuted ? 'is-muted' : ''}
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                >   
                    <img src={isMuted ? volumeOff : volumeOn} />
                    {isMuted ? 'Unmute' : 'Mute'}
                </button>
 
                {/* Volume slider */}
                <input
                    className="custom-video-volume"
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="Volume"
                    style={{ '--vol': `${((isMuted ? 0 : volume) * 100).toFixed(0)}%` } as React.CSSProperties}
                />
 
            </div>
 
            <div className="custom-video-controls-right">
 
                <span className="custom-video-time">
                    <span className="current-time">{formatTime(localCurrentTime)}</span>
                        {' / '}
                        {formatTime(duration)}
                    </span>
 
                    <button
                        type="button"
                        className={isFullscreen ? 'is-fullscreen' : ''}
                        onClick={toggleFullscreen}
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    >
                        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    </button>
 
            </div>
        </div>
    </div>
</div>
  );
}