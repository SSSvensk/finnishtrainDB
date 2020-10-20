<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    width="600"
  >
    <div class="monitortitle">
      <div class="wrap">
      <h3>Platform monitor</h3>
      <v-spacer></v-spacer>
      <v-btn text icon @click="dialog=false"><v-icon>mdi-close</v-icon></v-btn>
      </div>
    </div>
    <div class="gleismonitor">
        <v-container class="mt-n7">
          <v-row>
            <v-col md="3">
              <div><h2>{{ train.time }}</h2></div>
              <div>{{ train.trainNumber }}</div>
            </v-col>
            <v-col md="6">
              <div class="destination">{{train.viaStops}}</div>
              <div><h1>{{ train.destination }}</h1></div>
            </v-col>
            <v-col md="3">
              <div><h1 class="text-right">{{ train.track }}</h1></div>
            </v-col>
          </v-row>
        </v-container>
        <v-divider></v-divider>
        
    </div>
    <div class="gleismonitor">
      <div class="pt-3 pb-3 text-center">
        <a class="alink" @click="loadJourney()">
          {{ journeyOpen ? "HIDE" : "SHOW COMPLETE JOURNEY" }}
        </a>
      </div>
      
      <v-container v-if="journeyOpen">
        <v-row v-for="(viastop, index) in viaStops" v-bind:key="index" class="stoprow">
          <v-col sm="1" v-if="index == 0 || index == viaStops.length - 1" class="endcontainer">
            <span class="visitedStation" v-if="(viastop.actualDepartureTime) && new Date(viastop.actualDepartureTime) <= new Date()"></span>
            <span class="dot" v-else></span>
          </v-col>
          <v-col sm="1" v-else class="viacontainer">
            <span class="visitedStation" v-if="((viastop.actualArrivalTime) && new Date(viastop.actualArrivalTime) <= new Date()) || ((viastop.actualDepartureTime) && new Date(viastop.actualDepartureTime) <= new Date())"></span>
            <span class="dot" v-else></span>
          </v-col>
          <v-col sm="3">
            <!-- Arrival time -->
            <div v-if="viastop.scheduledArrivalTime">
              <!--First arrival place time -->
              <h1 v-if="index == 0 || index == viaStops.length - 1">
                {{ formatTime(viastop.scheduledArrivalTime) }}
              </h1>
              <p v-else>
                {{ formatTime(viastop.scheduledArrivalTime) }}                
                <!--Possible delay -->
                {{ (viastop.actualArrivalTime.getTime() - viastop.scheduledArrivalTime.getTime() > (1000 * 60)) ? getDelay(viastop.scheduledArrivalTime.getTime(), viastop.actualArrivalTime.getTime()) : "" }}
              </p>
            </div>

            <div v-if="viastop.scheduledDepartureTime">
              <h1 v-if="index == 0 || index == viaStops.length - 1">
                {{ formatTime(viastop.scheduledDepartureTime) }}
              </h1>
              <p v-else class="mt-n4">
                {{ formatTime(viastop.scheduledDepartureTime) }}
                <!--Possible delay -->
                {{ (viastop.actualDepartureTime.getTime() - viastop.scheduledDepartureTime.getTime()  > (1000 * 60)) ? getDelay(viastop.scheduledDepartureTime.getTime(), viastop.actualDepartureTime.getTime()) : "" }}
              </p>
            </div>
          </v-col>
          <v-col sm="6">
            <h1 v-if="index == 0 || index == viaStops.length - 1">
              {{ viastop.name }}
            </h1>
            <p v-else>{{viastop.name}}</p>
          </v-col>
          <v-col sm="2">
            <h1 v-if="index == 0 || index == viaStops.length - 1">
              {{ viastop.commercialTrack }}
            </h1>
            <p v-else>{{viastop.commercialTrack}}</p>
          </v-col>
        </v-row>
      </v-container>
    </div>

  </v-dialog>
</template>

