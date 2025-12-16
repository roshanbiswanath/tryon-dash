import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addBusiness,
  selectAllBusinesses,
  setBusinesses,
} from './store/businessSlice';
import { PlusIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { API_BASE_URL } from './config';

type Business = {
  _id: string;
  businessName: string;
  businessEmail: string;
  businessCreated_at: string;
  businessAPIKey: string;
  businessPassword: string;
};

export default function HomePage() {
  const dispatch = useDispatch();
  const businesses = useSelector(selectAllBusinesses);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [obscuredKeys, setObscuredKeys] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      const fetchBusinesses = async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/v1/internal/getAllBusinesses`
          );
          if (!response.ok) {
            throw new Error('Failed to fetch businesses');
          }
          const data: Business[] = await response.json();
          dispatch(setBusinesses(data));
        } catch (err) {
          setError('Failed to fetch businesses. Please try again later.');
          console.error('Error fetching businesses:', err);
        }
      };

      fetchBusinesses();
    }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/internal/createBusiness`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessName: name,
            businessEmail: email,
            businessPassword: password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create business');
      }

      const newBusiness: Business = await response.json();
      dispatch(addBusiness(newBusiness));
      setName('');
      setEmail('');
      setPassword('');
      setIsModalOpen(false);
      alert(`New business created! API Key: ${newBusiness.businessAPIKey}`);
    } catch (err) {
      setError('Failed to create business. Please try again.');
      alert(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleObscure = (id: string) => {
    setObscuredKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold text-gray-800'>Dashboard</h1>
        <button
          type='button'
          onClick={() => setIsModalOpen(true)}
          className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
        >
          <PlusIcon className='inline-block mr-2 h-5 w-5' />
          Add Business
        </button>
      </div>
      {error && (
        <div
          className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'
          role='alert'
        >
          <strong className='font-bold'>Error!</strong>
          <span className='block sm:inline'> {error}</span>
        </div>
      )}
      <div className='bg-white shadow-xl rounded-lg overflow-hidden'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Business Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Email
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Created At
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                API Key
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {businesses.map((business) => (
              <tr
                key={business._id}
                className='hover:bg-gray-50 transition-colors duration-200'
              >
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  {business.businessName}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {business.businessEmail}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {new Date(business.businessCreated_at).toLocaleString()}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  <div className='flex items-center'>
                    <span className='mr-2 font-mono'>
                      {obscuredKeys[business._id]
                        ? business.businessAPIKey
                        : '•'.repeat(business.businessAPIKey.length)}
                    </span>
                    <button
                      onClick={() => toggleObscure(business._id)}
                      className='text-gray-400 hover:text-gray-600 focus:outline-none'
                    >
                      {obscuredKeys[business._id] ? (
                        <EyeOffIcon className='h-5 w-5' />
                      ) : (
                        <EyeIcon className='h-5 w-5' />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-xl max-w-md w-full'>
            <div className='p-6'>
              <h2 className='text-2xl font-bold mb-4 text-gray-800'>
                Add New Business
              </h2>
              <form
                onSubmit={handleSubmit}
                className='space-y-4'
              >
                <div>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Business Name
                  </label>
                  <input
                    id='name'
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                </div>
                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Email
                  </label>
                  <input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                </div>
                <div>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Password
                  </label>
                  <input
                    id='password'
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  />
                </div>
                <div className='flex justify-end space-x-3 mt-6'>
                  <button
                    type='button'
                    onClick={() => setIsModalOpen(false)}
                    className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={isLoading}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Creating...' : 'Create Business'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
