import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Activity,
  Target,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Droplets,
  Footprints,
  Moon,
  Award,
  Star,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

// Sample data
const weightData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
  datasets: [
    {
      label: 'Weight (kg)',
      data: [85, 84.2, 83.8, 83.1, 82.5, 82.0, 81.3, 80.8],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgb(16, 185, 129)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6
    }
  ]
};

const calorieData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Consumed',
      data: [1850, 2100, 1920, 1780, 2200, 2400, 1950],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
      borderRadius: 8
    },
    {
      label: 'Goal',
      data: [2000, 2000, 2000, 2000, 2000, 2000, 2000],
      backgroundColor: 'rgba(156, 163, 175, 0.3)',
      borderRadius: 8
    }
  ]
};

const macroData = {
  labels: ['Protein', 'Carbs', 'Fat'],
  datasets: [
    {
      data: [32, 48, 20],
      backgroundColor: [
        'rgba(239, 68, 68, 0.9)',
        'rgba(59, 130, 246, 0.9)',
        'rgba(250, 204, 21, 0.9)'
      ],
      borderWidth: 0
    }
  ]
};

const activityData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Steps',
      data: [8500, 12000, 6800, 9200, 11000, 15000, 7500],
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4
    }
  ]
};

const Progress = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [currentWeek, setCurrentWeek] = useState('Dec 23 - Dec 29');

  const stats = {
    weightLost: 4.2,
    avgCalories: 2028,
    avgSteps: 10000,
    streakDays: 14,
    goalProgress: 67,
    waterAvg: 7.2
  };

  return (
    <motion.div
      className="space-y-6 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        className="relative rounded-3xl overflow-hidden"
        variants={itemVariants}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="relative z-10 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Progress Tracker</h1>
              <p className="text-purple-100">Monitor your health journey</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center justify-between">
            <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1">
              {['week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    timeRange === range
                      ? 'bg-white text-purple-600'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <button className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <span className="text-white font-medium px-2">{currentWeek}</span>
              <button className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        <StatCard
          icon={<Scale className="w-6 h-6" />}
          label="Weight Lost"
          value={stats.weightLost}
          unit="kg"
          trend="down"
          color="emerald"
        />
        <StatCard
          icon={<Flame className="w-6 h-6" />}
          label="Avg Calories"
          value={stats.avgCalories}
          unit="kcal"
          trend="stable"
          color="orange"
        />
        <StatCard
          icon={<Footprints className="w-6 h-6" />}
          label="Avg Steps"
          value={(stats.avgSteps / 1000).toFixed(1)}
          unit="k/day"
          trend="up"
          color="indigo"
        />
        <StatCard
          icon={<Award className="w-6 h-6" />}
          label="Streak"
          value={stats.streakDays}
          unit="days"
          trend="up"
          color="amber"
        />
      </motion.div>

      {/* Goal Progress */}
      <motion.div
        className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
        variants={itemVariants}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            Goal Progress
          </h3>
          <span className="text-sm font-medium text-gray-500">Target: 75 kg</span>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">85 kg</span>
              <span className="text-emerald-600 font-medium">80.8 kg</span>
              <span className="text-gray-600">75 kg</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${stats.goalProgress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats.goalProgress}% complete • 4.2 kg remaining
            </p>
          </div>

          <div className="text-center px-8 py-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
            <p className="text-4xl font-bold text-emerald-600">{stats.goalProgress}%</p>
            <p className="text-sm text-gray-500">Goal Progress</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weight Chart - Main */}
        <motion.div
          className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                <Scale className="w-5 h-5 text-white" />
              </div>
              Weight Trend
            </h3>
            <div className="flex items-center gap-2 text-emerald-600">
              <ArrowDownRight className="w-5 h-5" />
              <span className="font-medium">-4.2 kg this period</span>
            </div>
          </div>

          <div className="h-72">
            <Line
              data={weightData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(0,0,0,0.03)' },
                    ticks: { color: '#9ca3af' }
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af' }
                  }
                }
              }}
            />
          </div>
        </motion.div>

        {/* Macro Distribution */}
        <motion.div
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
          variants={itemVariants}
        >
          <h3 className="text-lg font-bold text-gray-800 mb-6">Macro Avg</h3>

          <div className="flex items-center justify-center mb-6">
            <div className="w-40 h-40">
              <Doughnut
                data={macroData}
                options={{
                  plugins: { legend: { display: false } },
                  cutout: '70%'
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <MacroBar label="Protein" value={32} color="red" />
            <MacroBar label="Carbs" value={48} color="blue" />
            <MacroBar label="Fat" value={20} color="yellow" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calorie Comparison */}
        <motion.div
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-200">
                <Flame className="w-5 h-5 text-white" />
              </div>
              Calorie Tracking
            </h3>
          </div>

          <div className="h-64">
            <Bar
              data={calorieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                      usePointStyle: true,
                      boxWidth: 8
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.03)' },
                    ticks: { color: '#9ca3af' }
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af' }
                  }
                }
              }}
            />
          </div>
        </motion.div>

        {/* Activity Chart */}
        <motion.div
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Footprints className="w-5 h-5 text-white" />
              </div>
              Step Count
            </h3>
            <div className="flex items-center gap-2 text-indigo-600">
              <ArrowUpRight className="w-5 h-5" />
              <span className="font-medium">+12% vs last week</span>
            </div>
          </div>

          <div className="h-64">
            <Line
              data={activityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.03)' },
                    ticks: { color: '#9ca3af' }
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af' }
                  }
                }
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Water Intake */}
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 border border-blue-100"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-200">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Hydration</h3>
              <p className="text-sm text-gray-500">Weekly average</p>
            </div>
          </div>

          <div className="text-center py-4">
            <p className="text-5xl font-bold text-blue-600">{stats.waterAvg}</p>
            <p className="text-gray-500">glasses/day</p>
          </div>

          <div className="flex justify-between mt-4 text-sm">
            <span className="text-gray-500">Goal: 8 glasses</span>
            <span className="text-blue-600 font-medium">90% achieved</span>
          </div>
        </motion.div>

        {/* Sleep */}
        <motion.div
          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Sleep Quality</h3>
              <p className="text-sm text-gray-500">Weekly average</p>
            </div>
          </div>

          <div className="text-center py-4">
            <p className="text-5xl font-bold text-indigo-600">7.2</p>
            <p className="text-gray-500">hours/night</p>
          </div>

          <div className="flex justify-between mt-4 text-sm">
            <span className="text-gray-500">Goal: 8 hours</span>
            <span className="text-indigo-600 font-medium">Good</span>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-100"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Achievements</h3>
              <p className="text-sm text-gray-500">This period</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <Achievement icon="🔥" text="14-day streak" />
            <Achievement icon="🎯" text="Hit calorie goal 5x" />
            <Achievement icon="💪" text="Lost 4+ kg" />
            <Achievement icon="💧" text="Hydration master" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value, unit, trend, color }) => {
  const colorClasses = {
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-200',
    orange: 'from-orange-500 to-amber-600 shadow-orange-200',
    indigo: 'from-indigo-500 to-purple-600 shadow-indigo-200',
    amber: 'from-amber-500 to-orange-600 shadow-amber-200'
  };

  const trendColors = {
    up: 'text-emerald-600 bg-emerald-100',
    down: 'text-emerald-600 bg-emerald-100',
    stable: 'text-gray-600 bg-gray-100'
  };

  const trendIcons = {
    up: <TrendingUp className="w-4 h-4" />,
    down: <TrendingDown className="w-4 h-4" />,
    stable: <Activity className="w-4 h-4" />
  };

  return (
    <motion.div
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
      whileHover={{ y: -2, boxShadow: '0 10px 40px -15px rgba(0,0,0,0.1)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${trendColors[trend]}`}>
          {trendIcons[trend]}
        </div>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-400">{unit}</p>
      </div>
    </motion.div>
  );
};

const MacroBar = ({ label, value, color }) => {
  const colorClasses = {
    red: 'from-red-400 to-rose-500',
    blue: 'from-blue-400 to-indigo-500',
    yellow: 'from-amber-400 to-yellow-500'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-sm font-bold text-gray-800">{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1 }}
        />
      </div>
    </div>
  );
};

const Achievement = ({ icon, text }) => (
  <div className="flex items-center gap-3 p-2 bg-white/50 rounded-xl">
    <span className="text-xl">{icon}</span>
    <span className="text-sm font-medium text-gray-700">{text}</span>
  </div>
);

export default Progress;
