// Install mocha: npm install -g mocha
// Install chai: npm install -g chai
// Install zombie: npm install -g zombie

const Browser = require("zombie");

const SERVER = "http://localhost";
const PORT = "8000";
const PATH = "quizzes";
const URL = `${SERVER}:${PORT}/${PATH}`;

const URLTEXT = "http://localhost:8000/quizzes";
const URLFORM = "http://localhost:8000/quizzes/new"

const browser = new Browser();

before(function() {
    console.log(` - Inicio de los tests - `);
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