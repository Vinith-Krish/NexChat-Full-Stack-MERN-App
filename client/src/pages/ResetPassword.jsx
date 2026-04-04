import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/reset-password', { token, password });
      setMessage(res.data.message);
      if (res.data.message && res.data.message.includes('successful')) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error resetting password.');
    }
    setLoading(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#070816]'>
      <form className='w-full max-w-md border border-white/20 bg-white/8 text-white p-8 flex flex-col gap-6 rounded-2xl shadow-2xl backdrop-blur-xl' style={{marginTop: 40}} onSubmit={handleSubmit}>
        <h2 className='font-medium text-2xl mb-2'>Reset Password</h2>
        <label className='text-base mb-1'>New Password:</label>
        <input
          type='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2 bg-transparent text-white'
          placeholder='Enter new password'
        />
        <label className='text-base mb-1'>Confirm Password:</label>
        <input
          type='password'
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2 bg-transparent text-white'
          placeholder='Confirm new password'
        />
        <button
          type='submit'
          disabled={loading}
          className='py-3 bg-linear-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed w-full'
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        {message && <div className='mt-2 text-red-400 text-center'>{message}</div>}
      </form>
    </div>
  );
};

export default ResetPassword;
