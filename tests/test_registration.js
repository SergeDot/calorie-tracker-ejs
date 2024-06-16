import { expect } from 'chai';
import chai from '../utils/chaiLauncher.js';
import { app, server } from '../app.js';

import { factory } from '../utils/seed_db.js';
import { fakerEN_US as faker } from '@faker-js/faker';
import User from '../models/User.js';

const loginText = 'Logon';
const registerText = 'Register';
const secretWordText = 'View/change the secret word';
const foodListText = 'View/change the food item list';
const regexTextCSRF = /_csrf\" value=\"(.*?)\"/;
const regexResHeaderCSRFCookie = /csrfToken=(.*?);\s/;

describe('tests for registration and logon @chai', function () {
  after(() => {
    server.close();
  });

  it('should get the registration page', (done) => {
    chai
      .request.execute(app)
      .get('/sessions/register')
      .send()
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res).to.have.property('text');
        expect(res.text).to.include('Enter your name');
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

  it('should register the user', async () => {
    this.password = faker.internet.password();
    this.user = await factory.build('user', { password: this.password });
    const dataToPost = {
      name: this.user.name,
      email: this.user.email,
      password: this.password,
      password1: this.password,
      _csrf: this.csrfToken,
    };
    try {
      const request =
        chai
          .request.execute(app)
          .post('/sessions/register')
          .set("Cookie", `csrfToken=${this.csrfCookie}`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send(dataToPost);

      const res = await request;

      expect(res).to.have.status(200);
      expect(res).to.have.property('text');
      expect(res.text).to.include(loginText);
      expect(res.text).to.include(registerText);
      const newUser = await User.findOne({ email: this.user.email });
      expect(newUser).to.not.be.null;
    } catch (error) {
      console.log(`Register request failed ${error.message}`);
      expect.fail(`Register request failed ${error.message}`);
    }
  });

  it('should log the user on', async () => {
    const dataToPost = {
      email: this.user.email,
      password: this.password,
      _csrf: this.csrfToken,
    };
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
      .request.execute(app).get('/')
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
    } catch (error) {
      console.log(error.message);
      expect.fail();
    };
  });
});
