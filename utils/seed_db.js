import { createRequire } from "module";
const require = createRequire(import.meta.url);

const FactoryBot = require('factory-bot');
import FoodItem from '../models/FoodItem.js';
import User from '../models/User.js';
import { fakerEN_US as faker } from '@faker-js/faker';
import { config } from 'dotenv';
config();

const mealTimeChoiceList = ['breakfast', 'second_breakfast', 'lunch', 'after_lunch', 'dinner', 'late_dinner', 'midnight_crave'];
const unitChoice = ['oz', 'g', 'lb', 'glass', 'qt', 'gal', 'cup', 'fl_oz', 'teaspoonful', 'small_bowl', 'large_bowl', 'just_a_pinch_it_doesnt_count'];

const createDaterange = (days) => {
  let end = new Date();
  let start = new Date(end.getTime() - (days * 24 * 60 * 60 * 1000));
  return { start, end };
};
const dateRange = createDaterange(10);
const predefinedNumberOfFoodItems = 20;

const testUserPassword = faker.internet.password();
const factory = FactoryBot.factory;
const factoryAdapter = new FactoryBot.MongooseAdapter();
factory.setAdapter(factoryAdapter);
factory.define('foodItem', FoodItem, {
  name: () => faker.animal.fish(),
  brand: () => faker.company.name(),
  mealTime: () => mealTimeChoiceList[Math.floor(mealTimeChoiceList.length * Math.random())], // random one of these
  calories: () => faker.number.int({ min: 100, max: 1000 }),
  amount: {
    quantity: () => faker.number.int(8),
    unit: () => unitChoice[Math.floor(unitChoice.length * Math.random())]
  },
  consumeDate: () => faker.date.between({ from: dateRange.start, to: dateRange.end }),
  comments: () => faker.word.interjection()
}
);
factory.define('user', User, {
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  password: () => faker.internet.password()
});

const seed_db = async () => {
  let testUser = null;
  let foodItem = null;
  try {
    const mongoURL = process.env.MONGO_URI_TEST
    await FoodItem.deleteMany({}) // deletes all job records
    await User.deleteMany({}) // and all the users
    testUser = await factory.create('user', { password: testUserPassword })
    foodItem = await factory.createMany('foodItem', predefinedNumberOfFoodItems, { createdBy: testUser._id }) // put 20 job entries in the database.
  } catch (e) {
    console.log('database error')
    console.log(e.message);
    throw (e);
  };
  return testUser;
};

export { testUserPassword, factory, seed_db, predefinedNumberOfFoodItems };
