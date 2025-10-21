import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Video, X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  videoUrl?: string;
  video?: any;
}

export default function VideoModal({ 
  isOpen, 
  onClose, 
  title,
  videoUrl,
  video
}: VideoModalProps) {
  // Extract video URL and title from video object if provided
  const finalVideoUrl = video?.url || videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ";
  const finalTitle = video?.title || title || "Health Education Video";
  
  // Convert YouTube URL to embed format if needed
  const getEmbedUrl = (url: string) => {
    if (url.includes('embed')) return url;
    if (url.includes('youtu.be')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtube.com/shorts')) {
      const videoId = url.split('shorts/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full max-h-[95vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            {finalTitle}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>
        
        {/* Increased height from aspect-video to fixed height */}
        <div className="w-full" style={{ height: '600px' }}>
          <iframe
            src={getEmbedUrl(finalVideoUrl)}
            title={finalTitle}
            className="w-full h-full rounded-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        
        {/* Video Details */}
        {video && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {video.duration && (
                <div>
                  <span className="font-semibold">Duration:</span> {video.duration}
                </div>
              )}
              {video.difficulty && (
                <div>
                  <span className="font-semibold">Level:</span> {video.difficulty}
                </div>
              )}
              {video.instructor && (
                <div>
                  <span className="font-semibold">Instructor:</span> {video.instructor}
                </div>
              )}
              {video.calories && (
                <div>
                  <span className="font-semibold">Calories:</span> {video.calories}
                </div>
              )}
            </div>
            {video.description && (
              <p className="mt-3 text-gray-700">{video.description}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}