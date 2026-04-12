import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import assets from '../assets/assets';
import toast from 'react-hot-toast';

const SKILL_OPTIONS = [
    'JavaScript', 'Python', 'React', 'Node.js', 'UI/UX Design',
    'Docker', 'AWS', 'MongoDB', 'Machine Learning'
];

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Expert'];

const LOOKING_FOR_OPTIONS = [
    'Find collaborators',
    'Mentor others',
    'Be mentored',
    'Learn new skill',
    'Build startup',
    'Open source',
    'Freelance'
];

const CollaborationDiscovery = () => {
    const { axios } = useContext(AuthContext);
    const { selectedUser, setSelectedUser, setUnseenMessages } = useContext(ChatContext);
    const [discoveredUsers, setDiscoveredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false);
    const skillsDropdownRef = useRef(null);
    const [filters, setFilters] = useState({
        skills: [],
        experienceLevel: '',
        lookingFor: ''
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (skillsDropdownRef.current && !skillsDropdownRef.current.contains(event.target)) {
                setSkillsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const searchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.skills.length > 0) {
                params.append('skills', filters.skills.join(','));
            }
            if (filters.experienceLevel) {
                params.append('experienceLevel', filters.experienceLevel);
            }
            if (filters.lookingFor) {
                params.append('lookingFor', filters.lookingFor);
            }
            
            const { data } = await axios.get(`/api/auth/discover?${params}`);
            if (data.success) {
                setDiscoveredUsers(data.users);
            }
        } catch (error) {
            toast.error('Error discovering users'+error.message);
        }
        setLoading(false);
    };
    
    const toggleSkill = (skill) => {
        setFilters(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }));
    };
    
    return (
        <div className='p-4'>
            <h2 className='text-white text-xl font-bold mb-4'>Find Collaborators</h2>
            
            {/* Filters */}
            <div className='bg-white/5 p-4 rounded-lg mb-4'>
                <div className='mb-4' ref={skillsDropdownRef}>
                    <p className='text-xs text-gray-300 mb-2'>Skills</p>
                    <button
                        type='button'
                        onClick={() => setSkillsDropdownOpen(prev => !prev)}
                        className='w-full bg-gray-800 text-white rounded px-3 py-2 text-sm text-left flex items-center justify-between'
                    >
                        <span className='truncate'>
                            {filters.skills.length > 0
                                ? `${filters.skills.length} selected`
                                : 'Select one or more skills'}
                        </span>
                        <span className='text-xs text-gray-400'>{skillsDropdownOpen ? 'Close' : 'Open'}</span>
                    </button>

                    {skillsDropdownOpen && (
                        <div className='mt-2 bg-gray-900 border border-gray-700 rounded max-h-44 overflow-y-auto p-2 space-y-1'>
                            {SKILL_OPTIONS.map(skill => (
                                <label
                                    key={skill}
                                    className='flex items-center gap-2 text-sm text-gray-200 cursor-pointer px-1 py-1 hover:bg-white/5 rounded'
                                >
                                    <input
                                        type='checkbox'
                                        checked={filters.skills.includes(skill)}
                                        onChange={() => toggleSkill(skill)}
                                        className='accent-violet-600'
                                    />
                                    <span>{skill}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {filters.skills.length > 0 && (
                        <div className='flex flex-wrap gap-2 mt-2'>
                            {filters.skills.map(skill => (
                                <button
                                    key={skill}
                                    type='button'
                                    onClick={() => toggleSkill(skill)}
                                    className='px-2 py-1 rounded text-xs bg-violet-600/25 text-violet-200 border border-violet-500/40'
                                >
                                    {skill} x
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3'>
                    <select
                        value={filters.experienceLevel}
                        onChange={(e) => setFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
                        className='bg-gray-800 text-white rounded px-2 py-2 text-sm'
                    >
                        <option value=''>Any experience level</option>
                        {EXPERIENCE_LEVELS.map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>

                    <select
                        value={filters.lookingFor}
                        onChange={(e) => setFilters(prev => ({ ...prev, lookingFor: e.target.value }))}
                        className='bg-gray-800 text-white rounded px-2 py-2 text-sm'
                    >
                        <option value=''>Any goal</option>
                        {LOOKING_FOR_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={() => {
                        setFilters({ skills: [], experienceLevel: '', lookingFor: '' });
                        setDiscoveredUsers([]);
                    }}
                    className='w-full py-2 mb-2 bg-gray-700 text-white rounded'
                    type='button'
                >
                    Clear Filters
                </button>

                <button
                    onClick={searchUsers}
                    disabled={loading}
                    className='w-full py-2 bg-violet-600 text-white rounded disabled:opacity-50'
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>
            
            {/* Results */}
            <div className='space-y-2'>
                {discoveredUsers.map(user => (
                    <button
                        key={user._id}
                        type='button'
                        onClick={() => {
                            setSelectedUser(user);
                            setUnseenMessages(prev => ({ ...prev, [user._id]: 0 }));
                        }}
                        className={`w-full text-left bg-white/10 p-3 rounded-lg border transition ${selectedUser?._id === user._id ? 'border-violet-400 bg-violet-600/20' : 'border-transparent hover:border-violet-500/50'}`}
                    >
                        <div className='flex items-center gap-3 mb-2'>
                            <img
                                src={user.profilePic || assets.avatar_icon}
                                alt={user.fullName}
                                className='w-8 h-8 rounded-full'
                            />
                            <div className='flex-1'>
                                <p className='text-white font-semibold'>{user.fullName}</p>
                                <p className='text-xs text-gray-400'>{user.experienceLevel}</p>
                            </div>
                        </div>
                        <p className='text-xs text-gray-300 mb-2'>{user.bio}</p>
                        <div className='flex flex-wrap gap-1 mb-2'>
                            {user.skills?.slice(0, 3).map(skill => (
                                <span key={skill.name} className='text-xs bg-violet-600/30 px-2 py-1 rounded'>
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                        <p className='text-[11px] text-violet-200'>Click to open chat</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CollaborationDiscovery;