import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface VideoInteractionProps {
  videoId: string;
  onLikeUpdate: (liked: boolean, count: number) => void;
  onCommentCountUpdate: (count: number) => void;
  onShareCountUpdate: (count: number) => void;
}

export function useVideoInteractions({ 
  videoId, 
  onLikeUpdate, 
  onCommentCountUpdate, 
  onShareCountUpdate 
}: VideoInteractionProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (videoId) {
      fetchInteractionCounts();
      if (user) {
        checkUserLike();
      }
    }
  }, [videoId, user]);

  const fetchInteractionCounts = async () => {
    try {
      const [likesResult, commentsResult, sharesResult] = await Promise.all([
        supabase.from('likes').select('*').eq('video_id', videoId),
        supabase.from('comments').select('*').eq('video_id', videoId),
        supabase.from('shares').select('*').eq('video_id', videoId)
      ]);

      const likes = likesResult.data?.length || 0;
      const comments = commentsResult.data?.length || 0;
      const shares = sharesResult.data?.length || 0;

      setLikeCount(likes);
      setCommentCount(comments);
      setShareCount(shares);

      onCommentCountUpdate(comments);
      onShareCountUpdate(shares);
    } catch (error) {
      console.error('Error fetching interaction counts:', error);
    }
  };

  const checkUserLike = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('video_id', videoId)
        .eq('user_id', user.id)
        .single();

      setIsLiked(!!data);
    } catch (error) {
      // Not an error if no like exists
      setIsLiked(false);
    }
  };

  const toggleLike = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', user.id);

        if (!error) {
          setIsLiked(false);
          const newCount = Math.max(0, likeCount - 1);
          setLikeCount(newCount);
          onLikeUpdate(false, newCount);
        }
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            video_id: videoId,
            user_id: user.id
          });

        if (!error) {
          setIsLiked(true);
          const newCount = likeCount + 1;
          setLikeCount(newCount);
          onLikeUpdate(true, newCount);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isLiked,
    likeCount,
    commentCount,
    shareCount,
    toggleLike,
    loading,
    updateCommentCount: (count: number) => {
      setCommentCount(count);
      onCommentCountUpdate(count);
    },
    updateShareCount: (count: number) => {
      setShareCount(count);
      onShareCountUpdate(count);
    }
  };
}