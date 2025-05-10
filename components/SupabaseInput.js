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
 * @param {string} props.rowId - The ID of the row to update
 * @param {string} props.rowIdField - The name of the ID field in the table (default: 'id')
 * @param {string} props.value - The current value of the input
 * @param {function} props.onUpdate - Callback function when update is successful
 * @param {string} props.type - Input type (text, email, tel, etc.)
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.debounceTime - Debounce time in milliseconds (default: 500)
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
  ...inputProps
}) {
  const [inputValue, setInputValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
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
    // Validate inputs
    if (!isValidIdentifier(tableName)) {
      setError('Invalid table name');
      return;
    }

    if (!isValidIdentifier(fieldName)) {
      setError('Invalid field name');
      return;
    }

    if (!isValidIdentifier(rowIdField)) {
      setError('Invalid row ID field name');
      return;
    }

    if (!isValidRowId(rowId)) {
      setError('Invalid row ID');
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      // Create update object with just the field being updated
      const updateData = {};
      updateData[fieldName] = newValue;

      // Update the field in the specified table
      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq(rowIdField, rowId);

      if (error) {
        console.error(`Error updating ${fieldName}:`, error);
        setError(error.message || 'Failed to update');
        return;
      }

      console.log(`Field ${fieldName} updated successfully to ${newValue}`);

      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate(fieldName, newValue);
      }
    } catch (error) {
      console.error('Error in updateSupabaseData:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
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
        className={`${className} ${isUpdating ? 'opacity-70' : ''} ${error ? 'border-red-500' : ''}`}
        disabled={isUpdating}
        {...inputProps}
      />
      {error && (
        <div className="text-red-500 text-xs mt-1">{error}</div>
      )}
      {isUpdating && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
