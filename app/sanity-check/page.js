'use client';
import { useState, useRef } from 'react';
import { supabase } from '../utils/supabase/client';

export default function SanityCheckPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // Refs for the update form inputs
  const tableRef = useRef(null);
  const idRef = useRef(null);
  const attributeRef = useRef(null);
  const valueRef = useRef(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Step 1: Starting fetch users operation...');
      console.log('Step 2: Using Supabase client');
      
      console.log('Step 3: Sending request to fetch users from Supabase...');
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      
      console.log('Step 4: Users fetched successfully:', data);
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
      console.log('Step 5: Fetch users operation completed');
    }
  };
  
  // Function to clear users from state
  const clearUsers = () => {
    console.log('Clearing users from state');
    setUsers([]);
  };

  // create a sectoin in sanity check with inputs for table, id, attribure, and value. there is an update button that when pressed updates supabase according to that data and logs each stap
  
  // Function to update a record in Supabase
  const updateRecord = async () => {
    // Reset states
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);
    
    // Get form values
    const table = tableRef.current.value.trim();
    const id = idRef.current.value.trim();
    const attribute = attributeRef.current.value.trim();
    const value = valueRef.current.value.trim();
    
    // Validate inputs
    if (!table || !id || !attribute || !value) {
      setUpdateError('All fields are required');
      setUpdateLoading(false);
      return;
    }
    
    try {
      // Log each step
      console.log('Step 1: Starting update operation...');
      console.log('Step 2: Using Supabase client');
      
      // Prepare update data
      const updateData = {};
      updateData[attribute] = value;
      
      console.log(`Step 3: Preparing to update ${attribute} to ${value} for record with ID ${id} in table ${table}`);
      
      // Perform update
      console.log('Step 4: Sending update request to Supabase...');
      const { data, error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      console.log('Step 5: Update successful!');
      console.log('Step 6: Updated data:', data);
      setUpdateSuccess(true);
    } catch (err) {
      console.error('Error updating record:', err);
      setUpdateError(err.message || 'Failed to update record');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Supabase Sanity Check</h1>
      
      <p className="mb-4 text-gray-600">Open the browser console (F12) to view update logs.</p>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Database Load Test</h2>
        <div className="flex space-x-3">
          <button 
            onClick={fetchUsers}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors disabled:bg-blue-300"
          >
            {loading ? 'Loading...' : 'Fetch Users'}
          </button>
          
          <button 
            onClick={clearUsers}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors disabled:bg-gray-300"
          >
            Clear Users
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Update Record Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Update Database Record</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
            <input
              ref={tableRef}
              type="text"
              placeholder="e.g. users"
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Record ID</label>
            <input
              ref={idRef}
              type="text"
              placeholder="e.g. 123"
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attribute</label>
            <input
              ref={attributeRef}
              type="text"
              placeholder="e.g. name"
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Value</label>
            <input
              ref={valueRef}
              type="text"
              placeholder="e.g. John Doe"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
        
        <button 
          onClick={updateRecord}
          disabled={updateLoading}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors disabled:bg-green-300"
        >
          {updateLoading ? 'Updating...' : 'Update Record'}
        </button>
        
        {updateError && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {updateError}
          </div>
        )}
        
        {updateSuccess && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
            Update successful! Check console for details.
          </div>
        )}
      </div>
      
      {users.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Users Data</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {users.map((user) => (
              <div key={user.id} className="p-4 border rounded-md">
                <h3 className="font-medium">{user.name || user.email || 'User ' + user.id}</h3>
                <div className="mt-2 text-sm text-gray-600">
                  {Object.entries(user).map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className="font-medium mr-2">{key}:</span>
                      <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
