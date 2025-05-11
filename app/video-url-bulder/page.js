'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '../utils/supabase/client';
import './videoUrlBuilder.css';

// Component that handles all the URL building functionality
function UrlBuilderContent() {
  const auth_id = useSelector((state) => state.main.auth_id);
  const userData = useSelector((state) => state.main.userData || {});

  const [formData, setFormData] = useState({
    meetingId: '',
    passcode: '',
    secondaryPassword: '',
    userName: '',
    notes: ''
  });
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [zoomUrl, setZoomUrl] = useState('');
  const [zoomInviteText, setZoomInviteText] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [showManualInputs, setShowManualInputs] = useState(false);

  // User selection states
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyMyClients, setOnlyMyClients] = useState(true);
  const [hideStaff, setHideStaff] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);

  // Set the base URL on client-side only
  useEffect(() => {
    setBaseUrl(`${window.location.origin}/video-chat`);
  }, []);

  // Search for users when search parameters change
  useEffect(() => {
    if (!auth_id) return;

    const searchUsers = async () => {
      setUserLoading(true);

      try {
        let query = supabase.from('users').select('*');

        // Apply search term if provided
        if (searchTerm) {
          query = query.or(
            `name.ilike.%${searchTerm}%,` +
            `preferred_name.ilike.%${searchTerm}%,` +
            `email.ilike.%${searchTerm}%,` +
            `phone.ilike.%${searchTerm}%`
          );
        }

        // Filter out current user
        query = query.neq('auth_id', auth_id);

        const { data, error } = await query;

        if (error) throw error;

        // Apply client-side filters
        let filteredUsers = data || [];

        // Filter for only my clients if selected
        if (onlyMyClients) {
          // Make sure userData.clients exists and is an array
          const myClients = Array.isArray(userData.clients) ? userData.clients : [];

          // Only show clients whose auth_id is in the user's clients array
          filteredUsers = filteredUsers.filter(user =>
            user && user.auth_id && myClients.includes(user.auth_id)
          );
        }

        // Hide staff users if selected
        if (hideStaff) {
          filteredUsers = filteredUsers.filter(user =>
            user.type !== 'staff'
          );
        }

        setUsers(filteredUsers);
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setUserLoading(false);
      }
    };

    searchUsers();
  }, [auth_id, searchTerm, onlyMyClients, hideStaff, userData.clients]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle Zoom URL input
  const handleZoomUrlInput = (e) => {
    setZoomUrl(e.target.value);
  };

  // Handle Zoom invite text input
  const handleZoomInviteInput = (e) => {
    setZoomInviteText(e.target.value);
  };

  // Parse Zoom invite text
  const parseZoomInvite = () => {
    if (!zoomInviteText) {
      alert('Please enter a Zoom meeting invite text');
      return;
    }

    try {
      // Extract meeting ID using regex
      const meetingIdMatch = zoomInviteText.match(/Meeting ID:\s*(\d+\s*\d+\s*\d+)/i);
      const extractedMeetingId = meetingIdMatch ? meetingIdMatch[1].replace(/\s+/g, '') : '';

      // Extract passcode using regex
      const passcodeMatch = zoomInviteText.match(/Passcode:\s*([\w\d]+)/i);
      const extractedPasscode = passcodeMatch ? passcodeMatch[1].trim() : '';

      // Extract URL to get secondary password
      const urlMatch = zoomInviteText.match(/https?:\/\/[^\s]+/i);
      let extractedSecondaryPassword = '';

      if (urlMatch) {
        const urlString = urlMatch[0];
        try {
          const url = new URL(urlString);
          const pwdParam = url.searchParams.get('pwd');
          if (pwdParam) {
            extractedSecondaryPassword = pwdParam;
          }
        } catch (urlError) {
          console.error('Error parsing URL from invite:', urlError);
        }
      }

      // Update form data with extracted information
      if (extractedMeetingId) {
        const updatedFormData = {
          ...formData,
          meetingId: extractedMeetingId,
          passcode: extractedPasscode,
          secondaryPassword: extractedSecondaryPassword
        };

        setFormData(updatedFormData);

        // Show manual inputs for verification/editing
        setShowManualInputs(true);

        // Automatically generate URL
        generateUrlFromData(updatedFormData);
      } else {
        alert('Could not extract meeting ID from the invite text');
      }
    } catch (error) {
      alert('Error parsing the invite text');
      console.error('Error parsing invite text:', error);
    }
  };

  // Helper function to generate URL from data
  const generateUrlFromData = (data) => {
    if (!data.meetingId) {
      alert('Meeting ID is required');
      return null;
    }

    // Remove spaces from inputs
    const meetingIdNoSpaces = data.meetingId.replace(/\s+/g, '');
    const passcodeNoSpaces = data.passcode ? data.passcode.replace(/\s+/g, '') : '';
    const secondaryPasswordNoSpaces = data.secondaryPassword ? data.secondaryPassword.replace(/\s+/g, '') : '';

    let url = `${baseUrl}?meetingId=${meetingIdNoSpaces}`;

    if (passcodeNoSpaces) {
      url += `&passcode=${passcodeNoSpaces}`;
    }

    if (secondaryPasswordNoSpaces) {
      url += `&secondaryPassword=${secondaryPasswordNoSpaces}`;
    }

    if (data.userName) {
      url += `&userName=${encodeURIComponent(data.userName)}`;
    }

    setGeneratedUrl(url);
    return url;
  };

  // Extract meeting info from Zoom URL
  const extractZoomInfo = () => {
    if (!zoomUrl) {
      alert('Please enter a Zoom URL');
      return;
    }

    try {
      // Parse the URL
      const url = new URL(zoomUrl);

      // Extract meeting ID from path
      // Format could be /j/MEETING_ID or /wc/MEETING_ID
      const pathParts = url.pathname.split('/');
      let extractedMeetingId = '';

      // Find the meeting ID in the path
      for (let i = 0; i < pathParts.length; i++) {
        if ((pathParts[i] === 'j' || pathParts[i] === 'wc') && i + 1 < pathParts.length) {
          extractedMeetingId = pathParts[i + 1];
          break;
        }
      }

      // Extract passcode from query parameters
      const searchParams = new URLSearchParams(url.search);
      let extractedPasscode = searchParams.get('pwd') || '';

      // Update form data with extracted information
      if (extractedMeetingId) {
        setFormData({
          ...formData,
          meetingId: extractedMeetingId,
          passcode: extractedPasscode,
          secondaryPassword: extractedPasscode // Also set as secondary password
        });

        // Show manual inputs for verification/editing
        setShowManualInputs(true);
      } else {
        alert('Could not extract meeting ID from the URL');
      }
    } catch (error) {
      alert('Invalid URL format');
      console.error('Error parsing URL:', error);
    }
  };

  // Generate URL from form data
  const generateUrl = (e) => {
    if (e) e.preventDefault();

    if (!formData.meetingId) {
      alert('Meeting ID is required');
      return;
    }

    // Use the helper function to generate the URL
    generateUrlFromData(formData);
  };

  // Handle selecting a user
  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  // Generate URL and create session with selected user
  const generateUrlAndCreateSession = async () => {
    if (!selectedUser || !auth_id) {
      alert('Please select a user first');
      return;
    }

    if (!formData.meetingId) {
      alert('Meeting ID is required');
      return;
    }

    // Generate the URL first
    const url = generateUrlFromData(formData);
    if (!url) return;

    try {
      // Get current date and time
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS

      // Create session object
      const newSession = {
        client_auth_id: selectedUser.auth_id,
        additional_clients: [],
        staff_auth_id: auth_id,
        additional_staff: [],
        note: formData.notes || '',
        date: dateStr,
        start_time: timeStr,
        meeting_url: url
      };

      // Insert into sessions table
      const { data, error } = await supabase
        .from('sessions')
        .insert([newSession])
        .select();

      if (error) {
        console.error('Error creating session:', error);
        alert(`Failed to create session: ${error.message}`);
        return;
      }

      console.log('Session created successfully:', data[0]);
      setSessionCreated(true);

      // Reset after 5 seconds
      setTimeout(() => {
        setSessionCreated(false);
      }, 5000);

    } catch (error) {
      console.error('Failed to create session:', error);
      alert(`An error occurred while creating the session: ${error.message || 'Unknown error'}`);
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl)
      .then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setCopySuccess('Failed to copy');
      });
  };

  // Open the generated URL
  const openMeeting = () => {
    if (generatedUrl) {
      window.open(generatedUrl, '_blank');
    }
  };

  // Generate a random meeting ID
  const generateRandomMeetingId = () => {
    // Generate a random 9-digit meeting ID
    const newMeetingId = Math.floor(100000000 + Math.random() * 900000000).toString();
    setFormData({
      ...formData,
      meetingId: newMeetingId
    });
  };

  // Generate a random passcode
  const generateRandomPasscode = () => {
    // Generate a random 6-character passcode
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let newPasscode = '';
    for (let i = 0; i < 6; i++) {
      newPasscode += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    setFormData({
      ...formData,
      passcode: newPasscode
    });
  };

  return (
    <div className="url-builder-container pt-24 pb-16" style={{paddingTop: "80px"}}>
      <h1>Video Meeting URL Builder</h1>
      <p className="description">
        Create a shareable link for your video meeting. Fill in the details below and generate a URL that participants can use to join.
      </p>

      <div className="builder-content">
        <div className="form-section">
          {/* Generated URL Section - Shown at the top when URL is generated */}
          {generatedUrl && (
            <div className="result-section mb-6 border rounded-lg overflow-hidden">
              <div className="p-4 bg-green-50">
                <h2 className="text-xl font-semibold mb-3">Your Meeting URL</h2>
                <input
                  type="text"
                  value={generatedUrl}
                  readOnly
                  onClick={(e) => e.target.select()}
                  className="w-full p-3 border rounded-md bg-white"
                />
              </div>

              <div className="p-4 bg-green-50 border-t border-green-200">
                <div className="flex justify-between">
                  <button
                    onClick={openMeeting}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md transition-colors"
                  >
                    Join Meeting
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md transition-colors"
                  >
                    {copySuccess || 'Copy to Clipboard'}
                  </button>
                </div>
              </div>

              {/* How to use section inside the URL box */}
              <div className="p-4 bg-blue-50 border-t">
                <h3 className="text-lg font-semibold mb-2">How to use:</h3>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Share this URL with meeting participants</li>
                  <li>Participants can click the link to join the meeting</li>
                  <li>No additional software is required - the meeting opens in the browser</li>
                </ol>
              </div>
            </div>
          )}

          {/* Zoom Invite Text Input */}
          <div className="zoom-invite-section mb-6 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Paste Zoom Meeting Invite</h2>
            <div className="form-group">
              <textarea
                id="zoomInviteText"
                value={zoomInviteText}
                onChange={handleZoomInviteInput}
                placeholder="Paste your Zoom meeting invite text here (e.g. 'Abe Apple is inviting you to a scheduled Zoom meeting...')"
                className="w-full p-3 border rounded-md min-h-[120px]"
              />
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={parseZoomInvite}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                Parse Invite
              </button>
            </div>
          </div>

          {/* User Selection Section */}
          <div className="user-selection-section mb-6 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Select User for Session</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select a user to start a session with. This will generate the URL and create a session record.
            </p>

            {/* Search and Filter Controls */}
            <div className="mb-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label htmlFor="userSearch" className="block text-sm font-medium text-gray-700 mb-1">
                    Search Users
                  </label>
                  <input
                    type="text"
                    id="userSearch"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, or phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="myClientsOnly"
                      checked={onlyMyClients}
                      onChange={(e) => setOnlyMyClients(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="myClientsOnly" className="ml-2 text-sm text-gray-700">
                      Only My Clients
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hideStaffUsers"
                      checked={hideStaff}
                      onChange={(e) => setHideStaff(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="hideStaffUsers" className="ml-2 text-sm text-gray-700">
                      Hide Staff Users
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* User Results */}
            <div className="bg-gray-50 p-4 rounded-md mb-4 max-h-[300px] overflow-y-auto">
              {userLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users found matching your criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {users.map((user) => (
                    <div
                      key={user.auth_id}
                      onClick={() => handleSelectUser(user)}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${selectedUser?.auth_id === user.auth_id ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white border hover:bg-gray-50'}`}
                    >
                      <h4 className="font-semibold truncate">
                        {user.preferred_name || user.name || 'Unnamed User'}
                      </h4>
                      {user.email && (
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      )}
                      {user.type && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                          {user.type}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected User Info */}
            {selectedUser && (
              <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-200">
                <h3 className="font-semibold">Selected User:</h3>
                <p>{selectedUser.preferred_name || selectedUser.name}</p>
                {selectedUser.email && <p className="text-sm">{selectedUser.email}</p>}
              </div>
            )}

            {/* Generate URL and Start Session Button */}
            <button
              onClick={generateUrlAndCreateSession}
              disabled={!selectedUser || !formData.meetingId}
              className={`w-full py-3 px-4 rounded-md transition-colors ${!selectedUser || !formData.meetingId ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >
              Generate URL & Start Session with User
            </button>

            {/* Session Created Success Message */}
            {sessionCreated && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md border border-green-300">
                <p className="font-semibold">Session started successfully!</p>
                <p className="text-sm">A new session has been created with {selectedUser?.preferred_name || selectedUser?.name}.</p>
              </div>
            )}
          </div>

          {/* Collapsible Manual Inputs Section */}
          <div className="manual-inputs-section mb-6 border rounded-lg overflow-hidden">
            <div
              className="bg-gray-100 px-4 py-3 flex justify-between items-center cursor-pointer"
              onClick={() => setShowManualInputs(!showManualInputs)}
            >
              <h2 className="text-xl font-semibold">Manual Meeting Settings</h2>
              <span className="text-gray-500">
                {showManualInputs ? '▼' : '►'}
              </span>
            </div>
            
            {showManualInputs && (
              <div className="p-4">
                <div className="form-group">
                  <label htmlFor="meetingId">Meeting ID*</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="meetingId"
                      name="meetingId"
                      value={formData.meetingId}
                      onChange={handleInputChange}
                      placeholder="Enter Meeting ID"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="passcode">Passcode</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      id="passcode"
                      name="passcode"
                      value={formData.passcode}
                      onChange={handleInputChange}
                      placeholder="Enter Passcode"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="secondaryPassword">Secondary Password</label>
                  <input
                    type="text"
                    id="secondaryPassword"
                    name="secondaryPassword"
                    value={formData.secondaryPassword}
                    onChange={handleInputChange}
                    placeholder="Enter Secondary Password (optional)"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="userName">User Name</label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="Enter User Name (optional)"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes or information about this meeting"
                    className="notes-textarea"
                  ></textarea>
                </div>
                
                {/* Generate URL Button inside manual settings */}
                <div className="form-group mt-4">
                  <button 
                    type="button" 
                    onClick={generateUrl}
                    className="generate-url-button w-full"
                  >
                    Generate URL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component
function UrlBuilderLoading() {
  return (
    <div className="url-builder-container pt-20 pb-16 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="mt-2">Loading URL builder...</p>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function VideoUrlBuilder() {
  return (
    <Suspense fallback={<UrlBuilderLoading />}>
      <UrlBuilderContent />
    </Suspense>
  );
}