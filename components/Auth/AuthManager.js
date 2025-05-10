'use client';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectShowAuthMenu, setUserId, setAccountData } from '../../redux/MainSlice';
import AuthMenu from './AuthMenu';
import supabase from '../../app/supabase/client';

export default function AuthManager() {
  const showAuthMenu = useSelector(selectShowAuthMenu);
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // User is signed in
        console.log('Auth state changed: User signed in', session.user.id);
        dispatch(setUserId(session.user.id));
        
        // Fetch user data from the users table
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user data:', error);
          } else if (userData) {
            console.log('User data fetched:', userData);
            
            // Create account data object from user data
            // Use the exact field names from the database
            const accountData = {
              name: userData.name || '',
              preferred_name: userData.preferred_name || '',
              email: userData.email || '',
              phone: userData.phone || ''
            };
            
            // Set account data in Redux
            dispatch(setAccountData(accountData));
          } else {
            console.log('No user data found in users table');
            
            // Set empty object in Redux if no data is found
            dispatch(setAccountData({}));
          }
        } catch (error) {
          console.error('Error in user data fetch:', error);
        }
      } else {
        // User is signed out
        console.log('Auth state changed: User signed out');
        dispatch(setUserId(null));
        dispatch(setAccountData(null));
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