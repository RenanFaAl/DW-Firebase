const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const Handlebars = require("handlebars")

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore')
const serviceAccount = require('./webii-b0511-firebase-adminsdk-sjdk4-69623176e0.json')

Handlebars.registerHelper('eq', function(v1, v2) {
    return v1 === v2;
})

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine('handlebars', handlebars({ defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', function(req,res){
    res.render('primeira_pagina')
})

app.listen(8081, function(){
    console.log('Servidor Ativo')
})

app.post('/cadastrar' , function(req,res){
    var result = db.collection('clientes').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Dados cadastrados com sucesso')
    })
})

app.get('/consultar', function(req,res){
    var posts = []
    db.collection('clientes').get().then(
        function(snapshot){
            snapshot.forEach(
                function(doc){
                    const data = doc.data()
                    data.id = doc.id
                    posts.push(data)
                }
            )
            res.render("consulta", {posts: posts})
        }
    )
})

app.post('/atualizar', function(req,res){
    const id = req.body.id
    var result = db.collection('clientes').doc(id).update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Documento atualizado com sucesso');
        res.redirect('/consultar')
    })
})

app.get('/excluir/:id',function(req,res){
    const id = req.params.id
    var result = db.collection('clientes').doc(id).delete().then(function(){
        console.log('Documento excluído com sucesso');
        res.redirect('/consultar')
    })
})

app.get("/editar/:id", function(req, res){
    var posts = []
    const id = req.params.id
    const clientes = db.collection('clientes').doc(id).get().then(
        function(doc){
            const data = doc.data()
            data.id = doc.id
            posts.push(data)
            res.render("editar", {posts: posts})
        }
    )
})
