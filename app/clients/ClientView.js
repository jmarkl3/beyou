'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setViewedClientId, setViewedClientData } from '../../redux/MainSlice';
import { supabase } from '../utils/supabase/client';
import ClientInformation from './components/ClientInformation';
import ClientSessions from './components/ClientSessions';
import ClientJournals from './components/ClientJournals';
import StaffAssignment from './components/StaffAssignment';
import ClientActions from './components/ClientActions';

const ClientView = () => {
  const dispatch = useDispatch();
  const viewedClientId = useSelector((state) => state.main.viewedClientId);
  const viewedClientData = useSelector((state) => state.main.viewedClientData);
  const [loading, setLoading] = useState(false);
  
  // Handle closing the client view
  const handleClose = () => {
    dispatch(setViewedClientId(null));
    dispatch(setViewedClientData(null));
  };
  
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
      } catch (error) {
        console.error('Failed to load client data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [viewedClientId, dispatch]);

  // If no client is being viewed, don't render anything
  if (!viewedClientId || !viewedClientData) {
    return null;
  }

  // No additional functions needed - all functionality is now in component files

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

            {/* Client Sessions Section */}
            <ClientSessions />
            
            {/* Client Journals Section */}
            <ClientJournals />

            {/* Client Information Section */}
            <ClientInformation />
            
            {/* Client Actions Section */}
            <ClientActions />
            
            {/* Staff Assignment Section */}
            <StaffAssignment />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientView;