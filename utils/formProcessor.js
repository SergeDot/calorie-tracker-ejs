const LB_TO_KG = 0.453592;
const FT_TO_CM = 30.48;
const IN_TO_CM = 2.54;
const P_ACTIVITY_MATRIX = {
  1: {
    1: 1,
    2: 1.12,
    3: 1.27,
    4: 1.54
  },
  2: {
    1: 1,
    2: 1.14,
    3: 1.27,
    4: 1.45
  }
};

const TEE_ACTIVITY_FACTOR_MATRIX = {
  1: {
    1: 0.3,
    2: 0.6,
    3: 0.7,
    4: 1.1,
    5: 1.4
  },
  2: {
    1: 0.3,
    2: 0.5,
    3: 0.6,
    4: 0.9,
    5: 1.2
  }
};

const TDEE_ACTIVITY_FACTOR_MATRIX = {
  1: 1.55,
  2: 1.85,
  3: 2.2,
  4: 2.4,
  5: 2.679
};

const TDEE_ACTIVITY_FACTOR_MATRIX2 = {
  1: 1.2,
  2: 1.375,
  3: 1.55,
  4: 1.725,
  5: 1.9
};

const calculateCalories = (birthYear, sex, lifestyle, height, weight) => {
  const weightKg = weight * LB_TO_KG;
  const heightCm = (height.feet * FT_TO_CM + height.inches * IN_TO_CM);
  const heightM = (height.feet * FT_TO_CM + height.inches * IN_TO_CM) / 100;
  const age = new Date().getFullYear() - birthYear;
  const calcedLifestyle = P_ACTIVITY_MATRIX[sex][lifestyle];
  let result = {};

  const maleTEE = 864 - 9.72 * age + calcedLifestyle * (14.2 * weightKg + 503 * heightM);
  const femaleTEE = 387 - 7.31 * age + calcedLifestyle * (10.9 * weightKg + 660.7 * heightM);

  const maleBMR = 66.5 + (13.75 * weightKg) + (5.003 * heightCm) - (6.75 * age);
  const femaleBMR = 655.1 + (9.563 * weightKg) + (1.850 * heightCm) - (4.676 * age);

  let maleRMR;
  if (age > 0 && age <= 3) {
    maleRMR = 60.9 * weightKg - 54;
  } else if (age > 3 && age <= 10)
    maleRMR = 22.7 * weightKg + 495;
  else if (age > 10 && age <= 18) {
    maleRMR = 17.5 * weightKg + 651;
  } else if (age > 18 && age <= 30) {
    maleRMR = 15.3 * weightKg + 679;
  } else if (age > 30 && age <= 60) {
    maleRMR = 11.6 * weightKg + 879;
  } else if (age > 60) {
    maleRMR = 13.5 * weightKg + 487;
  };

  let femaleRMR;
  if (age > 0 && age <= 3) {
    femaleRMR = 61 * weightKg - 51;
  } else if (age > 3 && age <= 10) {
    femaleRMR = 22.5 * weightKg + 499;
  } else if (age > 10 && age <= 18) {
    femaleRMR = 12.2 * weightKg + 746;
  } else if (age > 18 && age <= 30) {
    femaleRMR = 14.7 * weightKg + 496;
  } else if (age > 30 && age <= 60) {
    femaleRMR = 8.7 * weightKg + 829;
  } else if (age > 60) {
    femaleRMR = 10.5 * weightKg + 596
  };

  const maleLBM = 0.407 * weightKg + 0.267 * heightCm - 19.2;
  let femaleLBM = 0.252 * weightKg + 0.473 * heightCm - 48.3;

  const maleTDEE = maleRMR * TDEE_ACTIVITY_FACTOR_MATRIX[lifestyle];
  const femaleTDEE = femaleRMR * TDEE_ACTIVITY_FACTOR_MATRIX[lifestyle];

  const maleDCE = 1.1 * maleRMR * (1 + TEE_ACTIVITY_FACTOR_MATRIX[sex][lifestyle]);
  const femaleDCE = 1.1 * femaleRMR * (1 + TEE_ACTIVITY_FACTOR_MATRIX[sex][lifestyle]);

  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  result.bmi = Math.round(bmi * 10) / 10;
  result.bmiCategory = bmi < 18.5
    ? 'Underweight'
    : bmi < 24.9
      ? 'Normal'
      : bmi < 29.9
        ? 'Overweight'
        : 'Obesity';

  if (sex - 1) {
    result.tee = Math.round(femaleTEE);
    result.bmr = Math.round(femaleBMR);
    result.rmr = Math.round(femaleRMR);
    result.thefex = Math.round(femaleRMR * TEE_ACTIVITY_FACTOR_MATRIX[sex][lifestyle]);
    result.lbm = Math.round(femaleLBM);
    result.tdee = Math.round(femaleTDEE);
    result.dce = Math.round(femaleDCE);
  } else {
    result.tee = Math.round(maleTEE);
    result.bmr = Math.round(maleBMR);
    result.rmr = Math.round(maleRMR);
    result.thefex = Math.round(maleRMR * TEE_ACTIVITY_FACTOR_MATRIX[sex][lifestyle]);
    result.lbm = Math.round(maleLBM);
    result.tdee = Math.round(maleTDEE);
    result.dce = Math.round(maleDCE);
  };
  return result;
};

