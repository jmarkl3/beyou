'use client';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { supabase } from '../utils/supabase/client';
import JournalEntry from './JournalEntry';

// Set to true to enable development testing features
const developerTesting = false;

export default function JournalPage() {
  const auth_id = useSelector((state) => state.main.auth_id);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Get journal entries with pagination
  const fetchJournalEntries = async (loadMore = false) => {
    if (!auth_id) return;
    
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Get the oldest date we currently have to use as a cursor for pagination
      const oldestDate = loadMore && journalEntries.length > 0 
        ? journalEntries[journalEntries.length - 1].date 
        : null;
      
      // Query to get entries
      let query = supabase
        .from('journal_entries')
        .select('*')
        .eq('auth_id', auth_id)
        .order('date', { ascending: false })
        .limit(5);
      
      // If loading more, get entries older than our oldest entry
      if (oldestDate) {
        query = query.lt('date', oldestDate);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Check if we have more entries to load
      setHasMore(data && data.length === 5);

      // Get today's date
      const todayDate = getTodayDate();
      
      // Check if today's date is in the entries
      const hasToday = data ? data.some(entry => entry.date === todayDate) : false;
      
      // Create the final entries array
      let entries = [...(data || [])];
      
      if (loadMore) {
        // Append new entries to existing ones
        setJournalEntries(prev => {
          const combined = [...prev, ...entries];
          // Remove any duplicates (by date)
          const uniqueEntries = [];
          const dateSet = new Set();
          
          combined.forEach(entry => {
            if (!dateSet.has(entry.date)) {
              dateSet.add(entry.date);
              uniqueEntries.push(entry);
            }
          });
          
          // Sort by date (newest first)
          return uniqueEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        });
      } else {
        // Add today's entry if it doesn't exist
        if (!hasToday) {
          entries.unshift({
            date: todayDate,
            auth_id: auth_id
          });
        }
        
        // Sort by date (newest first)
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setJournalEntries(entries);
      }
    } catch (err) {
      console.error('Error fetching journal entries:', err);
      // Even if there's an error, show today's entry
      const todayDate = getTodayDate();
      setJournalEntries([{ date: todayDate, auth_id: auth_id }]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // No need for handleUpdateCallback anymore as it's handled in the JournalEntry component

  // Development function to create random test entries
  const createRandomEntries = async () => {
    if (!auth_id) return;
    
    // Get all existing dates to avoid duplicates
    const { data: existingEntries } = await supabase
      .from('journal_entries')
      .select('date')
      .eq('auth_id', auth_id);
    
    const existingDates = new Set(existingEntries?.map(entry => entry.date) || []);
    
    // Generate random dates in the past month that don't already exist
    const randomDates = [];
    const today = new Date();
    
    // Try to find 10 unique dates
    for (let attempts = 0; randomDates.length < 10 && attempts < 50; attempts++) {
      // Random day in the past month (1-30 days ago)
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const randomDate = new Date(today);
      randomDate.setDate(randomDate.getDate() - daysAgo);
      
      const dateString = randomDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Only add if this date doesn't already exist
      if (!existingDates.has(dateString) && !randomDates.includes(dateString)) {
        randomDates.push(dateString);
      }
    }
    
    // Random content templates
    const publicTemplates = [
      "Today was a productive day. I accomplished several tasks.",
      "Feeling good about my progress on personal goals.",
      "Had some challenges today but working through them.",
      "Met with friends and had a great time.",
      "Focused on self-care today."
    ];
    
    const privateTemplates = [
      "Need to remember to follow up on that important matter.",
      "Personal note: don't forget the appointment next week.",
      "Reminder to myself about boundaries with certain people.",
      "My honest thoughts about today's meeting...",
      "Things I want to work on but haven't told anyone:"
    ];
    
    // Create entries for each random date
    const entries = randomDates.map(date => ({
      auth_id,
      date,
      content: publicTemplates[Math.floor(Math.random() * publicTemplates.length)],
      content_private: privateTemplates[Math.floor(Math.random() * privateTemplates.length)],
      updated_datetime: new Date().toISOString()
    }));
    
    // Insert all entries
    if (entries.length > 0) {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert(entries)
        .select();
      
      if (error) {
        console.error('Error creating random entries:', error);
      } else {
        console.log(`Created ${data.length} random journal entries`);
        // Refresh the entries list
        fetchJournalEntries();
      }
    }
  };

  // Handle when a new entry is created in the JournalEntry component
  const handleEntryCreated = (newEntry) => {
    if (!newEntry) return;
    
    setJournalEntries(prev => {
      return prev.map(entry => {
        // Replace the placeholder entry with the real one
        if (entry.date === newEntry.date && !entry.id) {
          return newEntry;
        }
        return entry;
      });
    });
  };

  // Fetch entries when auth_id changes
  useEffect(() => {
    if (auth_id) {
      fetchJournalEntries();
    } else {
      // Even if not logged in, show today's entry
      const todayDate = getTodayDate();
      setJournalEntries([{ date: todayDate }]);
    }
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
      
      {loading && journalEntries.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading journal entries...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {journalEntries.map(entry => (
            <JournalEntry 
              key={`journal-entry-${entry.date}`}
              entry={entry}
              onEntryCreated={handleEntryCreated}
            />
          ))}
          
          {/* Load Earlier Button - Always shown but with different styling when no more entries */}
          {auth_id && (
            <div className="text-center py-4">
              <button 
                onClick={hasMore ? () => fetchJournalEntries(true) : undefined} 
                className={`py-2 px-6 rounded-md transition-colors text-white ${
                  hasMore 
                    ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer' 
                    : 'bg-blue-300 cursor-default'
                }`}
                disabled={loadingMore || !hasMore}
              >
                {loadingMore ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Loading...
                  </>
                ) : hasMore ? (
                  'Load Earlier Entries'
                ) : (
                  'No Earlier Entries'
                )}
              </button>
            </div>
          )}
          
          {/* DEV ONLY: Button to create random test entries */}
          {developerTesting && auth_id && (
            <div className="text-center py-4 mt-8 border-t border-gray-200">
              <p className="text-gray-500 mb-2 text-sm">Development Testing</p>
              <button 
                onClick={createRandomEntries} 
                className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-6 rounded-md transition-colors"
              >
                Create 10 Random Test Entries
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
