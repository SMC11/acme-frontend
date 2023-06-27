<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const showDetails = ref(false);
const user = ref(null);

const props = defineProps({
  site: {
    required: true,
  },
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  console.log(props.site.photo);
});


function getAddress(address) {
  return (address.length > 100) ? address.slice(0, 100-1) + '...' : address;
}

const emit = defineEmits(["delete-site"]);

const handleDelete = (siteId) => {
  console.log(siteId);
  emit("delete-site", siteId);
};

function navigateToEdit() {
  router.push({ name: "editsite", params: { id: props.site.id } });
}

</script>

<template>
  <v-card class="rounded-lg elevation-5 mb-8 card"
    @click="showDetails = !showDetails"
  >
  <div class="card-background" :style="{ backgroundImage: `url(${site.photo})` }"></div>
    <v-card-title class="headline card-content">
      <v-row align="center">
        <v-col cols="10">
          {{ site.name }}
          <v-chip class="ma-2" color="accent" label>
            <v-icon start icon="mdi-clock-outline"></v-icon>
            {{ site.duration }}
          </v-chip>
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-icon
            v-if="user !== null"
            size="small"
            icon="mdi-delete"
            @click="handleDelete(site.id)"
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
      {{ getAddress(site.address) }}
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