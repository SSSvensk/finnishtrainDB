<template>
<div>
  <v-container fluid>
    <div v-if="!stationSelected" class="text-center headlinediv">
      <h1 class="pt-12 pb-5">Aikataulut</h1>
    </div>
    <div class="searchdiv">
      <v-autocomplete
        v-model="model"
        :items="stations"
        color="white"
        dark
        hide-no-data
        hide-selected
        clearable
        item-text="stationName"
        item-value="stationShortCode"
        label="Stations"
        placeholder="Start typing to Search"
        prepend-icon="mdi-train"
        return-object
      ></v-autocomplete>
    </div>
      <div v-if="stationSelected" class="departuremonitor">

        <div>Lähtevät Departures/Abfahrt</div>
        
        <div v-if="!loadingTrains">
          <v-container fluid>
            <v-row>
              <v-col md="2" sm="4">Aika time / Zeit</v-col>
              <v-col md="4" v-if="$vuetify.breakpoint.mdAndUp">Kautta via</v-col>
              <v-col md="3" sm="5">Määränpää Destination</v-col>
              <v-col md="3" sm="3">Laituri platform</v-col>
            </v-row>
            <v-row v-for="(train, index) in departs" v-bind:key="index" class="trainrow" @click="selectTrain(train)">
              <v-col md="1" sm="2">
                <div class="colcontent">{{train.trainNumber}}</div>
              </v-col>
              <v-col md="1" sm="2">
                <div class="timecol">{{train.time}}</div>
              </v-col>
              <v-col md="4" v-if="$vuetify.breakpoint.mdAndUp">
                <div class="colcontent">{{train.viaStops}}</div>
              </v-col>
              <v-col md="3" sm="5" class="text-left">
                <h3>{{train.destination}}</h3>
              </v-col>
              <v-col md="1" sm="3">{{train.track}}</v-col>
              <v-col md="2" v-if="$vuetify.breakpoint.mdAndUp">
                <div class="timecol" v-if="train.delay > 0">{{train.delay}}</div></v-col>
            </v-row>
          </v-container>
        </div>
        
        <div v-else>
          <v-progress-circular
            indeterminate
            color="white"
            class="text-xs-center"
          ></v-progress-circular>
        </div>
        
      </div>
      <div class="text-center pa-3" v-else-if="stationsLoadFailed">
        <v-btn @click="loadStations">
          Lataa uudestaan
        </v-btn>
      </div>
      <div class="text-center pa-3" v-else-if="userCoordinates && stationsLoaded">
        <h2 class="text-left">Lähimmät asemat</h2>
        <v-row v-for="(obj, index) in closestStations" v-bind:key="'station'+index">
          <v-col sm="9" class="text-left">
            <a @click="selectStationFromList(obj.station)">{{ obj.station.stationName }}</a>
          </v-col>
          <v-col sm="3">
            {{ obj.distance.toFixed(2) }} km
          </v-col>
        </v-row>
      </div>
  </v-container>
  <TrainDialog ref="traindialog"></TrainDialog>
</div>

</template>

<script>
// @ is an alias to /src
import axios from "axios"
import TrainDialog from "@/components/TrainDialog"

