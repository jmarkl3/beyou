'use client';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUserId, setUserId } from '../../redux/MainSlice';
import { useRouter } from 'next/navigation';

// Account input fields configuration
const accountInputFields = [
  { key: 'name', label: 'Name' },
  { key: 'preferred_name', label: 'Preferred Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' }
];

// Sample user data
const sampleUserData = {
  name: 'John Doe',
  preferred_name: 'Johnny',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567'
};

export default function AccountPage() {
  const userId = useSelector(selectUserId);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(sampleUserData);

  // Redirect to home if not logged in
  useEffect(() => {
    if (!userId) {
      router.push('/');
    }
  }, [userId, router]);

  const handleLogout = () => {
    dispatch(setUserId(null));
    router.push('/');
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleSave = () => {
    // Here you would typically save the data to your backend
    // For now, we'll just exit edit mode
    setIsEditing(false);
  };

  if (!userId) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Account Information</h2>
          <button 
            onClick={()=>setIsEditing(!isEditing)} 
            className="text-blue-500 hover:text-blue-700 font-bold"
            aria-label={isEditing ? "Cancel editing" : "Edit account information"}
          >
            {isEditing ? "✕" : "✎"}
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600">User ID:</p>
          <p className="font-medium">{userId}</p>
        </div>
        
        {accountInputFields.map((field) => (
          <div className="mb-4" key={field.key}>
            <p className="text-gray-600">{field.label}:</p>
            {isEditing ? (
              <input
                type="text"
                name={field.key}
                value={userData[field.key]}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            ) : (
              <p className="font-medium">{userData[field.key]}</p>
            )}
          </div>
        ))}
        
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}