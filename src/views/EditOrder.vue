<script setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import OrderServices from "../services/OrderServices";
import CustomerServices from "../services/CustomerServices";
import UserServices from "../services/UserServices";

const route = useRoute();
const router = useRouter();

var newOrder = ref({});
let isAddOrder = ref(false);
let isEditOrder = ref(true);
let readOnly = ref(true);
const pickupDate = ref(null);
const pickupTime = ref(null);
const deliveryDate = ref(null);
const deliveryTime = ref(null);
const customers = ref([]);
const selectedCustomer = ref(null);
const selectedDeliverToCustomer = ref(null);

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
          if (value?.length <= 32) return true

          return 'Value must be less than 32 characters.'
        },
      ],
      emailRules: [
        value => {
          if (value) return true

          return 'E-mail is required.'
        },
        value => {
          if (/.+@.+\..+/.test(value)) return true

          return 'E-mail must be valid.'
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
      passwordRules: [
        value => {
          if (value) return true

          return 'Password is required.'
        },
        value => {
          //At least 1 number, 1 Capital Letter, 1 Small letter, 1 Special Char
          if (/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(value)) return true

          return 'Password must be valid. (At least 1 number & 1 Capital Letter & 1 Small letter & 1 Special Character)'
        },
      ],
      confirmPasswordRules: [
        value => {
          if (value) return true

          return 'Value is required.'
        },
        value => {
          if (value === user.value.password) return true

          return 'Must match with Password.'
        },
      ],
      
    }));

onMounted(async () => {
  const cacheUser = localStorage.getItem("user");
  if(cacheUser === null){
    router.push({ name: "login" });
  }
  // console.log(JSON.parse(cacheUser).id);
    
  await getCustomers();
  await getOrder();
  if (cacheUser !== null) {
    // user.value.id = JSON.parse(cacheUser).id;
    if(JSON.parse(cacheUser).role >= 1){
        readOnly.value = false;
        // console.log(readOnly);
    }
  }
});
async function getCustomers() {
  await CustomerServices.getCustomers()
    .then((response) => {
      customers.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
async function getOrder() {
  await OrderServices.getOrder(route.params.id)
    .then((response) => {
      newOrder.value = response.data;
      console.log(newOrder.value);
      pickupDate.value = getDate(newOrder.value.pickupTime);
      pickupTime.value = getTime(newOrder.value.pickupTime);
      deliveryDate.value = getDate(newOrder.value.deliveryTime);
      deliveryTime.value = getTime(newOrder.value.deliveryTime);
      selectedCustomer.value = newOrder.value.customer;
      selectedDeliverToCustomer.value = newOrder.value.deliverToCustomer;
    })
    .catch((error) => {
      console.log(error);
    });
}
function getDate(date){
    date = new Date(date);
    return date.toISOString().split('T')[0];
}

function getTime(date){
    console.log(date);
    date = new Date(date);
    console.log(date);
    let time = date.toTimeString().split(' GMT')[0];
    console.log(time);
    return time.split('Z')[0];
}

async function updateOrder() {
  let pickUp = pickupDate.value +"T"+ pickupTime.value;
  let delivery = deliveryDate.value +"T"+ deliveryTime.value;
  if(new Date(pickUp) > new Date(delivery)){
    alert("Pick Up DateTime cannot be after Delivery DateTime");
    return;
  }
  newOrder.value.pickupTime = pickUp;
  newOrder.value.deliveryTime = delivery;
  newOrder.value.customerId = selectedCustomer.value.id;
  newOrder.value.deliverToCustomerId = selectedDeliverToCustomer.value.id;
  await OrderServices.updateOrder(newOrder.value.id, newOrder.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Order updated successfully!`;
      setTimeout(()=> {router.push({ name: "home" });}, 2500);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getOrder();
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
          >{{ readOnly?"View ":"Edit " }} Order
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
            <v-text-field
              v-model="pickupDate"
              label="Pick Up Date"
              type="date"
              required
            ></v-text-field>
            <v-text-field
              v-model="pickupTime"
              label="Pick Up Time"
              type="time"
              required
            ></v-text-field>
            
            <v-text-field
              v-model="deliveryDate"
              label="Delivery Date"
              type="date"
              required
            ></v-text-field>
            <v-text-field
              v-model="deliveryTime"
              label="Delivery Time"
              type="time"
              required
            ></v-text-field>

            <v-autocomplete
            v-model="selectedCustomer"
            :items="customers"
            item-title="name"
            item-value="id"
            label="Select Customer"
            placeholder="Search Customers"
            persistent-hint
            return-object
            auto-select-first
            hide-selected
            clearable
            ></v-autocomplete>

            <v-autocomplete
            v-model="selectedDeliverToCustomer"
            :items="customers"
            item-title="name"
            item-value="id"
            label="Select Customer"
            placeholder="Search Customers"
            persistent-hint
            return-object
            auto-select-first
            hide-selected
            clearable
            ></v-autocomplete>

            <v-text-field
              v-model="newOrder.blocks"
              label="Blocks"
              required
            ></v-text-field>

            <v-text-field
              v-model="newOrder.quotedPrice"
              label="Quoted Price"
              required
            ></v-text-field>
            
            <v-text-field
              v-model="newOrder.finalBill"
              label="Final Bill"
              required
            ></v-text-field>
          </v-card-text>
          <v-card-actions class="pt-0">
            
            <v-btn v-if="!readOnly"
            variant="flat" color="primary"
            @click="
              isAddOrder
                ? addOrder()
                : isEditOrder
                ? updateOrder()
                : false
            "
             >
             {{
              isAddOrder
                ? "Create Order"
                : isEditOrder
                ? "Update Order"
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