export default {
  name: 'Home',
  components: {
    TrainDialog
  },
  data() {
    return {
      model: null,
      stationsLoaded: false,
      trains: [],
      stations: [],
      loadingTrains: false,
      departs: [],
      stationSelected: false,
      stationsLoadFailed: false,
      geolocationError: false,
      userCoordinates: null
    }
  },
  computed: {
    timeNow() {
      return new Date().getTime()
    },
    closestStations() {
      var distances = []
      this.stations.forEach(station => {
        distances.push({
          station: station, 
          distance: this.distance(this.userCoordinates.lat, this.userCoordinates.lng, station.latitude, station.longitude)
        })
      })
      distances.sort((a, b) => (a.distance > b.distance) ? 1 : -1)
      return distances.slice(0, 10)
    },
  },
  mounted() {
    this.getPosition()
    this.loadStations()
  },
  watch: {
    model() {
      this.stationSelected = true
      if (this.model) {
        this.loadTrains()
      } else {
        this.stationSelected = false
      }
    }
  },
  methods: {
    selectStationFromList(data) {
      this.model = data
    },
    distance(lat1, lon1, lat2, lon2) {
      if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
      }
      else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
          dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344
        return dist;
      }
    },
    getPosition() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.showPosition);
      } else {
        console.log("Geolocation is not supported by this browser.");
        this.geolocationError = true
      }
    },
    showPosition(position) {
      console.log("latitude", position.coords.latitude)
      console.log("Longitude: ", position.coords.longitude)
      this.userCoordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
    },
    selectTrain(train) {
      console.log(train)
      this.$refs.traindialog.open(train, this.model)
      
    },
    loadStations() {
      axios.get('/stations').then(response => {
        this.stationsLoaded = true
        console.log(response)
        for (var i = 0; i < response.data.length; i++) {
          if (response.data[i].passengerTraffic) {
            this.stations.push(response.data[i])
          }
        }
        this.$store.commit('addStations', this.stations)
      })
      .catch(e => {
        this.stationsLoadFailed = true
        console.log(e)
      })
    },
    loadTrains() {
      this.loadingTrains = true
      this.departs = []
      axios.get('/trains', {params: {shortCode:this.model.stationShortCode}}).then(response => {
        console.log(response)
        for (var i = 0; i < response.data.length; i++) {
          
          if (response.data[i].trainCategory == "Long-distance" || response.data[i].trainCategory == "Commuter") {
            if (this.model.stationShortCode != response.data[i].timeTableRows[response.data[i].timeTableRows.length - 1].stationShortCode)  {
              var obj = {}
              obj.train = response.data[i]
              var viaStops = []
              if (response.data[i].commuterLineID) {
                obj.trainNumber = response.data[i].commuterLineID
              } else {
                obj.trainNumber = response.data[i].trainType + " " + response.data[i].trainNumber 
              }
              var inspectedStationFound = false
              var smallestStop = 0
              var nextStop = null
              for (var j = 0; j < response.data[i].timeTableRows.length; j++) {
                if (inspectedStationFound) {
                  if (!nextStop && response.data[i].timeTableRows[j].commercialStop && response.data[i].timeTableRows[j].type == "DEPARTURE") {
                    nextStop = response.data[i].timeTableRows[j]
                  } 
                  if (nextStop) {
                    if (j < response.data[i].timeTableRows.length - 1 && response.data[i].timeTableRows[j].commercialStop && response.data[i].timeTableRows[j].type == "ARRIVAL") {
                      var trainStopping = new Date(response.data[i].timeTableRows[j+1].scheduledTime).getTime() - new Date(response.data[i].timeTableRows[j].scheduledTime).getTime()
                      if (viaStops.length < 2 && nextStop.stationShortCode != response.data[i].timeTableRows[j].stationShortCode) {
                        viaStops.push({ stopTime: trainStopping, stop: response.data[i].timeTableRows[j] })
                        viaStops.sort((a,b) => (a.stopTime > b.stopTime) ? -1 : ((b.stopTime > a.stopTime) ? 1 : 0));
                        if (smallestStop == 0) {
                          smallestStop = trainStopping
                        } else {
                          if (smallestStop > trainStopping) {
                            smallestStop = trainStopping
                          }
                        }
                      } else {
                        trainStopping = new Date(response.data[i].timeTableRows[j+1].scheduledTime).getTime() - new Date(response.data[i].timeTableRows[j].scheduledTime).getTime()
                        if (trainStopping > smallestStop) {
                          viaStops.pop()
                          viaStops.push({ stopTime: trainStopping, stop: response.data[i].timeTableRows[j] })
                          viaStops.sort((a,b) => (a.stopTime > b.stopTime) ? -1 : ((b.stopTime > a.stopTime) ? 1 : 0));
                          smallestStop = viaStops[1].stopTime
                        }
                      }
                      
                    }
                  }
                }
                if (this.model.stationShortCode == response.data[i].timeTableRows[j].stationShortCode && response.data[i].timeTableRows[j].type == "DEPARTURE" && this.timeNow <= new Date(response.data[i].timeTableRows[j].scheduledTime).getTime()) {
                  obj.track = response.data[i].timeTableRows[j].commercialTrack
                  var departTime = new Date(response.data[i].timeTableRows[j].scheduledTime)
                  var departHours = departTime.getHours()
                  if (departHours < 10) {
                    departHours = '0' + departHours
                  }
                  var departMinutes = departTime.getMinutes()
                  if (departMinutes < 10) {
                    departMinutes = '0' + departMinutes
                  }
                  obj.originalTime = departTime
                  obj.time = departHours + ':' + departMinutes
                  obj.delay = response.data[i].timeTableRows[j].differenceInMinutes
                  inspectedStationFound = true
                }
              }
              if (inspectedStationFound) {
                var viaStopString = ""

                //Searching the destination station name
                for (var k = 0; k < this.stations.length; k++) {
                  if (response.data[i].timeTableRows[response.data[i].timeTableRows.length - 1].stationShortCode == this.stations[k].stationShortCode) {
                    obj.destination = this.stations[k].stationName
                  }
                  if (nextStop) {
                    if (nextStop.stationShortCode == this.stations[k].stationShortCode) {
                      viaStopString = this.stations[k].stationName
                    }
                  }
                  
                }

                viaStops.sort(function(a,b){return new Date(a.stop.scheduledTime) - new Date(b.stop.scheduledTime);});

                for (var a = 0; a < viaStops.length; a++) {
                  for (var b = 0; b < this.stations.length; b++) {
                    if (viaStops[a].stop.stationShortCode == this.stations[b].stationShortCode) {
                      viaStopString = viaStopString + " - " + this.stations[b].stationName
                    }
                  }
                }

                //Searching the middlestop names
                obj.viaStops = viaStopString
                this.departs.push(obj)
              }
            }
          }
          
        }
        var sortArray = this.departs
        sortArray.sort(function(a,b){return new Date(a.originalTime) - new Date(b.originalTime);});
        this.departs = sortArray
        this.loadingTrains = false
      })
    }
  }
}
</script>
<style scoped>
.headlinediv {
  background-color: rgb(4, 4, 146);
  color: white;
}
.searchdiv {
  background-color: rgb(4, 4, 146);
}
.container {
  position: relative;
  min-height: 150px;
}
.foreigntext {
  font-style: italic;
}
.header-content {
  position: absolute;
  bottom: 0;
  left: 0;
}
.departuremonitor {
  background-color: rgb(4, 4, 146);
  color: white;
}
.trainrow {
  background-color: blue;
}
.trainrow:hover {
  background-color: rgb(32, 32, 252);
  cursor: pointer;
}
.timecol {
  padding: 5px;
  background-color: white;
  color: blue;
}
.colcontent {
  padding: 5px;
}
</style>
