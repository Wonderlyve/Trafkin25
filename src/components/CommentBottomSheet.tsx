import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, User } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
}

interface CommentBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  comments: Comment[];
  onAddComment: (postId: string, content: string) => Promise<void>;
}

export default function CommentBottomSheet({ 
  open, 
  onOpenChange, 
  postId,
  comments,
  onAddComment
}: CommentBottomSheetProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, profile } = useAuth();

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting || !user) return;

    setIsSubmitting(true);
    try {
      await onAddComment(postId, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'maintenant';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}j`;
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[75vh] flex flex-col">
        <DrawerHeader className="border-b border-border">
          <DrawerTitle className="text-left">
            Commentaires ({comments.length})
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Comments List */}
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              {comments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <User className="mx-auto mb-3 h-12 w-12 opacity-50" />
                  <p>Aucun commentaire pour le moment</p>
                  <p className="text-sm">Soyez le premier à commenter !</p>
                </div>
              ) : (
                comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-3"
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {comment.user_avatar}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="bg-muted/50 rounded-2xl px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.user_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Comment Input */}
          {user ? (
            <div className="border-t border-border p-4 bg-background">
              <div className="flex gap-3 items-end">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                <div className="flex-1 flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Écrivez un commentaire..."
                    className="flex-1 rounded-2xl border-muted"
                    disabled={isSubmitting}
                  />
                  
                  <Button
                    onClick={handleSubmit}
                    disabled={!newComment.trim() || isSubmitting}
                    size="icon"
                    className="rounded-full h-10 w-10 flex-shrink-0"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-t border-border p-4 bg-muted/20 text-center">
              <p className="text-sm text-muted-foreground">
                Connectez-vous pour commenter
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}