import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import assets from '../assets/assets';
import toast from 'react-hot-toast';

const SKILL_OPTIONS = [
    'JavaScript', 'Python', 'React', 'Node.js', 'UI/UX Design',
    'Docker', 'AWS', 'MongoDB', 'Machine Learning'
];

const CollaborationDiscovery = () => {
    const { axios } = useContext(AuthContext);
    const [discoveredUsers, setDiscoveredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        skills: [],
        experienceLevel: '',
        lookingFor: ''
    });
    
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
    
    const handleSkillFilter = (skill) => {
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
                <div className='flex flex-wrap gap-2 mb-4'>
                    {SKILL_OPTIONS.map(skill => (
                        <button
                            key={skill}
                            onClick={() => handleSkillFilter(skill)}
                            className={`px-3 py-1 rounded text-xs ${
                                filters.skills.includes(skill)
                                    ? 'bg-violet-600 text-white'
                                    : 'bg-gray-700 text-gray-300'
                            }`}
                        >
                            {skill}
                        </button>
                    ))}
                </div>
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
                    <div key={user._id} className='bg-white/10 p-3 rounded-lg'>
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
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CollaborationDiscovery;