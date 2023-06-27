<script setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import SiteServices from "../services/SiteServices";

const route = useRoute();
const router = useRouter();

var site = ref({});
let isAddSite = ref(true);
let isEditSite = ref(false);

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

const rules = ref(({
      valid: false,
      nameRules: [
        value => {
          if (value) return true

          return 'Value is required.'
        },
        value => {
          if (value?.length <= 256) return true

          return 'Value must be less than 256 characters.'
        },
      ],
      durationRules: [
        value => {
          if (value) return true

          return 'Value is required.'
        },
        value => {
          if (value?.length <= 15) return true

          return 'Value must be less than 15 characters.'
        },
      ],
      addressRules: [
        value => {
          if (value) return true

          return 'Value is required.'
        },
        value => {
          if (value?.length <= 2048) return true

          return 'Value must be less than 2048 characters.'
        },
      ],
      mapsRules: [
        value => {
          if (value) return true

          return 'Value is required.'
        },
        value => {
          if (value?.length <= 2048) return true

          return 'Value must be less than 2048 characters.'
        },
      ],
      photoRules: [
        value => {
          if (value) return true

          return 'Value is required.'
        },
        value => {
          if (value?.length <= 2048) return true

          return 'Value must be less than 2048 characters.'
        },
      ],
      }
));


onMounted(async () => {
  const user = localStorage.getItem("user");
  if(user === null){
    router.push({ name: "login" });
  }
  if(JSON.parse(user).role < 1){
    router.push({ name: "home" });
  }
  console.log(site.value);
});

async function getSite() {
  await SiteServices.getSite(route.params.id)
    .then((response) => {
      site.value = response.data[0];
    })
    .catch((error) => {
      console.log(error);
    });
}

async function updateSite() {
  await SiteServices.updateSite(site.value.id, site.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${site.value.name} updated successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getSite();
}

async function addSite() {
  await SiteServices.addSite(site.value).then(
    () => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${site.value.name} created successfully!`;
      setTimeout(()=> {router.push({ name: "viewsites" });}, 5000);
    }
  )
  .catch((error) => {
    console.log(error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = error.response.data.message;
  });
}


</script>

<template>
  <v-container>
    <v-row align="center">
      <v-col cols="10"
        ><v-card-title class="pl-0 text-h4 font-weight-bold"
          >Create Site
        </v-card-title>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card class="rounded-lg elevation-5">
          <v-form v-model="rules.valid">
          >
          <v-card-text>
            <v-row>
              <v-col>
                <v-text-field
                  v-model="site.name"
                  label="Name"
                  :rules="rules.nameRules"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="site.duration"
                  label="Duration"
                  :rules="rules.durationRules"
                ></v-text-field>
                <v-text-field
                  v-model="site.address"
                  label="Address"
                  :rules="rules.addressRules"
                ></v-text-field>
                <v-text-field
                  v-model="site.link"
                  label="Maps Link"
                  :rules="rules.mapsRules"
                ></v-text-field>
                <v-text-field
                  v-model="site.photo"
                  label="Photo Link"
                  :rules="rules.photoRules"
                ></v-text-field>
              </v-col>
              <v-col>
                <v-textarea
                  v-model="site.description"
                  rows="10"
                  label="Description"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pt-0">
            
            <v-btn 
            variant="flat" color="primary"
            @click="
              isAddSite
                ? addSite()
                : isEditSite
                ? updateSite()
                : false
            "
             >
             {{
              isAddSite
                ? "Create Site"
                : isEditSite
                ? "Update Site"
                : ""
            }}
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
