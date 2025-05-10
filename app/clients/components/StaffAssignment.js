'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setUserData } from '../../../redux/MainSlice';
import { supabase } from '../../utils/supabase/client';

const StaffAssignment = () => {
  const dispatch = useDispatch();
  const viewedClientId = useSelector((state) => state.main.viewedClientId);
  const userData = useSelector((state) => state.main.userData || {});
  const [sectionOpen, setSectionOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Staff assignment states
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [staffSearchResults, setStaffSearchResults] = useState([]);
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [staffSearchLoading, setStaffSearchLoading] = useState(false);

  // Load assigned staff when the section is opened
  useEffect(() => {
    if (sectionOpen && viewedClientId) {
      loadAssignedStaff();
    }
  }, [sectionOpen, viewedClientId]);

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

  if (!viewedClientId) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden mb-6">
      <div 
        className="bg-gray-100 px-4 py-3 flex justify-between items-center cursor-pointer"
        onClick={() => setSectionOpen(!sectionOpen)}
      >
        <h3 className="text-lg font-semibold">Staff Assignment</h3>
        <span className="text-gray-500">
          {sectionOpen ? '▼' : '►'}
        </span>
      </div>
      
      {sectionOpen && (
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
  );
};

export default StaffAssignment;
