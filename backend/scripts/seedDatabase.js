/**
 * Database Seeder Script
 * Populates the database with initial data for foods, medicines, lab rules, and meal plans
 *
 * Usage: node scripts/seedDatabase.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { foods, medicines, labRules, predefinedMealPlans, exercises } = require('../data/seedData');
const additionalFoods = require('../data/additionalFoods');

// Models
const Food = require('../models/Food');
const Medicine = require('../models/Medicine');
const LabRule = require('../models/LabRule');
const PredefinedMealPlan = require('../models/PredefinedMealPlan');
const ExerciseType = require('../models/ExerciseType');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nutricare';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Seed Foods (combine original and additional foods)
    console.log('📦 Seeding foods...');
    await Food.deleteMany({ source: 'database' }); // Only delete seeded foods
    const allFoods = [...foods, ...additionalFoods];
    const foodDocs = allFoods.map(food => ({ ...food, source: 'database', isVerified: true }));
    await Food.insertMany(foodDocs);
    console.log(`   ✅ Added ${allFoods.length} foods (${foods.length} original + ${additionalFoods.length} additional)\n`);

    // Seed Medicines
    console.log('💊 Seeding medicines...');
    await Medicine.deleteMany({});
    await Medicine.insertMany(medicines);
    console.log(`   ✅ Added ${medicines.length} medicines\n`);

    // Seed Lab Rules
    console.log('🔬 Seeding lab rules...');
    await LabRule.deleteMany({});
    await LabRule.insertMany(labRules);
    console.log(`   ✅ Added ${labRules.length} lab rules\n`);

    // Seed Predefined Meal Plans
    console.log('🍽️  Seeding predefined meal plans...');
    await PredefinedMealPlan.deleteMany({});
    await PredefinedMealPlan.insertMany(predefinedMealPlans);
    console.log(`   ✅ Added ${predefinedMealPlans.length} meal plans\n`);

    // Seed Exercise Types
    console.log('🏃 Seeding exercise types...');
    await ExerciseType.deleteMany({});
    await ExerciseType.insertMany(exercises);
    console.log(`   ✅ Added ${exercises.length} exercise types\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('Summary:');
    console.log(`   - Foods: ${foods.length + additionalFoods.length}`);
    console.log(`   - Medicines: ${medicines.length}`);
    console.log(`   - Lab Rules: ${labRules.length}`);
    console.log(`   - Meal Plans: ${predefinedMealPlans.length}`);
    console.log(`   - Exercise Types: ${exercises.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeder
seedDatabase();
