import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';

const RecoverPassword = () => {
  const { axios } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/reset-password', {
        email,
        recoveryCode,
        password,
      });
      if (data.message) {
        toast.success(data.message);
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen px-4 py-8 flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      <img src={assets.logo_icon} alt='' className='w-[min(30vw,250px)]' />
      <form onSubmit={handleSubmit} className='w-full max-w-md border border-white/20 bg-white/8 text-white p-6 flex flex-col gap-6 rounded-2xl shadow-2xl backdrop-blur-xl'>
        <h2 className='font-medium text-2xl'>Reset with recovery code</h2>
        <p className='text-sm text-gray-400'>Enter your email, your recovery code, and your new password.</p>
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type='email'
          placeholder='Email Address'
          required
          className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
        />
        <input
          onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
          value={recoveryCode}
          type='text'
          placeholder='Recovery Code'
          required
          className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tracking-widest'
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type='password'
          placeholder='New Password'
          required
          className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
        />
        <input
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword}
          type='password'
          placeholder='Confirm New Password'
          required
          className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
        />
        <button
          type='submit'
          disabled={loading}
          className='py-3 bg-linear-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        <div className='flex flex-col gap-2 text-sm text-gray-500'>
          <p>If you are already signed in, you can generate a new recovery code from your profile page.</p>
          <p>Keep the code safe. It is the only free way to reset your password without email.</p>
        </div>
      </form>
    </div>
  );
};

export default RecoverPassword;