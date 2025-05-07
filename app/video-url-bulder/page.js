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
  const [baseUrl, setBaseUrl] = useState('');

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
          passcode: extractedPasscode
        });
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
    e.preventDefault();
    
    if (!formData.meetingId) {
      alert('Meeting ID is required');
      return;
    }
    
    // Remove spaces from inputs
    const meetingIdNoSpaces = formData.meetingId.replace(/\s+/g, '');
    const passcodeNoSpaces = formData.passcode ? formData.passcode.replace(/\s+/g, '') : '';
    const secondaryPasswordNoSpaces = formData.secondaryPassword ? formData.secondaryPassword.replace(/\s+/g, '') : '';
    
    let url = `${baseUrl}?meetingId=${meetingIdNoSpaces}`;
    
    if (passcodeNoSpaces) {
      url += `&passcode=${passcodeNoSpaces}`;
    }
    
    if (secondaryPasswordNoSpaces) {
      url += `&secondaryPassword=${secondaryPasswordNoSpaces}`;
    }
    
    if (formData.userName) {
      url += `&userName=${encodeURIComponent(formData.userName)}`;
    }
    
    setGeneratedUrl(url);
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
    <div className="url-builder-container pt-20 pb-16">
      <h1>Video Meeting URL Builder</h1>
      <p className="description">
        Create a shareable link for your video meeting. Fill in the details below and generate a URL that participants can use to join.
      </p>

      {/* Zoom URL extraction section removed as requested */}

      <div className="builder-content">
        <div className="form-section">
          <form onSubmit={generateUrl}>
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
                {/* Random generation button commented out
                <button 
                  type="button" 
                  className="generate-button"
                  onClick={generateRandomMeetingId}
                  title="Generate Random ID"
                >
                  Random
                </button>
                */}
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
                  placeholder="Enter Passcode (optional)"
                />
                {/* Random generation button commented out
                <button 
                  type="button" 
                  className="generate-button"
                  onClick={generateRandomPasscode}
                  title="Generate Random Passcode"
                >
                  Random
                </button>
                */}
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
                placeholder="Enter Secondary Password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="userName">Default User Name</label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                placeholder="Enter default user name (optional)"
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

            <button type="submit" className="generate-url-button">
              Generate URL
            </button>
          </form>
        </div>

        {generatedUrl && (
          <div className="result-section">
            <h2>Your Meeting URL</h2>
            <div className="url-display">
              <input
                type="text"
                value={generatedUrl}
                readOnly
                onClick={(e) => e.target.select()}
              />
              <button 
                onClick={copyToClipboard} 
                className="copy-button"
                title="Copy to Clipboard"
              >
                {copySuccess || 'Copy'}
              </button>
            </div>

            <div className="action-buttons">
              <button onClick={openMeeting} className="join-button">
                Join Meeting
              </button>
            </div>

            <div className="info-box">
              <h3>How to use:</h3>
              <ol>
                <li>Share this URL with meeting participants</li>
                <li>Participants can click the link to join the meeting</li>
                <li>No additional software is required - the meeting opens in the browser</li>
              </ol>
            </div>
          </div>
        )}
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