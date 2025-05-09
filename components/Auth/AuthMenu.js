'use client';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { closeAuthMenu, setUserId, setAccountData } from '../../redux/MainSlice';
import { useRouter } from 'next/navigation';

export default function AuthMenu() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleClose = () => {
    dispatch(closeAuthMenu());
  };

  // Sample user data to be set when user logs in
  const sampleAccountData = {
    name: 'John Doe',
    preferredName: 'Johnny',
    email: 'user@example.com',
    phone: '(555) 123-4567'
  };

  const handleAuth = () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    setError('');
    
    if (isLogin) {
      console.log('Login attempt with:', { email, password });
      // Simple validation - in a real app, this would be a server call
      if (email && password) {
        console.log("hello")
        // Simulate successful login
        dispatch(setUserId('test'));
        dispatch(setAccountData(sampleAccountData));
        dispatch(closeAuthMenu());
        router.push('/account');
      } else {
        setError('Please enter both email and password');
      }
    } else {
      const passwordConfirm = document.getElementById('passwordConfirm').value;
      console.log('Sign up attempt with:', { email, password, passwordConfirm });
      
      // Simple validation - in a real app, this would be a server call
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }
      
      if (password !== passwordConfirm) {
        setError('Passwords do not match');
        return;
      }
      
      // Simulate successful signup
      dispatch(setUserId('test'));
      dispatch(closeAuthMenu());
      router.push('/account');
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
