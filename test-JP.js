
//Recursos
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process')

const { Sequelize } = require('sequelize');
const sequelize = new Sequelize("sqlite:db.sqlite", { logging: false, operatorsAliases: false });

const Quiz = sequelize.define(
    'quiz', {
    question: Sequelize.STRING,
    answer: Sequelize.STRING
})

//Test

const chai = require('chai'), chaiHttp = require('chai-http');
const expect = chai.expect;
const should = chai.should()
chai.use(chaiHttp);


const Browser = require('zombie');
Browser.localhost('http://localhost/', 8000);
const browser = new Browser();


//Iniciación
const path_root = path.resolve(__dirname);
const path_server = path.join(path_root, "main.js");
const path_dbsqlite = path.resolve(path.join(path_root, "db.sqlite"));

let server = null;


//TEST

describe('Test: Quizzes', function () {
    this.timeout(800);
    it('Creando copia de seguridad si existe el archivo dbsqlite', () => {
        fs.access(path_dbsqlite, (err) => {
            if (err) {
                this.skip()
            } else {
                fs.renameSync(path_dbsqlite, `${path_dbsqlite}.bak`);
                expect(err).to.be.null
            }
        })
    });
    it('Inicializando el servidor.', (done) => {
        server = spawn("node", [path_server], { detached: true });
        setTimeout(function () {
            sequelize.sync() 
            done();
        }, 300)
    });


    describe('Comprobando funcionalidad de una vista mostrada al usuario', () => {

        it('Muestra /Quizzes/1/edit', (done) => {
            browser.visit(`http://localhost:8000/quizzes/1/edit`, () => {
                browser.assert.success();
                browser.assert.className('input[value="Update"]', 'button');
                done()
            })
        })

 
    })

    describe('Comprobando funcionamiento de un formulario.', () => {

        before(() => browser.visit("http://localhost:8000/quizzes/1/edit"));

        it('Rellenando formulario /quizzes/1/edit.', function () {
            browser.assert.success();
            browser.fill('question', '¿Funciona?');
            browser.fill('answer', 'Si');
            browser.pressButton("Update", () => {
                browser.wait().then(() => {
                    browser.assert.text('a', '¿Funciona?') 
                });
            });
        })
    })

    describe("Comprobando la funcionalidad de una ruta", function () {

      
        it("Muestra /Edit", async function () {
            const response = await chai.request("http://localhost:8000").get('/quizzes/1/edit');
            expect(response).to.have.status(200);
        })
    
    })

    describe('Comprobando funcionamiento de un controlador.', function () {
        it('Petición de /Quizzes', function (done) {
            chai.request("http://localhost:8000")
                .post('/quizzes')
                .set({ 'content-type': 'application/x-www-form-urlencoded' })
                .send({ question: '¿POST?', answer: 'Si' })
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    done();
                })
        })

    })

    describe('Comprobando que funciona el acceso a la Base Datos.', function () {

        it('Modificando la Base de datos.', async function () {

            await Quiz.create({ question: '¿Hay un nuevo dato?', answer: 'Si' });
            let found = await Quiz.findOne({ where: { question: '¿Hay un nuevo dato?' } });

            expect(found).to.be.an('Object');
            found.should.have.property('question');
            found.should.have.property('answer');
        })

    })

    after( () => {
        if (server) {
            server.kill()
            fs.unlinkSync(`${path_dbsqlite}`);
        }

        fs.access(`${path_dbsqlite}.bak`, (err) => {
            if (!err) {
                fs.renameSync(`${path_dbsqlite}.bak`, `${path_dbsqlite}`)
                expect(err).to.be.null;
            } else {
                throw err
            }
        })
    })
})
