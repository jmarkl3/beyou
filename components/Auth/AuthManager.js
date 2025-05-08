'use client';
import { useSelector } from 'react-redux';
import { selectShowAuthMenu } from '../../redux/MainSlice';
import AuthMenu from './AuthMenu';

export default function AuthManager() {
  const showAuthMenu = useSelector(selectShowAuthMenu);

  return (
    <>
      {showAuthMenu && <AuthMenu />}
    </>
  );
}