'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../app/utils/supabase/client';

/**
 * InputSupabase2 - A component that updates Supabase when input changes with enhanced UI
 * @param {Object} props
 * @param {string} props.table - The Supabase table to update
 * @param {string} props.attribute - The column/attribute to update
 * @param {string} props.identifier - The value to identify the record (e.g. auth_id value)
 * @param {string} props.identifierName - The column name for the identifier (defaults to 'id')
 * @param {function} props.onChange - Optional callback function when value changes
 * @param {string} props.initialValue - Initial value for the input
 * @param {string} props.placeholder - Placeholder text for the input
 * @param {string} props.className - Additional CSS classes for the input
 * @param {string} props.type - Input type (text, email, etc.)
 */
export default function InputSupabase2({
  table,
  attribute,
  identifier,
  identifierName = 'id',
  onChange,
  initialValue = '',
  placeholder = '',
  className = '',
  type = 'text',
  isTextarea = false,
  rows = 3,
  ...inputProps
}) {
  const [updateState, setUpdateState] = useState('idle'); // 'idle', 'updating', 'success', 'error'
  const [message, setMessage] = useState('');
  const timeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Validate parameters before updating
  const validateParams = () => {
    if (!table) {
      console.error('InputSupabase2: No table specified');
      return false;
    }
    if (!attribute) {
      console.error('InputSupabase2: No attribute specified');
      return false;
    }
    if (!identifier) {
      console.error('InputSupabase2: No identifier value specified');
      return false;
    }
    if (!identifierName) {
      console.error('InputSupabase2: No identifierName specified');
      return false;
    }
    return true;
  };

  // Update the database
  const updateDatabase = async (currentValue) => {
    if (!validateParams()) {
      setUpdateState('error');
      setMessage('Invalid parameters');
      return;
    }

    setUpdateState('updating');
    setMessage('Updating...');

    try {
      // Create an update object with the attribute as the key
      const updateData = {};
      updateData[attribute] = currentValue;

      // Update the record
      const { data, error } = await supabase
        .from(table)
        .update(updateData)
        .eq(identifierName, identifier)
        .select();

      if (error) {
        console.error('Error updating database:', error);
        setUpdateState('error');
        setMessage(`Error: ${error.message}`);
        return;
      }

      // Success
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      setUpdateState('success');
      setMessage(`Saved at ${timeString}`);
      console.log(`Updated ${table}.${attribute} for ${identifierName}=${identifier}:`, data);
      
    } catch (error) {
      console.error('Exception updating database:', error);
      setUpdateState('error');
      setMessage(`Error: ${error.message}`);
    }
  };

  // Handle input change with debounce
  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Call the onChange callback if provided
    if (onChange) {
      onChange(newValue);
    }

    // Reset the timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      updateDatabase(newValue);
    }, 500); // 500ms debounce
  };

  return (
    <div className="relative">
      {isTextarea ? (
        <textarea
          ref={inputRef}
          defaultValue={initialValue}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          className={`w-full p-2 border rounded-md ${className} ${updateState === 'error' ? 'border-red-500' : ''}`}
          {...inputProps}
        />
      ) : (
        <input
          ref={inputRef}
          type={type}
          defaultValue={initialValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full p-2 border rounded-md ${className} ${updateState === 'error' ? 'border-red-500' : ''}`}
          {...inputProps}
        />
      )}
      
      {/* Status indicators - positioned at top-right for textarea, center-right for input */}
      <div className={`absolute right-2 ${isTextarea ? 'top-2' : 'top-1/2 transform -translate-y-1/2'}`}>
        {updateState === 'updating' && (
          <div 
            className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"
            title="Updating..."
          ></div>
        )}
        {updateState === 'success' && (
          <div title={message}>
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
        {updateState === 'error' && (
          <div title={message}>
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
