import React, { useContext, useState } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';

const SignupPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login('signup', {
      fullName,
      email,
      password,
      bio,
    });
    setIsSubmitting(false);
  };

  return (
    <div className='min-h-screen px-4 py-8 flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      <img src={assets.logo_icon} alt='' className='w-[min(30vw,250px)]' />
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
    </div>
  );
};

export default SignupPage;
