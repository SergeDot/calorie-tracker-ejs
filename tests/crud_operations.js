import { use, expect } from 'chai';
import chai from '../utils/chaiLauncher.js';
import { app, server } from '../app.js';
import { factory, seed_db, testUserPassword, predefinedNumberOfFoodItems } from '../utils/seed_db.js';
import FoodItem from '../models/FoodItem.js';

const loginText = 'Logon';
const registerText = 'Register';
const secretWordText = 'View/change the secret word';
const foodListText = 'View/change the food item list';
const foodItemHeaderText = 'Food Items List';
const regexTextCSRF = /_csrf\" value=\"(.*?)\"/;
const regexResHeaderCSRFCookie = /csrfToken=(.*?);\s/;
const regexFoodItemRowClass = /food-item-entry/g;

describe('tests for crud operations @chai', function () {
  this.timeout(45000);
  after(() => {
    server.close();
  });

  it('should get CSRF', (done) => {
    chai
      .request.execute(app)
      .get('/sessions/register')
      .send()
      .end((err, res) => {
        if (err) {
          console.log(err);
          done();
        };
        const textNoLineEnd = res.text.replaceAll('\n', '');
        const csrfToken = regexTextCSRF.exec(textNoLineEnd);
        expect(csrfToken).to.not.be.null;
        this.csrfToken = csrfToken[1];
        expect(res).to.have.property('headers');
        expect(res.headers).to.have.property('set-cookie');
        const cookies = res.headers['set-cookie'];
        const csrfCookie = cookies.find(element =>
          element.startsWith('csrfToken'),
        );
        expect(csrfCookie).to.not.be.undefined;
        const cookieValue = regexResHeaderCSRFCookie.exec(csrfCookie);
        this.csrfCookie = cookieValue[1];
        done();
      });
  });

  it('should log the user on and get cookie', async () => {
    this.timeout(15000);
    const { email, name, id } = await seed_db();
    const dataToPost = {
      password: testUserPassword,
      _csrf: this.csrfToken,
      email
    };
    this.user = { name, id };
    try {
      const request =
        chai
          .request.execute(app)
          .post('/sessions/logon')
          .set('Cookie', `csrfToken=${this.csrfCookie}`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .redirects(0)
          .send(dataToPost);
      const res = await request;
      expect(res).to.have.status(302);
      expect(res.headers.location).to.equal('/');
      const cookies = res.headers['set-cookie'];
      this.sessionCookie = cookies.find(element =>
        element.startsWith('connect.sid'),
      );
      expect(this.sessionCookie).to.not.be.undefined;
    } catch (error) {
      console.log(error.message);
      expect.fail('Logon request failed');
    };
  });

  it('should get the index page', (done) => {
    chai
      .request.execute(app)
      .get('/')
      .set('Cookie', this.sessionCookie)
      .send()
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res).to.have.property('text');
        expect(res.text).to.include(this.user.name);
        done();
      });
  });

  it('should get the food item page', (done) => {
    chai
      .request.execute(app)
      .get('/food-items')
      .set('Cookie', this.sessionCookie)
      .send()
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res).to.have.property('text');
        expect(res.text).to.include(foodItemHeaderText);
        const foodItemLineList = res.text.match(regexFoodItemRowClass);
        expect(foodItemLineList).to.have.length(predefinedNumberOfFoodItems);
        // console.log(`157`, Object.keys(res));
        done();
      });
  });

  it('should add a food item', async () => {
    this.timeout(15000);

    const { _doc: dataToPost } = await factory.build('foodItem', { createdBy: this.user.id });
    delete dataToPost._id;
    dataToPost._csrf = this.csrfToken;

    try {
      const request =
        chai
          .request.execute(app)
          .post('/food-items')
          .set('Cookie', `csrfToken=${this.csrfCookie};${this.sessionCookie}`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .redirects(0)
          .send(dataToPost);

      const res = await request;
      expect(res).to.have.status(302);
      expect(res.text).not.to.include(`class="error-message"`);
      const createdFoodItem = FoodItem.findOne({
        name: dataToPost.name,
        brand: dataToPost.brand,
        mealTime: dataToPost.mealTime,
        calories: dataToPost.calories,
        amount: {
          quantity: dataToPost.amount.quantity,
          unit: dataToPost.amount.unit
        },
        consumeDate: dataToPost.consumeDate,
        comments: dataToPost.comments
      })
      expect(createdFoodItem).not.to.be.null;
    } catch (err) {
      console.log(err.message);
      console.log(err);
      expect.fail('add food failed');
    };
  });

  it('should get the updated food item page', (done) => {
    chai
      .request.execute(app)
      .get('/food-items')
      .set('Cookie', this.sessionCookie)
      .send()
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res).to.have.property('text');
        expect(res.text).to.include(foodItemHeaderText);
        const foodItemLineList = res.text.match(regexFoodItemRowClass);
        expect(foodItemLineList).to.have.length(predefinedNumberOfFoodItems + 1);
        done();
      });
  });

  it('should log the user off', (done) => {
    const dataToPost = {
      _csrf: this.csrfToken,
    };
    try {
      chai
        .request.execute(app).post('/sessions/logoff')
        .set('Cookie', `csrfToken=${this.csrfCookie}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .redirects(1)
        .send(dataToPost)
        .end((err, res) => {
          expect(err).to.equal(null);
          expect(res).to.have.status(200);
          expect(res).to.have.property("text");
          expect(res.text).to.include(loginText);
          expect(res.text).to.include(registerText);
          expect(res.text).not.to.include(secretWordText);
          expect(res.text).not.to.include(foodListText);
          done();
        });
    } catch (err) {
      console.log(err.message);
      expect.fail();
    };
  });
});
