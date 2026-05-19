const express = require('express')
const app = express()
const path = require('path')

// settings
app.set('port', 3000)

//middlewares
app.use(express.static(path.join(__dirname, '../client/public')))

//routes
app.get('/', (req ,res)=>{
    res.send('Bienvenido')
})

app.listen(app.get('port'), ()=>{
    console.log(`backend up on port 3000 ${app.get('port')}`)
})