import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Scale,
  Ruler,
  Target,
  Utensils,
  TestTube,
  MessageCircle,
  Plus,
  Droplets,
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [waterGlasses, setWaterGlasses] = useState(0);

  // User's personal data - empty by default, user adds their own
  const userData = user?.healthData || {
    weight: null,
    height: null,
    targetWeight: null
  };

  // Calculate BMI if weight and height are available
  const calculateBMI = () => {
    if (!userData.weight || !userData.height) return null;
    const heightInMeters = userData.height / 100;
    return (userData.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const bmi = calculateBMI();

  const getBmiStatus = (bmi) => {
    if (!bmi) return { text: 'Not set', color: 'gray' };
    if (bmi < 18.5) return { text: 'Underweight', color: 'yellow' };
    if (bmi < 25) return { text: 'Normal', color: 'green' };
    if (bmi < 30) return { text: 'Overweight', color: 'orange' };
    return { text: 'Obese', color: 'red' };
  };

  const bmiStatus = getBmiStatus(bmi);

  const quickActions = [
    { to: '/nutrition', icon: Utensils, label: 'Log Meal', color: 'bg-emerald-500' },
    { to: '/lab-tests', icon: TestTube, label: 'Lab Results', color: 'bg-purple-500' },
    { to: '/chat', icon: MessageCircle, label: 'AI Chat', color: 'bg-blue-500' },
    { to: '/profile', icon: Plus, label: 'Add Data', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-emerald-500 rounded-2xl p-5 text-white">
        <p className="text-emerald-100 text-sm">Welcome back</p>
        <h1 className="text-2xl font-bold mt-1">
          {user?.firstName || user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-emerald-100 text-sm mt-2">
          Track your health and nutrition
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-100"
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-600 text-center">{action.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Scale className="w-5 h-5" />}
          label="Weight"
          value={userData.weight || '--'}
          unit="kg"
          color="blue"
        />
        <StatCard
          icon={<Ruler className="w-5 h-5" />}
          label="Height"
          value={userData.height || '--'}
          unit="cm"
          color="purple"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="BMI"
          value={bmi || '--'}
          unit={bmiStatus.text}
          color={bmiStatus.color}
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Goal"
          value={userData.targetWeight || '--'}
          unit="kg"
          color="emerald"
        />
      </div>

      {/* Water Tracker */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-gray-800">Water Intake</span>
          </div>
          <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
            {waterGlasses}/8
          </span>
        </div>
        <div className="flex gap-2">
          {[1,2,3,4,5,6,7,8].map(i => (
            <button
              key={i}
              onClick={() => setWaterGlasses(i)}
              className={`flex-1 h-10 rounded-lg transition-all ${
                i <= waterGlasses
                  ? 'bg-blue-500'
                  : 'bg-white border border-blue-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Empty State - Encourage user to add data */}
      {!userData.weight && (
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <h3 className="font-semibold text-gray-800 mb-2">Get Started</h3>
          <p className="text-sm text-gray-600 mb-4">
            Add your health data to get personalized insights and track your progress.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-medium text-sm"
          >
            Add Your Data
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Recent Activity - Empty by default */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">Recent Activity</h3>
        <div className="text-center py-8 text-gray-400">
          <Utensils className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No meals logged yet</p>
          <Link to="/nutrition" className="text-emerald-600 text-sm font-medium mt-2 inline-block">
            Log your first meal
          </Link>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, unit, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    gray: 'bg-gray-50 text-gray-600'
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-xl font-bold text-gray-800">{value}</span>
        <span className="text-xs text-gray-400">{unit}</span>
      </div>
    </div>
  );
};

export default Dashboard;
