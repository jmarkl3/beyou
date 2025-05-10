'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setViewedClientData } from '../../../redux/MainSlice';
import InputSupabase2 from '@/components/database/InputSupabase2';
import { supabase } from '../../utils/supabase/client';

const ClientInformation = () => {
  const dispatch = useDispatch();
  const viewedClientId = useSelector((state) => state.main.viewedClientId);
  const viewedClientData = useSelector((state) => state.main.viewedClientData || {});
  const [isEditing, setIsEditing] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Client input fields configuration
  const clientInputFields = [
    { key: 'name', label: 'Name', type: 'input' },
    { key: 'preferred_name', label: 'Preferred Name', type: 'input' },
    { key: 'email', label: 'Email', type: 'input' },
    { key: 'phone', label: 'Phone', type: 'input' },
    { key: 'type', label: 'Account Type', type: 'input', readonly: true },
    { key: 'note', label: 'Note', type: 'textarea', rows: 4 }
  ];

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

  if (!viewedClientId) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden mb-6">
      <div 
        className="bg-gray-100 px-4 py-3 flex justify-between items-center cursor-pointer"
        onClick={() => setSectionOpen(!sectionOpen)}
      >
        <h3 className="text-lg font-semibold">Client Information</h3>
        <span className="text-gray-500">
          {sectionOpen ? '▼' : '►'}
        </span>
      </div>
      
      {sectionOpen && (
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
  );
};

export default ClientInformation;
