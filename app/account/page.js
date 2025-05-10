'use client';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUserId, selectAccountData, setAccountData } from '../../redux/MainSlice';
import { useRouter } from 'next/navigation';
import supabase from '../supabase/client';
import SupabaseInput from '../../components/SupabaseInput';

export default function AccountPage() {
  const userId = useSelector(selectUserId);
  const accountData = useSelector(selectAccountData);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  
  // Define the account fields to display with database field names
  const accountFields = [
    { id: 'name', label: 'Name', type: 'text' },
    { id: 'preferred_name', label: 'Preferred Name', type: 'text' },
    { id: 'email', label: 'Email', type: 'email' },
    { id: 'phone', label: 'Phone', type: 'tel' }
  ];

  // No redirect on page load, just show a message if not logged in

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // The AuthManager will detect the sign-out and update Redux
      // No redirect, just stay on the page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const handleOpenAuthMenu = () => {
    // This function will be implemented in a future update to open the auth menu
    // For now, we'll redirect to home where the auth menu can be opened
    router.push('/');
  };

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-8 text-center max-w-md w-full border border-white">
          <h1 className="text-2xl font-bold mb-4">Not Signed In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your account information.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleOpenAuthMenu}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push('/')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-md transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  
  
  // Function to update Supabase auth data when email, phone, or name changes
  const handleAuthUpdate = async (fieldName, newValue) => {
    try {
      console.log(`Updating auth ${fieldName} to ${newValue}`);
      
      if (fieldName === 'email') {
        // Update email in Supabase auth
        const { data, error } = await supabase.auth.updateUser({
          email: newValue
        });
        
        if (error) {
          console.error('Error updating auth email:', error);
          return;
        }
        
        console.log('Auth email updated successfully');
      } 
      else if (fieldName === 'phone') {
        // Update phone in Supabase auth
        const { data, error } = await supabase.auth.updateUser({
          phone: newValue
        });
        
        if (error) {
          console.error('Error updating auth phone:', error);
          return;
        }
        
        console.log('Auth phone updated successfully');
      } 
      else if (fieldName === 'name') {
        // Update display name in Supabase auth
        const { data, error } = await supabase.auth.updateUser({
          data: { display_name: newValue }
        });
        
        if (error) {
          console.error('Error updating auth display name:', error);
          return;
        }
        
        console.log('Auth display name updated successfully');
      }
    } catch (error) {
      console.error('Error in handleAuthUpdate:', error);
    }
  };
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
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
      
      <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6 border border-white relative hover:bg-opacity-95 transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Account Information</h2>
          <button 
            onClick={handleEditToggle} 
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title={isEditing ? "Done" : "Edit"}
          >
            {isEditing ? (
              <div title="Done">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div title="Edit">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            )}
          </button>
        </div>
        
        {accountData && accountFields.map((field) => (
          <div className="mb-4" key={field.id}>
            <p className="text-gray-600">{field.label}:</p>
            {isEditing ? (
              <SupabaseInput
                tableName="users"
                fieldName={field.id}
                rowId={userId}
                rowIdField="auth_id"
                value={accountData[field.id] || ''}
                type={field.type}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                debounceTime={500}
                debug={true}
                onUpdate={(fieldName, newValue) => {
                  console.log('Field updated:', fieldName, newValue);
                  
                  // Update Redux store with the new value
                  dispatch(setAccountData({
                    ...accountData,
                    [fieldName]: newValue
                  }));
                  
                  // Call handleAuthUpdate for auth-related fields
                  if (['email', 'phone', 'name'].includes(fieldName)) {
                    handleAuthUpdate(fieldName, newValue);
                  }
                }}
              />
            ) : (
              <p className="font-medium">{accountData[field.id]}</p>
            )}
          </div>
        ))}
      </div>
      
      <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6 border border-white hover:bg-opacity-95 transition-all">
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