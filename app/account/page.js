'use client';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setAuthId, openAuthMenu, setUserData } from '../../redux/MainSlice';
import { useRouter } from 'next/navigation';
import InputSupabase from '../../components/database/InputSupabase';
import InputSupabase2 from '@/components/database/InputSupabase2';
import { supabase } from '../utils/supabase/client';

// Account input fields configuration
const accountInputFields = [
  { key: 'name', label: 'Name', type: 'input' },
  { key: 'preferred_name', label: 'Preferred Name', type: 'input' },
  { key: 'email', label: 'Email', type: 'input' },
  { key: 'phone', label: 'Phone', type: 'input' },
  { key: 'type', label: 'Account Type', type: 'input', readonly: true, adminOnly: true },
  { key: 'note', label: 'Note', type: 'textarea', rows: 4, adminOnly: true }
];

export default function AccountPage() {
  const auth_id = useSelector((state) => state.main.auth_id);
  const userData = useSelector((state) => state.main.userData || {});
  const dispatch = useDispatch();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  
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


  // Update Redux when database update succeeds and sync auth data if needed
  const handleUpdateCallback = async (value, updatedData) => {
    if (!updatedData) return;
    
    console.log('Updating Redux with new data:', updatedData);
    // Update the Redux store with the new data
    dispatch(setUserData({ ...userData, ...updatedData }));
    
    // If email or phone was updated, also update the auth profile
    if (updatedData.email !== undefined || updatedData.phone !== undefined) {
      try {
        const updateData = {};
        
        if (updatedData.email !== undefined) {
          updateData.email = updatedData.email;
        }
        
        if (updatedData.phone !== undefined) {
          updateData.phone = updatedData.phone;
        }
        
        // Only proceed if we have data to update
        if (Object.keys(updateData).length > 0) {
          const { data, error } = await supabase.auth.updateUser(updateData);
          
          if (error) {
            console.error('Error updating auth profile:', error);
            setUpdateError(`Failed to update profile: ${error.message}`);
          } else {
            console.log('Auth profile updated successfully:', data);
            setUpdateError('');
          }
        }
      } catch (err) {
        console.error('Error in auth update:', err);
      }
    }
  };
  
  // Handle input changes (for any additional processing if needed)
  const handleInputChange = (value) => {
    // This function can be used for immediate UI feedback or validation
    // Currently not needed but kept for potential future use
  };

  const handleOpenAuthMenu = () => {
    dispatch(openAuthMenu());
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoToJournal = () => {
    router.push('/journal');
  };
  
  const handleJoinSession = () => {
    if (activeSession && activeSession.meeting_url) {
      window.open(activeSession.meeting_url, '_blank');
    }
  };

  // For debugging purposes
  useEffect(() => {
    console.log('Current user data:', userData);
  }, [userData]);
  
  // Check for active sessions
  useEffect(() => {
    if (!auth_id) return;
    
    const checkForActiveSessions = async () => {
      try {
        // Get current time
        const now = new Date();
        // Calculate time 1 hour ago
        const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
        
        // Format date for comparison
        const formattedOneHourAgo = oneHourAgo.toISOString();
        
        let query;
        
        if (userData.type === 'staff') {
          // For staff, check sessions where they are the staff
          query = supabase
            .from('sessions')
            .select('*')
            .eq('staff_auth_id', auth_id)
            .order('created_at', { ascending: false })
            .limit(1);
        } else {
          // For clients, check sessions where they are the client
          query = supabase
            .from('sessions')
            .select('*')
            .eq('client_auth_id', auth_id)
            .order('created_at', { ascending: false })
            .limit(1);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error checking for active sessions:', error);
          return;
        }
        
        if (data && data.length > 0) {
          const latestSession = data[0];
          const sessionCreatedAt = new Date(latestSession.created_at);
          
          // Check if session was created within the last hour
          if (sessionCreatedAt > oneHourAgo) {
            console.log('Active session found:', latestSession);
            setActiveSession(latestSession);
          } else {
            console.log('Latest session is not active (older than 1 hour)');
            setActiveSession(null);
          }
        } else {
          console.log('No sessions found');
          setActiveSession(null);
        }
      } catch (err) {
        console.error('Error in session check:', err);
      }
    };
    
    checkForActiveSessions();
    
    // Set up interval to check every minute
    const intervalId = setInterval(checkForActiveSessions, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [auth_id, userData.type]);

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
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div 
          onClick={handleGoToJournal}
          className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-opacity-95 transition-all aspect-square border border-white hover:shadow-xl">
          <div className="mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold">Journaling</h3>
        </div>
        
        <div 
          onClick={handleJoinSession}
          className={`bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-opacity-95 transition-all aspect-square border border-white ${activeSession ? 'hover:shadow-xl' : 'opacity-70'}`}
        >
          <div className="mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke={activeSession ? 'currentColor' : '#777777'}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className={`text-base font-semibold ${activeSession ? 'text-black' : 'text-gray-600'}`}>Join Session</h3>
          {activeSession ? (
            <span className="text-xs text-green-600 font-medium mt-1">(Active)</span>
          ) : (
            <span className="text-xs text-gray-500 mt-1">(Inactive)</span>
          )}
        </div>
        
        {userData.type === 'staff' && (
          <>
            <div 
              onClick={() => router.push('/video-url-bulder')}
              className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-opacity-95 transition-all aspect-square border border-white hover:shadow-xl">
              <div className="mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-base font-semibold">Meeting Link Builder</h3>
            </div>
            
            <div 
              onClick={() => router.push('/clients')}
              className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-opacity-95 transition-all aspect-square border border-white hover:shadow-xl">
              <div className="mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold">Clients</h3>
            </div>
          </>
        )}
      </div>
      
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
        
        {updateError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {updateError}
          </div>
        )}
        
        {accountInputFields.map((field) => {
          // Skip fields marked as adminOnly if user is not an admin or staff
          if (field.adminOnly && userData.type !== 'admin' && userData.type !== 'staff') {
            return null;
          }
          
          return (
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
                  updateCallback={handleUpdateCallback}
                  onChange={handleInputChange}
                  className="border-gray-300"
                  isTextarea={field.type === 'textarea'}
                  rows={field.rows || 3}
                  readOnly={field.readonly}
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
          );
        })}
        
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

          {/* For development only */}
          {/* <button 
            onClick={logUserData}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Log User Data
          </button> */}
        </div>
      </div>
    </div>
  );
}