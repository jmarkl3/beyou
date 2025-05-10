'use client';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthId, openAuthMenu } from '../../redux/MainSlice';
import { useRouter } from 'next/navigation';
import InputSupabase from '../../components/database/InputSupabase';
import InputSupabase2 from '@/components/database/InputSupabase2';

// Account input fields configuration
const accountInputFields = [
  { key: 'name', label: 'Name', type: 'input' },
  { key: 'preferred_name', label: 'Preferred Name', type: 'input' },
  { key: 'email', label: 'Email', type: 'input' },
  { key: 'phone', label: 'Phone', type: 'input' },
  { key: 'note', label: 'Note', type: 'textarea', rows: 4 }
];

export default function AccountPage() {
  const auth_id = useSelector((state) => state.main.auth_id);
  const userData = useSelector((state) => state.main.userData || {});
  const dispatch = useDispatch();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  
  // Log user data from Redux
  const logUserData = () => {
    console.log('User data from Redux:', userData);
  };

  // No longer redirecting automatically if not logged in
  // Instead, we'll show a message box with options

  const handleLogout = () => {
    dispatch(setAuthId(null));
    router.push('/');
  };


  // Log input changes (optional)
  const handleInputChange = (value, field) => {
    console.log(`Field ${field} changed to: ${value}`);
  };

  const handleOpenAuthMenu = () => {
    dispatch(openAuthMenu());
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (!auth_id) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Not Signed In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to access your account.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={handleOpenAuthMenu}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md transition-colors"
            >
              Sign In
            </button>
            
            <button 
              onClick={handleGoHome}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-md transition-colors"
            >
              Go to Home Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Account Information</h2>
          <button 
            onClick={()=>setIsEditing(!isEditing)} 
            className="text-blue-500 hover:text-blue-700 font-bold"
            aria-label={isEditing ? "Cancel editing" : "Edit account information"}
          >
            {isEditing ? "✕" : "✎"}
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600">User ID:</p>
          <p className="font-medium">{auth_id}</p>
        </div>
        

        
        {accountInputFields.map((field) => (
          <div className="mb-4" key={field.key}>
            <p className="text-gray-600">{field.label}:</p>
            {isEditing ? (
              <InputSupabase2
                table="users"
                attribute={field.key}
                identifier={auth_id}
                identifierName="auth_id"
                initialValue={userData[field.key] || ''}
                placeholder={`Enter your ${field.label.toLowerCase()}`}
                onChange={(value) => handleInputChange(value, field.key)}
                className="border-gray-300"
                isTextarea={field.type === 'textarea'}
                rows={field.rows || 3}
              />
            ) : (
              field.type === 'textarea' ? (
                <div className="whitespace-pre-wrap font-medium border p-2 rounded-md bg-gray-50">
                  {userData[field.key] || 'No notes added yet.'}
                </div>
              ) : (
                <p className="font-medium">{userData[field.key] || ''}</p>
              )
            )}
          </div>
        ))}
        
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Log Out
          </button>
          
          <button 
            onClick={logUserData}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Log User Data
          </button>
        </div>
      </div>
    </div>
  );
}