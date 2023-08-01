<script setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import UserServices from "../services/UserServices";
import CustomerServices from "../services/CustomerServices";

const route = useRoute();
const router = useRouter();

var customer = ref({});
let isAddCustomer = ref(false);
let isEditCustomer = ref(true);
let readOnly = ref(true);

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
          if (value?.length <= 64) return true

          return 'Value must be less than 64 characters.'
        },
      ],
      phoneRules: [
        value => {
          if (value) return true

          return 'Phone Number is required.'
        },
        value => {
          if (/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(value)) return true

          return 'Phone Number must be valid.'
        },
      ],
      
    }));

onMounted(async () => {
  const cacheUser = localStorage.getItem("user");
  if(cacheUser === null){
    router.push({ name: "login" });
  }
  console.log(JSON.parse(cacheUser).id);
    
  await getCustomer();
  if (cacheUser !== null) {
    // user.value.id = JSON.parse(cacheUser).id;
    if(JSON.parse(cacheUser).role > 1){
        readOnly.value = false;
        console.log(readOnly);
    }
  }
  console.log(user.value);
});

async function getCustomer() {
  await CustomerServices.getCustomer(route.params.id)
    .then((response) => {
      customer.value = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

async function updateCustomer() {
  await CustomerServices.updateCustomer(customer.value.id, customer.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${customer.value.name} updated successfully!`;
      setTimeout(()=> {router.push({ name: "home" });}, 5000);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getCustomer();
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
          >{{ readOnly?"View ":"Edit " }} Customer
        </v-card-title>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card class="rounded-lg elevation-5">
          <v-form v-model="rules.valid"
            :readonly="readOnly"
          >
          <v-card-text>
            <v-row>
              <v-col>
                
                <v-text-field
                  v-model="customer.phoneNumber"
                  label="Number"
                  required
                ></v-text-field>

                <v-text-field
              v-model="customer.name"
              label="Name"
              :rules="rules.nameRules"
              required
                ></v-text-field>

                <v-text-field
                  v-model="customer.address"
                  label="Address"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="customer.instructions"
                  label="Instructions"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pt-0">
            
            <v-btn v-if="!readOnly"
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
