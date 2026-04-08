import React , { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast';

const SKILL_OPTIONS = [
  'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'TypeScript', 'PHP',
  'React', 'Vue', 'Angular', 'Svelte', 'HTML/CSS',
  'Node.js', 'Express', 'Django', 'FastAPI', 'Spring',
  'React Native', 'Flutter', 'Swift', 'Kotlin',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD',
  'UI/UX Design', 'Figma', 'Adobe XD', 'Graphic Design',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase',
  'Machine Learning', 'Data Science', 'Marketing', 'Content Writing'
];

const MAX_SKILLS = 5;

const ProfilePage = () => {
  const {authUser,updateProfile,updateSkillsProfile,isUpdatingProfile,generateRecoveryCode,isGeneratingRecoveryCode,axios} = useContext(AuthContext);
  const [selectedImage,setSelectedImage]= useState(null)
  const navigate = useNavigate();
  const [name,setName]= useState(authUser.fullName);
  const [bio,setBio]= useState(authUser.bio);
  const [previewUrl,setPreviewUrl] = useState(authUser?.profilePic || assets.avatar_icon);
  const [recoveryCode, setRecoveryCode] = useState('');
  // Skills update form
const [isEditingSkills, setIsEditingSkills] = useState(false);
const [tempSkills, setTempSkills] = useState(authUser?.skills || []);
const [tempLookingFor] = useState(authUser?.lookingFor || []);

  useEffect(() => {
    setTempSkills(authUser?.skills || []);
  }, [authUser]);

  useEffect(()=>{
    setName(authUser.fullName);
    setBio(authUser.bio);
    setPreviewUrl(authUser?.profilePic || assets.avatar_icon);
  },[authUser]);

  useEffect(()=>{
    if(!selectedImage){
      setPreviewUrl(authUser?.profilePic || assets.avatar_icon);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

    return ()=> URL.revokeObjectURL(objectUrl);
  },[selectedImage,authUser?.profilePic])

  const handleSubmit = async(e)=>{
    e.preventDefault();
    if(!selectedImage){
      const success = await updateProfile({fullName:name,bio});
      if(success) navigate("/")
        return;
    }
    const reader= new FileReader();
    reader.readAsDataURL(selectedImage);
    reader.onload= async()=>{
      const base64Image = reader.result;
      const success = await updateProfile({profilePic:base64Image,fullName:name,bio});
      if(success) navigate("/")
    }
  }

  const handleGenerateRecoveryCode = async () => {
    if (!window.confirm('Generate a new recovery code? The old one will stop working.')) return;
    const code = await generateRecoveryCode();
    if (code) {
      setRecoveryCode(code);
      toast.success('New recovery code generated. Save it now.');
    }
  };
  const handleUpdateSkills = async () => {
    try {
      const normalizedSkills = tempSkills.map((skill) => ({
        name: skill.name,
        proficiency: skill.proficiency || authUser?.experienceLevel || 'Beginner',
        yearsOfExperience: Number.isFinite(skill.yearsOfExperience) ? skill.yearsOfExperience : 0,
      }));

      const result = await updateSkillsProfile({
        skills: normalizedSkills,
            lookingFor: tempLookingFor,
        });

      if (result.success) {
        const usersRes = await axios.get('/api/messages/users');
        const matchedCount = usersRes.data?.users?.length || 0;
            toast.success('Skills updated');
        toast.success(`Found ${matchedCount} matching user${matchedCount === 1 ? '' : 's'}`);
            setIsEditingSkills(false);
        navigate('/');
      } else {
        toast.error(result.message || 'Unable to update skills');
        }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error updating skills');
    }
};

  const handleToggleSkill = (skillName) => {
    const alreadySelected = tempSkills.find((s) => s.name === skillName);

    if (alreadySelected) {
      setTempSkills(tempSkills.filter((s) => s.name !== skillName));
      return;
    }

    if (tempSkills.length >= MAX_SKILLS) {
      toast.error(`You can select up to ${MAX_SKILLS} skills`);
      return;
    }

    setTempSkills([
      ...tempSkills,
      {
        name: skillName,
        proficiency: authUser?.experienceLevel || 'Beginner',
        yearsOfExperience: 0,
      },
    ]);
  };

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center p-6'>
      <div className='w-full max-w-4xl flex flex-col gap-4'>
        <div className="backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-10 flex-1">
            <h3 className="text-lg">Profile Details</h3>
            <label htmlFor="avatar" className="flex items-center gap-3 cursor-pointer">
              <input onChange={(e) => setSelectedImage(e.target.files[0])} type="file" id="avatar" accept=".png,.jpg,.jpeg" hidden />
              <img src={previewUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
              upload profile pic
            </label>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              required
              placeholder='Your name'
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'
            />
            <textarea
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              placeholder='Write profile bio'
              required
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'
              rows={4}
            ></textarea>
            <button type="button" onClick={handleGenerateRecoveryCode} disabled={isGeneratingRecoveryCode} className='bg-white/10 text-white p-2 rounded-full text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'>
              {isGeneratingRecoveryCode ? 'Generating recovery code...' : 'Generate new recovery code'}
            </button>
            {recoveryCode && (
              <div className='rounded-lg border border-emerald-500/30 bg-emerald-950/25 p-3 text-sm font-mono tracking-widest break-all'>
                {recoveryCode}
              </div>
            )}
            <button type='submit' disabled={isUpdatingProfile} className='bg-linear-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'>
              {isUpdatingProfile ? 'Saving...' : 'Save'}
            </button>
          </form>
          <img className='max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 object-cover' src={previewUrl} alt="" />
        </div>

        <div className='p-4 bg-white/10 rounded-lg border border-gray-700'>
          <div className='flex items-center justify-between'>
            <h3 className='text-white font-semibold'>Skills</h3>
            {isEditingSkills ? (
              <button onClick={handleUpdateSkills} className='text-xs px-3 py-1 rounded bg-violet-600 text-white'>
                Update
              </button>
            ) : (
              <button onClick={() => setIsEditingSkills(true)} className='text-violet-400 text-sm'>
                Edit
              </button>
            )}
          </div>

          {isEditingSkills ? (
            <div className='mt-3'>
              <p className='text-xs text-gray-300 mb-2'>Selected: {tempSkills.length}/{MAX_SKILLS}</p>
              <div className='flex flex-wrap gap-2'>
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleToggleSkill(skill)}
                  className={`px-3 py-1 rounded text-xs ${
                    tempSkills.find((s) => s.name === skill)
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  {skill}
                </button>
              ))}
              </div>
            </div>
          ) : (
            <div className='flex flex-wrap gap-2 mt-3'>
              {(authUser?.skills || []).map((skill) => (
                <span key={skill.name} className='px-3 py-1 bg-violet-600 rounded-full text-xs text-white'>
                  {skill.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default ProfilePage