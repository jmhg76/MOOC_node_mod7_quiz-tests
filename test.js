// Install mocha: npm install  mocha
// Install chai: npm install --save-dev chai
// Install zombie: npm install --save-dev zombie

const Browser = require("zombie");
const browser = new Browser();

let chai = require("chai");
let chaiHttp = require("chai-http");
chai.use(chaiHttp);

let chai_expect = chai.expect;

const Sequelize = require('sequelize');

const options = { logging: false, operatorsAliases: false };
const sequelize = new Sequelize("sqlite:db.sqlite", options);

const Quiz = sequelize.define( // define Quiz model (table quizzes)
    'quiz', {
        question: Sequelize.STRING,
        answer: Sequelize.STRING
    }
);

const ID2DELETE = 1;

const SERVER = "http://localhost";
const PORT = "8000";
const PATH = "quizzes";
const URL = `${SERVER}:${PORT}/${PATH}`;
const ROUTE = "/1/play";
const NEW = "/new"

const URLTEXT = "http://localhost:8000/quizzes";
const URLFORM = "http://localhost:8000/quizzes/new";

const URLROUTE = `${URL}${ROUTE}`;
const URLNEW = `${URL}${NEW}`;




before(function() {
    console.log(` - Inicio de los tests - \n`);
});
after(function() {
    console.log(` - Final de los tests - `)
});

describe("1. Módulo 7: Pruebas con Zombie: Un test que compruebe la funcionalidad de una vista mostrada al usuario", function() {

    before(() => browser.visit(URLTEXT));

    it("1.1. Visitamos página '" + URLTEXT + "' ...", () => {
        browser.assert.success();
    });

    it("1.2. Estamos en la página de '" + URLTEXT + "' ...", () => {
        browser.assert.url({ pathname: "/quizzes" });
    });
});


describe("2. Módulo 7: Pruebas con Zombie: Un test que compruebe el funcionamiento de un formulario", function() {

    before(() => browser.visit(URLFORM));

    it("2.1. Visitamos formulario '" + URLFORM + "' ...", () => {
        browser.assert.success();
    });

    it("2.2. Estamos en la página de " + URLFORM + "' ...", () => {
        browser.assert.url({ pathname: "/quizzes/new" });
    });

    it("2.3. Rellenamos formulario " + URLFORM + "' ...", () => {
        browser.fill('question', 'question-test');
        browser.fill('answer', 'answer-test')
        return browser.pressButton('Create');
    });

    it("2.4. Volvemos a la página de " + URLTEXT + "' ...", () => {
        browser.assert.url({ pathname: "/quizzes" });
    });
});


describe("3. Módulo 7: Pruebas con Chai: Un test que compruebe el funcionamiento de una ruta", function() {
    // Mirar https://www.chaijs.com/plugins/chai-http/
    it("3.1. Comprobamos ruta correcta '" + URLROUTE + "' ...", (done) => {
        chai.request(URL)
            .get(ROUTE)
            .end((err, res) => {
                chai_expect(res).to.have.status(200); // Se devolvío 200 OK a la petición 
                done();
            });
    });
});

describe("4. Módulo 7: Pruebas con Chai: Un test que compruebe el funcionamiento de un controlador.", function() {
    // Mirar https://www.paradigmadigital.com/dev/testeo-api-rest-mocha-chai-http/    
    it("4.1. Comprobamos el controlador post '" + URLNEW + "' ...", (done) => {
        chai.request(`${SERVER}:${PORT}`) // http://localhost:8000
            .post(`/${PATH}`) // el post se hace desde ${URL}/quizzes
            .type('form')
            .send({ question: "question-post", answer: "answer-post" })
            .end((err, res) => {
                chai_expect(res).to.have.status(200); // Se devolvío 200 OK a la petición 
                done();
            });
    });
});

describe("5. Módulo 7: Pruebas con Chai: Un test que compruebe el funcionamiento de un acceso a la BD.", function() {

    let count;
    before(async function() {
        try {
            await sequelize.sync(); // Syncronize DB and seed if needed
            count = await Quiz.count();
            if (count === 0) {
                const c = await Quiz.bulkCreate([
                    { question: "Capital of Italy", answer: "Rome" },
                    { question: "Capital of France", answer: "Paris" },
                    { question: "Capital of Spain", answer: "Madrid" },
                    { question: "Capital of Portugal", answer: "Lisbon" }
                ]);
                console.log(`DB filled with ${c.length} quizzes.`);
            } else {
                console.log(`DB exists & has ${count} quizzes.`);
            }
        } catch (err) {
            console.log(err);
        }
    });

    it(`5.1. Comprobamos el acceso a la BDD, creada por defecto debería tener 4 registros`, function() {
        console.log(`Número de registros actuales en la BDD: ${count}`);
        chai_expect(count, 'La BDD debería estar creada por defecto').to.be.at.least(4); // La BDD está, al menos, creada por defecto
    });

    it(`5.2. Comprobamos si podemos borrar registros`, async function() {
        console.log(`Intentamos borrar el registro con id: ${ID2DELETE}`);
        let quiz = await Quiz.destroy({ where: { id: ID2DELETE } });
        chai_expect(quiz, `No ha podido eliminarse el registro con ID: ${ID2DELETE}`).to.equal(1);
    });

});