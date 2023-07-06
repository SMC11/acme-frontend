<script setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import CustomerServices from "../services/CustomerServices";


const route = useRoute();
const router = useRouter();

const newCustomer = ref({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
});
let isAddCustomer = ref(true);
let isEditCustomer = ref(false);

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

  // console.log(newCustomer);
  if (user !== null) {
    newCustomer.value.id = JSON.parse(user).id;
  }
  console.log(newCustomer.value);
});

async function getCustomer() {
  await CustomerServices.getCustomer(route.params.id)
    .then((response) => {
      newCustomer.value = response.data[0];
    })
    .catch((error) => {
      console.log(error);
    });
}

async function updateCustomer() {
  await CustomerServices.updateCustomer(newCustomer.value.id, newCustomer.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newCustomer.value.name} updated successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getCustomer();
}

async function addCustomer() {
  newCustomer.value.role=1;
  await CustomerServices.addCustomer(newCustomer.value).then(
    () => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newCustomer.value.name} created successfully!`;
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
          >Create Customer
        </v-card-title>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card class="rounded-lg elevation-5">
          <v-form>
          <v-card-text>
            <v-text-field
              v-model="newCustomer.name"
              label="Name"
              required
            ></v-text-field>

            <v-text-field
              v-model="newCustomer.address"
              label="Address"
              required
            ></v-text-field>
            <v-text-field
              v-model="newCustomer.instructions"
              label="Instructions"
              required
            ></v-text-field>
            <v-text-field
              v-model="newCustomer.phoneNumber"
              label="Phone"
              required
            ></v-text-field>
          </v-card-text>
          <v-card-actions class="pt-0">
            
            <v-btn 
            variant="flat" color="primary"
            @click="
              isAddCustomer
                ? addCustomer()
                : isEditCustomer
                ? updateCustomer()
                : false
            "
             >
             {{
              isAddCustomer
                ? "Create Customer"
                : isEditCustomer
                ? "Update Customer"
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
