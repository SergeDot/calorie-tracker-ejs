import { expect } from 'chai';
import chai from '../utils/chaiLauncher.js';
import { app, server } from '../app.js';

const loginText = 'Logon';
const registerText = 'Register';
const secretWordText = 'View/change the secret word';
const foodListText = 'View/change the food item list';

describe("test getting a page @chai", function () {
  after(() => {
    server.close();
  });

  it("should get the index page", (done) => {
    chai
      .request.execute(app)
      .get("/")
      .send()
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
  });
});
