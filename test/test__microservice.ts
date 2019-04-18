import * as chai from 'chai';
// import * as sinon from 'sinon';

chai.use(require('sinon-chai'));

chai.use(require('chai-diff'));

const {expect} = chai;

describe('Project', function (): void {
    it('Should be tested but is not',(): void => {
        expect(true);
    });
});
