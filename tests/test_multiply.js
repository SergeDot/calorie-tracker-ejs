import multiply from '../utils/multiply.js';
import { expect } from 'chai';

describe('testing multiply @chai', () => {
  it('should give 7*6 is 42', (done) => {
    expect(multiply(7, 6)).to.equal(42);
    done();
  });

  it('should give 7*6 is 42', (done) => {
    expect(multiply(7, 6)).to.equal(97)
    done();
  });
});
