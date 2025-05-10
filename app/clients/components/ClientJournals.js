'use client';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '../../utils/supabase/client';

const ClientJournals = () => {
  const viewedClientId = useSelector((state) => state.main.viewedClientId);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load journals when the section is opened
  useEffect(() => {
    if (sectionOpen && viewedClientId && journals.length === 0) {
      handleLoadJournals();
    }
  }, [sectionOpen, viewedClientId, journals.length]);

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
    } catch (error) {
      console.error('Failed to load journals:', error);
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
        <h3 className="text-lg font-semibold">Client Journals</h3>
        <span className="text-gray-500">
          {sectionOpen ? '▼' : '►'}
        </span>
      </div>
      
      {sectionOpen && (
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
  );
};

export default ClientJournals;
