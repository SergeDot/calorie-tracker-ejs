import { expect } from 'chai';
import puppeteer from 'puppeteer';
import { server, port } from '../app.js';
import { factory, seed_db, testUserPassword, predefinedNumberOfFoodItems } from '../utils/seed_db.js';

const baseUrl = `http://localhost:${port}`;
const browserWindowOptions = [
  `--window-size=1440,1080`,
  `--window-position=480,240`
];
const headless = false;
const browserOptions = headless ? {
  headless: true
} : {
  headless: false,
  slowMo: 10,
  args: [...browserWindowOptions]
};
let testUser = null;

const logonButtonText = 'Logon';
const registerButtonText = 'Register';
const homePageHeaderText = 'Calorie Tracker EJS';
const regexLastFourDigits = /\d{4}$/g;
const currentYear = new Date().getFullYear().toString();

//utils
const waitFor = (milliseconds) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliseconds)
  });
};

const createFoodItemData = async (userId) => {
  const { _doc: dataToPost } = await factory.build('foodItem', { createdBy: userId });
  delete dataToPost._id;
  return dataToPost;
};

const createUserData = async () => {
  const { _doc: dataToPost } = await factory.build('user', { password: testUserPassword });
  delete dataToPost._id;
  return dataToPost;
};

const formattedDateEdit = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toLocaleString(undefined, { minimumIntegerDigits: 2 });
  const day = (date.getDate()).toLocaleString(undefined, { minimumIntegerDigits: 2 });
  return `${month}/${day}/${year}`;
};

