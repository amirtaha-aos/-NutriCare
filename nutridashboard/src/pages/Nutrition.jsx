import { useState, useEffect } from 'react';
import { nutritionAPI } from '../services/api';
import {
  Utensils,
  Plus,
  Search,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Calendar,
  ChevronRight,
  ChevronLeft,
  X,
  Loader,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const Nutrition = () => {
  const [dailyLog, setDailyLog] = useState({ logs: [], dailyTotals: {} });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchDailyLog();
  }, [selectedDate]);

  const fetchDailyLog = async () => {
    setLoading(true);
    try {
      const res = await nutritionAPI.getDailyLog(selectedDate);
      setDailyLog(res.data.data);
    } catch (error) {
      console.error('Error fetching daily log:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await nutritionAPI.searchFood(searchQuery);
      setSearchResults(res.data.data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const mealTypeLabels = {
    breakfast: 'Breakfast',
    snack1: 'Morning Snack',
    lunch: 'Lunch',
    snack2: 'Afternoon Snack',
    dinner: 'Dinner',
    other: 'Other'
  };

  const calorieGoal = 2000;
  const progress = Math.min((dailyLog.dailyTotals.calories / calorieGoal) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-500" />
            Daily Nutrition
          </h1>
          <p className="text-gray-500 mt-1">Track your food intake and macros</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 font-medium"
        >
          <Plus className="w-5 h-5" />
          Log Food
        </button>
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-500" />
          <span className="font-medium">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
        <button
          onClick={() => changeDate(1)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          disabled={selectedDate === new Date().toISOString().split('T')[0]}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Daily Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Daily Summary</h3>
          <span className="text-sm text-gray-500">
            {dailyLog.dailyTotals.calories || 0} / {calorieGoal} kcal
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-6">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progress > 100 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Macro Summary */}
        <div className="grid grid-cols-4 gap-4">
          <MacroCard
            icon={<Flame className="w-5 h-5" />}
            label="Calories"
            value={dailyLog.dailyTotals.calories || 0}
            unit="kcal"
            color="orange"
          />
          <MacroCard
            icon={<Beef className="w-5 h-5" />}
            label="Protein"
            value={dailyLog.dailyTotals.protein || 0}
            unit="g"
            color="red"
          />
          <MacroCard
            icon={<Wheat className="w-5 h-5" />}
            label="Carbs"
            value={dailyLog.dailyTotals.carbs || 0}
            unit="g"
            color="blue"
          />
          <MacroCard
            icon={<Droplet className="w-5 h-5" />}
            label="Fat"
            value={dailyLog.dailyTotals.fat || 0}
            unit="g"
            color="yellow"
          />
        </div>
      </div>

      {/* Food Logs */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : dailyLog.logs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-10 h-10 text-emerald-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-600">No food logged yet</h3>
            <p className="text-gray-400 mt-2">Log your first meal for today</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700"
            >
              <Plus className="w-4 h-4" />
              Add Food
            </button>
          </div>
        ) : (
          Object.entries(
            dailyLog.logs.reduce((acc, log) => {
              if (!acc[log.mealType]) acc[log.mealType] = [];
              acc[log.mealType].push(log);
              return acc;
            }, {})
          ).map(([mealType, logs]) => (
            <div key={mealType} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 font-medium text-gray-700 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-500" />
                {mealTypeLabels[mealType]}
              </div>
              <div className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <div key={log._id} className="p-4">
                    {log.foods.map((food, i) => (
                      <div key={i} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
                        <div>
                          <p className="font-medium text-gray-800">{food.name}</p>
                          <p className="text-sm text-gray-500">
                            {food.amount} {food.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-800">{food.calories} kcal</p>
                          <p className="text-xs text-gray-400">
                            P:{food.protein}g | C:{food.carbs}g | F:{food.fat}g
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Food Modal */}
      {showModal && (
        <AddFoodModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchDailyLog}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          handleSearch={handleSearch}
          searching={searching}
        />
      )}
    </div>
  );
};

const MacroCard = ({ icon, label, value, unit, color }) => {
  const colorClasses = {
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };

  return (
    <div className="text-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-2`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{unit} {label}</p>
    </div>
  );
};

const AddFoodModal = ({ onClose, onSuccess, searchQuery, setSearchQuery, searchResults, handleSearch, searching }) => {
  const [loading, setLoading] = useState(false);
  const [mealType, setMealType] = useState('breakfast');
  const [selectedFoods, setSelectedFoods] = useState([]);

  const addFood = (food) => {
    setSelectedFoods([...selectedFoods, { ...food, amount: 100 }]);
  };

  const removeFood = (index) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
  };

  const updateAmount = (index, amount) => {
    const updated = [...selectedFoods];
    const ratio = amount / 100;
    updated[index] = {
      ...updated[index],
      amount,
      calories: Math.round(updated[index].calories * ratio),
      protein: Math.round(updated[index].protein * ratio * 10) / 10,
      carbs: Math.round(updated[index].carbs * ratio * 10) / 10,
      fat: Math.round(updated[index].fat * ratio * 10) / 10
    };
    setSelectedFoods(updated);
  };

  const handleSubmit = async () => {
    if (selectedFoods.length === 0) {
      toast.error('Please select at least one food');
      return;
    }

    setLoading(true);
    try {
      await nutritionAPI.logFood({
        mealType,
        foods: selectedFoods.map(f => ({
          name: f.name,
          amount: f.amount,
          unit: 'g',
          calories: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fat: f.fat
        }))
      });
      toast.success('Food logged successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to log food');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Log Food</h2>
              <p className="text-sm text-emerald-100">Add what you ate</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Meal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-gray-50 focus:bg-white"
            >
              <option value="breakfast">Breakfast</option>
              <option value="snack1">Morning Snack</option>
              <option value="lunch">Lunch</option>
              <option value="snack2">Afternoon Snack</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Food</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter food name..."
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-5 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium"
              >
                {searching ? <Loader className="w-5 h-5 animate-spin" /> : 'Search'}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border-2 border-gray-100 rounded-xl divide-y max-h-48 overflow-y-auto">
              {searchResults.map((food, i) => (
                <div
                  key={i}
                  className="p-3 hover:bg-emerald-50 cursor-pointer flex items-center justify-between transition-colors"
                  onClick={() => addFood(food)}
                >
                  <div>
                    <p className="font-medium text-gray-800">{food.name}</p>
                    <p className="text-xs text-gray-500">{food.per}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">{food.calories} kcal</span>
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Foods */}
          {selectedFoods.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Foods</label>
              <div className="space-y-2">
                {selectedFoods.map((food, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                    <button
                      onClick={() => removeFood(i)}
                      className="w-8 h-8 bg-red-100 text-red-500 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{food.name}</p>
                      <p className="text-xs text-gray-500">{food.calories} kcal</p>
                    </div>
                    <input
                      type="number"
                      value={food.amount}
                      onChange={(e) => updateAmount(i, parseInt(e.target.value) || 0)}
                      className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg text-center focus:border-emerald-500 outline-none"
                    />
                    <span className="text-sm text-gray-500">g</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || selectedFoods.length === 0}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Log Food'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
