'use client';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectShowAuthMenu, setUserId } from '../../redux/MainSlice';
import AuthMenu from './AuthMenu';
import supabase from '../../app/supabase/client';

export default function AuthManager() {
  const showAuthMenu = useSelector(selectShowAuthMenu);
  const dispatch = useDispatch();

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // User is signed in
        console.log('Auth state changed: User signed in', session.user.id);
        dispatch(setUserId(session.user.id));
      } else {
        // User is signed out
        console.log('Auth state changed: User signed out');
        dispatch(setUserId(null));
      }
    });

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