const runTests = async () => {
  let page = null;
  let browser = null;

  // page utils
  const getTextBySelector = async (selector) => {
    if (typeof selector === 'string') {
      try {
        const element = await page.waitForSelector(selector);
        return element.evaluate(el => el.textContent);
      } catch (e) {
        console.log(`Error getting ${selector}`, e);
        return;
      };
    } else {
      console.log(`Wrong selector data type`);
    };
  };

  const clickElementBySelector = async (selector) => {
    if (typeof selector === 'string') {
      try {
        const element = await page.waitForSelector(selector);
        element.click();
      } catch (e) {
        console.log(`Error getting ${selector}`, e);
        return;
      };
    } else {
      console.log(`Wrong selector data type`);
    };
  };

  const getPageHeaderText = async () => {
    return await getTextBySelector('.page-header');
  };

  //scenarios
  // Launch the browser and open a new blank page
  describe('puppeteer test suite @puppeteer', function () {
    before(async function () {
      this.timeout(45000);
      browser = await puppeteer.launch(browserOptions);
      page = await browser.newPage();
      await page.goto(baseUrl);
    });

    after(async function () {
      this.timeout(5000);
      await browser.close();
      server.close();
      return;
    });

    describe('got to site', function () {
      it('should have completed a connection', function (done) {
        done();
      });
    });

    describe('index page test', function () {
      this.timeout(10000);

      it('finds the index page logon link', async () => {
        this.logonLink = await page.waitForSelector(
          `#logon ::-p-text(${logonButtonText})`
        );
        this.registerLink = await page.waitForSelector(
          `#register ::-p-text(${registerButtonText})`
        );
        const pageHeader = await getTextBySelector('h1');
        const pageHeaderText = pageHeader.trim();
        expect(pageHeaderText).to.eq(homePageHeaderText);
      });

      it('gets to the logon page', async () => {
        await this.logonLink.click();
        await page.waitForNavigation();
        const emailField = await page.waitForSelector('input[name=email]');
        expect(emailField).not.to.be.null;
        const passwordField = await page.waitForSelector('input[name=password]');
        expect(passwordField).not.to.be.null;
      });
    });

    describe('logon page test', function () {
      this.timeout(20000);

      it('resolves all the fields', async () => {
        this.email = await page.waitForSelector('input[name=email]');
        this.password = await page.waitForSelector('input[name=password]');
        this.submit = await page.waitForSelector('button ::-p-text(Logon)');
      });

      it('sends the logon', async () => {
        testUser = await seed_db();
        await this.email.type(testUser.email);
        await this.password.type(testUserPassword);
        await this.submit.click();
        await page.waitForNavigation();
        await page.waitForSelector(
          `p ::-p-text(Logon successful. Welcome)`,
        );
        const userNameText = await getTextBySelector(`#user-name`);
        const userName = userNameText.trim();
        expect(userName).to.be.equal(testUser.name);

        await page.waitForSelector('div ::-p-text(change the secret)');
        const copyright = await getTextBySelector('p ::-p-text(Girrackle)');

        const copyrightText = copyright.trim();
        const copyrightYear = regexLastFourDigits.exec(copyrightText)[0];
        expect(copyrightYear).to.be.equal(currentYear);
      });

      it('logs off', async () => {
        const logoffButton = await page.waitForSelector(`button#logoff`);
        await logoffButton.click();
        await page.waitForNavigation();
        const logonButton = await page.waitForSelector(
          `#logon ::-p-text(${logonButtonText})`
        );
        const registerButton = await page.waitForSelector(
          `#register ::-p-text(${registerButtonText})`
        );
        expect(logonButton).not.to.be.null;
        expect(registerButton).not.to.be.null;
      });
    });

    describe('registration test', function () {
      this.timeout(15000);

      it('navigates to the registration page', async () => {
        await clickElementBySelector(
          `#register ::-p-text(${registerButtonText})`
        );
        const pageHeader = await getPageHeaderText();
        expect(pageHeader).to.include('Registration');
      });

      it('resolves all the fields', async () => {
        this.name = await page.waitForSelector('input#name');
        this.email = await page.waitForSelector('input#email');
        this.password1 = await page.waitForSelector('input#password');
        this.password2 = await page.waitForSelector('input#password1');
        this.submit = await page.waitForSelector('button ::-p-text(Register)');
        this.cancel = await page.waitForSelector('button ::-p-text(Cancel)');
      });

      it('registers new user', async () => {
        const formData = await createUserData();
        this.user = { ...formData };

        await this.name.type(formData.name);
        await this.email.type(formData.email);
        await this.password1.type(testUserPassword);
        await this.password2.type(testUserPassword);
        this.submit.click();
        await page.waitForNavigation();

        const successMessageText = await getTextBySelector('h3.info-message');
        expect(successMessageText).to.include('Registration is successful');
      });

      it('logs in with new credentials', async () => {
        await clickElementBySelector(
          `#logon ::-p-text(${logonButtonText})`
        );
        const emailInput = await page.waitForSelector('input[name=email]');
        const passwordInput = await page.waitForSelector('input[name=password]');
        await emailInput.type(this.user.email);
        await passwordInput.type(testUserPassword);
        await clickElementBySelector('button ::-p-text(Logon)');
        await page.waitForNavigation();
        const welcomeMessage = await getTextBySelector(
          `p ::-p-text(Logon successful. Welcome)`,
        );
        expect(welcomeMessage).not.to.be.null;
        expect(welcomeMessage).to.include(this.user.name);
      });
    });

    describe('food item page test', function () {
      this.timeout(10000);

      // login
      before(async function () {
        const loggedIn = await page.waitForSelector('p#message', { timeout: 500 });
        if (loggedIn) {
          const logoffButton = await page.waitForSelector(`button#logoff`);
          await logoffButton.click();
        };
        await clickElementBySelector(
          `#logon ::-p-text(${logonButtonText})`
        );
        const emailInput = await page.waitForSelector('input[name=email]');
        const passwordInput = await page.waitForSelector('input[name=password]');
        testUser = await seed_db();
        await emailInput.type(testUser.email);
        await passwordInput.type(testUserPassword);
        await clickElementBySelector('button ::-p-text(Logon)');
        await page.waitForNavigation();
        const welcomeMessage = await page.waitForSelector(
          `p ::-p-text(Logon successful. Welcome)`,
        );
        expect(welcomeMessage).not.to.be.null;
      });

      it('verifies the number of food items', async () => {
        const foodItemListButton = await page.waitForSelector('.form-input-text a[href="/food-items"]');
        await foodItemListButton.click();
        const pageHeader = await getPageHeaderText();
        expect(pageHeader).to.include('Food Items List');
        const foodItemElmentList = await page.$$('.food-item-entry');
        expect(foodItemElmentList).to.have.length(predefinedNumberOfFoodItems);
      });

      it('goes to add food item page', async () => {
        const addFoodItemListButton = await page.waitForSelector('#add-food-item-button');
        await addFoodItemListButton.click();
        const pageHeader = await getPageHeaderText();
        expect(pageHeader).to.include('Food Item Form');
      });

      it('resolves all the fields', async () => {
        this.name = await page.waitForSelector('input#food-name');
        this.brand = await page.waitForSelector('input#brand');
        this.mealTime = await page.waitForSelector('select#meal-time');
        this.calories = await page.waitForSelector('input#calories');
        this.quantity = await page.waitForSelector('input#quantity');
        this.unit = await page.waitForSelector('select#unit');
        this.consumeDate = await page.waitForSelector('input#consume-date');
        this.comments = await page.waitForSelector('input#comments');
        this.submit = await page.waitForSelector('button ::-p-text(Add)');
        this.cancel = await page.waitForSelector('button ::-p-text(Cancel)');
      });

      it('creates a food item', async () => {
        this.timeout(40000);
        const formData = await createFoodItemData(testUser.id);
        await this.name.type(formData.name);
        await this.brand.type(formData.brand);
        await this.mealTime.select(formData.mealTime);
        await this.calories.type(`${formData.calories}`);
        await this.quantity.type(`${formData.amount.quantity}`);
        await this.unit.select(formData.amount.unit);
        await this.consumeDate.type(formattedDateEdit(formData.consumeDate));
        await this.comments.type(formData.comments);
        this.submit.click();
        await page.waitForNavigation();
        const resultMessage = await getTextBySelector('h3.info-message');
        expect(resultMessage).to.include('added successfully')
      });
    });
  });
};

await runTests();
