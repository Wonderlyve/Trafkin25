import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

interface SocialVideoPlayerProps {
  videoUrl: string;
  username: string;
  userAvatar?: string;
  caption: string;
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export function SocialVideoPlayer({
  videoUrl,
  username,
  userAvatar,
  caption,
  likes = 0,
  comments = 0,
  isLiked = false,
  onLike,
  onComment,
  onShare
}: SocialVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto bg-card rounded-2xl overflow-hidden shadow-card border border-border">
      {/* Video Container */}
      <div 
        className="relative aspect-[9/16] overflow-hidden cursor-pointer"
        onClick={togglePlay}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
          preload="metadata"
        />
        
        {/* Video Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Play/Pause Button */}
        <motion.div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
          initial={{ scale: 0.8 }}
          animate={{ scale: showControls || !isPlaying ? 1 : 0.8 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-black/50"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
        </motion.div>

        {/* Sound Control */}
        <motion.div
          className={`absolute top-4 right-4 transition-opacity duration-200 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-black/50"
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </motion.div>

        {/* User Info Overlay */}
        <div className="absolute bottom-4 left-4 right-16 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-8 h-8 border-2 border-white/20">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">{username}</span>
          </div>
          <p className="text-sm leading-relaxed line-clamp-3 text-white/90">
            {caption}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-3">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-black/50"
              onClick={(e) => {
                e.stopPropagation();
                onLike?.();
              }}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            {likes > 0 && (
              <p className="text-xs text-center text-white/80 mt-1">{likes}</p>
            )}
          </motion.div>

          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-black/50"
              onClick={(e) => {
                e.stopPropagation();
                onComment?.();
              }}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            {comments > 0 && (
              <p className="text-xs text-center text-white/80 mt-1">{comments}</p>
            )}
          </motion.div>

          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-black/50"
              onClick={(e) => {
                e.stopPropagation();
                onShare?.();
              }}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}