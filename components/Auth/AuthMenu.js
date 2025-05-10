'use client';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { closeAuthMenu, setUserId, setAccountData } from '../../redux/MainSlice';
import { useRouter } from 'next/navigation';
import supabase from '../../app/supabase/client';

// Helper function to check if input is an email
const isEmail = (input) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

// Helper function to format phone number for Supabase
const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Ensure it's a US number (add country code if needed)
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If it already has a country code (e.g. starts with 1)
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // Return as is with + prefix if it seems to already have a country code
  return `+${digits}`;
};

export default function AuthMenu() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleClose = () => {
    dispatch(closeAuthMenu());
  };

  // Create initial account data based on signup information
  const createInitialAccountData = (emailOrPhone, isEmailType) => {
    return {
      name: '',
      preferred_name: '',
      email: isEmailType ? emailOrPhone : '',
      phone: !isEmailType ? emailOrPhone : ''
    };
  };

  const handleAuth = async () => {
    // Get input values using getElementById
    const emailOrPhone = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    setError('');
    
    if (isLogin) {
      if (!emailOrPhone || !password) {
        setError('Please enter both email/phone and password');
        return;
      }

      try {
        let { data, error } = {};
        
        if (isEmail(emailOrPhone)) {
          // Sign in with email
          ({ data, error } = await supabase.auth.signInWithPassword({
            email: emailOrPhone,
            password: password
          }));
        } else {
          // Sign in with phone
          const formattedPhone = formatPhoneNumber(emailOrPhone);
          ({ data, error } = await supabase.auth.signInWithPassword({
            phone: formattedPhone,
            password: password
          }));
        }
        
        if (error) throw error;
        
        console.log('Login successful:', data.user);
        
        // Set user ID in Redux
        dispatch(setUserId(data.user.id));
        
        // Create initial account data based on login method
        const initialData = createInitialAccountData(emailOrPhone, isEmail(emailOrPhone));
        dispatch(setAccountData(initialData));
        
        // Close auth menu and redirect to account page
        dispatch(closeAuthMenu());
        router.push('/account');
      } catch (error) {
        console.error('Login error:', error);
        setError(error.message || 'Failed to sign in');
      }
    } else {
      const passwordConfirm = document.getElementById('passwordConfirm').value;
      
      if (!emailOrPhone || !password) {
        setError('Please fill in all fields');
        return;
      }
      
      if (password !== passwordConfirm) {
        setError('Passwords do not match');
        return;
      }

      try {
        let { data, error } = {};
        
        if (isEmail(emailOrPhone)) {
          // Sign up with email
          ({ data, error } = await supabase.auth.signUp({
            email: emailOrPhone,
            password: password
          }));
        } else {
          // Sign up with phone
          const formattedPhone = formatPhoneNumber(emailOrPhone);
          ({ data, error } = await supabase.auth.signUp({
            phone: formattedPhone,
            password: password
          }));
        }
        
        if (error) throw error;
        
        console.log('Signup successful:', data.user);
        
        // Create a new user in the users table with email/phone and password
        const userData = {
          auth_id: data.user.id,
          password: password, // Store password temporarily for recovery purposes
          created_at: new Date().toISOString()
        };
        
        // Add email or phone based on what was used for signup
        if (isEmail(emailOrPhone)) {
          userData.email = emailOrPhone;
        } else {
          userData.phone = formatPhoneNumber(emailOrPhone);
        }
        
        // Insert the user data into the users table
        const { error: insertError } = await supabase
          .from('users')
          .insert([userData]);
        
        if (insertError) {
          console.error('Error inserting user data:', insertError);
          // Continue anyway since auth was successful
        }
        
        // Set user ID in Redux
        dispatch(setUserId(data.user.id));
        
        // Create initial account data based on login method
        const initialData = createInitialAccountData(emailOrPhone, isEmail(emailOrPhone));
        dispatch(setAccountData(initialData));
        
        // Close auth menu and redirect to account page
        dispatch(closeAuthMenu());
        router.push('/account');
      } catch (error) {
        console.error('Signup error:', error);
        setError(error.message || 'Failed to sign up');
      }
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
              id="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email or Phone (ex: +15551234567)"
            />
          </div>
          
          <div className="mb-4">
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Password"
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
