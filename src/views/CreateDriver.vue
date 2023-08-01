<script setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import UserServices from "../services/UserServices";


const route = useRoute();
const router = useRouter();

const newUser = ref({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
});
let isAddDriver = ref(true);
let isEditDriver = ref(false);

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});


onMounted(async () => {
  const user = localStorage.getItem("user");
  if(user === null){
    router.push({ name: "login" });
  }
  if(JSON.parse(user).role < 1){
    router.push({ name: "home" });
  }

  // console.log(newUser);
  if (user !== null) {
    newUser.value.id = JSON.parse(user).id;
  }
  console.log(newUser.value);
});

async function getDriver() {
  await UserServices.getUser(route.params.id)
    .then((response) => {
      newUser.value = response.data[0];
    })
    .catch((error) => {
      console.log(error);
    });
}

async function updateDriver() {
  await UserServices.updateUser(newUser.value.id, newUser.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newUser.value.firstName} updated successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getDriver();
}

async function addDriver() {
  newUser.value.role=0;
  await UserServices.addUser(newUser.value).then(
    () => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newUser.value.firstName} created successfully!`;
    }
  )
  .catch((error) => {
    console.log(error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = error.response.data.message;
  });
  setTimeout(()=> {router.push({ name: "home" });}, 5000);
}


</script>

<template>
  <v-container>
    <v-row align="center">
      <v-col cols="10"
        ><v-card-title class="pl-0 text-h4 font-weight-bold"
          >Create Driver
        </v-card-title>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card class="rounded-lg elevation-5">
          <v-form>
          <v-card-text>
            <v-text-field
              v-model="newUser.firstName"
              label="First Name"
              required
            ></v-text-field>

            <v-text-field
              v-model="newUser.lastName"
              label="Last Name"
              required
            ></v-text-field>
            <v-text-field
              v-model="newUser.phoneNumber"
              label="Phone"
              required
            ></v-text-field>
            <v-text-field
              v-model="newUser.email"
              label="Email"
              required
            ></v-text-field>

            <v-text-field
              v-model="newUser.password"
              label="Password"
              required
            ></v-text-field>

          </v-card-text>
          <v-card-actions class="pt-0">
            
            <v-btn 
            variant="flat" color="primary"
            @click="
              isAddDriver
                ? addDriver()
                : isEditDriver
                ? updateDriver()
                : false
            "
             >
             {{
              isAddDriver
                ? "Create Driver"
                : isEditDriver
                ? "Update Driver"
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
