'use client';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { closeAuthMenu, setAuthId, setUserData } from '../../redux/MainSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../app/utils/supabase/client';

export default function AuthMenu() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [emailFromUrl, setEmailFromUrl] = useState('');
  const [passwordFromUrl, setPasswordFromUrl] = useState('');
  
  // Check for URL parameters on component mount
  useEffect(() => {
    const email = searchParams.get('email');
    const password = searchParams.get('password');
    
    if (email) {
      setEmailFromUrl(email);
    }
    
    if (password) {
      setPasswordFromUrl(password);
    }
  }, [searchParams]);

  const handleClose = () => {
    dispatch(closeAuthMenu());
  };

  // Helper function to determine if input is email or phone
  const isPhoneNumber = (input) => {
    // First check if it contains an @ symbol - if so, it's an email
    if (input.includes('@')) {
      return false;
    }
    
    // If no @ symbol, check if it's mostly digits
    // Remove common phone number formatting characters
    const digitsOnly = input.replace(/[\s()-+.]/g, '');
    
    // If it's at least 10 digits (standard US phone number length) and mostly numbers
    return digitsOnly.length >= 10 && /^[0-9]+$/.test(digitsOnly);
  };

  // Format phone number to E.164 format for Supabase
  const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If it's a US number without country code, add +1
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    // If it already has country code (11 digits starting with 1 for US)
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    // Otherwise, just add + (assuming it's already in international format)
    return `+${digits}`;
  };
  
  // Sign in with Email
  const signInWithEmail = async (email, password) => {
    console.log('Step 1: Starting sign in process with email');
    try {
      console.log('Step 2: Validating input');
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }
      
      console.log('Step 3: Attempting to sign in with email and password');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Step 4: Sign in error:', error.message);
        throw error;
      }
      
      console.log('Step 4: Sign in successful');
      console.log('Step 5: User data:', data.user);
      
      // Close auth menu and redirect to account page
      console.log('Step 6: Closing auth menu and redirecting to account page');
      dispatch(closeAuthMenu());
      router.push('/account');
      
      return data;
    } catch (error) {
      console.error('Sign in error:', error.message);
      setError(error.message);
      return null;
    }
  };
  
  // Sign in with Phone
  const signInWithPhone = async (phone, password) => {
    console.log('Step 1: Starting sign in process with phone');
    try {
      console.log('Step 2: Validating input');
      if (!phone || !password) {
        throw new Error('Please enter both phone number and password');
      }
      
      // Format phone number to E.164 format
      const formattedPhone = formatPhoneNumber(phone);
      console.log('Step 3: Formatted phone number:', formattedPhone);
      
      console.log('Step 4: Attempting to sign in with phone and password');
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: formattedPhone,
        password,
      });
      
      if (error) {
        console.error('Step 5: Sign in error:', error.message);
        throw error;
      }
      
      console.log('Step 5: Sign in successful');
      console.log('Step 6: Sign In data:', data.user);
      
      // Close auth menu and redirect to account page
      console.log('Step 7: Closing auth menu and redirecting to account page');
      dispatch(closeAuthMenu());
      router.push('/account');
      
      return data;
    } catch (error) {
      console.error('Sign in error:', error.message);
      setError(error.message);
      return null;
    }
  };
  
  // Sign in with either email or phone
  const signInWithSupabase = async (identifier, password) => {
    console.log('Step 1: Determining if identifier is email or phone');
    
    if (isPhoneNumber(identifier)) {
      console.log('Step 2: Identifier is a phone number');
      return signInWithPhone(identifier, password);
    } else {
      console.log('Step 2: Identifier is an email');
      return signInWithEmail(identifier, password);
    }
  };
  
  // Sign up with Email
  const signUpWithEmail = async (email, password, passwordConfirm) => {
    console.log('Step 1: Starting sign up process with email');
    try {
      console.log('Step 2: Validating input');
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }
      
      if (password !== passwordConfirm) {
        throw new Error('Passwords do not match');
      }
      
      console.log('Step 3: Attempting to sign up with email and password');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error('Step 4: Sign up error:', error.message);
        throw error;
      }
      
      console.log('Step 4: Sign up successful');
      console.log('Step 5: User data:', data.user);
      console.log('Step 6: Email confirmation status:', data.session ? 'No confirmation needed' : 'Confirmation email sent');
      
      // Create user record in the users table
      console.log('Step 7: Creating user record in database');
      try {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            { 
              auth_id: data.user.id,
              email: email,
              password: password,
              type: 'client',
              // created_at: new Date().toISOString()
            }
          ]);

        // Set the initial user data because it may not be in teh db by the time the page tries to load
        dispatch(setUserData({email: email}))
          
        if (insertError) {
          console.error('Error creating user record:', insertError);
        } else {
          console.log('User record created successfully');
        }
      } catch (dbError) {
        console.error('Database error creating user record:', dbError);
      }
      
      // Close auth menu and redirect to account page
      console.log('Step 8: Closing auth menu and redirecting to account page');
      dispatch(closeAuthMenu());
      router.push('/account');
      
      return data;
    } catch (error) {
      console.error('Sign up error:', error.message);
      setError(error.message);
      return null;
    }
  };
  
  // Sign up with Phone
  const signUpWithPhone = async (phone, password, passwordConfirm) => {
    console.log('Step 1: Starting sign up process with phone');
    try {
      console.log('Step 2: Validating input');
      if (!phone || !password) {
        throw new Error('Please fill in all fields');
      }
      
      if (password !== passwordConfirm) {
        throw new Error('Passwords do not match');
      }
      
      // Format phone number to E.164 format
      const formattedPhone = formatPhoneNumber(phone);
      console.log('Step 3: Formatted phone number:', formattedPhone);
      
      console.log('Step 4: Attempting to sign up with phone and password');
      const { data, error } = await supabase.auth.signUp({
        phone: formattedPhone,
        password,
      });
      
      if (error) {
        console.error('Step 5: Sign up error:', error.message);
        throw error;
      }
      
      console.log('Step 5: Sign up successful');
      console.log('Step 6: Sign Up data:', data.user);
      console.log('Step 7: Phone confirmation status:', data.session ? 'No confirmation needed' : 'Confirmation SMS sent');
      
      // Create user record in the users table
      console.log('Step 8: Creating user record in database');
      try {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            { 
              auth_id: data.user.id,
              phone: formattedPhone,
              type: 'client',
              created_at: new Date().toISOString()
            }
          ]);

          
        // Set the initial user data because it may not be in teh db by the time the page tries to load
        dispatch(setUserData({email: email}))
          
        if (insertError) {
          console.error('Error creating user record:', insertError);
        } else {
          console.log('User record created successfully');
        }
      } catch (dbError) {
        console.error('Database error creating user record:', dbError);
      }
      
      // Close auth menu and redirect to account page
      console.log('Step 9: Closing auth menu and redirecting to account page');
      dispatch(closeAuthMenu());
      router.push('/account');
      
      return data;
    } catch (error) {
      console.error('Sign up error:', error.message);
      setError(error.message);
      return null;
    }
  };
  
  // Sign up with either email or phone
  const signUpWithSupabase = async (identifier, password, passwordConfirm) => {
    console.log('Step 1: Determining if identifier is email or phone');
    
    if (isPhoneNumber(identifier)) {
      console.log('Step 2: Identifier is a phone number');
      return signUpWithPhone(identifier, password, passwordConfirm);
    } else {
      console.log('Step 2: Identifier is an email');
      return signUpWithEmail(identifier, password, passwordConfirm);
    }
  };

  const handleAuth = async () => {
    // Get input values using getElementById
    const identifier = document.getElementById('identifier').value;
    const password = document.getElementById('password').value;
    
    setError('');
    
    if (isLogin) {
      console.log('Login attempt initiated with identifier:', identifier);
      await signInWithSupabase(identifier, password);
    } else {
      const passwordConfirm = document.getElementById('passwordConfirm').value;
      console.log('Sign up attempt initiated with identifier:', identifier);
      await signUpWithSupabase(identifier, password, passwordConfirm);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-[95%] sm:w-[500px]">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="w-6"></div> {/* Empty div for spacing */}
          <h2 className="text-2xl font-bold text-center">{isLogin ? 'Log In' : 'Sign Up'}</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div>
          <div className="mb-4">
            <input
              type="text"
              id="identifier"
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email or Phone (ex: 123-456-7890)"
              defaultValue={emailFromUrl}
            />
          </div>
          
          <div className="mb-4">
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Password"
              defaultValue={passwordFromUrl}
            />
          </div>
          
          {!isLogin && (
            <div className="mb-4">
              <input
                type="password"
                id="passwordConfirm"
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password retype"
              />
            </div>
          )}
          
          {error && (
            <div className="mb-4 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          )}
          
          <div className="mb-2 text-center">
            <button
              type="button"
              onClick={() => console.log('Forgot password clicked')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          
          <div className="mb-4 text-center">
            <button 
              type="button" 
              onClick={toggleAuthMode} 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
            >
              {isLogin ? 'Need an account? Create account' : 'Already have an account? Log in'}
            </button>
          </div>
          
          <div className="flex flex-col">
            <button
              type="button"
              onClick={handleAuth}
              className="w-full bg-[rgb(87,187,191)] text-white py-3 px-4 rounded-md hover:bg-[rgb(67,167,171)] focus:outline-none focus:ring-2 focus:ring-[rgb(87,187,191)] focus:ring-offset-2 font-medium"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
