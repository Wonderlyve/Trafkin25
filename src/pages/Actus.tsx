import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Heart, 
  MessageCircle,
  MoreHorizontal,
  Clock,
  MapPin,
  AlertTriangle,
  Car,
  Users,
  Droplets,
  Construction,
  Volume2,
  Loader2,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import CreatePostModal from '@/components/CreatePostModal';
import EditPostModal from '@/components/EditPostModal';
import CommentBottomSheet from '@/components/CommentBottomSheet';
import AuthModal from '@/components/AuthModal';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';


const getTypeIcon = (type: string) => {
  switch (type) {
    case 'traffic': return Car;
    case 'incident': return AlertTriangle;
    case 'event': return Users;
    case 'flood': return Droplets;
    case 'construction': return Construction;
    case 'noise': return Volume2;
    case 'native_ads': return ExternalLink;
    default: return MapPin;
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'traffic': return { label: 'Embouteillage', color: 'bg-orange-500' };
    case 'incident': return { label: 'Accident', color: 'bg-red-500' };
    case 'event': return { label: 'Événement', color: 'bg-purple-500' };
    case 'flood': return { label: 'Inondation', color: 'bg-blue-500' };
    case 'construction': return { label: 'Travaux', color: 'bg-yellow-500' };
    case 'noise': return { label: 'Nuisance sonore', color: 'bg-gray-500' };
    case 'native_ads': return { label: 'Sponsorisé', color: 'bg-gradient-to-r from-yellow-400 to-orange-500' };
    default: return { label: 'Info', color: 'bg-green-500' };
  }
};

