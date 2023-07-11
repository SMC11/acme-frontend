<script setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import UserServices from "../services/UserServices";
import OrderServices from "../services/OrderServices";
import CustomerServices from "../services/CustomerServices";


const route = useRoute();
const router = useRouter();

const newOrder = ref({
  pickupTime: "",
  deliveryTime: "",
  blocks: "",
  quotedPrice: "",
  customerId: "",
  deliverToCustomerId: "",
  userId: "",
  finalBill: "",
});
let isAddOrder = ref(true);
let isEditClerk = ref(false);
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


onMounted(async () => {
  const user = localStorage.getItem("user");
  if(user === null){
    router.push({ name: "login" });
  }
  if(JSON.parse(user).role < 1){
    router.push({ name: "home" });
  }

  // console.log(newOrder);
  if (user !== null) {
    newOrder.value.userId = JSON.parse(user).id;
  }
  getCustomers();
  // console.log(newOrder.value);
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
async function getClerk() {
  await UserServices.getUser(route.params.id)
    .then((response) => {
      newUser.value = response.data[0];
    })
    .catch((error) => {
      console.log(error);
    });
}

async function updateClerk() {
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
  await getClerk();
}

async function addOrder() {
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
  await OrderServices.addOrder(newOrder.value).then(
    () => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Order created successfully!`;
      setTimeout(()=> {router.push({ name: "home" });}, 5000);
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
          >Create Order
        </v-card-title>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card class="rounded-lg elevation-5">
          <v-form>
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
              label="Pick Up Date"
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
            
            <v-btn 
            variant="flat" color="primary"
            @click="
              isAddOrder
                ? addOrder()
                : isEditClerk
                ? updateClerk()
                : false
            "
             >
             {{
              isAddOrder
                ? "Create Order"
                : isEditClerk
                ? "Update Clerk"
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
