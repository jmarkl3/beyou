'use client';
import { useState, useEffect, useRef } from 'react';
import supabase from '../app/supabase/client';
import { useDispatch } from 'react-redux';

/**
 * SupabaseInput - A reusable input component that updates Supabase data after inactivity
 * 
 * @param {Object} props
 * @param {string} props.tableName - The name of the Supabase table to update
 * @param {string} props.fieldName - The name of the field in the table to update
 * @param {string} props.rowId - The ID value to identify the row (e.g., the auth_id value)
 * @param {string} props.rowIdField - The name of the ID column in the table (default: 'id', but could be 'auth_id', 'user_id', etc.)
 * @param {string} props.value - The current value of the input
 * @param {function} props.onUpdate - Callback function when update is successful
 * @param {string} props.type - Input type (text, email, tel, etc.)
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.debounceTime - Debounce time in milliseconds (default: 500)
 * @param {boolean} props.debug - Enable detailed console logging for debugging
 */
export default function SupabaseInput({
  tableName,
  fieldName,
  rowId,
  rowIdField = 'id',
  value = '',
  onUpdate,
  type = 'text',
  className = '',
  debounceTime = 500,
  debug = false,
  ...inputProps
}) {
  const [inputValue, setInputValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null); // null, 'success', or 'error'
  const [error, setError] = useState('');
  const [lastSaveTime, setLastSaveTime] = useState('');
  const timeoutRef = useRef(null);
  const dispatch = useDispatch();

  // Update local state when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Validate table and field names to prevent SQL injection
  const isValidIdentifier = (name) => {
    // Only allow alphanumeric characters, underscores, and no spaces
    const validPattern = /^[a-zA-Z0-9_]+$/;
    return validPattern.test(name);
  };

  // Validate row ID
  const isValidRowId = (id) => {
    return id !== undefined && id !== null && id !== '';
  };

  const updateSupabaseData = async (newValue) => {
    // Reset status before starting new update
    setUpdateStatus(null);
    setError('');
    setIsUpdating(true);
    
    // Validate inputs
    if (!isValidIdentifier(tableName)) {
      setError('Invalid table name');
      setUpdateStatus('error');
      setIsUpdating(false);
      return;
    }

    if (!isValidIdentifier(fieldName)) {
      setError('Invalid field name');
      setUpdateStatus('error');
      setIsUpdating(false);
      return;
    }

    if (!isValidIdentifier(rowIdField)) {
      setError('Invalid row ID field name');
      setUpdateStatus('error');
      setIsUpdating(false);
      return;
    }

    if (!isValidRowId(rowId)) {
      setError('Invalid row ID');
      setUpdateStatus('error');
      setIsUpdating(false);
      return;
    }

    try {
      // Create update object with just the field being updated
      const updateData = {};
      updateData[fieldName] = newValue;

      // Always log the update parameters for debugging
      console.log('Updating Supabase data:', {
        table: tableName,
        field: fieldName,
        value: newValue,
        idField: rowIdField,
        id: rowId
      });

      // First check if the record exists
      const { data: existingData, error: checkError } = await supabase
        .from(tableName)
        .select('*')
        .eq(rowIdField, rowId)
        .maybeSingle();

      if (checkError) {
        console.error(`Error checking if record exists:`, checkError);
        setError(`Error checking record: ${checkError.message}`);
        setUpdateStatus('error');
        setIsUpdating(false);
        return;
      }

      if (!existingData) {
        console.error(`Record not found with ${rowIdField} = ${rowId}`);
        setError(`Record not found with ${rowIdField} = ${rowId}`);
        setUpdateStatus('error');
        setIsUpdating(false);
        return;
      }

      // Record exists, proceed with update
      const { data, error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq(rowIdField, rowId);

      if (error) {
        console.error(`Error updating ${fieldName}:`, error);
        setError(error.message || 'Failed to update');
        setUpdateStatus('error');
        setIsUpdating(false);
        return;
      }
      
      // Log the response data
      console.log('Update response:', data);
      console.log(`Field ${fieldName} updated successfully to ${newValue}`);

      // Set success status, save time, and clear updating state
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSaveTime(timeString);
      setUpdateStatus('success');
      setIsUpdating(false);

      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate(fieldName, newValue);
      }
    } catch (error) {
      console.error('Error in updateSupabaseData:', error);
      setError(error.message || 'An unexpected error occurred');
      setUpdateStatus('error');
      setIsUpdating(false);
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout for the update
    timeoutRef.current = setTimeout(() => {
      // Only update if the value has changed
      if (newValue !== value) {
        updateSupabaseData(newValue);
      }
    }, debounceTime);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <input
        type={type}
        value={inputValue}
        onChange={handleChange}
        className={`${className} ${error ? 'border-red-500' : ''}`}
        {...inputProps}
      />
      
      {/* Status indicators */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
        {isUpdating && (
          <div 
            className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"
            title="Updating..."
          ></div>
        )}
        {updateStatus === 'success' && (
          <div title={`Save successful at ${lastSaveTime}`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-green-500" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {updateStatus === 'error' && (
          <div title={error}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-red-500" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
