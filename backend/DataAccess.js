const axios = require('axios');

const AXIOS = axios.create({
    baseURL: '',
    timeout: 5000,
    headers: {
        'accept-encoding': 'gzip'
    }
});

module.exports = {
    getStations() {
        return AXIOS.get('https://rata.digitraffic.fi/api/v1/metadata/stations')
    },
    getTrainsFromStation(stationCode) {
        if ((stationCode) || stationCode.length > 0) {
            const url = 'https://rata.digitraffic.fi/api/v1/live-trains/station/' + stationCode + '?departing_trains=50'
            return AXIOS.get(url)
        } else {
            return Promise.reject("Missing station code")
        }
        
    }
}