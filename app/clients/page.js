'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setViewedClientId } from '../../redux/MainSlice';
import { supabase } from '../utils/supabase/client';
import ClientView from './ClientView';

export default function ClientsPage() {
  const dispatch = useDispatch();
  const auth_id = useSelector((state) => state.main.auth_id);
  const userData = useSelector((state) => state.main.userData || {});
  const viewedClientId = useSelector((state) => state.main.viewedClientId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyMyClients, setOnlyMyClients] = useState(false);
  const [hideStaff, setHideStaff] = useState(true);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search for clients when search parameters change
  useEffect(() => {
    if (!auth_id) return;
    
    const searchClients = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase.from('users').select('*');
        
        // Apply search term if provided
        if (searchTerm) {
          query = query.or(
            `name.ilike.%${searchTerm}%,` +
            `preferred_name.ilike.%${searchTerm}%,` +
            `email.ilike.%${searchTerm}%,` +
            `phone.ilike.%${searchTerm}%,` +
            `note.ilike.%${searchTerm}%`
          );
        }
        
        // Filter out current user
        query = query.neq('auth_id', auth_id);
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Apply client-side filters
        let filteredClients = data || [];
        
        // Filter for only my clients if selected
        if (onlyMyClients && userData.clients) {
          filteredClients = filteredClients.filter(client => 
            userData.clients.includes(client.auth_id)
          );
        }
        
        // Hide staff users if selected
        if (hideStaff) {
          filteredClients = filteredClients.filter(client => 
            client.type !== 'staff'
          );
        }
        
        setClients(filteredClients);
      } catch (err) {
        console.error('Error searching clients:', err);
        setError('Failed to search clients');
      } finally {
        setLoading(false);
      }
    };
    
    searchClients();
  }, [auth_id, searchTerm, onlyMyClients, hideStaff, userData.clients]);

  // Handle viewing a client
  const handleViewClient = (clientId) => {
    dispatch(setViewedClientId(clientId));
  };

  // If not logged in or not a staff user
  if (!auth_id) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to access this page.</p>
        </div>
      </div>
    );
  }

  if (userData.type !== 'staff') {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Only staff members can access the client management system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Client Management</h1>
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Clients
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, or notes"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="myClients"
                checked={onlyMyClients}
                onChange={(e) => setOnlyMyClients(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="myClients" className="ml-2 text-sm text-gray-700">
                Only My Clients
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hideStaff"
                checked={hideStaff}
                onChange={(e) => setHideStaff(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hideStaff" className="ml-2 text-sm text-gray-700">
                Hide Staff Users
              </label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Client Results */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Client Results</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : clients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No clients found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {clients.map((client) => (
              <div 
                key={client.auth_id}
                onClick={() => handleViewClient(client.auth_id)}
                className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="font-semibold text-lg truncate">
                  {client.preferred_name || client.name || 'Unnamed Client'}
                </h3>
                {client.email && (
                  <p className="text-sm text-gray-600 truncate">{client.email}</p>
                )}
                {client.phone && (
                  <p className="text-sm text-gray-600 truncate">{client.phone}</p>
                )}
                {client.type && (
                  <p className="text-xs text-gray-500 mt-2 bg-gray-100 inline-block px-2 py-1 rounded">
                    {client.type}
                  </p>
                )}
                {userData.clients?.includes(client.auth_id) && (
                  <div className="mt-2 text-xs text-blue-600 font-medium">
                    My Client
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Client View Modal */}
      {viewedClientId && <ClientView />}
    </div>
  );
}