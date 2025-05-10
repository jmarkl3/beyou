'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setViewedClientId, setViewedClientData } from '../../redux/MainSlice';
import InputSupabase2 from '@/components/database/InputSupabase2';
import { supabase } from '../utils/supabase/client';

const ClientView = () => {
  const dispatch = useDispatch();
  const viewedClientId = useSelector((state) => state.main.viewedClientId);
  const viewedClientData = useSelector((state) => state.main.viewedClientData);
  const userData = useSelector((state) => state.main.userData || {});
  const [isEditing, setIsEditing] = useState(false);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Section visibility states
  const [infoSectionOpen, setInfoSectionOpen] = useState(false);
  const [assignmentSectionOpen, setAssignmentSectionOpen] = useState(false);
  const [journalsSectionOpen, setJournalsSectionOpen] = useState(false);
  
  // Staff assignment states
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [staffSearchResults, setStaffSearchResults] = useState([]);
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [staffSearchLoading, setStaffSearchLoading] = useState(false);

  // Client input fields configuration
  const clientInputFields = [
    { key: 'name', label: 'Name', type: 'input' },
    { key: 'preferred_name', label: 'Preferred Name', type: 'input' },
    { key: 'email', label: 'Email', type: 'input' },
    { key: 'phone', label: 'Phone', type: 'input' },
    { key: 'type', label: 'Account Type', type: 'input', readonly: true },
    { key: 'note', label: 'Note', type: 'textarea', rows: 4 }
  ];

  // Load client data when viewedClientId changes
  useEffect(() => {
    const loadClientData = async () => {
      if (!viewedClientId) {
        dispatch(setViewedClientData(null));
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', viewedClientId)
          .single();

        if (error) {
          console.error('Error loading client data:', error);
          return;
        }

        dispatch(setViewedClientData(data));
        
        // Reset section states when a new client is viewed
        setInfoSectionOpen(false);
        setAssignmentSectionOpen(false);
        setJournalsSectionOpen(false);
      } catch (error) {
        console.error('Failed to load client data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [viewedClientId, dispatch]);
  
  // Load assigned staff when the assignment section is opened
  useEffect(() => {
    if (assignmentSectionOpen && viewedClientId) {
      loadAssignedStaff();
    }
  }, [assignmentSectionOpen, viewedClientId]);

  // Handle closing the client view
  const handleClose = () => {
    dispatch(setViewedClientId(null));
    dispatch(setViewedClientData(null));
    setJournals([]);
    setStaffSearchResults([]);
    setStaffSearchTerm('');
  };

  // Update Redux when database update succeeds
  const handleUpdateCallback = (value, updatedData) => {
    if (!updatedData) return;
    
    console.log('Updating viewed client data with:', updatedData);
    // Update the Redux store with the new data
    dispatch(setViewedClientData({ ...viewedClientData, ...updatedData }));
  };
  
  // Handle input changes (for any additional processing if needed)
  const handleInputChange = (value) => {
    // This function can be used for immediate UI feedback or validation
  };

  // Load client journals
  const handleLoadJournals = async () => {
    if (!viewedClientId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('auth_id', viewedClientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading journals:', error);
        return;
      }

      setJournals(data || []);
      setJournalsSectionOpen(true);
    } catch (error) {
      console.error('Failed to load journals:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Search for staff users
  const handleSearchStaff = async () => {
    if (!staffSearchTerm) return;
    
    setStaffSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('type', 'staff')
        .or(
          `name.ilike.%${staffSearchTerm}%,` +
          `preferred_name.ilike.%${staffSearchTerm}%,` +
          `email.ilike.%${staffSearchTerm}%`
        );

      if (error) {
        console.error('Error searching staff:', error);
        return;
      }

      setStaffSearchResults(data || []);
    } catch (error) {
      console.error('Failed to search staff:', error);
    } finally {
      setStaffSearchLoading(false);
    }
  };
  
  // Load assigned staff
  const loadAssignedStaff = async () => {
    if (!viewedClientId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('type', 'staff')
        .contains('clients', [viewedClientId]);

      if (error) {
        console.error('Error loading assigned staff:', error);
        return;
      }

      setAssignedStaff(data || []);
    } catch (error) {
      console.error('Failed to load assigned staff:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Assign client to staff
  const assignClientToStaff = async (staffId) => {
    if (!viewedClientId || !staffId) return;
    
    setLoading(true);
    try {
      // First, get the staff user's current clients array
      const { data: staffData, error: staffError } = await supabase
        .from('users')
        .select('clients')
        .eq('auth_id', staffId)
        .single();

      if (staffError) {
        console.error('Error fetching staff data:', staffError);
        return;
      }
      
      // Create or update the clients array
      const currentClients = staffData.clients || [];
      if (!currentClients.includes(viewedClientId)) {
        const updatedClients = [...currentClients, viewedClientId];
        
        // Update the staff user's clients array
        const { error: updateError } = await supabase
          .from('users')
          .update({ clients: updatedClients })
          .eq('auth_id', staffId);

        if (updateError) {
          console.error('Error updating staff clients:', updateError);
          return;
        }
        
        // Refresh the assigned staff list
        await loadAssignedStaff();
        
        // Clear search results
        setStaffSearchResults([]);
        setStaffSearchTerm('');
        
        // If the current user is the one being assigned, update their userData
        if (staffId === userData.auth_id) {
          const updatedUserData = { ...userData, clients: updatedClients };
          dispatch(setUserData(updatedUserData));
        }
      }
    } catch (error) {
      console.error('Failed to assign client to staff:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Remove client assignment from staff
  const removeClientAssignment = async (staffId) => {
    if (!viewedClientId || !staffId) return;
    
    setLoading(true);
    try {
      // First, get the staff user's current clients array
      const { data: staffData, error: staffError } = await supabase
        .from('users')
        .select('clients')
        .eq('auth_id', staffId)
        .single();

      if (staffError) {
        console.error('Error fetching staff data:', staffError);
        return;
      }
      
      // Remove the client from the array
      const currentClients = staffData.clients || [];
      const updatedClients = currentClients.filter(id => id !== viewedClientId);
      
      // Update the staff user's clients array
      const { error: updateError } = await supabase
        .from('users')
        .update({ clients: updatedClients })
        .eq('auth_id', staffId);

      if (updateError) {
        console.error('Error updating staff clients:', updateError);
        return;
      }
      
      // Refresh the assigned staff list
      await loadAssignedStaff();
      
      // If the current user is the one being updated, update their userData
      if (staffId === userData.auth_id) {
        const updatedUserData = { ...userData, clients: updatedClients };
        dispatch(setUserData(updatedUserData));
      }
    } catch (error) {
      console.error('Failed to remove client assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  // If no client is being viewed, don't render anything
  if (!viewedClientId || !viewedClientData) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-lg shadow-xl w-[95%] max-h-[95vh] overflow-hidden flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
          <h2 className="text-2xl font-bold">
            {viewedClientData.preferred_name || viewedClientData.name || 'Client'}
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-900 text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          <div className="space-y-6">
            {/* Client Information Section - Collapsible */}
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="bg-gray-100 px-4 py-3 flex justify-between items-center cursor-pointer"
                onClick={() => setInfoSectionOpen(!infoSectionOpen)}
              >
                <h3 className="text-lg font-semibold">Client Information</h3>
                <span className="text-gray-500">
                  {infoSectionOpen ? '▼' : '►'}
                </span>
              </div>
              
              {infoSectionOpen && (
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Personal Details</h4>
                    <button 
                      onClick={() => setIsEditing(!isEditing)} 
                      className="text-blue-500 hover:text-blue-700 font-bold"
                      aria-label={isEditing ? "Cancel editing" : "Edit client information"}
                    >
                      {isEditing ? "✕" : "✎"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {clientInputFields.map((field) => (
                      <div className="mb-4" key={field.key}>
                        <p className="text-gray-600">{field.label}:</p>
                        {isEditing ? (
                          <InputSupabase2
                            table="users"
                            attribute={field.key}
                            identifier={viewedClientId}
                            identifierName="auth_id"
                            initialValue={viewedClientData[field.key] || ''}
                            placeholder={`Enter client's ${field.label.toLowerCase()}`}
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
                              {viewedClientData[field.key] || 'No notes added yet.'}
                            </div>
                          ) : (
                            <p className="font-medium">{viewedClientData[field.key] || ''}</p>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Staff Assignment Section - Collapsible */}
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="bg-gray-100 px-4 py-3 flex justify-between items-center cursor-pointer"
                onClick={() => setAssignmentSectionOpen(!assignmentSectionOpen)}
              >
                <h3 className="text-lg font-semibold">Staff Assignment</h3>
                <span className="text-gray-500">
                  {assignmentSectionOpen ? '▼' : '►'}
                </span>
              </div>
              
              {assignmentSectionOpen && (
                <div className="p-4">
                  {/* Assigned Staff List */}
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Currently Assigned Staff:</h4>
                    {assignedStaff.length > 0 ? (
                      <div className="space-y-2">
                        {assignedStaff.map((staff) => (
                          <div key={staff.auth_id} className="flex justify-between items-center p-2 border rounded-md">
                            <div>
                              <p className="font-medium">{staff.preferred_name || staff.name}</p>
                              <p className="text-sm text-gray-600">{staff.email}</p>
                            </div>
                            <button
                              onClick={() => removeClientAssignment(staff.auth_id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No staff currently assigned to this client.</p>
                    )}
                  </div>
                  
                  {/* Staff Search */}
                  <div>
                    <h4 className="font-medium mb-2">Assign New Staff:</h4>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={staffSearchTerm}
                        onChange={(e) => setStaffSearchTerm(e.target.value)}
                        placeholder="Search staff by name or email"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleSearchStaff}
                        disabled={staffSearchLoading || !staffSearchTerm}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors disabled:bg-gray-400"
                      >
                        {staffSearchLoading ? 'Searching...' : 'Search'}
                      </button>
                    </div>
                    
                    {/* Staff Search Results */}
                    {staffSearchResults.length > 0 && (
                      <div className="mt-4 border rounded-md overflow-hidden">
                        {staffSearchResults.map((staff) => (
                          <div 
                            key={staff.auth_id} 
                            className="flex justify-between items-center p-3 border-b last:border-b-0 hover:bg-gray-50"
                          >
                            <div>
                              <p className="font-medium">{staff.preferred_name || staff.name}</p>
                              <p className="text-sm text-gray-600">{staff.email}</p>
                            </div>
                            <button
                              onClick={() => assignClientToStaff(staff.auth_id)}
                              disabled={assignedStaff.some(s => s.auth_id === staff.auth_id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm transition-colors disabled:bg-gray-400"
                            >
                              {assignedStaff.some(s => s.auth_id === staff.auth_id) ? 'Already Assigned' : 'Assign'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Journals Section - Collapsible */}
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="bg-gray-100 px-4 py-3 flex justify-between items-center cursor-pointer"
                onClick={() => setJournalsSectionOpen(!journalsSectionOpen)}
              >
                <h3 className="text-lg font-semibold">Client Journals</h3>
                <span className="text-gray-500">
                  {journalsSectionOpen ? '▼' : '►'}
                </span>
              </div>
              
              {journalsSectionOpen && (
                <div className="p-4">
                  {journals.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                      {journals.map((journal) => (
                        <div key={journal.id} className="border-b p-4 hover:bg-gray-50 last:border-b-0">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">
                              {new Date(journal.created_at).toLocaleString()}
                            </h4>
                          </div>
                          <div className="whitespace-pre-wrap">{journal.content}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 italic mb-4">No journals found for this client.</p>
                      <button 
                        onClick={handleLoadJournals} 
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : 'Refresh Journals'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientView;