export const formatters = {
  number: (value: number, decimals: number = 0): string => {
    return value.toFixed(decimals);
  },

  calories: (value: number): string => {
    return `${formatters.number(value, 0)} kcal`;
  },

  macronutrient: (value: number, unit: string = 'g'): string => {
    return `${formatters.number(value, 1)}${unit}`;
  },

  percentage: (current: number, goal: number): string => {
    const percentage = (current / goal) * 100;
    return `${formatters.number(percentage, 0)}%`;
  },

  weight: (value: number, unit: 'kg' | 'lbs' = 'kg'): string => {
    return `${formatters.number(value, 1)} ${unit}`;
  },

  height: (value: number, unit: 'cm' | 'in' = 'cm'): string => {
    return `${formatters.number(value, 0)} ${unit}`;
  },
};
