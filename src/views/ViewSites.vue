<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import SiteCard from "../components/SiteCardComponent.vue";
import SiteServices from "../services/SiteServices.js";

const router = useRouter();
const sites = ref([]);
const sitesList = [ref([]), ref([]), ref([])];

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
  sitesList[0].value = [];
  sitesList[1].value = [];
  sitesList[2].value = [];
  await getSites();
  user.value = JSON.parse(localStorage.getItem("user"));
  role.value = user.value.role;
  // console.log(user.value);
  if(user.value === null){
    router.push({ name: "login" });
  }
}

async function getSites() {
  await SiteServices.getSites()
    .then((response) => {
      sites.value = response.data;
      for(let i = 0; i < response.data.length; i++){
        let index = i%3;
        sitesList[index].value.push(response.data[i]);
      }
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}


async function deleteSite(siteId) {
  await SiteServices.deleteSite(siteId)
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
  router.push({ name: "createsite" });
}

function addSite() {
  router.push({ name: "createsite" });
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
            >Sites For Destinations
          </v-card-title>
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="user !== null && role > 0" color="accent" @click="addSite()"
            >Create Site</v-btn
          >
        </v-col>
      </v-row>
      <v-row class="mb-4">
        <v-col cols="4">
      <SiteCard
        v-for="site in sitesList[0].value"
        :key="site.id"
        :site="site"
        @delete-site="deleteSite"
      />
    </v-col>
    
        <v-col cols="4">
      <SiteCard
        v-for="site in sitesList[1].value"
        :key="site.id"
        :site="site"
        @delete-site="deleteSite"
      />
    </v-col>
    
        <v-col cols="4">
      <SiteCard
        v-for="site in sitesList[2].value"
        :key="site.id"
        :site="site"
        @delete-site="deleteSite"
      />
    </v-col>
    </v-row>

      <v-row align="center" class="mb-4">
        <v-col cols="10"
          >
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="user !== null && role > 0" color="accent" @click="addSite()"
            >Create Site</v-btn
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
