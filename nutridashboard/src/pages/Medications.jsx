import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill,
  Plus,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Sparkles,
  ChevronRight,
  Calendar,
  Bell,
  Trash2,
  Edit3,
  Filter,
  Sun,
  Sunset,
  Moon,
  Coffee
} from 'lucide-react';

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

// Sample medications data
const sampleMedications = [
  {
    id: 1,
    name: 'Vitamin D3',
    dosage: '2000 IU',
    frequency: 'Once daily',
    time: 'Morning',
    type: 'supplement',
    color: 'amber',
    icon: '☀️',
    taken: true
  },
  {
    id: 2,
    name: 'Omega-3 Fish Oil',
    dosage: '1000mg',
    frequency: 'Twice daily',
    time: 'Morning & Evening',
    type: 'supplement',
    color: 'blue',
    icon: '🐟',
    taken: true
  },
  {
    id: 3,
    name: 'Multivitamin',
    dosage: '1 tablet',
    frequency: 'Once daily',
    time: 'With breakfast',
    type: 'supplement',
    color: 'emerald',
    icon: '💊',
    taken: false
  },
  {
    id: 4,
    name: 'Magnesium',
    dosage: '400mg',
    frequency: 'Once daily',
    time: 'Before bed',
    type: 'supplement',
    color: 'purple',
    icon: '🌙',
    taken: false
  },
  {
    id: 5,
    name: 'Probiotics',
    dosage: '10B CFU',
    frequency: 'Once daily',
    time: 'Morning (empty stomach)',
    type: 'supplement',
    color: 'green',
    icon: '🦠',
    taken: true
  }
];

// Sample interactions data
const sampleInteractions = [
  {
    id: 1,
    severity: 'warning',
    medications: ['Vitamin D3', 'Calcium'],
    message: 'Take together for better absorption. Vitamin D helps calcium absorption.',
    recommendation: 'Consider taking with a meal containing healthy fats.'
  },
  {
    id: 2,
    severity: 'info',
    medications: ['Omega-3', 'Vitamin E'],
    message: 'May enhance blood-thinning effects when combined.',
    recommendation: 'Monitor if taking blood thinners. Consult doctor if concerned.'
  }
];

