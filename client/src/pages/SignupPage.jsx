import React, { useContext, useState } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const SKILL_OPTIONS = [
    // Languages
    'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'TypeScript', 'PHP',
    // Frontend
    'React', 'Vue', 'Angular', 'Svelte', 'HTML/CSS',
    // Backend
    'Node.js', 'Express', 'Django', 'FastAPI', 'Spring',
    // Mobile
    'React Native', 'Flutter', 'Swift', 'Kotlin',
    // DevOps
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD',
    // Design
    'UI/UX Design', 'Figma', 'Adobe XD', 'Graphic Design',
    // Databases
    'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase',
    // Others
    'Machine Learning', 'Data Science', 'Marketing', 'Content Writing'
];

const LOOKING_FOR_OPTIONS = [
    'Find collaborators',
    'Mentor others',
    'Be mentored',
    'Learn new skill',
    'Build startup',
    'Open source',
    'Freelance'
];

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Expert'];

const SignupPage = () => {
    const { axios } = useContext(AuthContext);
    const [step, setStep] = useState(1); // 1-5
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recoveryCode, setRecoveryCode] = useState('');
    const [createdEmail, setCreatedEmail] = useState('');
    
    // Step 1: Basic Info
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [bio, setBio] = useState('');
    
    // Step 2: Skills
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [experienceLevel, setExperienceLevel] = useState('Beginner');
    
    // Step 3: Looking For
    const [lookingFor, setLookingFor] = useState([]);
    
    // Step 4: Portfolio Links
    const [portfolioLinks, setPortfolioLinks] = useState({
        github: '',
        linkedin: '',
        portfolio: '',
        behance: '',
        stackoverflow: '',
    });
    
    const handleSkillToggle = (skill) => {
        setSelectedSkills(prev => 
            prev.includes(skill) 
                ? prev.filter(s => s !== skill)
                : [...prev, skill].slice(-5) // Max 5 skills
        );
    };
    
    const handleLookingForToggle = (option) => {
        setLookingFor(prev =>
            prev.includes(option)
                ? prev.filter(o => o !== option)
                : [...prev, option]
        );
    };
    
    const handlePortfolioChange = (field, value) => {
        setPortfolioLinks(prev => ({ ...prev, [field]: value }));
    };
    
    const copyRecoveryCode = async () => {
        if (!recoveryCode) return;
        await navigator.clipboard.writeText(recoveryCode);
        toast.success('Recovery code copied');
    };
    
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const payload = {
                fullName,
                email,
                password,
                bio,
                skills: selectedSkills.map(skill => ({
                    name: skill,
                    proficiency: experienceLevel,
                    yearsOfExperience: 0
                })),
                experienceLevel,
                lookingFor,
                portfolioLinks: {
                    github: portfolioLinks.github || undefined,
                    linkedin: portfolioLinks.linkedin || undefined,
                    portfolio: portfolioLinks.portfolio || undefined,
                    behance: portfolioLinks.behance || undefined,
                    stackoverflow: portfolioLinks.stackoverflow || undefined,
                }
            };
            
            const { data } = await axios.post('/api/auth/signup', payload);
            
            if (data.success) {
                setRecoveryCode(data.recoveryCode || '');
                setCreatedEmail(email);
                setStep(5);
                toast.success('Account created. Save your recovery code.');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
        
        setIsSubmitting(false);
    };
    
    // Step 1: Basic Info
    if (step === 1 || (step === 1 && recoveryCode)) {
        return (
            <div className='min-h-screen px-4 py-8 flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
                <div className='flex flex-col items-center gap-3'>
                    <img src={assets.logo_icon} alt='' className='w-[min(30vw,250px)]' />
                    <p className='text-2xl font-semibold tracking-wide text-white'>NexChat</p>
                </div>
                <form className='w-full max-w-md border border-white/20 bg-white/8 text-white p-6 flex flex-col gap-6 rounded-2xl shadow-2xl backdrop-blur-xl'>
                    <div>
                        <h2 className='font-medium text-2xl'>Sign up</h2>
                        <p className='text-xs text-gray-400 mt-1'>Step {step} of 5</p>
                    </div>
                    <input
                        onChange={(e) => setFullName(e.target.value)}
                        value={fullName}
                        type='text'
                        className='p-2 border border-gray-500 rounded-md focus:outline-none text-white'
                        placeholder='Full Name'
                        required
                    />
                    <input
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        type='email'
                        placeholder='Email Address'
                        required
                        className='p-2 border border-gray-500 rounded-md focus:outline-none text-black'
                    />
                    <input
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        type='password'
                        placeholder='Password (min 6 chars)'
                        required
                        className='p-2 border border-gray-500 rounded-md focus:outline-none text-black'
                    />
                    <textarea
                        onChange={(e) => setBio(e.target.value)}
                        value={bio}
                        rows={4}
                        className='p-2 border border-gray-500 rounded-md focus:outline-none text-black'
                        placeholder='Short bio (what do you do?)'
                        required
                    ></textarea>
                    <button
                        type='button'
                        onClick={() => setStep(2)}
                        disabled={!fullName || !email || !password || !bio}
                        className='py-3 bg-linear-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
                    >
                        Next: Add Skills
                    </button>
                    <p className='text-sm text-gray-600'>
                        Already have an account?{' '}
                        <Link to='/login' className='font-medium text-violet-500'>Login</Link>
                    </p>
                </form>
            </div>
        );
    }
    
    // Step 2: Skills Selection
    if (step === 2) {
        return (
            <div className='min-h-screen px-4 py-8 flex items-center justify-center gap-8 max-sm:flex-col backdrop-blur-2xl'>
                <div className='flex flex-col items-center gap-3'>
                    <img src={assets.logo_icon} alt='' className='w-[min(30vw,250px)]' />
                    <p className='text-2xl font-semibold tracking-wide text-white'>Skills</p>
                </div>
                <form className='w-full max-w-md border border-white/20 bg-white/8 text-white p-6 flex flex-col gap-4 rounded-2xl shadow-2xl backdrop-blur-xl max-h-96 overflow-y-auto'>
                    <div>
                        <h2 className='font-medium text-xl'>Select Your Skills</h2>
                        <p className='text-xs text-gray-400 mt-1'>Step 2 of 5 - Pick up to 5 skills</p>
                    </div>
                    
                    <div>
                        <label className='text-sm text-gray-300 block mb-2'>Experience Level</label>
                        <select
                            value={experienceLevel}
                            onChange={(e) => setExperienceLevel(e.target.value)}
                            className='w-full p-2 border border-gray-500 rounded-md text-black'
                        >
                            {EXPERIENCE_LEVELS.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <p className='text-sm text-gray-300 mb-2'>
                            Selected: {selectedSkills.length}/5
                        </p>
                        <div className='flex flex-wrap gap-2'>
                            {SKILL_OPTIONS.map(skill => (
                                <button
                                    key={skill}
                                    type='button'
                                    onClick={() => handleSkillToggle(skill)}
                                    className={`px-3 py-1 rounded-full text-xs ${
                                        selectedSkills.includes(skill)
                                            ? 'bg-violet-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className='flex gap-2'>
                        <button
                            type='button'
                            onClick={() => setStep(1)}
                            className='flex-1 py-2 bg-gray-700 text-white rounded-md'
                        >
                            Back
                        </button>
                        <button
                            type='button'
                            onClick={() => setStep(3)}
                            disabled={selectedSkills.length === 0}
                            className='flex-1 py-2 bg-linear-to-r from-purple-400 to-violet-600 text-white rounded-md disabled:opacity-60'
                        >
                            Next
                        </button>
                    </div>
                </form>
            </div>
        );
    }
    
    // Step 3: Looking For
    if (step === 3) {
        return (
            <div className='min-h-screen px-4 py-8 flex items-center justify-center gap-8 max-sm:flex-col backdrop-blur-2xl'>
                <div className='flex flex-col items-center gap-3'>
                    <img src={assets.logo_icon} alt='' className='w-[min(30vw,250px)]' />
                    <p className='text-2xl font-semibold tracking-wide text-white'>Looking For</p>
                </div>
                <form className='w-full max-w-md border border-white/20 bg-white/8 text-white p-6 flex flex-col gap-4 rounded-2xl shadow-2xl backdrop-blur-xl'>
                    <div>
                        <h2 className='font-medium text-xl'>What are you looking for?</h2>
                        <p className='text-xs text-gray-400 mt-1'>Step 3 of 5 - Select all that apply</p>
                    </div>
                    
                    <div className='space-y-2'>
                        {LOOKING_FOR_OPTIONS.map(option => (
                            <label key={option} className='flex items-center gap-2 cursor-pointer'>
                                <input
                                    type='checkbox'
                                    checked={lookingFor.includes(option)}
                                    onChange={() => handleLookingForToggle(option)}
                                    className='w-4 h-4'
                                />
                                <span className='text-sm'>{option}</span>
                            </label>
                        ))}
                    </div>
                    
                    <div className='flex gap-2'>
                        <button
                            type='button'
                            onClick={() => setStep(2)}
                            className='flex-1 py-2 bg-gray-700 text-white rounded-md'
                        >
                            Back
                        </button>
                        <button
                            type='button'
                            onClick={() => setStep(4)}
                            disabled={lookingFor.length === 0}
                            className='flex-1 py-2 bg-linear-to-r from-purple-400 to-violet-600 text-white rounded-md disabled:opacity-60'
                        >
                            Next
                        </button>
                    </div>
                </form>
            </div>
        );
    }
    
    // Step 4: Portfolio Links
    if (step === 4) {
        return (
            <div className='min-h-screen px-4 py-8 flex items-center justify-center gap-8 max-sm:flex-col backdrop-blur-2xl'>
                <div className='flex flex-col items-center gap-3'>
                    <img src={assets.logo_icon} alt='' className='w-[min(30vw,250px)]' />
                    <p className='text-2xl font-semibold tracking-wide text-white'>Portfolio</p>
                </div>
                <form className='w-full max-w-md border border-white/20 bg-white/8 text-white p-6 flex flex-col gap-4 rounded-2xl shadow-2xl backdrop-blur-xl'>
                    <div>
                        <h2 className='font-medium text-xl'>Portfolio Links (Optional)</h2>
                        <p className='text-xs text-gray-400 mt-1'>Step 4 of 5</p>
                    </div>
                    
                    <input
                        type='url'
                        placeholder='GitHub Profile'
                        value={portfolioLinks.github}
                        onChange={(e) => handlePortfolioChange('github', e.target.value)}
                        className='p-2 border border-gray-500 rounded-md text-black text-sm'
                    />
                    <input
                        type='url'
                        placeholder='LinkedIn Profile'
                        value={portfolioLinks.linkedin}
                        onChange={(e) => handlePortfolioChange('linkedin', e.target.value)}
                        className='p-2 border border-gray-500 rounded-md text-black text-sm'
                    />
                    <input
                        type='url'
                        placeholder='Portfolio Website'
                        value={portfolioLinks.portfolio}
                        onChange={(e) => handlePortfolioChange('portfolio', e.target.value)}
                        className='p-2 border border-gray-500 rounded-md text-black text-sm'
                    />
                    <input
                        type='url'
                        placeholder='Behance (Designers)'
                        value={portfolioLinks.behance}
                        onChange={(e) => handlePortfolioChange('behance', e.target.value)}
                        className='p-2 border border-gray-500 rounded-md text-black text-sm'
                    />
                    <input
                        type='url'
                        placeholder='Stack Overflow (Developers)'
                        value={portfolioLinks.stackoverflow}
                        onChange={(e) => handlePortfolioChange('stackoverflow', e.target.value)}
                        className='p-2 border border-gray-500 rounded-md text-black text-sm'
                    />
                    
                    <div className='flex gap-2'>
                        <button
                            type='button'
                            onClick={() => setStep(3)}
                            className='flex-1 py-2 bg-gray-700 text-white rounded-md'
                        >
                            Back
                        </button>
                        <button
                            type='button'
                            onClick={onSubmitHandler}
                            disabled={isSubmitting}
                            className='flex-1 py-2 bg-linear-to-r from-purple-400 to-violet-600 text-white rounded-md disabled:opacity-60'
                        >
                            {isSubmitting ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }
    
    // Step 5: Recovery Code
    if (step === 5) {
        return (
            <div className='min-h-screen px-4 py-8 flex items-center justify-center gap-8 max-sm:flex-col backdrop-blur-2xl'>
                <div className='flex flex-col items-center gap-3'>
                    <img src={assets.logo_icon} alt='' className='w-[min(30vw,250px)]' />
                    <p className='text-2xl font-semibold tracking-wide text-white'>Recovery Code</p>
                </div>
                <div className='w-full max-w-md border border-white/20 bg-white/8 text-white p-6 flex flex-col gap-6 rounded-2xl shadow-2xl backdrop-blur-xl'>
                    <h2 className='font-medium text-2xl'>Save your recovery code</h2>
                    <p className='text-sm text-gray-300'>
                        This code is the only free, zero-email way to reset the password for {createdEmail}.
                    </p>
                    <div className='rounded-xl border border-emerald-500/30 bg-emerald-950/25 p-4 font-mono tracking-widest text-center text-lg break-all'>
                        {recoveryCode}
                    </div>
                    <div className='flex gap-3'>
                        <button 
                            onClick={copyRecoveryCode} 
                            type='button' 
                            className='flex-1 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700'
                        >
                            Copy code
                        </button>
                        <Link to='/login' className='flex-1 py-3 text-center bg-linear-to-r from-purple-400 to-violet-600 text-white rounded-md'>
                            Go to login
                        </Link>
                    </div>
                    <p className='text-xs text-gray-400'>
                        Keep this code safe. If you lose it, you will need to regenerate a new one while logged in.
                    </p>
                </div>
            </div>
        );
    }
};

export default SignupPage;