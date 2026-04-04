import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [message, setMessage] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setDevOtpHint('');
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setMessage('');
      if (res.data._dev?.otp != null) {
        setDevOtpHint(`Dev: your code is ${res.data._dev.otp} (also in server log)`);
      }
      setStep('otp');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Something went wrong.');
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/api/auth/verify-reset-otp', { email, otp: otp.replace(/\D/g, '').slice(0, 6) });
      const token = res.data.resetToken;
      if (!token) {
        setMessage('Invalid response from server.');
        setLoading(false);
        return;
      }
      navigate(`/reset-password/${token}`);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Verification failed.');
    }
    setLoading(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#070816]'>
      {step === 'email' ? (
        <form
          className='w-full max-w-md border border-white/20 bg-white/8 text-white p-8 flex flex-col gap-6 rounded-2xl shadow-2xl backdrop-blur-xl'
          style={{ marginTop: 40 }}
          onSubmit={handleEmailSubmit}
        >
          <h2 className='font-medium text-2xl mb-2'>Forgot Password</h2>
          <p className='text-sm text-gray-400'>We&apos;ll send a 6-digit code to your email.</p>
          <label className='text-base mb-1'>Email</label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2 bg-transparent text-white'
            placeholder='Enter your email address'
          />
          <button
            type='submit'
            disabled={loading}
            className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed w-full'
          >
            {loading ? 'Sending...' : 'Send code'}
          </button>
          {message && <div className='mt-2 text-red-400 text-center text-sm'>{message}</div>}
        </form>
      ) : (
        <form
          className='w-full max-w-md border border-white/20 bg-white/8 text-white p-8 flex flex-col gap-6 rounded-2xl shadow-2xl backdrop-blur-xl'
          style={{ marginTop: 40 }}
          onSubmit={handleOtpSubmit}
        >
          <h2 className='font-medium text-2xl mb-2'>Enter code</h2>
          <p className='text-sm text-gray-400'>We sent a 6-digit code to {email}</p>
          {devOtpHint && (
            <div className='text-xs text-emerald-400/95 bg-emerald-950/40 border border-emerald-700/50 rounded-lg px-3 py-2'>{devOtpHint}</div>
          )}
          <label className='text-base mb-1'>Verification code</label>
          <input
            type='text'
            inputMode='numeric'
            autoComplete='one-time-code'
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2 bg-transparent text-white tracking-widest text-center text-lg'
            placeholder='000000'
          />
          <button
            type='submit'
            disabled={loading || otp.length !== 6}
            className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed w-full'
          >
            {loading ? 'Verifying...' : 'Verify & continue'}
          </button>
          <button
            type='button'
            className='text-sm text-violet-400 hover:underline'
            onClick={() => {
              setStep('email');
              setOtp('');
              setMessage('');
              setDevOtpHint('');
            }}
          >
            Use a different email
          </button>
          {message && <div className='mt-2 text-red-400 text-center text-sm'>{message}</div>}
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
