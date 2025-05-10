'use client';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthId, setUserData } from '../../redux/MainSlice';
import { supabase } from '../../app/utils/supabase/client';
import AuthMenu from './AuthMenu';

export default function AuthManager() {
  const showAuthMenu = useSelector((state) => state.main.showAuthMenu);
  const dispatch = useDispatch();

  // Function to load user data from the users table
  const loadUserData = async (auth_id) => {
    if(!auth_id) {
      console.log('No auth_id provided, setting empty user data');
      dispatch(setUserData({}));
      return;
    }
    
    console.log('Loading user data for auth_id:', auth_id);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', auth_id)
        .single();
      
      if (error) {
        console.error('Error loading user data:', error.message);
        dispatch(setUserData({}));
        return;
      }
      
      console.log('User data result:', data);
      
      if (data) {
        console.log('User data loaded successfully');
        dispatch(setUserData(data));
      } else {
        console.log('No user data found, setting empty object');
        dispatch(setUserData({}));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      dispatch(setUserData({}));
    }
  };

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed event:', event);
      console.log('Auth state changed session:', session);
      
      // User signed in or updated, update Redux state with user ID
      console.log('User signed in:', session?.user?.id);
      const auth_id = session?.user?.id
      dispatch(setAuthId(auth_id));

      loadUserData(auth_id)

    });
    
    // Check current session on mount
    const checkCurrentSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Current session found:', session.user.id);
        dispatch(setAuthId(session.user.id));
      }
    };
    
    checkCurrentSession();
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return (
    <>
      {showAuthMenu && <AuthMenu />}
    </>
  );
}