import { supabase } from '@/integrations/supabase/client';

export const checkIfVideosExist = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error checking if videos exist:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking if videos exist:', error);
    return false;
  }
};

export const getVideoCount = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting video count:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error getting video count:', error);
    return 0;
  }
};
