const express = require("express")
const app = express()
const handle = require("handlebars")
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const {doc, updateDoc} = require('firebase/firestore')

// config do handlebars
app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

handle.registerHelper('celular', function (value) {
    if (value == "Celular") {
        return "selected='selected'"
    }
    return ""
});

handle.registerHelper('whatsapp', function (value) {
    if (value == "Whatsapp") {
        return "selected='selected'"
    }
    return ""
});

handle.registerHelper('linkedin', function (value) {
    if (value == "Linkedin") {
        return "selected='selected'"
    }
    return ""
});

// firebase
var serviceAccount = require("./tarefafirebase-d0beb-firebase-adminsdk-aj2t9-50dc12b5aa.json");

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

// body parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// rotas
app.get("/", function(req, res){
    res.render("primeira_pagina")
})

app.get("/consulta", async function(req, res){
    let result = await db.collection('agendamentos').where('nome','!=',null).get();
    
    let vetor = [];
    result.forEach(doc => {
        vetor.push({
            nome: doc.data().nome, 
            telefone: doc.data().telefone, 
            origem: doc.data().origem, 
            data_contato: doc.data().data_contato, 
            observacao: doc.data().observacao
        })
    })

    //console.log(vetor)
    res.render("consulta", {vetor})
})

app.get("/editar/:nome", async function(req, res){
    let result = await db.collection('agendamentos').where('nome','==',req.params.nome).limit(1).get()
    
    let post = [];
    result.forEach(doc => {
        post.push(
            {
                nome_antigo: req.params.nome,
                nome: doc.data().nome, 
                telefone: doc.data().telefone, 
                origem: doc.data().origem, 
                data_contato: doc.data().data_contato, 
                observacao: doc.data().observacao
            }
        )
    })

    res.render("editar", {post})
})

app.get("/excluir/:nome", async function(req, res){
    let result = await db.collection('agendamentos').doc(req.params.nome).delete()
    res.redirect("/consulta")
})

app.post("/cadastrar", function(req, res){
    let result = db.collection('agendamentos').doc(req.body.nome).set({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(()=>{
        console.log('cadastrado com sucesso')
        res.redirect("/")
    }).catch( (erro) =>{
        console.log('erro ao cadastrar: '+erro)
        res.send('Erro ao cadastrar')
    })
})

app.post("/atualizar", async function(req, res){
    let result = await db.collection('agendamentos').where('nome','==',req.body.nome_antigo).get();
    
    // se existir um doc com nome igual ao que está sendo atualizado 
    if(!(result.empty)){

        // apagamos o doc do nome antigo (mas temos os dados vindos do form de alteração)
        result = await db.collection('agendamentos').doc(req.body.nome_antigo).delete();

        // criamos um novo doc com os dados do usuario. Assim, caso ele mude o nome, o doc terá o nome novo
        result = await db.collection('agendamentos').doc(req.body.nome).set(
            {
                nome: req.body.nome,
                telefone: req.body.telefone,
                origem: req.body.origem,
                data_contato: req.body.data_contato,
                observacao: req.body.observacao
            }
        ).then(()=>{
            res.redirect('/consulta')
        }).catch( (erro) =>{
            console.log('erro ao atualizar dados: '+erro)
            res.send('Erro ao atualizar dados')
        })
    }

})

app.listen(8081, function(){
    console.log("Servidor ativo!")
})
