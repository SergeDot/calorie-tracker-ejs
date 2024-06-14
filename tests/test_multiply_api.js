import { expect } from 'chai';
import chai from '../utils/chaiLauncher.js';
import { app, server } from '../app.js';

describe('test multiply api @chai', () => {
  after(() => {
    try {
      server.close();
      console.log(`The server is closed`);
    } catch (e) {
      console.log(e);
      console.log(`Error closing the server`);
    }
  });

  it('should multiply two numbers', (done) => {
    chai.request.execute(app)
      .get('/multiply')
      .query({ first: 7, second: 6 })
      .send()
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res).to.have.property('body');
        expect(res.body).to.have.property('result');
        expect(res.body.result).to.equal(42);
        done();
      });
  });
});
