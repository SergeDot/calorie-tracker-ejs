// workaround for chai.execute.request issue
import { use } from 'chai';
import chaiHttp from 'chai-http';
const chai = use(chaiHttp);

export default chai;
