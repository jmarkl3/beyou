'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../app/utils/supabase/client';

/**
 * InputSupabase - A component that updates Supabase when input changes
 * @param {Object} props
 * @param {string} props.table - The Supabase table to update
 * @param {string} props.attribute - The column/attribute to update
 * @param {string} props.identifier - The value to identify the record (e.g. auth_id value)
 * @param {string} props.identifierName - The column name for the identifier (defaults to 'id')
 * @param {function} props.onChange - Optional callback function when value changes
 * @param {string} props.initialValue - Initial value for the input
 * @param {string} props.placeholder - Placeholder text for the input
 * @param {string} props.className - Additional CSS classes for the input
 */
export default function InputSupabase({
  table,
  attribute,
  identifier,
  identifierName = 'id',
  onChange,
  initialValue = '',
  placeholder = '',
  className = '',
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
      console.error('InputSupabase: No table specified');
      return false;
    }
    if (!attribute) {
      console.error('InputSupabase: No attribute specified');
      return false;
    }
    if (!identifier) {
      console.error('InputSupabase: No identifier value specified');
      return false;
    }
    if (!identifierName) {
      console.error('InputSupabase: No identifierName specified');
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

      // Create a query condition with the identifier
      const query = {};
      query[identifierName] = identifier;

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

  // Status indicator styles
  const getStatusStyles = () => {
    switch (updateState) {
      case 'updating':
        return 'bg-yellow-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        ref={inputRef}
        defaultValue={initialValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full p-2 border rounded-md ${className}`}
      />
      <div 
        className={`ml-2 w-3 h-3 rounded-full ${getStatusStyles()}`}
        title={message}
      />
    </div>
  );
}
