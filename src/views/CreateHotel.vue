<script setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import HotelServices from "../services/HotelServices";

const route = useRoute();
const router = useRouter();

var hotel = ref({});
let isAddHotel = ref(true);
let isEditHotel = ref(false);

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
      phoneRules: [
        value => {
          if (value) return true

          return 'Phone Nummber is required.'
        },
        value => {
          if (/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(value)) return true

          return 'Phone Number must be valid.'
        },
      ],
      linkRules: [
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
});

async function getHotel() {
  await HotelServices.getHotel(route.params.id)
    .then((response) => {
      hotel.value = response.data[0];
    })
    .catch((error) => {
      console.log(error);
    });
}

async function updateHotel() {
  await HotelServices.updateHotel(hotel.value.id, hotel.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${hotel.value.name} updated successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getHotel();
}

async function addHotel() {
  await HotelServices.addHotel(hotel.value).then(
    () => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${hotel.value.name} created successfully!`;
    }
  )
  .catch((error) => {
    console.log(error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = error.response.data.message;
  });
  setTimeout(()=> {router.push({ name: "viewhotels" });}, 5000);
}


</script>

<template>
  <v-container>
    <v-row align="center">
      <v-col cols="10"
        ><v-card-title class="pl-0 text-h4 font-weight-bold"
          >Create Hotel
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
                  v-model="hotel.name"
                  label="Name"
                  :rules="rules.nameRules"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="hotel.address"
                  label="Address"
                  :rules="rules.addressRules"
                ></v-text-field>
                <v-text-field
                  v-model="hotel.phone"
                  label="Phone Number"
                  :rules="rules.phoneRules"
                ></v-text-field>
                <v-text-field
                  v-model="hotel.link"
                  label="Hotel Link"
                  :rules="rules.linkRules"
                ></v-text-field>
                <v-text-field
                  v-model="hotel.maps"
                  label="Hotel Maps Link"
                  :rules="rules.mapsRules"
                ></v-text-field>
                <v-text-field
                  v-model="hotel.photo"
                  label="Photo Link"
                  :rules="rules.photoRules"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pt-0">
            
            <v-btn 
            variant="flat" color="primary"
            @click="
              isAddHotel
                ? addHotel()
                : isEditHotel
                ? updateHotel()
                : false
            "
             >
             {{
              isAddHotel
                ? "Create Hotel"
                : isEditHotel
                ? "Update Hotel"
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
