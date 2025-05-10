'use client';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUserId, setUserId, selectAccountData, updateAccountField } from '../../redux/MainSlice';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../app/firebase/firebase-config';

export default function AccountPage() {
  const userId = useSelector(selectUserId);
  const accountData = useSelector(selectAccountData);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  
  // Define the account fields to display
  const accountFields = [
    { id: 'name', label: 'Name', type: 'text' },
    { id: 'preferredName', label: 'Preferred Name', type: 'text' },
    { id: 'email', label: 'Email', type: 'email' },
    { id: 'phone', label: 'Phone', type: 'tel' }
  ];

  // Redirect to home if not logged in
  useEffect(() => {
    if (!userId) {
      router.push('/');
    }
  }, [userId, router]);

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      // The AuthManager will detect the sign-out and update Redux
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!userId) {
    return null; // Don't render anything while redirecting
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    dispatch(updateAccountField({ field, value }));
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-white">My Account</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-opacity-95 transition-all aspect-square border border-white">
          <div className="mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold">Journaling</h3>
        </div>
        
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-opacity-95 transition-all aspect-square border border-white">
          <div className="mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold">Join Session</h3>
        </div>
      </div>
      
      <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6 border border-white relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Account Information</h2>
          <button 
            onClick={handleEditToggle} 
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isEditing ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            )}
          </button>
        </div>
        
        {accountData && accountFields.map((field) => (
          <div className="mb-4" key={field.id}>
            <p className="text-gray-600">{field.label}:</p>
            {isEditing ? (
              <input
                type={field.type}
                value={accountData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="font-medium">{accountData[field.id]}</p>
            )}
          </div>
        ))}
      </div>
      
      <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6 border border-white">
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