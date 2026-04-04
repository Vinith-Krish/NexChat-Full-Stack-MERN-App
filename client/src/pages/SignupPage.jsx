import React, { useContext, useState } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [createdEmail, setCreatedEmail] = useState('');
  const { axios } = useContext(AuthContext);

  const copyRecoveryCode = async () => {
    if (!recoveryCode) return;
    await navigator.clipboard.writeText(recoveryCode);
    toast.success('Recovery code copied');
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await axios.post('/api/auth/signup', {
        fullName,
        email,
        password,
        bio,
      });
      if (data.success) {
        setRecoveryCode(data.recoveryCode || '');
        setCreatedEmail(email);
        toast.success('Account created. Save your recovery code.');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className='min-h-screen px-4 py-8 flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      <img src={assets.logo_icon} alt='' className='w-[min(30vw,250px)]' />
      {recoveryCode ? (
        <div className='w-full max-w-md border border-white/20 bg-white/8 text-white p-6 flex flex-col gap-6 rounded-2xl shadow-2xl backdrop-blur-xl'>
          <h2 className='font-medium text-2xl'>Save your recovery code</h2>
          <p className='text-sm text-gray-300'>
            This code is the only free, zero-email way to reset the password for {createdEmail}.
          </p>
          <div className='rounded-xl border border-emerald-500/30 bg-emerald-950/25 p-4 font-mono tracking-widest text-center text-lg break-all'>
            {recoveryCode}
          </div>
          <div className='flex gap-3'>
            <button onClick={copyRecoveryCode} type='button' className='flex-1 py-3 bg-emerald-600 text-white rounded-md'>Copy code</button>
            <a href='/login' className='flex-1 py-3 text-center bg-linear-to-r from-purple-400 to-violet-600 text-white rounded-md'>Go to login</a>
          </div>
          <p className='text-xs text-gray-400'>
            Keep this code safe. If you lose it, you will need to regenerate a new one while logged in.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmitHandler} className='w-full max-w-md border border-white/20 bg-white/8 text-white p-6 flex flex-col gap-6 rounded-2xl shadow-2xl backdrop-blur-xl'>
          <h2 className='font-medium text-2xl'>Sign up</h2>
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type='text'
            className='p-2 border border-gray-500 rounded-md focus:outline-none'
            placeholder='Full Name'
            required
          />
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type='email'
            placeholder='Email Address'
            required
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type='password'
            placeholder='Password'
            required
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            placeholder='Provide a short bio'
            required
          ></textarea>
          <button
            type='submit'
            disabled={isSubmitting}
            className='py-3 bg-linear-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {isSubmitting ? 'Please wait...' : 'Create Account'}
          </button>
          <div className='flex items-center gap-2 text-sm text-gray-500'>
            <input type='checkbox' />
            <p>Agree to the terms of use & privacy policy</p>
          </div>
          <p className='text-sm text-gray-600'>
            Already have an account?{' '}
            <a href='/login' className='font-medium text-violet-500 cursor-pointer'>Login here</a>
          </p>
        </form>
      )}
    </div>
  );
};

export default SignupPage;