const genderSelection = { 'gender_male': 1, 'gender_female': 2 };
const lifestyleSelection = { 'sedentary': 1, 'moderately_active': 2, 'active': 3, 'very_active': 4 };

const processUserForm = (reqBody) => {
  const keys = Object.keys(reqBody);
  let result = {};
  result.height = {};
  // result.goal = [];
  if (keys.includes('feet')) {
    result.height.feet = reqBody.feet;
  };
  if (keys.includes('unit')) {
    result.height.inches = reqBody.inches;
  };
  keys.map(key => {
    if (key === 'feet' || key === 'inches') {
      result.height[key] = reqBody[key];
      // } else if (Object.keys(goalSelection).includes(key)) {
      //   result.goal.push(goalSelection[key]);
    } else if (key === 'gender') {
      if (Object.keys(genderSelection).includes(reqBody[key][0])) {
        result.sex = genderSelection[reqBody[key][0]];
        result.gender = reqBody[key][0];
      } else {
        result.sex = 2;
        result.gender = reqBody[key][1]
      }
    } else if (key === 'age') {
      result.birthYear = new Date().getFullYear() - reqBody[key];
    } else if (key === 'lifestyle') {
      result.lifestyle = lifestyleSelection[reqBody[key]];
    } else {
      result[key] = reqBody[key];
    };
  });
  return result;
};

const reverseUserForm = (userInfo) => {
  const goalSelection = { 'lose_weight': 'Lose weight', 'maintain_weight': 'Maintain weight', 'gain_weight': 'Gain weight' };
  const lifestyleSelection = ['Sedentary', 'Moderately Active', 'Active', 'Very Active'];
  const goal = goalSelection[userInfo.goal];
  const lifestyle = lifestyleSelection[userInfo.lifestyle - 1];
  return { goal, lifestyle };
};

const processFoodItemForm = (reqBody) => {
  const keys = Object.keys(reqBody);
  let result = {};
  result.amount = {};
  if (keys.includes('quantity')) {
    result.amount.quantity = reqBody.quantity;
  };
  if (keys.includes('unit')) {
    result.amount.unit = reqBody.unit;
  };
  keys.map(key => {
    if (key === 'quantity' || key === 'unit') {
      result.amount[key] = reqBody[key];
    } else {
      result[key] = reqBody[key];
    }
  })
  return result;
};

const reverseFoodItemForm = (foodItems) => {
  const mealTimeSelection = { 'breakfast': 'Breakfast', 'second_breakfast': 'Second Breakfast', 'lunch': 'Lunch', 'after_lunch': 'After Lunch', 'dinner': 'Dinner', 'late_dinner': 'Late Dinner', 'midnight_crave': 'Midnight Crave' };
  const amountUnit = {'fl_oz': 'fl oz', 'small_bowl': 'small bowl', 'large_bowl': 'large bowl', 'just_a_pinch_it_doesnt_count': 'just a pinch it doesn\'t count'};
  for (let item of foodItems) {
    item.mealTime = mealTimeSelection[item.mealTime];
    item.amount.unit = amountUnit[item.amount.unit] || item.amount.unit;
  };
  return foodItems;
};

const processActivityForm = (reqBody) => {
  const keys = Object.keys(reqBody);
  let result = {};
  result.duration = {};
  if (keys.includes('number')) {
    result.duration.number = reqBody.number;
  };
  if (keys.includes('unit')) {
    result.duration.unit = reqBody.unit;
  };
  keys.map(key => {
    if (key === 'number' || key === 'unit') {
      result.duration[key] = reqBody[key];
    } else {
      result[key] = reqBody[key];
    }
  });
  return result;
};

const formattedDateEdit = (date) => {
  const timeZoneOffset = new Date(date).getTimezoneOffset();
  const offsetDate = new Date(Date.parse(date) + timeZoneOffset * 60 * 1000);
  const year = offsetDate.getFullYear();
  const month = offsetDate.getMonth();
  const day = offsetDate.getDate();
  return `${year}-${month + 1}-${day}`;
};

export {
  processFoodItemForm,
  processActivityForm,
  formattedDateEdit,
  processUserForm,
  reverseUserForm,
  calculateCalories,
  reverseFoodItemForm
};