export default function Actus() {
  const { posts, likedPosts, comments, loading, toggleLike, formatTimeAgo, createPost, updatePost, deletePost, fetchComments, addComment } = usePosts();
  const { user, profile, isAuthenticated } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [commentSheetPostId, setCommentSheetPostId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [dismissedPoliceAlerts, setDismissedPoliceAlerts] = useState<Set<string>>(() => {
    // Charger les alertes dismissées depuis localStorage
    try {
      const saved = localStorage.getItem('dismissedPoliceAlerts');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Reset scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCreatePostClick = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handlePostCreated = async (newPostData: any) => {
    const result = await createPost(newPostData);
    // Fermer la modal et reset le formulaire seulement si la création a réussi
    if (result && result.data && !result.error) {
      setIsCreateModalOpen(false);
      // Le CreatePostModal va garder ses valeurs, on peut optionnellement les réinitialiser
      // en fermant et rouvrant le modal via un state reset dans le modal même
    }
  };

  const handlePostUpdated = async (postId: string, updates: any) => {
    await updatePost(postId, updates);
    setIsEditModalOpen(false);
    setEditingPost(null);
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
  };

  const handleOpenComments = async (postId: string) => {
    setCommentSheetPostId(postId);
    if (!comments[postId]) {
      await fetchComments(postId);
    }
  };

  const handleCloseComments = () => {
    setCommentSheetPostId(null);
  };

  const isOwner = (post: any) => {
    return user && post.user_id === user.id;
  };

  const isPoliceAlert = (post: any) => {
    // Vérifier si le post provient d'un utilisateur avec le rôle 'police'
    return post.user_role === 'police';
  };

  const handleDismissPoliceAlert = (postId: string) => {
    setDismissedPoliceAlerts(prev => {
      const newSet = new Set([...prev, postId]);
      // Optionnel: sauvegarder dans localStorage pour persistance
      localStorage.setItem('dismissedPoliceAlerts', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  // Séparer les posts entre alertes police non-dismissées et autres
  const policeAlerts = posts.filter(post => isPoliceAlert(post) && !dismissedPoliceAlerts.has(post.id));
  const regularPosts = posts.filter(post => !isPoliceAlert(post) || dismissedPoliceAlerts.has(post.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-primary text-primary-foreground px-4 py-6 shadow-floating"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold">Alertes Trafic</h1>
          <Button
            onClick={handleCreatePostClick}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-sm px-3 py-2 h-auto"
          >
            <Plus size={16} className="mr-2" />
            Publier une alerte
          </Button>
        </div>
      </motion.header>

      {/* Content */}
      <div className="pt-[124px] px-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Alertes Police prioritaires */}
            {policeAlerts.map((post, index) => {
              const TypeIcon = getTypeIcon(post.type);
              const typeBadge = getTypeBadge(post.type);
              const isLiked = likedPosts.has(post.id);

              return (
                <motion.div
                  key={`police-${post.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">ALERTE POLICE</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDismissPoliceAlert(post.id)}
                          className="ml-auto text-xs bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                        >
                          Compris
                        </Button>
                      </div>
                      
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                              {post.avatar}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{post.user_name}</span>
                              <div className={`w-2 h-2 rounded-full ${typeBadge.color}`} />
                              <Badge variant="secondary" className="text-xs">
                                {typeBadge.label}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock size={12} />
                              <span>{formatTimeAgo(post.created_at)}</span>
                              <span>•</span>
                              <MapPin size={12} />
                              <span>{post.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <p className="text-sm leading-relaxed text-foreground font-medium">
                          {post.content}
                        </p>
                        
                        {post.image_url && (
                          <div className="mt-3 rounded-lg overflow-hidden">
                            <img 
                              src={post.image_url} 
                              alt="Post image"
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        )}
                        
                        {post.video_url && (
                          <div className="mt-3 rounded-lg overflow-hidden">
                            <video 
                              src={post.video_url} 
                              className="w-full h-48 object-cover"
                              controls
                            />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-6">
                          <motion.button
                            onClick={() => toggleLike(post.id)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors"
                            whileTap={{ scale: 0.95 }}
                          >
                            <Heart 
                              size={18} 
                              className={isLiked ? 'fill-red-500 text-red-500' : ''} 
                            />
                            <span className="text-sm font-medium">
                              {post.likes}
                            </span>
                          </motion.button>
                          
                           <motion.button
                             onClick={() => handleOpenComments(post.id)}
                             className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors"
                             whileTap={{ scale: 0.95 }}
                           >
                             <MessageCircle size={18} />
                             <span className="text-sm font-medium">{post.comments}</span>
                           </motion.button>
                        </div>

                        <div className="flex items-center gap-1">
                          <TypeIcon size={16} className="text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            
            {/* Posts réguliers */}
            {regularPosts.map((post, index) => {
              const TypeIcon = getTypeIcon(post.type);
              const typeBadge = getTypeBadge(post.type);
              const isLiked = likedPosts.has(post.id);

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-card border-0 shadow-card">
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                              {post.avatar}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{post.user_name}</span>
                              <div className={`w-2 h-2 rounded-full ${typeBadge.color}`} />
                              <Badge variant="secondary" className="text-xs">
                                {typeBadge.label}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock size={12} />
                              <span>{formatTimeAgo(post.created_at)}</span>
                              <span>•</span>
                              <MapPin size={12} />
                              <span>{post.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        {isOwner(post) ? (
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal size={16} />
                              </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
                              <SheetHeader className="text-left">
                                <SheetTitle>Options du post</SheetTitle>
                              </SheetHeader>
                              <div className="flex flex-col gap-4 mt-6">
                                <Button 
                                  variant="outline" 
                                  onClick={() => handleEditPost(post)}
                                  className="flex items-center justify-start gap-3 h-14 text-base"
                                >
                                  <Edit size={20} />
                                  Modifier le post
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      className="flex items-center justify-start gap-3 h-14 text-base text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                    >
                                      <Trash2 size={20} />
                                      Supprimer le post
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir supprimer ce post ? Cette action est irréversible.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeletePost(post.id)}>
                                        Supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </SheetContent>
                          </Sheet>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal size={16} />
                          </Button>
                        )}
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <p className="text-sm leading-relaxed text-foreground">
                          {post.content}
                        </p>
                        
                        {post.image_url && (
                          <div className="mt-3 rounded-lg overflow-hidden">
                            <img 
                              src={post.image_url} 
                              alt="Post image"
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        )}
                        
                        {post.video_url && (
                          <div className="mt-3 rounded-lg overflow-hidden">
                            <video 
                              src={post.video_url} 
                              className="w-full h-48 object-cover"
                              controls
                            />
                          </div>
                         )}
                         
                         {/* Bouton pour Native ads */}
                         {post.is_sponsored && post.sponsor_url && (
                           <div className="mt-3">
                             <Button
                               onClick={() => window.open(post.sponsor_url, '_blank')}
                               className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                               size="sm"
                             >
                               <ExternalLink size={16} className="mr-2" />
                               Aller sur le site
                             </Button>
                           </div>
                         )}
                       </div>

                       {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div className="flex items-center gap-6">
                          <motion.button
                            onClick={() => toggleLike(post.id)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors"
                            whileTap={{ scale: 0.95 }}
                          >
                            <Heart 
                              size={18} 
                              className={isLiked ? 'fill-red-500 text-red-500' : ''} 
                            />
                            <span className="text-sm font-medium">
                              {post.likes}
                            </span>
                          </motion.button>
                          
                           <motion.button
                             onClick={() => handleOpenComments(post.id)}
                             className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors"
                             whileTap={{ scale: 0.95 }}
                           >
                             <MessageCircle size={18} />
                             <span className="text-sm font-medium">{post.comments}</span>
                           </motion.button>
                        </div>

                        <div className="flex items-center gap-1">
                          <TypeIcon size={16} className="text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Modal de création */}
      <CreatePostModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        onPostCreated={handlePostCreated}
      />

      {/* Modal d'édition */}
      <EditPostModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        post={editingPost}
        onPostUpdated={handlePostUpdated}
      />

      {/* Modal d'authentification */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        message="Vous devez vous connecter pour publier une alerte."
      />

      {/* Bottom Sheet des commentaires */}
      <CommentBottomSheet
        open={commentSheetPostId !== null}
        onOpenChange={handleCloseComments}
        postId={commentSheetPostId || ''}
        comments={commentSheetPostId ? comments[commentSheetPostId] || [] : []}
        onAddComment={addComment}
      />
    </div>
  );
}