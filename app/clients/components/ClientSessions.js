'use client';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '../../utils/supabase/client';

const ClientSessions = () => {
  const viewedClientId = useSelector((state) => state.main.viewedClientId);
  const userData = useSelector((state) => state.main.userData || {});
  const [sectionOpen, setSectionOpen] = useState(false);
  
  // Sessions states
  const [sessions, setSessions] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [sessionFormData, setSessionFormData] = useState({
    datetime: new Date().toISOString().slice(0, 16),
    note: '',
    additional_clients: [],
    additional_staff: []
  });
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientSearchResults, setClientSearchResults] = useState([]);
  const [additionalStaffSearchTerm, setAdditionalStaffSearchTerm] = useState('');
  const [additionalStaffSearchResults, setAdditionalStaffSearchResults] = useState([]);

  // Load sessions when the section is opened
  useEffect(() => {
    if (sectionOpen && viewedClientId) {
      loadSessions();
    }
  }, [sectionOpen, viewedClientId]);

  // Load client sessions
  const loadSessions = async () => {
    if (!viewedClientId) return;
    
    setSessionLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('client_auth_id', viewedClientId)
        .order('datetime', { ascending: false });

      if (error) {
        console.error('Error loading sessions:', error);
        return;
      }

      setSessions(data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setSessionLoading(false);
    }
  };
  
  // Create a new session immediately when Add New Session is clicked
  const createNewSession = async () => {
    if (!viewedClientId || !userData.auth_id) {
      console.error('Cannot create session: Missing client or staff ID');
      return;
    }
    
    setSessionLoading(true);
    try {
      // Create a new session with current datetime and empty fields
      const newSession = {
        datetime: new Date().toISOString(),
        client_auth_id: viewedClientId,
        additional_clients: [],
        staff_auth_id: userData.auth_id,
        additional_staff: [],
        note: ''
      };
      
      console.log('Creating new session:', newSession);
      
      const { data, error } = await supabase
        .from('sessions')
        .insert([newSession])
        .select();

      if (error) {
        console.error('Error creating session:', error);
        alert(`Failed to create session: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.error('No data returned from session creation');
        return;
      }
      
      console.log('New session created:', data[0]);
      
      // Add the new session to the top of the list
      setSessions([data[0], ...sessions]);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert(`An error occurred while creating the session: ${error.message || 'Unknown error'}`);
    } finally {
      setSessionLoading(false);
    }
  };
  
  // Update an existing session
  const updateSession = async (sessionId, field, value) => {
    if (!sessionId) return;
    
    try {
      console.log(`Updating session ${sessionId}, field '${field}' to:`, value);
      
      const { data, error } = await supabase
        .from('sessions')
        .update({ [field]: value })
        .eq('id', sessionId)
        .select();

      if (error) {
        console.error('Error updating session:', error);
        return;
      }

      // Update the session in the local state
      setSessions(sessions.map(session => 
        session.id === sessionId ? { ...session, [field]: value } : session
      ));
      
      console.log('Session updated successfully');
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };
  
  // Search for clients to add to session
  const handleSearchClients = async () => {
    if (!clientSearchTerm) return;
    
    setSessionLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('type', 'client')
        .or(
          `name.ilike.%${clientSearchTerm}%,` +
          `preferred_name.ilike.%${clientSearchTerm}%,` +
          `email.ilike.%${clientSearchTerm}%`
        );

      if (error) {
        console.error('Error searching clients:', error);
        return;
      }

      setClientSearchResults(data || []);
    } catch (error) {
      console.error('Failed to search clients:', error);
    } finally {
      setSessionLoading(false);
    }
  };
  
  // Add additional client to session
  const addAdditionalClient = (clientId) => {
    if (clientId === viewedClientId || sessionFormData.additional_clients.includes(clientId)) return;
    
    setSessionFormData({
      ...sessionFormData,
      additional_clients: [...sessionFormData.additional_clients, clientId]
    });
  };
  
  // Remove additional client from session
  const removeAdditionalClient = (clientId) => {
    setSessionFormData({
      ...sessionFormData,
      additional_clients: sessionFormData.additional_clients.filter(id => id !== clientId)
    });
  };
  
  // Search for additional staff to add to session
  const handleSearchAdditionalStaff = async () => {
    if (!additionalStaffSearchTerm) return;
    
    setSessionLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('type', 'staff')
        .or(
          `name.ilike.%${additionalStaffSearchTerm}%,` +
          `preferred_name.ilike.%${additionalStaffSearchTerm}%,` +
          `email.ilike.%${additionalStaffSearchTerm}%`
        );

      if (error) {
        console.error('Error searching staff:', error);
        return;
      }

      setAdditionalStaffSearchResults(data || []);
    } catch (error) {
      console.error('Failed to search staff:', error);
    } finally {
      setSessionLoading(false);
    }
  };
  
  // Add additional staff to session
  const addAdditionalStaff = (staffId) => {
    if (staffId === userData.auth_id || sessionFormData.additional_staff.includes(staffId)) return;
    
    setSessionFormData({
      ...sessionFormData,
      additional_staff: [...sessionFormData.additional_staff, staffId]
    });
  };
  
  // Remove additional staff from session
  const removeAdditionalStaff = (staffId) => {
    setSessionFormData({
      ...sessionFormData,
      additional_staff: sessionFormData.additional_staff.filter(id => id !== staffId)
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
        <h3 className="text-lg font-semibold">Client Sessions</h3>
        <span className="text-gray-500">
          {sectionOpen ? '▼' : '►'}
        </span>
      </div>
      
      {sectionOpen && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Client Sessions</h4>
            <button 
              onClick={createNewSession} 
              disabled={sessionLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm transition-colors disabled:bg-gray-400"
            >
              {sessionLoading ? 'Creating...' : 'Add New Session'}
            </button>
          </div>
          
          {/* Sessions List */}
          {sessions.length > 0 ? (
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              {sessions.map((session) => (
                <div key={session.id} className="border-b p-4 hover:bg-gray-50 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">
                      <input 
                        type="datetime-local" 
                        defaultValue={new Date(session.datetime).toISOString().slice(0, 16)}
                        onChange={(e) => {
                          const newDate = new Date(e.target.value).toISOString();
                          updateSession(session.id, 'datetime', newDate);
                        }}
                        className="p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </h4>
                    <span className="text-xs text-gray-500">
                      ID: {session.id}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">Notes:</p>
                    <textarea
                      defaultValue={session.note || ''}
                      onChange={(e) => {
                        // We're using a debounce approach to avoid too many updates
                        if (session.noteUpdateTimeout) {
                          clearTimeout(session.noteUpdateTimeout);
                        }
                        
                        // Store the timeout ID on the session object
                        session.noteUpdateTimeout = setTimeout(() => {
                          updateSession(session.id, 'note', e.target.value);
                        }, 1000);
                      }}
                      onBlur={(e) => {
                        // Also update when field loses focus
                        if (session.noteUpdateTimeout) {
                          clearTimeout(session.noteUpdateTimeout);
                          session.noteUpdateTimeout = null;
                        }
                        
                        // Only update if the value has changed
                        if (e.target.value !== session.note) {
                          updateSession(session.id, 'note', e.target.value);
                        }
                      }}
                      placeholder="Add session notes here..."
                      className="w-full p-2 border border-gray-300 rounded-md min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Additional clients */}
                  {session.additional_clients && session.additional_clients.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700">Additional Clients:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {session.additional_clients.map((clientId, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                            {clientId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Additional staff */}
                  {session.additional_staff && session.additional_staff.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Additional Staff:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {session.additional_staff.map((staffId, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs">
                            {staffId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 italic mb-4">No sessions found for this client.</p>
              <button 
                onClick={loadSessions} 
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
                disabled={sessionLoading}
              >
                {sessionLoading ? 'Loading...' : 'Refresh Sessions'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSessions;
