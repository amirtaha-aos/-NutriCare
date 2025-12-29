const Patient = require('../models/Patient');
const User = require('../models/User');

// دریافت پروفایل بیمار
exports.getProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id }).populate('user', 'name email phone');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'پروفایل یافت نشد'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت پروفایل'
    });
  }
};

// به‌روزرسانی پروفایل بیمار
exports.updateProfile = async (req, res) => {
  try {
    const {
      birthDate,
      gender,
      height,
      weight,
      targetWeight,
      activityLevel,
      medicalConditions,
      allergies,
      medications,
      dietaryPreferences,
      dailyCalorieGoal
    } = req.body;

    let patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      patient = new Patient({ user: req.user.id });
    }

    // به‌روزرسانی فیلدها
    if (birthDate) patient.birthDate = birthDate;
    if (gender) patient.gender = gender;
    if (height) patient.height = height;
    if (weight) {
      // اضافه کردن به تاریخچه وزن
      patient.weightHistory.push({ weight, date: new Date() });
      patient.weight = weight;
    }
    if (targetWeight) patient.targetWeight = targetWeight;
    if (activityLevel) patient.activityLevel = activityLevel;
    if (medicalConditions) patient.medicalConditions = medicalConditions;
    if (allergies) patient.allergies = allergies;
    if (medications) patient.medications = medications;
    if (dietaryPreferences) patient.dietaryPreferences = dietaryPreferences;
    if (dailyCalorieGoal) patient.dailyCalorieGoal = dailyCalorieGoal;

    patient.updatedAt = Date.now();

    await patient.save();

    res.json({
      success: true,
      data: patient
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی پروفایل',
      error: err.message
    });
  }
};

// دریافت تاریخچه وزن
exports.getWeightHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'پروفایل یافت نشد'
      });
    }

    res.json({
      success: true,
      data: patient.weightHistory
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت تاریخچه وزن'
    });
  }
};

// دریافت آمار داشبورد
exports.getDashboardStats = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'پروفایل یافت نشد'
      });
    }

    // محاسبه BMR (نرخ متابولیسم پایه)
    let bmr = 0;
    if (patient.weight && patient.height && patient.age) {
      if (patient.gender === 'male') {
        bmr = 88.362 + (13.397 * patient.weight) + (4.799 * patient.height) - (5.677 * patient.age);
      } else {
        bmr = 447.593 + (9.247 * patient.weight) + (3.098 * patient.height) - (4.330 * patient.age);
      }
    }

    // ضریب فعالیت
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const tdee = bmr * (activityMultipliers[patient.activityLevel] || 1.55);

    res.json({
      success: true,
      data: {
        weight: patient.weight,
        height: patient.height,
        bmi: patient.bmi,
        age: patient.age,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetWeight: patient.targetWeight,
        weightToGoal: patient.targetWeight ? patient.weight - patient.targetWeight : null,
        weightHistory: patient.weightHistory.slice(-30) // آخرین ۳۰ رکورد
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت آمار'
    });
  }
};

// لیست همه بیماران (برای متخصص)
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate('user', 'name email phone');

    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت لیست بیماران'
    });
  }
};
