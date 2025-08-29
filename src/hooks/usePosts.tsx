import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  user_name: string;
  avatar: string;
  location: string;
  type: string;
  content: string;
  image_url?: string;
  video_url?: string;
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  user_id?: string;
  user_role?: string;
  is_sponsored?: boolean;
  sponsor_url?: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
}

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Récupérer les rôles des utilisateurs pour les posts
      const userIds = [...new Set((data || []).map(post => post.user_id).filter(Boolean))];
      let profiles: any[] = [];
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, role')
          .in('user_id', userIds);
        profiles = profilesData || [];
      }

      // Récupérer les compteurs exacts depuis la base de données
      const postsWithExactCounts = await Promise.all((data || []).map(async (post) => {
        const userProfile = profiles.find(p => p.user_id === post.user_id);
        
        // Compter les likes réels
        const { count: likesCount } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        // Compter les commentaires réels
        const { count: commentsCount } = await supabase
          .from('post_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        return {
          ...post,
          user_role: userProfile?.role || 'user',
          likes: likesCount || 0,
          comments: commentsCount || 0
        };
      }));
      
      setPosts(postsWithExactCounts);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les actualités",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's liked posts
  const fetchLikedPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const likedPostIds = new Set(data?.map(like => like.post_id) || []);
      setLikedPosts(likedPostIds);
    } catch (error: any) {
      // Silent error for likes as it's not critical
    }
  };

  // Create new post
  const createPost = async (postData: {
    user_name: string;
    avatar: string;
    location: string;
    type: string;
    content: string;
    image_url?: string;
    video_url?: string;
    is_sponsored?: boolean;
    sponsor_url?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour créer un post",
          variant: "destructive"
        });
        return { data: null, error: "No authentication" };
      }

      console.log('Creating post with user ID:', user.id);
      console.log('Post data:', postData);
      
      const insertData = {
        user_name: postData.user_name,
        avatar: postData.avatar,
        location: postData.location,
        type: postData.type,
        content: postData.content,
        user_id: user.id, // S'assurer que user_id est défini
        ...(postData.image_url && { image_url: postData.image_url }),
        ...(postData.video_url && { video_url: postData.video_url }),
        ...(postData.is_sponsored && { is_sponsored: postData.is_sponsored }),
        ...(postData.sponsor_url && { sponsor_url: postData.sponsor_url })
      };

      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('posts')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        let errorMessage = "Impossible de créer le post";
        
        if (error.message.includes('row-level security')) {
          errorMessage = "Accès refusé. Vérifiez vos permissions.";
        } else if (error.message.includes('not-null')) {
          errorMessage = "Certains champs obligatoires sont manquants.";
        }
        
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive"
        });
        return { data: null, error };
      }

      if (data) {
        setPosts(prev => [data, ...prev]);
        toast({
          title: "Post créé !",
          description: "Votre actualité a été publiée avec succès"
        });
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Create post error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le post",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  // Update post
  const updatePost = async (postId: string, updates: {
    content?: string;
    location?: string;
    type?: string;
    image_url?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour modifier un post",
          variant: "destructive"
        });
        return { data: null, error: "No user" };
      }

      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPosts(prev => prev.map(post => 
          post.id === postId ? { ...post, ...data } : post
        ));
        toast({
          title: "Post mis à jour !",
          description: "Votre actualité a été modifiée avec succès"
        });
      }

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le post",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  // Delete post
  const deletePost = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour supprimer un post",
          variant: "destructive"
        });
        return { error: "No user" };
      }

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      setPosts(prev => prev.filter(post => post.id !== postId));
      toast({
        title: "Post supprimé !",
        description: "Votre actualité a été supprimée avec succès"
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le post",
        variant: "destructive"
      });
      return { error };
    }
  };

  // Toggle like on post
  const toggleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour aimer un post",
          variant: "destructive"
        });
        return;
      }

      const isLiked = likedPosts.has(postId);

      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });

        // Update post likes count
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes: Math.max(0, post.likes - 1) }
            : post
        ));
      } else {
        // Add like
        const { error } = await supabase
          .from('post_likes')
          .insert([{
            post_id: postId,
            user_id: user.id
          }]);

        if (error) throw error;

        setLikedPosts(prev => new Set([...prev, postId]));

        // Update post likes count
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes: post.likes + 1 }
            : post
        ));
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le like",
        variant: "destructive"
      });
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('post_comments' as any)
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const commentsData = (data as unknown as Comment[]) || [];
      setComments(prev => ({
        ...prev,
        [postId]: commentsData
      }));
      
      // Mettre à jour le compteur de commentaires dans les posts
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments: commentsData.length }
          : post
      ));
      
      return commentsData;
    } catch (error: any) {
      console.error('Erreur lors du chargement des commentaires:', error);
      return [];
    }
  };

  // Add comment to post
  const addComment = async (postId: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour commenter",
          variant: "destructive"
        });
        return;
      }

      // Get user profile for display info
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      const userName = profile?.full_name || user.email?.split('@')[0] || 'Utilisateur';
      const userAvatar = userName[0]?.toUpperCase() || 'U';

      const { data, error } = await supabase
        .from('post_comments' as any)
        .insert([{
          post_id: postId,
          user_id: user.id,
          user_name: userName,
          user_avatar: userAvatar,
          content: content
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Update local comments state
        const newComment = data as unknown as Comment;
        const updatedComments = [...(comments[postId] || []), newComment];
        setComments(prev => ({
          ...prev,
          [postId]: updatedComments
        }));

        // Update post comments count with exact number
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, comments: updatedComments.length }
            : post
        ));

        toast({
          title: "Commentaire ajouté !",
          description: "Votre commentaire a été publié"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le commentaire",
        variant: "destructive"
      });
    }
  };

  // Format time ago
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

  useEffect(() => {
    fetchPosts();
    fetchLikedPosts();

    // Set up real-time subscription for new posts
    const channel = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        async (payload) => {
          if (payload.new) {
            // Récupérer le rôle de l'utilisateur pour le nouveau post
            let userRole = 'user';
            if (payload.new.user_id) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('role')
                .eq('user_id', payload.new.user_id)
                .single();
              userRole = profileData?.role || 'user';
            }
            
            const newPost = {
              ...payload.new as Post,
              user_role: userRole
            };
            setPosts(prev => [newPost, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        async (payload) => {
          if (payload.new) {
            // Récupérer le rôle de l'utilisateur pour le post mis à jour
            let userRole = 'user';
            if (payload.new.user_id) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('role')
                .eq('user_id', payload.new.user_id)
                .single();
              userRole = profileData?.role || 'user';
            }
            
            const updatedPost = {
              ...payload.new as Post,
              user_role: userRole
            };
            setPosts(prev => prev.map(post => 
              post.id === payload.new.id ? updatedPost : post
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    posts,
    likedPosts,
    comments,
    loading,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    fetchComments,
    addComment,
    formatTimeAgo,
    refreshPosts: fetchPosts
  };
}