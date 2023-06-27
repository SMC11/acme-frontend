<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const showDetails = ref(false);
const user = ref(null);

const props = defineProps({
  hotel: {
    required: true,
  },
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  console.log(props.hotel.photo);
});


function getAddress(address) {
  return (address.length > 300) ? address.slice(0, 300-1) + '...' : address;
}

const emit = defineEmits(["delete-hotel"]);

const handleDelete = (hotelId) => {
  console.log(hotelId);
  emit("delete-hotel", hotelId);
};

function navigateToEdit() {
  router.push({ name: "edithotel", params: { id: props.hotel.id } });
}

</script>

<template>
  <v-card class="rounded-lg elevation-5 mb-8 card"
    @click="showDetails = !showDetails"
  >
  <div class="card-background" :style="{ backgroundImage: `url(${hotel.photo})` }"></div>
    <v-card-title class="headline card-content">
      <v-row align="center">
        <v-col cols="10">
          {{ hotel.name }}
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-icon
            v-if="user !== null"
            size="small"
            icon="mdi-delete"
            @click="handleDelete(hotel.id)"
          ></v-icon>
          <v-icon
            v-if="user !== null"
            size="small"
            icon="mdi-pencil"
            @click="navigateToEdit()"
          ></v-icon>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="body-1 card-content">
      {{ getAddress(hotel.address) }}
    </v-card-text>
    
  </v-card>
</template>

<style>
.card {
  position: relative;
  overflow: hidden;
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.3; /* Adjust the opacity as desired */
  z-index: -1;
}

.card-content {
  position: relative;
  z-index: 1;
}
</style>