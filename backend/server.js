const express = require('express')
const axios = require('axios');
const dataAccess = require('./DataAccess.js');
const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

app.get('/stations', (req, res) => {
    dataAccess.getStations().then(response => {
        res.send(response.data)
    })
    .catch(e => {
        res.status(500).send({error: e})
    })
})

app.get('/trains', (req, res) => {
    dataAccess.getTrainsFromStation(req.query.shortCode).then(response => {
        res.send(response.data)
    })
    .catch(e => {
        res.status(500).send({error: e})
    })
})

app.get('/alltrains', (req, res) => {
    axios.get('https://rata.digitraffic.fi/api/v1/trains/2019-02-18').then(response => {
        res.send(response.data)
    })
    .catch(e => {
        console.log("e")
        res.status(500).send({error: e})
    })
})


