-- Add foreign key constraints to link tables properly
ALTER TABLE public.likes 
ADD CONSTRAINT likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.likes 
ADD CONSTRAINT likes_video_id_fkey 
FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;

ALTER TABLE public.comments 
ADD CONSTRAINT comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.comments 
ADD CONSTRAINT comments_video_id_fkey 
FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;

ALTER TABLE public.shares 
ADD CONSTRAINT shares_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.shares 
ADD CONSTRAINT shares_video_id_fkey 
FOREIGN KEY (video_id) REFERENCES public.videos(id) ON DELETE CASCADE;