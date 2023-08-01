<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import UserServices from "../services/UserServices";
import CustomerServices from "../services/CustomerServices";
import OrderServices from "../services/OrderServices";
import DirectionServices from "../services/DirectionServices";
import { jsPDF } from "jspdf";

import { nextTick } from "vue";

const router = useRouter();
const route = useRoute();
const clerks = ref([]);
const drivers = ref([]);
const orders = ref([]);
const customers = ref([]);
const selectedCustomer = ref(undefined);
var currentCustomer = "";
const selectedDriver = ref(undefined);
var currentDriver = "";

const isStatement = ref(false);

const role = ref(0);
const user = ref(null);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const map = ref(null);
const isOpenDirections = ref(false);
const finalPriceTotal = ref(0.00);

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  if(user.value == null){
    router.push({ name: "login" });
  }
  if(route.query.redirect !== undefined){
    var redirectParams = JSON.parse(decodeURI(route.query.redirect));
    console.log('Redirecting...');
    router.push({name: redirectParams.name, params: redirectParams.params});
  }
  mounted();
});

async function mounted(){
  user.value = JSON.parse(localStorage.getItem("user"));
  role.value = user.value.role;

  await getClerks();
  await getDrivers();
  await getCustomers();
  await getOrders();
  
}

async function getClerks() {
  if (user.value !== null && user.value.role > 1) {
    await UserServices.getClerks()
      .then((response) => {
        clerks.value = response.data;
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
  } else {
    
  }
  if (user.value !== null && user.value.role == 0) {
    
  } 
}

async function getOrders() {
  if(selectedCustomer.value && selectedCustomer.value.id == currentCustomer){
    if(selectedDriver.value && selectedDriver.value.id == currentDriver){
      return;
    }
  }
  if(selectedCustomer.value){
    currentCustomer = selectedCustomer.value.id;
  }
  if(!selectedCustomer.value){
    currentCustomer = "";
  }
  if(!selectedDriver.value){
    currentDriver = "";
  }
  if (user.value !== null && user.value.role >= 0) {
    await OrderServices.getOrders()
      .then((response) => {
        orders.value = [];
        finalPriceTotal.value = 0.00;
        for(let i=0; i<response.data.length; i++){
          response.data[i].pickupTime = getDateTime(response.data[i].pickupTime);
          response.data[i].deliveryTime = getDateTime(response.data[i].deliveryTime);
          response.data[i].updatedAt = getDateTime(response.data[i].updatedAt);
          if(selectedCustomer.value){
            console.log(response.data[i].customerId, selectedCustomer.value.id);
            if(response.data[i].customerId == selectedCustomer.value.id){
              if(selectedDriver.value){
                if(response.data[i].userId == selectedDriver.value.id){
                  orders.value.push(response.data[i]);
                  finalPriceTotal.value+=parseFloat(response.data[i].finalBill);
                  continue;
                }
              }else{
                orders.value.push(response.data[i]);
                finalPriceTotal.value+=parseFloat(response.data[i].finalBill);
                continue;
              }
            }
          }else if(selectedDriver.value){
            console.log(response.data[i].userId, selectedDriver.value.id);
            if(response.data[i].userId == selectedDriver.value.id){
              if(selectedCustomer.value){
                if(response.data[i].customerId == selectedCustomer.value.id){
                  orders.value.push(response.data[i])
                  finalPriceTotal.value+=parseFloat(response.data[i].finalBill);
                  continue;
                }
              }else{
                orders.value.push(response.data[i]);
                finalPriceTotal.value+=parseFloat(response.data[i].finalBill);
                continue;
              }
            }
          }else{
            orders.value.push(response.data[i]);
            finalPriceTotal.value+=parseFloat(response.data[i].finalBill);
            continue;
          }
        }
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
  }
}

async function getDrivers() {
  if (user.value !== null && user.value.role > 1) {
    await UserServices.getDrivers()
      .then((response) => {
        drivers.value = response.data;
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
  }
}
async function getCustomers() {
  if (user.value !== null && user.value.role >= 0) {
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
}
async function updateOrderState(orderId, state){
  await OrderServices.updateOrderState(orderId, state)
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
function assignOrder(orderId){
  updateOrderState(orderId, {
      userId: user.value.id,
      state: 1,
    });
}
function collectOrder(orderId){
  updateOrderState(orderId, {
      userId: user.value.id,
      state: 2,
    });
}
async function deliverOrder(orderId){
  await OrderServices.getOrder(orderId)
  .then((response) => {
    let order = response.data;
    var state = {
      userId: user.value.id,
      state: 3,
      finalBill : order.quotedPrice,
    }
    if((new Date(order.deliveryTime)) >= (new Date())){
      state['finalBill'] = parseFloat(order.quotedPrice) + parseFloat(order.quotedPrice * 0.10);
    }
    updateOrderState(orderId, state);
  });
  
}

async function showDirections(c1, c2, deliverToCustomer){
  await DirectionServices.findRoute(c1, c2)
  .then((response) => {
    map.value = response.data.directions;
    map.value += "\n Drop Off package at " + deliverToCustomer.instructions;
    console.log(map);
    isOpenDirections.value = true;
  });
}
function closeShowDirections(){
  isOpenDirections.value = false;
}

async function handleDeleteOrder(orderId) {
  // await sendEmail(orderId);
  await OrderServices.deleteOrder(orderId)
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

async function handleDelete(clerkId) {
  // await sendEmail(clerkId);
  await UserServices.deleteUser(clerkId)
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
  router.push({ name: "createclerk" });
}

function getCustomerInfo(customerId){
  for(let i=0; i< customers.value.length; i++){
    if(customers.value[i].id == customerId){
      return customers.value[i].name;
    }
  }
}

function closeSnackBar() {
  snackbar.value.value = false;
}
function navigateToEdit(clerkId) {
  router.push({ name: "editclerk", params: { id: clerkId } });
}

function navigateToEditOrder(orderId) {
  router.push({ name: "editorder", params: { id: orderId } });
}

function openAddCustomer() {
  router.push({ name: "createcustomer" });
}
function navigateToEditCustomer(customerId) {
  router.push({ name: "editcustomer", params: { id: customerId } });
}

async function handleDeleteCustomer(customerId) {
  await CustomerServices.deleteCustomer(customerId)
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

function openAddOrder() {
  router.push({ name: "createorder" });
}

function openAddDriver() {
  router.push({ name: "createdriver" });
}
function navigateToEditDriver(clerkId) {
  router.push({ name: "editdriver", params: { id: clerkId } });
}
function getDateTime(date){
  date = new Date(date);
  return days[date.getDay()] + " " + months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear()
  + " " + date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  ;
}

function handleDownloadPDF(){
  isStatement.value = true;
  nextTick(() => {
    var id = '#orders-table';
    // Default export is a4 paper, portrait, using millimeters for units
    const doc = new jsPDF({
      orientation: "landscape",
    });
    var elementHTML = document.querySelector(id);

    doc.html(elementHTML, {
        callback: function(doc) {
            // Save the PDF
            doc.save('statement.pdf');
        },
        x: 15,
        y: 15,
        width: 250, //target width in the PDF document
        windowWidth: 1200 //window width in CSS pixels
    });
    isStatement.value = false;
  });
  
}
</script>

<template>
  <v-container>
    <div id="body">
      <v-row v-if="user !== null && role == 1" class="mb-2">
        <v-card-title class="pl-0 text-h4 font-weight-bold"
            >Welcome Clerk!
          </v-card-title>
      </v-row>
      <v-row v-if="user !== null && role == 0" class="mb-2">
        <v-card-title class="pl-0 text-h4 font-weight-bold"
            >Welcome Driver!
          </v-card-title>
      </v-row>
      <v-row v-if="user !== null && role == 2" class="mb-2">
        <v-card-title class="pl-0 text-h4 font-weight-bold"
            >Welcome Admin!
          </v-card-title>
      </v-row>
      <v-row align="center" class="mb-4">
        <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="user !== null && role > 1" color="accent" @click="openAdd()"
            >Create Clerk</v-btn>
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="user !== null && role > 1" color="accent" @click="openAddDriver()"
            >Create Driver</v-btn>
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="user !== null && role > 1" color="accent" @click="openAddCustomer()"
            >Create Customer</v-btn>
            <v-btn v-if="user !== null && role == 1" color="accent" @click="openAddOrder()"
            >Create Order</v-btn>
        </v-col>
        <v-col cols="6">
        </v-col>
      </v-row>
      <v-card-title v-if="user !== null" class="pl-0 text-h4 font-weight-bold"
            >Orders
          </v-card-title>
      <v-row v-if="user !== null" class="mb-4">
        <v-col cols="10">
          <v-autocomplete
          v-if="user !== null && role > 0"
            v-model="selectedCustomer"
            :items="customers"
            item-title="name"
            item-value="id"
            label="Select Customer"
            placeholder="Search Customers"
            persistent-hint
            return-object
            auto-select-first
            :on-change="getOrders()"
            hide-selected
            clearable
          ></v-autocomplete>
        </v-col>
        <v-col cols="2">          
          <v-icon
                  v-if="user !== null && role == 2"
                  size="x-large"
                  icon="mdi-file-pdf-box"
                  title="Download PDF"
                  @click="handleDownloadPDF()"
                ></v-icon>
        </v-col>
        <v-col cols="10">
          <v-autocomplete
          v-if="user !== null && role > 1"
            v-model="selectedDriver"
            :items="drivers"
            item-title="firstName"
            item-value="id"
            label="Select Driver"
            placeholder="Search Drivers"
            persistent-hint
            return-object
            auto-select-first
            :on-change="getOrders()"
            hide-selected
            clearable
          ></v-autocomplete>
        </v-col>
        <v-col cols="2">          
          <v-icon
                  v-if="user !== null && role == 2"
                  size="x-large"
                  icon="mdi-file-pdf-box"
                  title="Download PDF"
                  @click="handleDownloadPDF()"
                ></v-icon>
        </v-col>
        <v-table theme="dark" id="orders-table">
          <thead>
            <tr>
              <th class="text-left">
                Pick Up
              </th>
              <th class="text-left">
                Drop Off
              </th>
              <th class="text-left">
                From
              </th>
              <th class="text-left">
                To
              </th>
              <th class="text-left">
                Blocks
              </th>
              <th class="text-left">
                Quoted Price
              </th>
              <th class="text-left">
                Final Price
              </th>
              <th class="text-left" v-if="!isStatement">
                Last State Change At
              </th>
              <th v-if="role > 0 && !isStatement" class="text-left">
                Driver
              </th>
              <th class="text-left" v-if="!isStatement">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in orders"
              :key="order.id"
            >
              <td>{{ order.pickupTime }}</td>
              <td>{{ order.deliveryTime }}</td>
              <td>{{ getCustomerInfo(order.customerId) }}</td>
              <td>{{ getCustomerInfo(order.deliverToCustomerId) }}</td>
              <td>{{ order.blocks }}</td>
              <td>{{ order.quotedPrice }}</td>
              <td>{{ order.finalBill }}</td>
              <td v-if="!isStatement">{{ order.updatedAt }}</td>
              <td v-if="role > 0 && !isStatement">{{ order.user? ( order.user.role == 0? order.user.firstName : "-"): "-"}}</td>
              <td v-if="!isStatement"><v-icon
                  v-if="user !== null && role > 0 && order.state < 2"
                  size="large"
                  icon="mdi-delete"
                  title="Delete"
                  @click="handleDeleteOrder(order.id)"
                ></v-icon>&nbsp;
                <v-icon
                  v-if="user !== null && role > 0 && order.state < 2"
                  size="large"
                  icon="mdi-pencil"
                  title="Edit"
                  @click="navigateToEditOrder(order.id)"
                ></v-icon>&nbsp;
                
                <v-icon
                  v-if="user !== null && role == 0 && order.state == 0"
                  size="large"
                  icon="mdi-account-plus"
                  title="Assign"
                  @click="assignOrder(order.id)"
                ></v-icon>
                <v-icon
                  v-if="user !== null && role == 0 && order.state == 1"
                  size="large"
                  icon="mdi-account-arrow-left"
                  title="Collected"
                  @click="collectOrder(order.id)"
                ></v-icon>
                <v-icon
                  v-if="user !== null && role == 0 && order.state == 2"
                  size="large"
                  icon="mdi-account-arrow-right"
                  title="Delivered"
                  @click="deliverOrder(order.id)"
                ></v-icon>
                <v-icon
                  v-if="user !== null && role == 0 && order.state == 3"
                  size="large"
                  icon="mdi-account-check"
                  title="Done"
                  disabled
                ></v-icon>
                <v-icon
                  v-if="user !== null && role == 0 && order.state < 3"
                  size="large"
                  icon="mdi-map"
                  title="Directions"
                  @click="showDirections(order.customerId, order.deliverToCustomerId, order.deliverToCustomer)"
                ></v-icon>
              </td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td>{{finalPriceTotal.toFixed(2)}}</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </v-table>
      </v-row>
      <v-card-title v-if="user !== null && role > 1" class="pl-0 text-h4 font-weight-bold"
            >Clerks
          </v-card-title>
      <v-row v-if="user !== null && role > 1" class="mb-4">
        <v-col cols="11">
      
        </v-col>
        <v-table theme="dark">
          <thead>
            <tr>
              <th class="text-left">
                First Name
              </th>
              <th class="text-left">
                Last Name
              </th>
              <th class="text-left">
                Email
              </th>
              <th class="text-left">
                Phone
              </th>
              <th class="text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="clerk in clerks"
              :key="clerk.id"
            >
              <td>{{ clerk.firstName }}</td>
              <td>{{ clerk.lastName }}</td>
              <td>{{ clerk.email }}</td>
              <td>{{ clerk.phoneNumber }}</td>
              <td><v-icon
                  v-if="user !== null"
                  size="small"
                  icon="mdi-delete"
                  @click="handleDelete(clerk.id)"
                ></v-icon>&nbsp;
                <v-icon
                  v-if="user !== null"
                  size="small"
                  icon="mdi-pencil"
                  @click="navigateToEdit(clerk.id)"
                ></v-icon></td>
            </tr>
          </tbody>
        </v-table>
      </v-row>

      <v-card-title v-if="user !== null && role > 1" class="pl-0 text-h4 font-weight-bold"
            >Drivers
          </v-card-title>
      <v-row v-if="user !== null && role > 1" class="mb-4">
        <v-col cols="11"></v-col>
        <v-table  theme="dark">
          <thead>
            <tr>
              <th class="text-left">
                First Name
              </th>
              <th class="text-left">
                Last Name
              </th>
              <th class="text-left">
                Email
              </th>
              <th class="text-left">
                Phone
              </th>
              <th class="text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="driver in drivers"
              :key="driver.id"
            >
              <td>{{ driver.firstName }}</td>
              <td>{{ driver.lastName }}</td>
              <td>{{ driver.email }}</td>
              <td>{{ driver.phoneNumber }}</td>
              <td><v-icon
                  v-if="user !== null && role > 1"
                  size="small"
                  icon="mdi-delete"
                  @click="handleDelete(driver.id)"
                ></v-icon>&nbsp;
                <v-icon
                  v-if="user !== null && role > 1"
                  size="small"
                  icon="mdi-pencil"
                  @click="navigateToEditDriver(driver.id)"
                ></v-icon></td>
            </tr>
          </tbody>
        </v-table>
      </v-row>


      <v-card-title v-if="user !== null && role > 1" class="pl-0 text-h4 font-weight-bold"
            >Customers
          </v-card-title>
      <v-row v-if="user !== null && role > 1" class="mb-4">
        <v-col cols="11">
      
        </v-col>
        <v-table theme="dark">
          <thead>
            <tr>
              <th class="text-left">
                Number
              </th>
              <th class="text-left">
                Name
              </th>
              <th class="text-left">
                Address
              </th>
              <th class="text-left">
                Instructions
              </th>
              <th class="text-left">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="customer in customers"
              :key="customer.id"
            >
              <td>{{ customer.phoneNumber }}</td>
              <td>{{ customer.name }}</td>
              <td>{{ customer.address }}</td>
              <td>{{ customer.instructions }}</td>
              <td><v-icon
                  v-if="user !== null"
                  size="small"
                  icon="mdi-delete"
                  @click="handleDeleteCustomer(customer.id)"
                ></v-icon>&nbsp;
                <v-icon
                  v-if="user !== null"
                  size="small"
                  icon="mdi-pencil"
                  @click="navigateToEditCustomer(customer.id)"
                ></v-icon></td>
            </tr>
          </tbody>
        </v-table>
      </v-row>

      <v-row align="center" class="mb-4">
        <v-col cols="10">
         
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
         
        </v-col>
      </v-row>
      

    <v-dialog persistent v-model="isOpenDirections" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">Directions</v-card-title>
          <v-card-text>
            <v-textarea
              v-model="map"
              label="Directions"
              required
            ></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              variant="filled"
              color="primary"
              auto-grow
              @click="closeShowDirections()"
              >Close</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

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