const Medications = () => {
  const [medications, setMedications] = useState(sampleMedications);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [checkingInteraction, setCheckingInteraction] = useState(false);

  const toggleTaken = (id) => {
    setMedications(meds =>
      meds.map(med =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && !med.taken;
    if (activeTab === 'taken') return matchesSearch && med.taken;
    return matchesSearch;
  });

  const takenCount = medications.filter(m => m.taken).length;
  const pendingCount = medications.filter(m => !m.taken).length;

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
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600" />
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="relative z-10 p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Pill className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Medications & Supplements</h1>
              <p className="text-rose-100">Track your daily medications and check interactions</p>
            </div>
          </div>

          {/* Today's Progress */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center">
              <p className="text-4xl font-bold text-white">{medications.length}</p>
              <p className="text-rose-100 text-sm">Total Items</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center">
              <p className="text-4xl font-bold text-emerald-300">{takenCount}</p>
              <p className="text-rose-100 text-sm">Taken Today</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center">
              <p className="text-4xl font-bold text-amber-300">{pendingCount}</p>
              <p className="text-rose-100 text-sm">Pending</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        className="flex flex-col md:flex-row gap-4"
        variants={itemVariants}
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search medications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-rose-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('taken')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'taken'
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Taken
          </button>
        </div>
        <motion.button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-medium shadow-lg shadow-rose-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Add New
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medications List */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Today's Schedule</h2>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {filteredMedications.map((med, index) => (
              <MedicationCard
                key={med.id}
                medication={med}
                onToggle={() => toggleTaken(med.id)}
                index={index}
              />
            ))}
          </AnimatePresence>

          {filteredMedications.length === 0 && (
            <motion.div
              className="text-center py-12 bg-white rounded-2xl border border-gray-100"
              variants={itemVariants}
            >
              <Pill className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No medications found</p>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Interaction Checker */}
          <motion.div
            className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-6 border border-purple-100"
            variants={itemVariants}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">AI Interaction Check</h3>
                <p className="text-sm text-gray-500">Analyze drug interactions</p>
              </div>
            </div>

            <motion.button
              onClick={() => setCheckingInteraction(true)}
              className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={checkingInteraction}
            >
              {checkingInteraction ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  Check Interactions
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Known Interactions */}
          <motion.div
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
            variants={itemVariants}
          >
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Known Interactions
            </h3>

            <div className="space-y-4">
              {sampleInteractions.map((interaction) => (
                <InteractionCard key={interaction.id} interaction={interaction} />
              ))}
            </div>
          </motion.div>

          {/* Schedule Overview */}
          <motion.div
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
            variants={itemVariants}
          >
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Daily Schedule
            </h3>

            <div className="space-y-3">
              <TimeSlot
                icon={<Sun className="w-5 h-5" />}
                time="Morning"
                count={medications.filter(m => m.time.includes('Morning')).length}
                color="amber"
              />
              <TimeSlot
                icon={<Coffee className="w-5 h-5" />}
                time="With Meals"
                count={medications.filter(m => m.time.includes('breakfast') || m.time.includes('meal')).length}
                color="orange"
              />
              <TimeSlot
                icon={<Sunset className="w-5 h-5" />}
                time="Evening"
                count={medications.filter(m => m.time.includes('Evening')).length}
                color="rose"
              />
              <TimeSlot
                icon={<Moon className="w-5 h-5" />}
                time="Before Bed"
                count={medications.filter(m => m.time.includes('bed')).length}
                color="purple"
              />
            </div>
          </motion.div>

          {/* Reminders */}
          <motion.div
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-100"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-gray-800">Reminders</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Get notified when it's time to take your medications.
            </p>
            <button className="w-full py-3 bg-white text-amber-600 rounded-xl font-medium border border-amber-200 hover:bg-amber-50 transition-colors">
              Set Up Reminders
            </button>
          </motion.div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddMedicationModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MedicationCard = ({ medication, onToggle, index }) => {
  const colorClasses = {
    amber: 'from-amber-400 to-orange-500 shadow-amber-200',
    blue: 'from-blue-400 to-cyan-500 shadow-blue-200',
    emerald: 'from-emerald-400 to-teal-500 shadow-emerald-200',
    purple: 'from-purple-400 to-violet-500 shadow-purple-200',
    green: 'from-green-400 to-emerald-500 shadow-green-200',
    rose: 'from-rose-400 to-pink-500 shadow-rose-200'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all ${
        medication.taken ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <motion.button
          onClick={onToggle}
          className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
            medication.taken
              ? 'bg-emerald-100'
              : `bg-gradient-to-br ${colorClasses[medication.color]} shadow-lg`
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {medication.taken ? (
            <CheckCircle className="w-7 h-7 text-emerald-500" />
          ) : (
            medication.icon
          )}
        </motion.button>

        <div className="flex-1">
          <h3 className={`font-semibold text-gray-800 ${medication.taken ? 'line-through text-gray-400' : ''}`}>
            {medication.name}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span>{medication.dosage}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{medication.frequency}</span>
          </div>
        </div>

        <div className="text-right">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            medication.taken
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            <Clock className="w-3 h-3" />
            {medication.time}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Edit3 className="w-4 h-4" />
          </motion.button>
          <motion.button
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const InteractionCard = ({ interaction }) => {
  const severityColors = {
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    danger: 'bg-red-50 border-red-200 text-red-800'
  };

  const severityIcons = {
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    danger: <XCircle className="w-5 h-5 text-red-500" />
  };

  return (
    <motion.div
      className={`p-4 rounded-xl border ${severityColors[interaction.severity]}`}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start gap-3">
        {severityIcons[interaction.severity]}
        <div className="flex-1">
          <p className="font-medium text-sm">
            {interaction.medications.join(' + ')}
          </p>
          <p className="text-xs mt-1 opacity-80">{interaction.message}</p>
          <p className="text-xs mt-2 font-medium">{interaction.recommendation}</p>
        </div>
      </div>
    </motion.div>
  );
};

const TimeSlot = ({ icon, time, count, color }) => {
  const colorClasses = {
    amber: 'bg-amber-100 text-amber-600',
    orange: 'bg-orange-100 text-orange-600',
    rose: 'bg-rose-100 text-rose-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-800">{time}</p>
      </div>
      <span className="text-sm font-medium text-gray-500">{count} items</span>
    </div>
  );
};

const AddMedicationModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    time: 'Morning',
    type: 'supplement'
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Medication</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              placeholder="e.g., Vitamin D3"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
            <input
              type="text"
              placeholder="e.g., 1000 IU"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
            >
              <option>Once daily</option>
              <option>Twice daily</option>
              <option>Three times daily</option>
              <option>As needed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <select
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
            >
              <option>Morning</option>
              <option>With breakfast</option>
              <option>With lunch</option>
              <option>With dinner</option>
              <option>Evening</option>
              <option>Before bed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormData({ ...formData, type: 'medication' })}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  formData.type === 'medication'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Medication
              </button>
              <button
                onClick={() => setFormData({ ...formData, type: 'supplement' })}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  formData.type === 'supplement'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Supplement
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-medium shadow-lg shadow-rose-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Add Medication
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Medications;
