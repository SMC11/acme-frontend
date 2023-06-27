<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const showDetails = ref(false);
const itineraryDayEvents = ref([]);
const user = ref(null);
const role = ref(0);
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const props = defineProps({
  itineraryDay: {
    required: true,
  },
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  role.value = user.value.role;
  itineraryDayEvents.value = props.itineraryDay.itineraryDayEvent;
  console.log(props.itineraryDay);
});


function getDate(date){
  date = new Date(date);
  return days[date.getDay()] + " " + months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

function getDescription(desc) {
  return (desc.length > 100) ? desc.slice(0, 100-1) + '...' : desc;
}

const emit = defineEmits(["delete-itinerary-day"]);

const handleDelete = (itineraryId, itineraryDayId) => {
  console.log(itineraryId, itineraryDayId);
  emit("delete-itinerary-day", itineraryId, itineraryDayId);
};

function navigateToEdit() {
  router.push({ name: "editItineraryDay", params: { id: props.itineraryDay.itineraryId, itineraryDayId: props.itineraryDay.id } });
}

function getSiteClick(siteId){
  router.push({ name: "editsite", params: { id: siteId } });
}
function getHotelClick(hotelId){
  return "/edithotel/" + hotelId;
}

</script>

<template>
  <v-spacer></v-spacer>
  <v-card 
    class="rounded-lg elevation-5 mb-8 padding"

  >
    <v-card-title class="headline">
      <v-row align="center">
        <v-col cols="10">
          {{ getDate(itineraryDay.dayOfEvent) }}
        </v-col>
        <v-col class="d-flex justify-end">
          <v-icon
            v-if="user !== null && role > 0"
            size="small"
            icon="mdi-delete"
            @click="handleDelete(itineraryDay.itineraryId, itineraryDay.id)"
          ></v-icon>
          <v-icon
            v-if="user !== null && role > 0"
            size="small"
            icon="mdi-pencil"
            @click="navigateToEdit()"
          ></v-icon>
        </v-col>
      </v-row>
      <SiteCard
        v-for="itineraryDayEvent in itineraryDayEvents"
        :key="itineraryDayEvent.id"
        :site="itineraryDayEvent.site"
        @delete-site="deleteSite"
      />
      <v-list>
        <v-list-item  v-for="itineraryDayEvent in itineraryDayEvents"
            :key="itineraryDayEvent.id">
            <v-row>
              <v-col cols="4">
                <a :href="itineraryDayEvent.site.link">
            <v-img
          :src="itineraryDayEvent.site.photo"
          aspect-ratio="16/9"
          :height="200"
          cover
        ></v-img>
          </a>
      </v-col>
      <v-col cols="8">
          <span style="cursor: pointer" class="text-wrap" v-if="role>0" @click="getSiteClick(itineraryDayEvent.site.id)"> {{ itineraryDayEvent.site.name }}
            <br> {{ itineraryDayEvent.site.duration }} 
            <br> Address: {{ itineraryDayEvent.site.address }} 
            <br> Description: {{ itineraryDayEvent.site.description }} 
          </span>
          <div class="text-wrap" v-if="role == 0">
            <b>Place: </b>{{ itineraryDayEvent.site.name }}
           <br><b>Duration: </b> {{ itineraryDayEvent.site.duration }} 
            <br><b>Address: </b> {{ itineraryDayEvent.site.address }} 
            <br> <b>Description: </b>{{ itineraryDayEvent.site.description }} 
          </div>
            <br> <a :href="itineraryDayEvent.site.link"> Maps Link</a>
          </v-col>
          </v-row>            
          <br>
        </v-list-item>
      </v-list>
      
  </v-card-title>

    <v-card>
      <v-card-title>
        <v-row align="center">
          <v-col cols="10">
          Hotel Info
          </v-col>
        </v-row>
        <v-row>
              <v-col cols="6">
                <a :href="itineraryDay.hotel.link" >
                  <v-img
                    :src="itineraryDay.hotel.photo"
                    aspect-ratio="16/9"
                    :height="200"
                    cover
                  ></v-img>
                </a>
              </v-col>
              <v-col cols="6">
                <a class="text-wrap" v-if="role > 0" :href="getHotelClick(itineraryDay.hotel.id)">
                  <b>Name: </b>{{ itineraryDay.hotel.name }}<br>
                  <b>Address: </b>{{ itineraryDay.hotel.address }}<br>
                  <b>Phone: </b>{{ itineraryDay.hotel.phone }}<br>
                  <a :href="itineraryDay.hotel.maps">Hotel Maps Link</a>

                </a>
                <div class="text-wrap" v-if="role == 0">
                  <b>Name: </b>{{ itineraryDay.hotel.name }}<br>
                  <b>Address: </b>{{ itineraryDay.hotel.address }}<br>
                  <b>Phone: </b>{{ itineraryDay.hotel.phone }}<br>
                  <a :href="itineraryDay.hotel.maps">Hotel Maps Link</a>

                </div>
              </v-col>
        </v-row>
      </v-card-title>
    </v-card>
     
  </v-card>
  <v-spacer></v-spacer>
</template>
