'use client';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '../utils/supabase/client';
import InputSupabase2 from '../../components/database/InputSupabase2';

export default function JournalPage() {
  const auth_id = useSelector((state) => state.main.auth_id);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate dates for the last 7 days
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push({
        date: date,
        formatted: date.toISOString().split('T')[0], // YYYY-MM-DD format
        display: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      });
    }
    return dates;
  };

  // Get last 7 days of journal entries
  const fetchJournalEntries = async () => {
    if (!auth_id) return;

    setLoading(true);
    setError(null);

    try {
      const dates = generateDates();
      const formattedDates = dates.map(d => d.formatted);

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('auth_id', auth_id)
        .in('date', formattedDates);

      if (error) throw error;

      // Ensure we have entries for all 7 days
      const entriesMap = {};
      if (data) {
        data.forEach(entry => {
          if (!entriesMap[entry.date]) {
            entriesMap[entry.date] = {};
          }
          entriesMap[entry.date][entry.type] = entry;
        });
      }

      // Create entries array with all 7 days
      const entries = dates.map(date => {
        const existingEntries = entriesMap[date.formatted] || {};
        return {
          date: date.date,
          formatted: date.formatted,
          display: date.display,
          public: existingEntries.open || null,
          private: existingEntries.private || null
        };
      });

      setJournalEntries(entries);
    } catch (err) {
      console.error('Error fetching journal entries:', err);
      setError('Failed to load journal entries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle database updates
  const handleUpdateCallback = (value, updatedData) => {
    if (!updatedData) return;

    // Update the local state with the new data
    setJournalEntries(prevEntries => {
      return prevEntries.map(entry => {
        if (entry.formatted === updatedData.date) {
          return {
            ...entry,
            [updatedData.type === 'open' ? 'public' : 'private']: updatedData
          };
        }
        return entry;
      });
    });
  };

  // Create a new journal entry if it doesn't exist
  const createJournalEntry = async (date, type) => {
    if (!auth_id) return null;

    try {
      const newEntry = {
        auth_id,
        date: date,
        type: type,
        content: '',
        updated_datetime: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('journal_entries')
        .insert([newEntry])
        .select();

      if (error) throw error;

      return data[0];
    } catch (err) {
      console.error('Error creating journal entry:', err);
      return null;
    }
  };

  // Fetch entries when auth_id changes
  useEffect(() => {
    fetchJournalEntries();
  }, [auth_id]);

  // If not logged in
  if (!auth_id) {
    return (
      <div className="container mx-auto px-4 py-20 pt-24 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Not Signed In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to access your journal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 pt-24 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">My Journal</h1>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading journal entries...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>
      ) : (
        <div className="space-y-8">
          {journalEntries.map((entry) => (
            <div key={entry.formatted} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">{entry.display}</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2 text-blue-600">Open Entry (Visible to your counsellor)</h3>
                <InputSupabase2
                  table="journal_entries"
                  attribute="content"
                  identifier={entry.public?.id || null}
                  identifierName="id"
                  initialValue={entry.public?.content || ''}
                  placeholder="Write your public journal entry here..."
                  updateCallback={handleUpdateCallback}
                  isTextarea={true}
                  rows={4}
                  className="w-full"
                  // If no entry exists yet, create one when focused
                  onFocus={async () => {
                    if (!entry.public) {
                      const newEntry = await createJournalEntry(entry.formatted, 'open');
                      if (newEntry) {
                        setJournalEntries(prev => {
                          return prev.map(e => {
                            if (e.formatted === entry.formatted) {
                              return { ...e, public: newEntry };
                            }
                            return e;
                          });
                        });
                      }
                    }
                  }}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 text-purple-600">Private Entry (Visible only to you)</h3>
                <InputSupabase2
                  table="journal_entries"
                  attribute="content"
                  identifier={entry.private?.id || null}
                  identifierName="id"
                  initialValue={entry.private?.content || ''}
                  placeholder="Write your private journal entry here..."
                  updateCallback={handleUpdateCallback}
                  isTextarea={true}
                  rows={4}
                  className="w-full"
                  // If no entry exists yet, create one when focused
                  onFocus={async () => {
                    if (!entry.private) {
                      const newEntry = await createJournalEntry(entry.formatted, 'private');
                      if (newEntry) {
                        setJournalEntries(prev => {
                          return prev.map(e => {
                            if (e.formatted === entry.formatted) {
                              return { ...e, private: newEntry };
                            }
                            return e;
                          });
                        });
                      }
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
