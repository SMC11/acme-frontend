<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import HotelCard from "../components/HotelCardComponent.vue";
import HotelServices from "../services/HotelServices.js";

const router = useRouter();
const hotels = ref([]);
const hotelsList = [ref([]), ref([]), ref([])];

const role = ref(0);
const user = ref(null);
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
  mounted();
});

async function mounted(){
  hotelsList[0].value = [];
  hotelsList[1].value = [];
  hotelsList[2].value = [];
  await getHotels();
  user.value = JSON.parse(localStorage.getItem("user"));
  role.value = user.value.role;
  // console.log(user.value);
  if(user.value === null){
    router.push({ name: "login" });
  }
}

async function getHotels() {
  await HotelServices.getHotels()
    .then((response) => {
      hotels.value = response.data;
      for(let i = 0; i < response.data.length; i++){
        let index = i%3;
        hotelsList[index].value.push(response.data[i]);
      }
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}


async function deleteHotel(hotelId) {
  await HotelServices.deleteHotel(hotelId)
  .then((response) => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = response.data.message;
      mounted();
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}


function openAdd() {
  router.push({ name: "createhotel" });
}

function addHotel() {
  router.push({ name: "createhotel" });
}

function closeSnackBar() {
  snackbar.value.value = false;
}

</script>

<template>
  <v-container>
    <div id="body">
      <v-row align="center" class="mb-4">
        <v-col cols="10"
          ><v-card-title class="pl-0 text-h4 font-weight-bold"
            >Hotels For Destinations
          </v-card-title>
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="user !== null && role > 0" color="accent" @click="addHotel()"
            >Create Hotel</v-btn
          >
        </v-col>
      </v-row>
      <v-row class="mb-4">
        <v-col cols="4">
      <HotelCard
        v-for="hotel in hotelsList[0].value"
        :key="hotel.id"
        :hotel="hotel"
        @delete-hotel="deleteHotel"
      />
    </v-col>
    
        <v-col cols="4">
      <HotelCard
        v-for="hotel in hotelsList[1].value"
        :key="hotel.id"
        :hotel="hotel"
        @delete-hotel="deleteHotel"
      />
    </v-col>
    
        <v-col cols="4">
      <HotelCard
        v-for="hotel in hotelsList[2].value"
        :key="hotel.id"
        :hotel="hotel"
        @delete-hotel="deleteHotel"
      />
    </v-col>
    </v-row>

      <v-row align="center" class="mb-4">
        <v-col cols="10"
          >
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="user !== null && role > 0" color="accent" @click="addHotel()"
            >Create Hotel</v-btn
          >
        </v-col>
      </v-row>
      
      <v-snackbar v-model="snackbar.value" rounded="pill">
        {{ snackbar.text }}

        <template v-slot:actions>
          <v-btn
            :color="snackbar.color"
            variant="text"
            @click="closeSnackBar()"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </v-container>
</template>
