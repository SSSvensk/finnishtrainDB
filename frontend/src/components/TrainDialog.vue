<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.smAndDown"
    width="500"
  >
    <div class="monitortitle">
      <h3>Platform monitor</h3>
      <v-spacer></v-spacer>
      <v-btn text icon>moi</v-btn>
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
      <div class="pt-3 pb-3 text-center"><a class="alink">SHOW COMPLETE JOURNEY</a></div>
    </div>

  </v-dialog>
</template>

<script>
  export default {
    name: 'TrainDialog',
    data() {
      return {
        train: {},
        dialog: false
      }
    },
    methods: {
      open(train) {
        this.dialog = true
        this.train = train
        
      }
    }
  }
</script>
<style scoped>
.alink {
  color: white;
}
.destination {
  display: table-cell;
  vertical-align: bottom;
  height: 80px;
}
.monitortitle {
  color: white;
  background-color: rgb(98, 104, 189);
  border: 3px solid rgb(98, 104, 189);
}
.gleismonitor {
  background-color: rgb(4, 4, 146);
  color: white;
  border: 3px solid rgb(98, 104, 189);
}
</style>
