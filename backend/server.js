const express = require('express')
const axios = require('axios');
const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/stations', (req, res) => {
    axios.get('https://rata.digitraffic.fi/api/v1/metadata/stations').then(response => {
        res.send(response.data)
    })
    .catch(e => {
        console.log("e")
        res.send("virhe!")
    })
})

app.get('/trains', (req, res) => {
    axios.get('https://rata.digitraffic.fi/api/v1/live-trains/station/' + req.query.shortCode).then(response => {
        res.send(response.data)
    })
    .catch(e => {
        console.log("e")
        res.send("virhe!")
    })
})

app.get('/alltrains', (req, res) => {
    console.log("Jjj")
    axios.get('https://rata.digitraffic.fi/api/v1/trains/2019-02-18').then(response => {
        res.send(response.data)
    })
    .catch(e => {
        console.log("e")
        res.send("virhe!")
    })
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))