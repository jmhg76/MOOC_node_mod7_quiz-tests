const Browser = require('zombie');
const chai = require('chai');
const expect = require('chai').expect;
//const assert = require('chai').assert;
const should = require('chai').should();
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('P2P: Diseño de tests para aplicaciones web', function() {
  const browser = new Browser();
  before(() => browser.visit('http://localhost:8000/quizzes'));
  it('funcionalidad de una vista mostrada al usuario', function() {
    browser.assert.success();
    browser.assert.url({pathname: '/quizzes'});
  });

  before(() => browser.visit('http://localhost:8000/quizzes/new'));
  before(() => {
    browser.fill('question', 'Testing question');
    browser.fill('answer', 'Testing answer');
    return browser.pressButton('Create');
  })
  it('funcionamiento de un formulario', function() {
    browser.assert.success();
    browser.assert.url({pathname: '/quizzes'});
    browser.assert.text('div:last-of-type>a:first-child',
      'Testing question');
    const arr = browser.html('div:last-of-type>a:first-child').split('/');
    browser.visit(`http://localhost:8000/quizzes/${arr[2]}?_method=DELETE`)
  });

  it('funcionamiento de una ruta', function(done) {
    chai.request('http://localhost:8000')
      .get('/quizzes')
      .end(function(err, res) {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        done();   // <= Call done to signal callback end
      });
  });

  it('funcionamiento de un controlador', function(done) {
    chai.request('http://localhost:8000')
      .get('/other')
      .end(function(err, res) {
        expect(res).to.have.status(404);
        let text = 'Error: resource not found or method not supported.';
        expect(res.text).to.equal(text);
        done();   // <= Call done to signal callback end
      });
  });

  it('funcionamiento de acceso a la BD', async function() {
    const {Sequelize, QueryTypes} = require('sequelize');
    /*************************** query: { raw: true } ************************/
    //const options = { logging: false, query: {raw: true} };
    const options = { logging: false };
    const sequelize = new Sequelize("sqlite:db.sqlite", options);
    const Quiz = sequelize.define( // define Quiz model (table quizzes)
      'quiz', {
        question: Sequelize.STRING,
        answer: Sequelize.STRING
      }
    );
    //await sequelize.sync();
    //console.time('quiz');
    const quizzes = await Quiz.findAll({
      attributes: ['id', 'question', 'answer']
    });
    //console.timeEnd('quiz');
    //console.log(quizzes);
    /*********/
    //console.time('raw');
    //const rawquiz = await sequelize.query("SELECT id, question, answer\
      //FROM `quizzes`", { type: QueryTypes.SELECT });
    /*********/
    //console.timeEnd('raw');
    //console.log(rawquiz);
    quizzes.should.be.a('array');
    quizzes.should.have.length(quizzes.length);
    quizzes.map(quiz => {
      quiz.should.have.property('id');
      quiz.should.have.property('question');
      quiz.should.have.property('answer');
    });
  });

});

/*describe.skip('Test group 2', function() {

  before(function() { console.log(' - Before test group 2') });
  after(function() { console.log(' - After test group 2') });

  it('Unit test 3 should fail', function() {
    console.log(' - Unit test 3');
    throw new Error('Unit 3 test error');
  });

});*/
