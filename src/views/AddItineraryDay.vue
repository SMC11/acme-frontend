<script setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import ItineraryServices from "../services/ItineraryServices";
import ItineraryDayServices from "../services/ItineraryDayServices";
import HotelServices from "../services/HotelServices";
import SiteServices from "../services/SiteServices";

const route = useRoute();
const router = useRouter();
const role = ref(0);
const user = ref(null);
var itinerary = ref({});
let isAddItinerary = ref(false);
let isEditItineraryDay = ref(false);
const selectedHotel = ref(undefined);
const selectedSite = ref(undefined);
const itineraryDay = ref({
    sites: []
});
const sites = ref([]);
const itineraryDaySites = ref([]);
const hotels = ref([]);

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});


onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  if(user.value === null){
    router.push({ name: "login" });
  }
  await getItinerary();
  await getItineraryDay();
  await getSites();
  await getHotels();
  if (user !== null) {
    itinerary.value.userId = user.id;
  }
  
});

async function getItinerary() {
  await ItineraryServices.getItinerary(route.params.id)
    .then((response) => {
      itinerary.value = response.data[0];
    })
    .catch((error) => {
      console.log(error);
    });
}

async function getItineraryDay() {
    if(route.params.itineraryDayId === undefined){
        console.log("returning");
      return;
    }
    isEditItineraryDay.value = true;
    itineraryDaySites.value = [];
    itineraryDay.value.sites = [];
  await ItineraryDayServices.getItineraryDay(route.params.id, route.params.itineraryDayId)
    .then((response) => {
      itineraryDay.value = response.data[0];
      itineraryDay.value.sites = [];
      itineraryDay.value.dayOfEvent = getDate(itineraryDay.value.dayOfEvent);
      selectedHotel.value = itineraryDay.value.hotel;
      for(let i=0; i<itineraryDay.value.itineraryDayEvent.length; i++){
        itineraryDaySites.value.push(itineraryDay.value.itineraryDayEvent[i].site);
        itineraryDay.value.sites.push(itineraryDay.value.itineraryDayEvent[i].site);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

async function getHotels() {
  await HotelServices.getHotels()
    .then((response) => {
      hotels.value = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}
async function getSites() {
  await SiteServices.getSites()
    .then((response) => {
      sites.value = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

async function addSiteToItineraryDay(){
    if(selectedSite.value == undefined){
        return null;
    }
    itineraryDaySites.value.push(selectedSite.value);
    itineraryDay.value.sites.push(selectedSite.value);
    console.log(itineraryDay);
}

async function addItineraryDay() {
  itineraryDay.value.hotel = selectedHotel.value;
  itineraryDay.value.hotelId = selectedHotel.value.id;
  itineraryDay.value.itineraryId = route.params.id;
  await ItineraryDayServices.addItineraryDay(itinerary.value.id, itineraryDay.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Itinerary Day added successfully!`;
      setTimeout(()=> {router.push({ name: "edititinerary", params: {id:route.params.id} });}, 2000);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getItineraryDay();
}
async function updateItineraryDay() {
  itineraryDay.value.hotel = selectedHotel.value;
  itineraryDay.value.hotelId = selectedHotel.value.id;
  itineraryDay.value.itineraryId = route.params.id;
  console.log(itineraryDay.value);
  await ItineraryDayServices.updateItineraryDay(itinerary.value.id, itineraryDay.value.id, itineraryDay.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Itinerary Day updated successfully!`;
      setTimeout(()=> {router.push({ name: "edititinerary", params: {id:route.params.id} });}, 2000);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getItineraryDay();
}

function deleteSite(index){
    itineraryDaySites.value.splice(index, 1);
    itineraryDay.value.sites.splice(index, 1);
}

function getDate(date){
    date = new Date(date);
    return date.toISOString().split('T')[0];
    return date.getFullYear()+"-"+date.getMonth() +"-"+date.getDate();
}

function closeSnackBar() {
  snackbar.value.value = false;
}

</script>

<template>
  <v-container>
    <v-btn v-if="user !== null" class="mx-2" @click="router.go(-1)"> Back </v-btn>
    <br><br>
    <v-row align="center">
      <v-col cols="10"
        ><v-card-title class="pl-0 text-h4 font-weight-bold"
          >Add Day to Itinerary
        </v-card-title>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card class="rounded-lg elevation-5">
          <v-form ref="form"
          >
          <v-card-text>
            <v-row>
                <v-col>
                    <v-text-field
                  v-model.date="itineraryDay.dayOfEvent"
                  label="Day Of Event"
                  type="date"
                ></v-text-field>
                </v-col>
              <v-col>
                <v-autocomplete
            v-model="selectedHotel"
            :items="hotels"
            item-title="name"
            item-value="id"
            label="Select Hotel for the Day"
            placeholder="Search Hotel"
            persistent-hint
            return-object
            auto-select-first
            hide-selected
            clearable
          ></v-autocomplete>
               
              </v-col>
              
            </v-row>
            
            <!-- Selected Sites -->
           
            <v-row>
                <v-table>
                    <tbody>
                <tr v-for="(site, index) in itineraryDaySites" :key="site.id">
                  <td><a :href=site.link>{{ site.name }}</a></td>
                  <td>{{ site.duration }}</td>
                  <td>{{ site.address }}</td>
                  <td></td>
                  <td>
                    <v-icon
                      size="x-small"
                      icon="mdi-trash-can"
                      @click="deleteSite(index)"
                    >
                    </v-icon>
                  </td>
                </tr>
              </tbody>
                </v-table>
            </v-row>
            <v-row>
                <v-col>
                    <v-autocomplete
            v-model="selectedSite"
            :items="sites"
            item-title="name"
            item-value="id"
            label="Select Site for the Day"
            placeholder="Search Sites"
            persistent-hint
            return-object
            auto-select-first
            hide-selected
            clearable
          ></v-autocomplete>
              </v-col>
              <v-col>
                <v-btn 
            variant="flat" color="primary"
            @click="addSiteToItineraryDay()"
             >Add Site
            </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pt-0">
            <v-btn v-if="!isEditItineraryDay"
            variant="flat" color="primary"
            @click="addItineraryDay()"
             >Add Day To Itinerary
            </v-btn>
            <v-btn v-if="isEditItineraryDay"
            variant="flat" color="primary"
            @click="updateItineraryDay()"
             >Update Day In Itinerary
            </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-form>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}

      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
