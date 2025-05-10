'use client';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { closeAuthMenu, setAuthId } from '../../redux/MainSlice';
import { useRouter } from 'next/navigation';
import { supabase } from '../../app/utils/supabase/client';

export default function AuthMenu() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleClose = () => {
    dispatch(closeAuthMenu());
  };

  // Sign in with Supabase
  const signInWithSupabase = async (email, password) => {
    console.log('Step 1: Starting sign in process with Supabase');
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
  
  // Sign up with Supabase
  const signUpWithSupabase = async (email, password, passwordConfirm) => {
    console.log('Step 1: Starting sign up process with Supabase');
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
      
      // Close auth menu and redirect to account page
      console.log('Step 7: Closing auth menu and redirecting to account page');
      dispatch(closeAuthMenu());
      router.push('/account');
      
      return data;
    } catch (error) {
      console.error('Sign up error:', error.message);
      setError(error.message);
      return null;
    }
  };

  const handleAuth = async () => {
    // Get input values using getElementById
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    setError('');
    
    if (isLogin) {
      console.log('Login attempt initiated with email:', email);
      await signInWithSupabase(email, password);
    } else {
      const passwordConfirm = document.getElementById('passwordConfirm').value;
      console.log('Sign up attempt initiated with email:', email);
      await signUpWithSupabase(email, password, passwordConfirm);
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
              type="email"
              id="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email"
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
