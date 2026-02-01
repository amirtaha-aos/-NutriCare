/**
 * Additional Foods Database
 * 150+ common foods with accurate nutritional data
 */

const additionalFoods = [
  // === BREAKFAST ITEMS ===
  { name: 'Scrambled Eggs', category: 'protein', nutritionPer100g: { calories: 148, protein: 10, carbs: 2, fats: 11, fiber: 0, sugar: 1 }, servingSize: { amount: 100, unit: 'g', description: '2 eggs scrambled' }, isGlutenFree: true },
  { name: 'Fried Eggs', category: 'protein', nutritionPer100g: { calories: 196, protein: 14, carbs: 1, fats: 15, fiber: 0, sugar: 1 }, servingSize: { amount: 90, unit: 'g', description: '2 eggs fried' }, isGlutenFree: true },
  { name: 'Boiled Eggs', category: 'protein', nutritionPer100g: { calories: 155, protein: 13, carbs: 1, fats: 11, fiber: 0, sugar: 1 }, servingSize: { amount: 50, unit: 'g', description: '1 large egg' }, isGlutenFree: true },
  { name: 'Omelette with Cheese', category: 'protein', nutritionPer100g: { calories: 185, protein: 13, carbs: 2, fats: 14, fiber: 0, sugar: 1 }, servingSize: { amount: 150, unit: 'g', description: '2 egg omelette' }, isGlutenFree: true },
  { name: 'Pancakes', category: 'grains', nutritionPer100g: { calories: 227, protein: 6, carbs: 28, fats: 10, fiber: 1, sugar: 6 }, servingSize: { amount: 75, unit: 'g', description: '2 small pancakes' } },
  { name: 'Waffles', category: 'grains', nutritionPer100g: { calories: 291, protein: 8, carbs: 33, fats: 14, fiber: 1, sugar: 5 }, servingSize: { amount: 75, unit: 'g', description: '1 waffle' } },
  { name: 'French Toast', category: 'grains', nutritionPer100g: { calories: 229, protein: 8, carbs: 26, fats: 10, fiber: 1, sugar: 7 }, servingSize: { amount: 65, unit: 'g', description: '1 slice' } },
  { name: 'Granola', category: 'grains', nutritionPer100g: { calories: 489, protein: 10, carbs: 64, fats: 24, fiber: 5, sugar: 25 }, servingSize: { amount: 50, unit: 'g', description: '1/2 cup' } },
  { name: 'Cornflakes', category: 'grains', nutritionPer100g: { calories: 357, protein: 7, carbs: 84, fats: 0.4, fiber: 3, sugar: 8 }, servingSize: { amount: 30, unit: 'g', description: '1 cup' }, isGlutenFree: true },
  { name: 'Muesli', category: 'grains', nutritionPer100g: { calories: 340, protein: 10, carbs: 66, fats: 6, fiber: 8, sugar: 20 }, servingSize: { amount: 50, unit: 'g', description: '1/2 cup' } },
  { name: 'Bagel', category: 'grains', nutritionPer100g: { calories: 257, protein: 10, carbs: 50, fats: 1, fiber: 2, sugar: 5 }, servingSize: { amount: 100, unit: 'g', description: '1 bagel' } },
  { name: 'Croissant', category: 'grains', nutritionPer100g: { calories: 406, protein: 8, carbs: 45, fats: 21, fiber: 2, sugar: 10 }, servingSize: { amount: 60, unit: 'g', description: '1 croissant' } },
  { name: 'English Muffin', category: 'grains', nutritionPer100g: { calories: 227, protein: 8, carbs: 44, fats: 2, fiber: 2, sugar: 5 }, servingSize: { amount: 57, unit: 'g', description: '1 muffin' } },
  { name: 'Toast with Butter', category: 'grains', nutritionPer100g: { calories: 313, protein: 7, carbs: 43, fats: 13, fiber: 2, sugar: 4 }, servingSize: { amount: 40, unit: 'g', description: '1 slice with butter' } },
  { name: 'Avocado Toast', category: 'prepared', nutritionPer100g: { calories: 220, protein: 4, carbs: 20, fats: 14, fiber: 5, sugar: 2 }, servingSize: { amount: 150, unit: 'g', description: '1 serving' } },

  // === LUNCH/DINNER MAINS ===
  { name: 'Grilled Chicken Breast', category: 'protein', nutritionPer100g: { calories: 165, protein: 31, carbs: 0, fats: 4, fiber: 0, sugar: 0 }, servingSize: { amount: 170, unit: 'g', description: '1 breast' }, isGlutenFree: true },
  { name: 'Roasted Chicken', category: 'protein', nutritionPer100g: { calories: 239, protein: 27, carbs: 0, fats: 14, fiber: 0, sugar: 0 }, servingSize: { amount: 150, unit: 'g', description: '1 serving' }, isGlutenFree: true },
  { name: 'Chicken Wings', category: 'protein', nutritionPer100g: { calories: 290, protein: 27, carbs: 0, fats: 19, fiber: 0, sugar: 0 }, servingSize: { amount: 100, unit: 'g', description: '4-5 wings' }, isGlutenFree: true },
  { name: 'Chicken Nuggets', category: 'protein', nutritionPer100g: { calories: 296, protein: 15, carbs: 17, fats: 18, fiber: 1, sugar: 0 }, servingSize: { amount: 100, unit: 'g', description: '6 nuggets' } },
  { name: 'Grilled Salmon', category: 'protein', nutritionPer100g: { calories: 208, protein: 20, carbs: 0, fats: 13, fiber: 0, sugar: 0 }, servingSize: { amount: 150, unit: 'g', description: '1 fillet' }, isGlutenFree: true },
  { name: 'Baked Cod', category: 'protein', nutritionPer100g: { calories: 105, protein: 23, carbs: 0, fats: 1, fiber: 0, sugar: 0 }, servingSize: { amount: 150, unit: 'g', description: '1 fillet' }, isGlutenFree: true },
  { name: 'Fish and Chips', category: 'prepared', nutritionPer100g: { calories: 247, protein: 12, carbs: 22, fats: 13, fiber: 2, sugar: 0 }, servingSize: { amount: 300, unit: 'g', description: '1 serving' } },
  { name: 'Grilled Steak', category: 'protein', nutritionPer100g: { calories: 271, protein: 26, carbs: 0, fats: 18, fiber: 0, sugar: 0 }, servingSize: { amount: 200, unit: 'g', description: '1 steak' }, isGlutenFree: true },
  { name: 'Beef Burger (no bun)', category: 'protein', nutritionPer100g: { calories: 295, protein: 26, carbs: 0, fats: 20, fiber: 0, sugar: 0 }, servingSize: { amount: 120, unit: 'g', description: '1 patty' }, isGlutenFree: true },
  { name: 'Hamburger', category: 'prepared', nutritionPer100g: { calories: 295, protein: 17, carbs: 24, fats: 14, fiber: 1, sugar: 5 }, servingSize: { amount: 200, unit: 'g', description: '1 burger' } },
  { name: 'Cheeseburger', category: 'prepared', nutritionPer100g: { calories: 303, protein: 17, carbs: 24, fats: 15, fiber: 1, sugar: 5 }, servingSize: { amount: 220, unit: 'g', description: '1 burger' } },
  { name: 'Pork Chop', category: 'protein', nutritionPer100g: { calories: 231, protein: 26, carbs: 0, fats: 14, fiber: 0, sugar: 0 }, servingSize: { amount: 150, unit: 'g', description: '1 chop' }, isGlutenFree: true },
  { name: 'Grilled Lamb Chops', category: 'protein', nutritionPer100g: { calories: 294, protein: 25, carbs: 0, fats: 21, fiber: 0, sugar: 0 }, servingSize: { amount: 100, unit: 'g', description: '2 chops' }, isGlutenFree: true },
  { name: 'Turkey Breast', category: 'protein', nutritionPer100g: { calories: 135, protein: 30, carbs: 0, fats: 1, fiber: 0, sugar: 0 }, servingSize: { amount: 100, unit: 'g', description: '3 slices' }, isGlutenFree: true },
  { name: 'Rotisserie Chicken', category: 'protein', nutritionPer100g: { calories: 190, protein: 25, carbs: 0, fats: 10, fiber: 0, sugar: 0 }, servingSize: { amount: 150, unit: 'g', description: '1/4 chicken' }, isGlutenFree: true },

  // === PASTA & NOODLES ===
  { name: 'Spaghetti Bolognese', category: 'prepared', nutritionPer100g: { calories: 130, protein: 7, carbs: 16, fats: 4, fiber: 1, sugar: 3 }, servingSize: { amount: 350, unit: 'g', description: '1 serving' } },
  { name: 'Spaghetti Carbonara', category: 'prepared', nutritionPer100g: { calories: 180, protein: 9, carbs: 19, fats: 8, fiber: 1, sugar: 1 }, servingSize: { amount: 300, unit: 'g', description: '1 serving' } },
  { name: 'Fettuccine Alfredo', category: 'prepared', nutritionPer100g: { calories: 180, protein: 6, carbs: 18, fats: 10, fiber: 1, sugar: 2 }, servingSize: { amount: 300, unit: 'g', description: '1 serving' } },
  { name: 'Lasagna', category: 'prepared', nutritionPer100g: { calories: 135, protein: 8, carbs: 13, fats: 5, fiber: 1, sugar: 3 }, servingSize: { amount: 300, unit: 'g', description: '1 serving' } },
  { name: 'Mac and Cheese', category: 'prepared', nutritionPer100g: { calories: 164, protein: 7, carbs: 16, fats: 8, fiber: 1, sugar: 2 }, servingSize: { amount: 250, unit: 'g', description: '1 serving' } },
  { name: 'Pasta with Marinara', category: 'prepared', nutritionPer100g: { calories: 120, protein: 4, carbs: 23, fats: 2, fiber: 2, sugar: 4 }, servingSize: { amount: 250, unit: 'g', description: '1 serving' } },
  { name: 'Penne Arrabiata', category: 'prepared', nutritionPer100g: { calories: 125, protein: 4, carbs: 24, fats: 2, fiber: 2, sugar: 3 }, servingSize: { amount: 250, unit: 'g', description: '1 serving' } },
  { name: 'Pad Thai', category: 'prepared', nutritionPer100g: { calories: 140, protein: 6, carbs: 20, fats: 4, fiber: 1, sugar: 5 }, servingSize: { amount: 300, unit: 'g', description: '1 serving' } },
  { name: 'Ramen', category: 'prepared', nutritionPer100g: { calories: 97, protein: 5, carbs: 13, fats: 3, fiber: 1, sugar: 1 }, servingSize: { amount: 400, unit: 'g', description: '1 bowl' } },
  { name: 'Lo Mein', category: 'prepared', nutritionPer100g: { calories: 120, protein: 5, carbs: 16, fats: 4, fiber: 1, sugar: 2 }, servingSize: { amount: 300, unit: 'g', description: '1 serving' } },

  // === RICE DISHES ===
  { name: 'Fried Rice', category: 'prepared', nutritionPer100g: { calories: 163, protein: 5, carbs: 24, fats: 5, fiber: 1, sugar: 1 }, servingSize: { amount: 250, unit: 'g', description: '1 serving' } },
  { name: 'Chicken Fried Rice', category: 'prepared', nutritionPer100g: { calories: 175, protein: 8, carbs: 24, fats: 5, fiber: 1, sugar: 1 }, servingSize: { amount: 280, unit: 'g', description: '1 serving' } },
  { name: 'Biryani', category: 'prepared', nutritionPer100g: { calories: 180, protein: 10, carbs: 24, fats: 5, fiber: 1, sugar: 1 }, servingSize: { amount: 350, unit: 'g', description: '1 serving' } },
  { name: 'Risotto', category: 'prepared', nutritionPer100g: { calories: 140, protein: 4, carbs: 20, fats: 5, fiber: 0, sugar: 1 }, servingSize: { amount: 250, unit: 'g', description: '1 serving' } },
  { name: 'Sushi Roll (California)', category: 'prepared', nutritionPer100g: { calories: 145, protein: 6, carbs: 18, fats: 5, fiber: 1, sugar: 3 }, servingSize: { amount: 150, unit: 'g', description: '6 pieces' } },
  { name: 'Sushi Roll (Salmon)', category: 'prepared', nutritionPer100g: { calories: 150, protein: 8, carbs: 17, fats: 5, fiber: 0, sugar: 2 }, servingSize: { amount: 150, unit: 'g', description: '6 pieces' } },
  { name: 'Burrito Bowl', category: 'prepared', nutritionPer100g: { calories: 135, protein: 7, carbs: 15, fats: 5, fiber: 3, sugar: 2 }, servingSize: { amount: 400, unit: 'g', description: '1 bowl' }, isGlutenFree: true },

  // === SALADS ===
  { name: 'Caesar Salad', category: 'prepared', nutritionPer100g: { calories: 127, protein: 5, carbs: 6, fats: 10, fiber: 1, sugar: 1 }, servingSize: { amount: 200, unit: 'g', description: '1 serving' } },
  { name: 'Greek Salad', category: 'prepared', nutritionPer100g: { calories: 90, protein: 4, carbs: 6, fats: 6, fiber: 2, sugar: 4 }, servingSize: { amount: 200, unit: 'g', description: '1 serving' }, isGlutenFree: true },
  { name: 'Chicken Caesar Salad', category: 'prepared', nutritionPer100g: { calories: 140, protein: 12, carbs: 5, fats: 9, fiber: 1, sugar: 1 }, servingSize: { amount: 300, unit: 'g', description: '1 serving' } },
  { name: 'Cobb Salad', category: 'prepared', nutritionPer100g: { calories: 150, protein: 10, carbs: 5, fats: 10, fiber: 2, sugar: 2 }, servingSize: { amount: 300, unit: 'g', description: '1 serving' }, isGlutenFree: true },
  { name: 'Garden Salad', category: 'vegetables', nutritionPer100g: { calories: 20, protein: 1, carbs: 4, fats: 0, fiber: 2, sugar: 2 }, servingSize: { amount: 150, unit: 'g', description: '1 serving' }, isVegan: true, isGlutenFree: true },
  { name: 'Tuna Salad', category: 'protein', nutritionPer100g: { calories: 180, protein: 19, carbs: 3, fats: 10, fiber: 0, sugar: 1 }, servingSize: { amount: 150, unit: 'g', description: '1 serving' }, isGlutenFree: true },
  { name: 'Coleslaw', category: 'vegetables', nutritionPer100g: { calories: 98, protein: 1, carbs: 9, fats: 7, fiber: 2, sugar: 7 }, servingSize: { amount: 100, unit: 'g', description: '1/2 cup' }, isGlutenFree: true },
  { name: 'Potato Salad', category: 'vegetables', nutritionPer100g: { calories: 143, protein: 2, carbs: 13, fats: 9, fiber: 1, sugar: 2 }, servingSize: { amount: 150, unit: 'g', description: '1 serving' }, isGlutenFree: true },

  // === SANDWICHES ===
  { name: 'BLT Sandwich', category: 'prepared', nutritionPer100g: { calories: 250, protein: 10, carbs: 20, fats: 15, fiber: 1, sugar: 3 }, servingSize: { amount: 180, unit: 'g', description: '1 sandwich' } },
  { name: 'Turkey Sandwich', category: 'prepared', nutritionPer100g: { calories: 228, protein: 14, carbs: 28, fats: 7, fiber: 2, sugar: 4 }, servingSize: { amount: 200, unit: 'g', description: '1 sandwich' } },
  { name: 'Chicken Sandwich', category: 'prepared', nutritionPer100g: { calories: 240, protein: 16, carbs: 26, fats: 8, fiber: 1, sugar: 4 }, servingSize: { amount: 200, unit: 'g', description: '1 sandwich' } },
  { name: 'Grilled Cheese Sandwich', category: 'prepared', nutritionPer100g: { calories: 290, protein: 11, carbs: 27, fats: 16, fiber: 1, sugar: 4 }, servingSize: { amount: 150, unit: 'g', description: '1 sandwich' } },
  { name: 'Tuna Sandwich', category: 'prepared', nutritionPer100g: { calories: 250, protein: 15, carbs: 26, fats: 10, fiber: 1, sugar: 3 }, servingSize: { amount: 180, unit: 'g', description: '1 sandwich' } },
  { name: 'Club Sandwich', category: 'prepared', nutritionPer100g: { calories: 270, protein: 18, carbs: 24, fats: 12, fiber: 2, sugar: 3 }, servingSize: { amount: 280, unit: 'g', description: '1 sandwich' } },
  { name: 'Wrap (Chicken)', category: 'prepared', nutritionPer100g: { calories: 200, protein: 12, carbs: 22, fats: 7, fiber: 2, sugar: 2 }, servingSize: { amount: 250, unit: 'g', description: '1 wrap' } },
  { name: 'Veggie Wrap', category: 'prepared', nutritionPer100g: { calories: 165, protein: 5, carbs: 25, fats: 5, fiber: 4, sugar: 3 }, servingSize: { amount: 200, unit: 'g', description: '1 wrap' }, isVegetarian: true },

  // === SOUPS ===
  { name: 'Chicken Soup', category: 'prepared', nutritionPer100g: { calories: 50, protein: 5, carbs: 4, fats: 2, fiber: 0, sugar: 1 }, servingSize: { amount: 250, unit: 'ml', description: '1 bowl' }, isGlutenFree: true },
  { name: 'Tomato Soup', category: 'prepared', nutritionPer100g: { calories: 40, protein: 1, carbs: 7, fats: 1, fiber: 1, sugar: 4 }, servingSize: { amount: 250, unit: 'ml', description: '1 bowl' }, isVegetarian: true, isGlutenFree: true },
  { name: 'Minestrone Soup', category: 'prepared', nutritionPer100g: { calories: 45, protein: 2, carbs: 8, fats: 1, fiber: 2, sugar: 2 }, servingSize: { amount: 250, unit: 'ml', description: '1 bowl' }, isVegetarian: true },
  { name: 'Clam Chowder', category: 'prepared', nutritionPer100g: { calories: 78, protein: 3, carbs: 8, fats: 4, fiber: 0, sugar: 1 }, servingSize: { amount: 250, unit: 'ml', description: '1 bowl' } },
  { name: 'Vegetable Soup', category: 'prepared', nutritionPer100g: { calories: 35, protein: 1, carbs: 6, fats: 1, fiber: 2, sugar: 2 }, servingSize: { amount: 250, unit: 'ml', description: '1 bowl' }, isVegan: true, isGlutenFree: true },
  { name: 'Lentil Soup', category: 'prepared', nutritionPer100g: { calories: 58, protein: 4, carbs: 9, fats: 1, fiber: 3, sugar: 1 }, servingSize: { amount: 250, unit: 'ml', description: '1 bowl' }, isVegan: true, isGlutenFree: true },
  { name: 'French Onion Soup', category: 'prepared', nutritionPer100g: { calories: 55, protein: 2, carbs: 6, fats: 2, fiber: 1, sugar: 3 }, servingSize: { amount: 250, unit: 'ml', description: '1 bowl' } },
  { name: 'Mushroom Soup', category: 'prepared', nutritionPer100g: { calories: 52, protein: 1, carbs: 4, fats: 4, fiber: 0, sugar: 1 }, servingSize: { amount: 250, unit: 'ml', description: '1 bowl' }, isVegetarian: true },

  // === PIZZA ===
  { name: 'Pizza Margherita', category: 'prepared', nutritionPer100g: { calories: 250, protein: 11, carbs: 32, fats: 9, fiber: 2, sugar: 4 }, servingSize: { amount: 100, unit: 'g', description: '1 slice' }, isVegetarian: true },
  { name: 'Pepperoni Pizza', category: 'prepared', nutritionPer100g: { calories: 275, protein: 12, carbs: 30, fats: 12, fiber: 2, sugar: 4 }, servingSize: { amount: 110, unit: 'g', description: '1 slice' } },
  { name: 'Veggie Pizza', category: 'prepared', nutritionPer100g: { calories: 235, protein: 9, carbs: 30, fats: 9, fiber: 3, sugar: 4 }, servingSize: { amount: 100, unit: 'g', description: '1 slice' }, isVegetarian: true },
  { name: 'Hawaiian Pizza', category: 'prepared', nutritionPer100g: { calories: 260, protein: 12, carbs: 32, fats: 10, fiber: 2, sugar: 6 }, servingSize: { amount: 110, unit: 'g', description: '1 slice' } },
  { name: 'BBQ Chicken Pizza', category: 'prepared', nutritionPer100g: { calories: 270, protein: 14, carbs: 32, fats: 10, fiber: 2, sugar: 6 }, servingSize: { amount: 110, unit: 'g', description: '1 slice' } },

  // === SIDES ===
  { name: 'French Fries', category: 'vegetables', nutritionPer100g: { calories: 312, protein: 3, carbs: 41, fats: 15, fiber: 4, sugar: 0 }, servingSize: { amount: 120, unit: 'g', description: 'medium serving' }, isVegan: true, isGlutenFree: true },
  { name: 'Mashed Potatoes', category: 'vegetables', nutritionPer100g: { calories: 113, protein: 2, carbs: 16, fats: 5, fiber: 1, sugar: 1 }, servingSize: { amount: 150, unit: 'g', description: '1 cup' }, isVegetarian: true, isGlutenFree: true },
  { name: 'Baked Potato', category: 'vegetables', nutritionPer100g: { calories: 93, protein: 2, carbs: 21, fats: 0, fiber: 2, sugar: 1 }, servingSize: { amount: 200, unit: 'g', description: '1 medium potato' }, isVegan: true, isGlutenFree: true },
  { name: 'Sweet Potato Fries', category: 'vegetables', nutritionPer100g: { calories: 260, protein: 2, carbs: 35, fats: 13, fiber: 4, sugar: 6 }, servingSize: { amount: 100, unit: 'g', description: '1 serving' }, isVegan: true, isGlutenFree: true },
  { name: 'Onion Rings', category: 'vegetables', nutritionPer100g: { calories: 352, protein: 5, carbs: 36, fats: 21, fiber: 2, sugar: 4 }, servingSize: { amount: 90, unit: 'g', description: '8 rings' }, isVegetarian: true },
  { name: 'Garlic Bread', category: 'grains', nutritionPer100g: { calories: 350, protein: 8, carbs: 43, fats: 16, fiber: 2, sugar: 3 }, servingSize: { amount: 50, unit: 'g', description: '2 slices' }, isVegetarian: true },
  { name: 'Steamed Broccoli', category: 'vegetables', nutritionPer100g: { calories: 35, protein: 3, carbs: 7, fats: 0, fiber: 3, sugar: 2 }, servingSize: { amount: 150, unit: 'g', description: '1 cup' }, isVegan: true, isGlutenFree: true },
  { name: 'Steamed Rice', category: 'grains', nutritionPer100g: { calories: 130, protein: 3, carbs: 28, fats: 0, fiber: 0, sugar: 0 }, servingSize: { amount: 160, unit: 'g', description: '1 cup' }, isVegan: true, isGlutenFree: true },
  { name: 'Corn on the Cob', category: 'vegetables', nutritionPer100g: { calories: 96, protein: 3, carbs: 21, fats: 1, fiber: 2, sugar: 5 }, servingSize: { amount: 150, unit: 'g', description: '1 ear' }, isVegan: true, isGlutenFree: true },
  { name: 'Grilled Vegetables', category: 'vegetables', nutritionPer100g: { calories: 45, protein: 1, carbs: 7, fats: 2, fiber: 2, sugar: 4 }, servingSize: { amount: 150, unit: 'g', description: '1 serving' }, isVegan: true, isGlutenFree: true },
  { name: 'Roasted Vegetables', category: 'vegetables', nutritionPer100g: { calories: 65, protein: 2, carbs: 10, fats: 3, fiber: 3, sugar: 4 }, servingSize: { amount: 150, unit: 'g', description: '1 serving' }, isVegan: true, isGlutenFree: true },

  // === SNACKS ===
  { name: 'Hummus', category: 'snacks', nutritionPer100g: { calories: 166, protein: 8, carbs: 14, fats: 10, fiber: 6, sugar: 0 }, servingSize: { amount: 30, unit: 'g', description: '2 tbsp' }, isVegan: true, isGlutenFree: true },
  { name: 'Guacamole', category: 'snacks', nutritionPer100g: { calories: 150, protein: 2, carbs: 9, fats: 13, fiber: 7, sugar: 1 }, servingSize: { amount: 30, unit: 'g', description: '2 tbsp' }, isVegan: true, isGlutenFree: true },
  { name: 'Tortilla Chips', category: 'snacks', nutritionPer100g: { calories: 489, protein: 7, carbs: 63, fats: 24, fiber: 4, sugar: 1 }, servingSize: { amount: 30, unit: 'g', description: '10 chips' }, isVegan: true },
  { name: 'Potato Chips', category: 'snacks', nutritionPer100g: { calories: 536, protein: 7, carbs: 53, fats: 35, fiber: 5, sugar: 0 }, servingSize: { amount: 30, unit: 'g', description: '15 chips' }, isVegan: true, isGlutenFree: true },
  { name: 'Pretzels', category: 'snacks', nutritionPer100g: { calories: 380, protein: 10, carbs: 79, fats: 3, fiber: 3, sugar: 3 }, servingSize: { amount: 30, unit: 'g', description: '10 pretzels' }, isVegan: true },
  { name: 'Popcorn (Plain)', category: 'snacks', nutritionPer100g: { calories: 387, protein: 13, carbs: 78, fats: 5, fiber: 15, sugar: 0 }, servingSize: { amount: 30, unit: 'g', description: '3 cups' }, isVegan: true, isGlutenFree: true },
  { name: 'Cheese Crackers', category: 'snacks', nutritionPer100g: { calories: 500, protein: 10, carbs: 57, fats: 26, fiber: 2, sugar: 5 }, servingSize: { amount: 30, unit: 'g', description: '20 crackers' } },
  { name: 'Rice Cakes', category: 'snacks', nutritionPer100g: { calories: 387, protein: 8, carbs: 82, fats: 3, fiber: 2, sugar: 0 }, servingSize: { amount: 9, unit: 'g', description: '1 cake' }, isVegan: true, isGlutenFree: true },
  { name: 'Trail Mix', category: 'snacks', nutritionPer100g: { calories: 462, protein: 14, carbs: 44, fats: 29, fiber: 5, sugar: 25 }, servingSize: { amount: 40, unit: 'g', description: '1/4 cup' }, isVegan: true, isGlutenFree: true },
  { name: 'Protein Bar', category: 'snacks', nutritionPer100g: { calories: 380, protein: 30, carbs: 40, fats: 12, fiber: 5, sugar: 15 }, servingSize: { amount: 60, unit: 'g', description: '1 bar' } },
  { name: 'Granola Bar', category: 'snacks', nutritionPer100g: { calories: 471, protein: 8, carbs: 64, fats: 21, fiber: 4, sugar: 24 }, servingSize: { amount: 40, unit: 'g', description: '1 bar' } },
  { name: 'Energy Bar', category: 'snacks', nutritionPer100g: { calories: 390, protein: 10, carbs: 45, fats: 18, fiber: 5, sugar: 20 }, servingSize: { amount: 50, unit: 'g', description: '1 bar' } },

  // === DESSERTS ===
  { name: 'Ice Cream (Vanilla)', category: 'sweets', nutritionPer100g: { calories: 207, protein: 4, carbs: 24, fats: 11, fiber: 0, sugar: 21 }, servingSize: { amount: 66, unit: 'g', description: '1 scoop' }, isVegetarian: true, isGlutenFree: true },
  { name: 'Ice Cream (Chocolate)', category: 'sweets', nutritionPer100g: { calories: 216, protein: 4, carbs: 28, fats: 11, fiber: 2, sugar: 24 }, servingSize: { amount: 66, unit: 'g', description: '1 scoop' }, isVegetarian: true },
  { name: 'Cheesecake', category: 'sweets', nutritionPer100g: { calories: 321, protein: 6, carbs: 26, fats: 23, fiber: 0, sugar: 18 }, servingSize: { amount: 125, unit: 'g', description: '1 slice' }, isVegetarian: true },
  { name: 'Chocolate Cake', category: 'sweets', nutritionPer100g: { calories: 367, protein: 5, carbs: 50, fats: 17, fiber: 2, sugar: 35 }, servingSize: { amount: 110, unit: 'g', description: '1 slice' }, isVegetarian: true },
  { name: 'Apple Pie', category: 'sweets', nutritionPer100g: { calories: 265, protein: 2, carbs: 40, fats: 11, fiber: 2, sugar: 22 }, servingSize: { amount: 125, unit: 'g', description: '1 slice' }, isVegetarian: true },
  { name: 'Brownie', category: 'sweets', nutritionPer100g: { calories: 405, protein: 5, carbs: 50, fats: 21, fiber: 2, sugar: 35 }, servingSize: { amount: 60, unit: 'g', description: '1 brownie' }, isVegetarian: true },
  { name: 'Cookie (Chocolate Chip)', category: 'sweets', nutritionPer100g: { calories: 488, protein: 5, carbs: 64, fats: 24, fiber: 2, sugar: 38 }, servingSize: { amount: 30, unit: 'g', description: '1 cookie' }, isVegetarian: true },
  { name: 'Donut (Glazed)', category: 'sweets', nutritionPer100g: { calories: 421, protein: 5, carbs: 53, fats: 22, fiber: 1, sugar: 27 }, servingSize: { amount: 60, unit: 'g', description: '1 donut' }, isVegetarian: true },
  { name: 'Muffin (Blueberry)', category: 'sweets', nutritionPer100g: { calories: 377, protein: 5, carbs: 56, fats: 15, fiber: 2, sugar: 30 }, servingSize: { amount: 110, unit: 'g', description: '1 muffin' }, isVegetarian: true },
  { name: 'Tiramisu', category: 'sweets', nutritionPer100g: { calories: 283, protein: 5, carbs: 30, fats: 16, fiber: 0, sugar: 22 }, servingSize: { amount: 120, unit: 'g', description: '1 serving' }, isVegetarian: true },
  { name: 'Frozen Yogurt', category: 'sweets', nutritionPer100g: { calories: 127, protein: 4, carbs: 22, fats: 3, fiber: 0, sugar: 19 }, servingSize: { amount: 120, unit: 'g', description: '1/2 cup' }, isVegetarian: true, isGlutenFree: true },
  { name: 'Pudding (Chocolate)', category: 'sweets', nutritionPer100g: { calories: 130, protein: 3, carbs: 22, fats: 4, fiber: 1, sugar: 17 }, servingSize: { amount: 120, unit: 'g', description: '1 cup' }, isVegetarian: true, isGlutenFree: true },

  // === DRINKS ===
  { name: 'Smoothie (Fruit)', category: 'beverages', nutritionPer100g: { calories: 50, protein: 1, carbs: 12, fats: 0, fiber: 1, sugar: 10 }, servingSize: { amount: 350, unit: 'ml', description: '1 glass' }, isVegan: true, isGlutenFree: true },
  { name: 'Protein Shake', category: 'beverages', nutritionPer100g: { calories: 80, protein: 15, carbs: 5, fats: 1, fiber: 0, sugar: 2 }, servingSize: { amount: 350, unit: 'ml', description: '1 shake' }, isGlutenFree: true },
  { name: 'Milkshake (Chocolate)', category: 'beverages', nutritionPer100g: { calories: 112, protein: 3, carbs: 18, fats: 4, fiber: 0, sugar: 16 }, servingSize: { amount: 350, unit: 'ml', description: '1 glass' }, isVegetarian: true, isGlutenFree: true },
  { name: 'Hot Chocolate', category: 'beverages', nutritionPer100g: { calories: 77, protein: 3, carbs: 11, fats: 3, fiber: 1, sugar: 9 }, servingSize: { amount: 240, unit: 'ml', description: '1 cup' }, isVegetarian: true, isGlutenFree: true },
  { name: 'Cappuccino', category: 'beverages', nutritionPer100g: { calories: 30, protein: 2, carbs: 3, fats: 1, fiber: 0, sugar: 3 }, servingSize: { amount: 240, unit: 'ml', description: '1 cup' }, isVegetarian: true, isGlutenFree: true },
  { name: 'Latte', category: 'beverages', nutritionPer100g: { calories: 45, protein: 3, carbs: 4, fats: 2, fiber: 0, sugar: 4 }, servingSize: { amount: 350, unit: 'ml', description: '1 large' }, isVegetarian: true, isGlutenFree: true },
  { name: 'Espresso', category: 'beverages', nutritionPer100g: { calories: 9, protein: 0.5, carbs: 1.7, fats: 0.2, fiber: 0, sugar: 0 }, servingSize: { amount: 30, unit: 'ml', description: '1 shot' }, isVegan: true, isGlutenFree: true },
  { name: 'Iced Coffee', category: 'beverages', nutritionPer100g: { calories: 3, protein: 0.2, carbs: 0.4, fats: 0, fiber: 0, sugar: 0 }, servingSize: { amount: 350, unit: 'ml', description: '1 glass' }, isVegan: true, isGlutenFree: true },
  { name: 'Lemonade', category: 'beverages', nutritionPer100g: { calories: 40, protein: 0, carbs: 10, fats: 0, fiber: 0, sugar: 9 }, servingSize: { amount: 350, unit: 'ml', description: '1 glass' }, isVegan: true, isGlutenFree: true },
  { name: 'Iced Tea', category: 'beverages', nutritionPer100g: { calories: 33, protein: 0, carbs: 8, fats: 0, fiber: 0, sugar: 8 }, servingSize: { amount: 350, unit: 'ml', description: '1 glass' }, isVegan: true, isGlutenFree: true },
  { name: 'Cola', category: 'beverages', nutritionPer100g: { calories: 42, protein: 0, carbs: 11, fats: 0, fiber: 0, sugar: 11 }, servingSize: { amount: 350, unit: 'ml', description: '1 can' }, isVegan: true, isGlutenFree: true },
  { name: 'Diet Cola', category: 'beverages', nutritionPer100g: { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0 }, servingSize: { amount: 350, unit: 'ml', description: '1 can' }, isVegan: true, isGlutenFree: true },
  { name: 'Sports Drink', category: 'beverages', nutritionPer100g: { calories: 26, protein: 0, carbs: 6, fats: 0, fiber: 0, sugar: 6 }, servingSize: { amount: 500, unit: 'ml', description: '1 bottle' }, isVegan: true, isGlutenFree: true },
  { name: 'Coconut Water', category: 'beverages', nutritionPer100g: { calories: 19, protein: 0.7, carbs: 4, fats: 0.2, fiber: 1, sugar: 2 }, servingSize: { amount: 330, unit: 'ml', description: '1 glass' }, isVegan: true, isGlutenFree: true },
  { name: 'Almond Milk', category: 'beverages', nutritionPer100g: { calories: 15, protein: 0.5, carbs: 0.6, fats: 1.2, fiber: 0, sugar: 0 }, servingSize: { amount: 240, unit: 'ml', description: '1 cup' }, isVegan: true, isGlutenFree: true },
  { name: 'Oat Milk', category: 'beverages', nutritionPer100g: { calories: 46, protein: 1, carbs: 7, fats: 1.5, fiber: 0.8, sugar: 4 }, servingSize: { amount: 240, unit: 'ml', description: '1 cup' }, isVegan: true },
  { name: 'Soy Milk', category: 'beverages', nutritionPer100g: { calories: 33, protein: 3, carbs: 1.8, fats: 1.8, fiber: 0.3, sugar: 1 }, servingSize: { amount: 240, unit: 'ml', description: '1 cup' }, isVegan: true, isGlutenFree: true },

  // === CONDIMENTS/SAUCES ===
  { name: 'Ketchup', category: 'condiments', nutritionPer100g: { calories: 112, protein: 1, carbs: 26, fats: 0.1, fiber: 0.3, sugar: 22 }, servingSize: { amount: 17, unit: 'g', description: '1 tbsp' }, isVegan: true, isGlutenFree: true },
  { name: 'Mayonnaise', category: 'condiments', nutritionPer100g: { calories: 680, protein: 1, carbs: 0.6, fats: 75, fiber: 0, sugar: 0.6 }, servingSize: { amount: 15, unit: 'g', description: '1 tbsp' }, isVegetarian: true, isGlutenFree: true },
  { name: 'Mustard', category: 'condiments', nutritionPer100g: { calories: 66, protein: 4, carbs: 6, fats: 3, fiber: 3, sugar: 3 }, servingSize: { amount: 5, unit: 'g', description: '1 tsp' }, isVegan: true, isGlutenFree: true },
  { name: 'BBQ Sauce', category: 'condiments', nutritionPer100g: { calories: 172, protein: 0.8, carbs: 41, fats: 0.6, fiber: 0.6, sugar: 33 }, servingSize: { amount: 30, unit: 'g', description: '2 tbsp' }, isVegan: true },
  { name: 'Soy Sauce', category: 'condiments', nutritionPer100g: { calories: 53, protein: 5, carbs: 5, fats: 0, fiber: 0.3, sugar: 0.4 }, servingSize: { amount: 15, unit: 'ml', description: '1 tbsp' }, isVegan: true },
  { name: 'Hot Sauce', category: 'condiments', nutritionPer100g: { calories: 11, protein: 0.5, carbs: 2, fats: 0.1, fiber: 0.6, sugar: 1 }, servingSize: { amount: 5, unit: 'ml', description: '1 tsp' }, isVegan: true, isGlutenFree: true },
  { name: 'Ranch Dressing', category: 'condiments', nutritionPer100g: { calories: 436, protein: 1, carbs: 6, fats: 45, fiber: 0, sugar: 3 }, servingSize: { amount: 30, unit: 'g', description: '2 tbsp' }, isVegetarian: true, isGlutenFree: true },
  { name: 'Italian Dressing', category: 'condiments', nutritionPer100g: { calories: 260, protein: 0, carbs: 9, fats: 25, fiber: 0, sugar: 7 }, servingSize: { amount: 30, unit: 'g', description: '2 tbsp' }, isVegan: true, isGlutenFree: true },
  { name: 'Peanut Butter', category: 'condiments', nutritionPer100g: { calories: 588, protein: 25, carbs: 20, fats: 50, fiber: 6, sugar: 9 }, servingSize: { amount: 32, unit: 'g', description: '2 tbsp' }, isVegan: true, isGlutenFree: true },
  { name: 'Jam (Strawberry)', category: 'condiments', nutritionPer100g: { calories: 278, protein: 0.4, carbs: 69, fats: 0.1, fiber: 1, sugar: 49 }, servingSize: { amount: 20, unit: 'g', description: '1 tbsp' }, isVegan: true, isGlutenFree: true },
  { name: 'Nutella', category: 'condiments', nutritionPer100g: { calories: 539, protein: 6, carbs: 58, fats: 31, fiber: 3, sugar: 56 }, servingSize: { amount: 37, unit: 'g', description: '2 tbsp' }, isVegetarian: true },
  { name: 'Cream Cheese', category: 'condiments', nutritionPer100g: { calories: 342, protein: 6, carbs: 4, fats: 34, fiber: 0, sugar: 4 }, servingSize: { amount: 30, unit: 'g', description: '2 tbsp' }, isVegetarian: true, isGlutenFree: true },
];

module.exports = additionalFoods;
