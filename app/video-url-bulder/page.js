'use client';

import { useState } from 'react';
import './videoUrlBuilder.css';

export default function VideoUrlBuilder() {
  const [formData, setFormData] = useState({
    meetingId: '',
    passcode: '',
    userName: '',
    notes: ''
  });
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [zoomUrl, setZoomUrl] = useState('');

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
      
      // If no meeting ID found in path, check query params
      if (!extractedMeetingId && url.searchParams.get('meetingId')) {
        extractedMeetingId = url.searchParams.get('meetingId');
      }
      
      if (!extractedMeetingId) {
        alert('Could not extract meeting ID from the URL');
        return;
      }
      
      // Extract password from query params
      // It could be pwd or passcode
      let extractedPasscode = url.searchParams.get('pwd') || url.searchParams.get('passcode') || '';
      
      // Some Zoom URLs have the password in a different format like "pwd=abc123.1"
      // We need to handle this case by removing the ".1" suffix if present
      if (extractedPasscode.includes('.')) {
        extractedPasscode = extractedPasscode.split('.')[0];
      }
      
      // Update form data
      setFormData({
        ...formData,
        meetingId: extractedMeetingId,
        passcode: extractedPasscode
      });
      
      // Clear the Zoom URL input
      setZoomUrl('');
      
    } catch (error) {
      console.error('Error parsing Zoom URL:', error);
      alert('Invalid Zoom URL format');
    }
  };

  // Generate the URL
  const generateUrl = (e) => {
    e.preventDefault();
    
    if (!formData.meetingId) {
      alert('Please enter a Meeting ID');
      return;
    }
    
    const baseUrl = `${window.location.origin}/video-chat`;
    let url = `${baseUrl}?meetingId=${formData.meetingId}`;
    
    if (formData.passcode) {
      url += `&passcode=${formData.passcode}`;
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

      <div className="zoom-url-section">
        <h2>Extract from Zoom URL</h2>
        <p>Paste a Zoom meeting URL to automatically extract the meeting ID and passcode.</p>
        <div className="zoom-url-input">
          <input
            type="text"
            placeholder="Paste Zoom URL (e.g., https://us05web.zoom.us/j/12345678901?pwd=abcdef)"
            value={zoomUrl}
            onChange={handleZoomUrlInput}
          />
          <button 
            type="button" 
            className="extract-button"
            onClick={extractZoomInfo}
          >
            Extract Info
          </button>
        </div>
      </div>

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
                <button 
                  type="button" 
                  className="generate-button"
                  onClick={generateRandomMeetingId}
                  title="Generate Random Meeting ID"
                >
                  Generate
                </button>
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
                  placeholder="Enter Passcode (Optional)"
                />
                <button 
                  type="button" 
                  className="generate-button"
                  onClick={generateRandomPasscode}
                  title="Generate Random Passcode"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="userName">Participant Name</label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                placeholder="Enter Participant Name (Optional)"
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