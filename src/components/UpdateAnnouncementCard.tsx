import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { UpdateAnnouncement } from '@/hooks/useUpdateAnnouncements';

interface UpdateAnnouncementCardProps {
  announcement: UpdateAnnouncement;
}

export const UpdateAnnouncementCard: React.FC<UpdateAnnouncementCardProps> = ({ announcement }) => {
  const handleUpdateClick = () => {
    window.open(announcement.update_link, '_blank');
  };

  return (
    <Card className="w-full bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg text-primary">
          {announcement.title}
        </CardTitle>
        <CardDescription className="text-sm">
          {announcement.description}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button
          onClick={handleUpdateClick}
          className="w-full"
          variant="default"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Mettre à jour
        </Button>
      </CardFooter>
    </Card>
  );
};