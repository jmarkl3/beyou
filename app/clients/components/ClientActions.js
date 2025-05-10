'use client';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '../../utils/supabase/client';

const ClientActions = () => {
  const viewedClientId = useSelector((state) => state.main.viewedClientId);
  const viewedClientData = useSelector((state) => state.main.viewedClientData);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Generate login link for the client
  const generateLoginLink = async () => {
    if (!viewedClientData || !viewedClientData.email) {
      alert('Client email is required to generate a login link');
      return;
    }
    
    // Create the login link with the client's email and a default password
    // The password can be changed later by the client
    const baseUrl = window.location.origin;
    const loginLink = `${baseUrl}/login-link?email=${encodeURIComponent(viewedClientData.email)}&password=welcome123`;
    
    setGeneratedLink(loginLink);
    setCopied(false);
  };
  
  // Copy the generated link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000); // Reset copied state after 3 seconds
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        alert('Failed to copy link to clipboard');
      });
  };

  if (!viewedClientId) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden mb-6">
      <div 
        className="bg-gray-100 px-4 py-3 flex justify-between items-center cursor-pointer"
        onClick={() => setSectionOpen(!sectionOpen)}
      >
        <h3 className="text-lg font-semibold">Client Actions</h3>
        <span className="text-gray-500">
          {sectionOpen ? '▼' : '►'}
        </span>
      </div>
      
      {sectionOpen && (
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Login Link</h4>
              <p className="text-sm text-gray-600 mb-3">
                Generate a login link for this client. When they click the link, they will be taken to the login page with their email and a default password pre-filled.
              </p>
              
              <button 
                onClick={generateLoginLink}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Generate Login Link
              </button>
              
              {generatedLink && (
                <div className="mt-4 p-3 bg-gray-50 border rounded-md">
                  <p className="text-sm font-medium mb-2">Login Link:</p>
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      value={generatedLink} 
                      readOnly 
                      className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className={`px-3 py-2 rounded-r-md transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Default password: welcome123
                  </p>
                </div>
              )}
            </div>
            
            {/* Add more actions here as needed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientActions;
