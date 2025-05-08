'use client';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUserId, setUserId } from '../../redux/MainSlice';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const userId = useSelector(selectUserId);
  const dispatch = useDispatch();
  const router = useRouter();

  // Redirect to home if not logged in
  useEffect(() => {
    if (!userId) {
      router.push('/');
    }
  }, [userId, router]);

  const handleLogout = () => {
    dispatch(setUserId(null));
    router.push('/');
  };

  if (!userId) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="mb-4">
          <p className="text-gray-600">User ID:</p>
          <p className="font-medium">{userId}</p>
        </div>
        <div className="mb-4">
          <p className="text-gray-600">Email:</p>
          <p className="font-medium">user@example.com</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}