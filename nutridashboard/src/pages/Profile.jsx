import { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Calendar,
  Ruler,
  Scale,
  Target,
  Activity,
  AlertCircle,
  Save,
  Loader,
  Heart,
  Sparkles,
  TrendingUp,
  Apple,
  Shield,
  Flame,
  Plus,
  X,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    birthDate: '',
    gender: '',
    height: '',
    weight: '',
    targetWeight: '',
    activityLevel: 'moderate',
    medicalConditions: [],
    allergies: [],
    dietaryPreferences: 'normal',
    dailyCalorieGoal: ''
  });
  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await patientAPI.getProfile();
      const data = res.data.data;
      setProfile({
        birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
        gender: data.gender || '',
        height: data.height || '',
        weight: data.weight || '',
        targetWeight: data.targetWeight || '',
        activityLevel: data.activityLevel || 'moderate',
        medicalConditions: data.medicalConditions || [],
        allergies: data.allergies || [],
        dietaryPreferences: data.dietaryPreferences || 'normal',
        dailyCalorieGoal: data.dailyCalorieGoal || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await patientAPI.updateProfile(profile);
      await checkAuth();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setProfile({
        ...profile,
        medicalConditions: [...profile.medicalConditions, newCondition.trim()]
      });
      setNewCondition('');
    }
  };

  const removeCondition = (index) => {
    setProfile({
      ...profile,
      medicalConditions: profile.medicalConditions.filter((_, i) => i !== index)
    });
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setProfile({
        ...profile,
        allergies: [...profile.allergies, newAllergy.trim()]
      });
      setNewAllergy('');
    }
  };

  const removeAllergy = (index) => {
    setProfile({
      ...profile,
      allergies: profile.allergies.filter((_, i) => i !== index)
    });
  };

  // Calculate BMI
  const calculateBMI = () => {
    if (profile.height && profile.weight) {
      const heightM = profile.height / 100;
      return (profile.weight / (heightM * heightM)).toFixed(1);
    }
    return null;
  };

  const getBMIStatus = (bmi) => {
    if (!bmi) return { label: '-', color: 'gray' };
    if (bmi < 18.5) return { label: 'Underweight', color: 'blue' };
    if (bmi < 25) return { label: 'Normal', color: 'emerald' };
    if (bmi < 30) return { label: 'Overweight', color: 'orange' };
    return { label: 'Obese', color: 'red' };
  };

  const bmi = calculateBMI();
  const bmiStatus = getBMIStatus(parseFloat(bmi));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-200 rounded-full animate-spin border-t-emerald-500"></div>
            <Heart className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-4 text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-3xl p-8 text-white">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <Sparkles className="absolute top-6 right-10 w-6 h-6 text-white/30 animate-pulse" />
          <Heart className="absolute bottom-8 right-1/4 w-8 h-8 text-white/20" />
        </div>

        <div className="relative flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-2xl">
              <span className="text-4xl font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center shadow-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">{user?.name || 'User'}</h1>
            <p className="text-white/80 mb-3">{user?.email}</p>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl flex items-center gap-2">
                <Scale className="w-4 h-4" />
                <span className="text-sm">{profile.weight || '-'} kg</span>
              </div>
              <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                <span className="text-sm">{profile.height || '-'} cm</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* BMI Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className={`w-12 h-12 rounded-xl bg-${bmiStatus.color}-100 flex items-center justify-center mb-3`}>
            <TrendingUp className={`w-6 h-6 text-${bmiStatus.color}-500`} />
          </div>
          <p className="text-2xl font-bold text-gray-800">{bmi || '-'}</p>
          <p className="text-sm text-gray-500">BMI Index</p>
          <span className={`text-xs px-2 py-1 rounded-full bg-${bmiStatus.color}-100 text-${bmiStatus.color}-600 mt-2 inline-block`}>
            {bmiStatus.label}
          </span>
        </div>

        {/* Target Weight */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
            <Target className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{profile.targetWeight || '-'}</p>
          <p className="text-sm text-gray-500">Target Weight (kg)</p>
          {profile.weight && profile.targetWeight && (
            <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
              profile.weight > profile.targetWeight
                ? 'bg-orange-100 text-orange-600'
                : 'bg-emerald-100 text-emerald-600'
            }`}>
              {Math.abs(profile.weight - profile.targetWeight)} kg to {profile.weight > profile.targetWeight ? 'lose' : 'gain'}
            </span>
          )}
        </div>

        {/* Calorie Goal */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{profile.dailyCalorieGoal || '-'}</p>
          <p className="text-sm text-gray-500">Daily Calories</p>
        </div>

        {/* Activity Level */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center mb-3">
            <Activity className="w-6 h-6 text-teal-500" />
          </div>
          <p className="text-lg font-bold text-gray-800">
            {profile.activityLevel === 'sedentary' && 'Sedentary'}
            {profile.activityLevel === 'light' && 'Lightly Active'}
            {profile.activityLevel === 'moderate' && 'Moderately Active'}
            {profile.activityLevel === 'active' && 'Active'}
            {profile.activityLevel === 'very_active' && 'Very Active'}
          </p>
          <p className="text-sm text-gray-500">Activity Level</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                <Calendar className="w-4 h-4 inline mr-1 text-gray-400" />
                Date of Birth
              </label>
              <input
                type="date"
                name="birthDate"
                value={profile.birthDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Gender</label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* Physical Info Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Scale className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Physical Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                <Ruler className="w-4 h-4 inline mr-1 text-gray-400" />
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                value={profile.height}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                placeholder="175"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                <Scale className="w-4 h-4 inline mr-1 text-gray-400" />
                Current Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={profile.weight}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                placeholder="70"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                <Target className="w-4 h-4 inline mr-1 text-gray-400" />
                Target Weight (kg)
              </label>
              <input
                type="number"
                name="targetWeight"
                value={profile.targetWeight}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                placeholder="65"
              />
            </div>
          </div>
        </div>

        {/* Lifestyle Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Lifestyle</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Activity Level</label>
              <select
                name="activityLevel"
                value={profile.activityLevel}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white outline-none transition-all"
              >
                <option value="sedentary">Sedentary (No exercise)</option>
                <option value="light">Lightly Active (1-3 days/week)</option>
                <option value="moderate">Moderately Active (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very_active">Very Active (Professional athlete)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                <Apple className="w-4 h-4 inline mr-1 text-gray-400" />
                Dietary Preference
              </label>
              <select
                name="dietaryPreferences"
                value={profile.dietaryPreferences}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white outline-none transition-all"
              >
                <option value="normal">Regular</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
                <option value="low_carb">Low Carb</option>
                <option value="diabetic">Diabetic-Friendly</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                <Flame className="w-4 h-4 inline mr-1 text-gray-400" />
                Daily Calorie Goal
              </label>
              <input
                type="number"
                name="dailyCalorieGoal"
                value={profile.dailyCalorieGoal}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white outline-none transition-all"
                placeholder="2000"
              />
            </div>
          </div>
        </div>

        {/* Health Info Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Health Information</h2>
          </div>

          {/* Medical Conditions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-3">
              <AlertCircle className="w-4 h-4 inline mr-1 text-gray-400" />
              Medical Conditions
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white outline-none transition-all"
                placeholder="e.g., Type 2 Diabetes"
              />
              <button
                type="button"
                onClick={addCondition}
                className="px-5 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2 shadow-lg shadow-red-200"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.medicalConditions.map((condition, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 border border-red-100"
                >
                  {condition}
                  <button
                    type="button"
                    onClick={() => removeCondition(index)}
                    className="hover:bg-red-100 rounded-full p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
              {profile.medicalConditions.length === 0 && (
                <span className="text-gray-400 text-sm">No conditions added yet</span>
              )}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-3">Food Allergies</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none transition-all"
                placeholder="e.g., Lactose"
              />
              <button
                type="button"
                onClick={addAllergy}
                className="px-5 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-lg shadow-orange-200"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.allergies.map((allergy, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-sm flex items-center gap-2 border border-orange-100"
                >
                  {allergy}
                  <button
                    type="button"
                    onClick={() => removeAllergy(index)}
                    className="hover:bg-orange-100 rounded-full p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
              {profile.allergies.length === 0 && (
                <span className="text-gray-400 text-sm">No allergies added yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 active:scale-[0.98]"
        >
          {saving ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-6 h-6" />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Profile;
