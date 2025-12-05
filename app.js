const PATH = require('path')
const express = require('express')
const APP = express()
const PORT = 5001
// respond with "hello world" when a GET request is made to the homepage
APP.use(express.static(PATH.join(__dirname, 'public')))

APP.use('/Styles', express.static(PATH.join(__dirname, 'Styles')))


APP.listen(PORT, ()=>{
    console.log("App a decorrer na porta 5001")
})