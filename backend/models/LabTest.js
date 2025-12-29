const mongoose = require('mongoose');

const LabTestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  testDate: {
    type: Date,
    default: Date.now
  },
  testType: {
    type: String,
    enum: ['blood', 'urine', 'lipid', 'thyroid', 'liver', 'kidney', 'vitamin', 'complete'],
    required: true
  },
  // نتایج آزمایش خون
  results: {
    // شمارش کامل خون (CBC)
    wbc: { value: Number, unit: { type: String, default: '10^3/uL' }, normalRange: { min: Number, max: Number } },
    rbc: { value: Number, unit: { type: String, default: '10^6/uL' }, normalRange: { min: Number, max: Number } },
    hemoglobin: { value: Number, unit: { type: String, default: 'g/dL' }, normalRange: { min: Number, max: Number } },
    hematocrit: { value: Number, unit: { type: String, default: '%' }, normalRange: { min: Number, max: Number } },
    platelets: { value: Number, unit: { type: String, default: '10^3/uL' }, normalRange: { min: Number, max: Number } },

    // پروفایل لیپید
    totalCholesterol: { value: Number, unit: { type: String, default: 'mg/dL' }, normalRange: { min: Number, max: Number } },
    ldl: { value: Number, unit: { type: String, default: 'mg/dL' }, normalRange: { min: Number, max: Number } },
    hdl: { value: Number, unit: { type: String, default: 'mg/dL' }, normalRange: { min: Number, max: Number } },
    triglycerides: { value: Number, unit: { type: String, default: 'mg/dL' }, normalRange: { min: Number, max: Number } },

    // قند خون
    fastingGlucose: { value: Number, unit: { type: String, default: 'mg/dL' }, normalRange: { min: Number, max: Number } },
    hba1c: { value: Number, unit: { type: String, default: '%' }, normalRange: { min: Number, max: Number } },

    // تیروئید
    tsh: { value: Number, unit: { type: String, default: 'mIU/L' }, normalRange: { min: Number, max: Number } },
    t3: { value: Number, unit: { type: String, default: 'ng/dL' }, normalRange: { min: Number, max: Number } },
    t4: { value: Number, unit: { type: String, default: 'ug/dL' }, normalRange: { min: Number, max: Number } },

    // کبد
    alt: { value: Number, unit: { type: String, default: 'U/L' }, normalRange: { min: Number, max: Number } },
    ast: { value: Number, unit: { type: String, default: 'U/L' }, normalRange: { min: Number, max: Number } },
    alp: { value: Number, unit: { type: String, default: 'U/L' }, normalRange: { min: Number, max: Number } },

    // کلیه
    creatinine: { value: Number, unit: { type: String, default: 'mg/dL' }, normalRange: { min: Number, max: Number } },
    bun: { value: Number, unit: { type: String, default: 'mg/dL' }, normalRange: { min: Number, max: Number } },

    // ویتامین‌ها
    vitaminD: { value: Number, unit: { type: String, default: 'ng/mL' }, normalRange: { min: Number, max: Number } },
    vitaminB12: { value: Number, unit: { type: String, default: 'pg/mL' }, normalRange: { min: Number, max: Number } },
    iron: { value: Number, unit: { type: String, default: 'ug/dL' }, normalRange: { min: Number, max: Number } },
    ferritin: { value: Number, unit: { type: String, default: 'ng/mL' }, normalRange: { min: Number, max: Number } }
  },
  // تحلیل AI
  aiAnalysis: {
    summary: String,
    concerns: [String],
    recommendations: [String],
    analyzedAt: Date
  },
  // فایل آزمایش
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// متد برای بررسی نتایج غیرطبیعی
LabTestSchema.methods.getAbnormalResults = function() {
  const abnormal = [];
  const results = this.results;

  for (const [key, data] of Object.entries(results.toObject())) {
    if (data && data.value && data.normalRange) {
      if (data.value < data.normalRange.min || data.value > data.normalRange.max) {
        abnormal.push({
          test: key,
          value: data.value,
          unit: data.unit,
          normalRange: data.normalRange,
          status: data.value < data.normalRange.min ? 'low' : 'high'
        });
      }
    }
  }

  return abnormal;
};

module.exports = mongoose.model('LabTest', LabTestSchema);
