'use client';

import { useState, useEffect, Suspense } from 'react';
import './videoUrlBuilder.css';

// Component that handles all the URL building functionality
function UrlBuilderContent() {
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

  // Set the base URL on client-side only
  useEffect(() => {
    setBaseUrl(`${window.location.origin}/video-chat`);
  }, []);

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
      return;
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