<script>
  export default {
    name: 'TrainDialog',
    data() {
      return {
        train: {},
        dialog: false,
        station: {},
        viaStops: [],
        journeyOpen: false
      }
    },
    computed: {
      stations() {
        return JSON.parse(JSON.stringify(this.$store.getters.stations))
      }
    },
    methods: {
      addZero(number) {
        if (number < 10) {
          return "0" + number
        }
        return number
      },
      formatTime(timeISOString) {
        if (timeISOString) {
          const dateObject = new Date(timeISOString)
          var hours = dateObject.getHours()
          hours = this.addZero(hours)

          var minutes = dateObject.getMinutes()
          minutes = this.addZero(minutes)
          return hours + ":" + minutes
        }
        return ""
      },
      getDelay(scheduledTime, actualTime) {
        var diff = -1 * parseInt((scheduledTime - actualTime) / (60 * 1000))
        var returnstring = ""
        if (diff > 0) {
          returnstring += "+"
        }
        return "(" + returnstring + "" + diff + " min)"
      },
      open(train, station) {
        this.dialog = true
        this.train = train
        this.station = station
        this.journeyOpen = false
        this.viaStops = []
      },
      loadJourney() {
        //var stationFound = false
        if (!this.journeyOpen) {
        this.journeyOpen = true
        console.log(this.train)
        for (var i = 0; i < this.train.train.timeTableRows.length; i++) {
          var stationName = ""
          for (var j = 0; j < this.stations.length; j++) {
            if (this.stations[j].stationShortCode == this.train.train.timeTableRows[i].stationShortCode) {
              stationName = this.stations[j].stationName
            }
          }
          if (this.train.train.timeTableRows[i].commercialStop && this.train.train.timeTableRows[i].type == "DEPARTURE" && i == 0) {

            //Jos junalla on estimaattiaika
            if (this.train.train.timeTableRows[i].liveEstimateTime) {
              this.viaStops.push({
                code: this.train.train.timeTableRows[i].stationShortCode,
                name: stationName,
                commercialTrack: this.train.train.timeTableRows[i].commercialTrack, 
                type: this.train.train.timeTableRows[i].type, 
                scheduledDepartureTime: new Date(this.train.train.timeTableRows[i].scheduledTime), 
                actualDepartureTime: new Date(this.train.train.timeTableRows[i].liveEstimateTime)
              }) 
            } else {
              this.viaStops.push({
                code: this.train.train.timeTableRows[i].stationShortCode,
                name: stationName,
                commercialTrack: this.train.train.timeTableRows[i].commercialTrack, 
                type: this.train.train.timeTableRows[i].type, 
                scheduledDepartureTime: new Date(this.train.train.timeTableRows[i].scheduledTime), 
                actualDepartureTime: new Date(this.train.train.timeTableRows[i].actualTime)
              }) 
            }
            
          }
          else if (this.train.train.timeTableRows[i].commercialStop && this.train.train.timeTableRows[i].type == "DEPARTURE" && i > 0) {

            //Jos junalla on estimaattiaika
            if (this.train.train.timeTableRows[i].liveEstimateTime) {
              this.viaStops.push({
                code: this.train.train.timeTableRows[i].stationShortCode,
                name: stationName,
                commercialTrack: this.train.train.timeTableRows[i].commercialTrack, 
                type: this.train.train.timeTableRows[i].type, 
                scheduledDepartureTime: new Date(this.train.train.timeTableRows[i].scheduledTime), 
                actualDepartureTime: new Date(this.train.train.timeTableRows[i].liveEstimateTime),
                scheduledArrivalTime: new Date(this.train.train.timeTableRows[i-1].scheduledTime),
                actualArrivalTime: new Date(this.train.train.timeTableRows[i-1].liveEstimateTime)
              }) 
            } else {
              this.viaStops.push({
                code: this.train.train.timeTableRows[i].stationShortCode,
                name: stationName,
                commercialTrack: this.train.train.timeTableRows[i].commercialTrack, 
                type: this.train.train.timeTableRows[i].type, 
                scheduledDepartureTime: new Date(this.train.train.timeTableRows[i].scheduledTime),
                actualDepartureTime: new Date(this.train.train.timeTableRows[i].actualTime),
                scheduledArrivalTime: new Date(this.train.train.timeTableRows[i-1].scheduledTime),
                actualArrivalTime: new Date(this.train.train.timeTableRows[i-1].actualTime)
              }) 
            }
            
          } else if (i == this.train.train.timeTableRows.length - 1) {
            if (this.train.train.timeTableRows[i].liveEstimateTime) {
              this.viaStops.push({
                code: this.train.train.timeTableRows[i].stationShortCode,
                name: stationName,
                commercialTrack: this.train.train.timeTableRows[i].commercialTrack, 
                type: this.train.train.timeTableRows[i].type, 
                scheduledDepartureTime: new Date(this.train.train.timeTableRows[i].scheduledTime), 
                actualDepartureTime: new Date(this.train.train.timeTableRows[i].liveEstimateTime)
              }) 
            } else {
              this.viaStops.push({
                code: this.train.train.timeTableRows[i].stationShortCode,
                name: stationName,
                commercialTrack: this.train.train.timeTableRows[i].commercialTrack, 
                type: this.train.train.timeTableRows[i].type, 
                scheduledDepartureTime: new Date(this.train.train.timeTableRows[i].scheduledTime), 
                actualDepartureTime: new Date(this.train.train.timeTableRows[i].actualTime)
              }) 
            }
          }
        }
        } else {
          this.journeyOpen = false
        }
      }
    }
  }
</script>
<style scoped>
.stoprow:hover {
  background-color: rgb(32, 32, 252);
  cursor: pointer;
}
.endcontainer {
  height: 80px;
  position: relative;
}
.viacontainer {
  height: 70px;
  position: relative;
}
.wrap {
  display: flex;
  align-items: center;
}
.alink {
  color: white;
}
.destination {
  display: table-cell;
  vertical-align: bottom;
  height: 80px;
}
.monitortitle {
  position: sticky;
  color: white;
  background-color: rgb(98, 104, 189);
  border: 3px solid rgb(98, 104, 189);
}
.gleismonitor {
  background-color: rgb(4, 4, 146);
  color: white;
  border: 3px solid rgb(98, 104, 189);
}
.visitedStation {
  color: "red";
  height: 10px;
  width: 10px;
  border: 8px solid white;
  border-radius: 50%;
  display: inline-block;
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
.dot {
  color: "red";
  height: 10px;
  width: 10px;
  border: 2px solid white;
  border-radius: 50%;
  display: inline-block;
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
.normaldot {
  height: 10px;
  width: 10px;
  border: 2px solid white;
  border-radius: 50%;
  display: inline-block;
}
</style>
