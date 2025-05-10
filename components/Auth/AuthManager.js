'use client';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectShowAuthMenu, setUserId } from '../../redux/MainSlice';
import AuthMenu from './AuthMenu';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../app/firebase/firebase-config';

export default function AuthManager() {
  const showAuthMenu = useSelector(selectShowAuthMenu);
  const dispatch = useDispatch();

  useEffect(() => {
    // Set up auth state change listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        dispatch(setUserId(user.uid));
      } else {
        // User is signed out
        dispatch(setUserId(null));
      }
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <>
      {showAuthMenu && <AuthMenu />}
    </>
  );
}