'use client';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import InputSupabase2 from '../../components/database/InputSupabase2';

const JournalEntry = ({ entry, onEntryCreated }) => {
  const auth_id = useSelector((state) => state.main.auth_id);
  const [isCreating, setIsCreating] = useState(false);
  
  // Format date for display with timezone adjustment
  const formatDate = (dateStr) => {
    // Create a date in local timezone from the YYYY-MM-DD string
    // This ensures we get the correct date regardless of timezone
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
    const date = new Date(year, month - 1, day); // month is 0-indexed in JS Date
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };
  
  // Create a new journal entry if it doesn't exist
  const createJournalEntry = async () => {
    if (!auth_id || isCreating || entry.id) return null;
    
    setIsCreating(true);
    try {
      const newEntry = {
        auth_id,
        date: entry.date,
        content: '',
        content_private: '',
        updated_datetime: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('journal_entries')
        .insert([newEntry])
        .select();

      if (error) throw error;
      
      // Notify parent component about the new entry
      if (data && data[0] && onEntryCreated) {
        onEntryCreated(data[0]);
      }

      return data[0];
    } catch (err) {
      console.error('Error creating journal entry:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  };
  
  // Handle database updates
  const handleUpdateCallback = (value, updatedData) => {
    // No need to do anything here as the database is updated directly
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">{formatDate(entry.date)}</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 text-blue-600">Open Entry (Visible to your counsellor)</h3>
        <InputSupabase2
          table="journal_entries"
          attribute="content"
          identifier={entry.id || null}
          identifierName="id"
          initialValue={entry.content || ''}
          placeholder="Write your public journal entry here..."
          updateCallback={handleUpdateCallback}
          isTextarea={true}
          rows={4}
          className="w-full"
          // If no entry exists yet, create one when focused
          onFocus={async () => {
            if (!entry.id) {
              await createJournalEntry();
            }
          }}
        />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2 text-purple-600">Private Entry (Visible only to you)</h3>
        <InputSupabase2
          table="journal_entries"
          attribute="content_private"
          identifier={entry.id || null}
          identifierName="id"
          initialValue={entry.content_private || ''}
          placeholder="Write your private journal entry here..."
          updateCallback={handleUpdateCallback}
          isTextarea={true}
          rows={4}
          className="w-full"
          // If no entry exists yet, create one when focused
          onFocus={async () => {
            if (!entry.id) {
              await createJournalEntry();
            }
          }}
        />
      </div>
    </div>
  );
};

export default JournalEntry;
