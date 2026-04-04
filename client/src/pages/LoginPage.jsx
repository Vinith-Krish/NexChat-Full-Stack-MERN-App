import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login('login', {
      email,
      password,
    });
    setIsSubmitting(false);
  };

  return (
    <div className='min-h-screen px-4 py-8 flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      <img src={assets.logo_icon} alt="" className="w-[min(30vw,250px)]" />

      <form onSubmit={onSubmitHandler} action="" className="w-full max-w-md border border-white/20 bg-white/8 text-white p-6 flex flex-col gap-6 rounded-2xl shadow-2xl backdrop-blur-xl">
        <h2 className="font-medium text-2xl">Login</h2>
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          placeholder='Email Address'
          required
          className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          placeholder='Password'
          required
          className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="text-right mt-1">
          <span onClick={() => navigate('/recover-password')} className="text-sm text-violet-400 hover:underline cursor-pointer">Reset with recovery code</span>
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className='py-3 bg-linear-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
        >
          {isSubmitting ? 'Please wait...' : 'Login Now'}
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className='text-sm text-gray-600'>
            Create an account{' '}
            <span onClick={() => navigate('/signup')} className='font-medium text-violet-500 cursor-pointer'>Click here</span>
          </p>
        </div>
      </form>
    </div>
  )
}

export default LoginPage