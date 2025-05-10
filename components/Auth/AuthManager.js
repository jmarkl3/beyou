'use client';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthId } from '../../redux/MainSlice';
import { supabase } from '../../app/utils/supabase/client';
import AuthMenu from './AuthMenu';

export default function AuthManager() {
  const showAuthMenu = useSelector((state) => state.main.showAuthMenu);
  const dispatch = useDispatch();

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // User signed in or updated, update Redux state with user ID
        console.log('User signed in:', session?.user?.id);
        dispatch(setAuthId(session?.user?.id || null));
      } else if (event === 'SIGNED_OUT') {
        // User signed out, clear user ID in Redux
        console.log('User signed out');
        dispatch(setAuthId(null));
      }
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