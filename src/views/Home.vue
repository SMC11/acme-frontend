<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import ItineraryCard from "../components/ItineraryCardComponent.vue";
import UserServices from "../services/UserServices";
import EmailServices from "../services/EmailServices";
import CustomerServices from "../services/CustomerServices";
import OrderServices from "../services/OrderServices";

const router = useRouter();
const route = useRoute();
const clerks = ref([]);
const drivers = ref([]);
const orders = ref([]);
const customers = ref([]);
const itinerariesList = [ref([]), ref([]), ref([])];
const subscribedItinerariesList = [ref([]), ref([]), ref([])];

const role = ref(0);
const user = ref(null);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
  itinerariesList[0].value = [];
  itinerariesList[1].value = [];
  itinerariesList[2].value = [];
  subscribedItinerariesList[0].value = [];
  subscribedItinerariesList[1].value = [];
  subscribedItinerariesList[2].value = [];
  await getClerks();
  await getDrivers();
  await getCustomers();
  await getOrders();
  user.value = JSON.parse(localStorage.getItem("user"));
  role.value = user.value.role;
  
}

async function getClerks() {
  user.value = JSON.parse(localStorage.getItem("user"));
  console.log(user.value);
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
  user.value = JSON.parse(localStorage.getItem("user"));
  console.log(user.value);
  if (user.value !== null && user.value.role == 1) {
    await OrderServices.getOrders()
      .then((response) => {
        orders.value = response.data;
        for(let i=0; i<orders.value.length; i++){
          orders.value[i].pickupTime = getDateTime(orders.value[i].pickupTime);
          orders.value[i].deliveryTime = getDateTime(orders.value[i].deliveryTime);
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
  user.value = JSON.parse(localStorage.getItem("user"));
  console.log(user.value);
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
  user.value = JSON.parse(localStorage.getItem("user"));
  console.log(user.value);
  if (user.value !== null && user.value.role > 1) {
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
async function sendEmail(itineraryId) {
  await ItineraryServices.getItinerary(itineraryId)
    .then((response) => {
      var deletedItinerary = response.data[0];
      var subscribers = deletedItinerary.subscription.map(sub => {return sub.user;});
      var subscriberEmails = subscribers.map(user => {return user.email;});
      if(subscriberEmails.length == 0){
        return;
      }
      var emailList = subscriberEmails.join(",");
      var subject = "Deleted Itinerary for " + deletedItinerary.name;
      var href = new URL(router.currentRoute.value.href, window.location.origin).href;
      var body = "This itinerary is no longer available. Please check out our other available itineraries at : " + href;
      EmailServices.sendEmail(emailList, subject, body)
        .then((response) => {
          snackbar.value.value = true;
          snackbar.value.color = "green";
          snackbar.value.text = "Emails Sent Successfully";
          setTimeout(()=> {return;}, 2000);
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
          snackbar.value.value = true;
          snackbar.value.color = "error";
          snackbar.value.text = error.text;
        });
    })
    .catch((error) => {
      console.log(error);
    });
  
}

function navigateToItinerary(itineraryId) {
  console.log(user.value);
  if(user.value === null){
    return;
  }
  if(role.value>0){
    router.push({ name: "edititinerary", params: {id: itineraryId} });
    return;
  }
  router.push({ name: "itinerary", params: {id: itineraryId} });
}


function openAdd() {
  router.push({ name: "createclerk" });
}


function viewHotels() {
  router.push({ name: "viewhotels" });
}
function viewSites() {
  router.push({ name: "viewsites" });
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
// function navigateToEditDriver(clerkId) {
//   router.push({ name: "editdriver", params: { id: clerkId } });
// }
function getDateTime(date){
  date = new Date(date);
  return days[date.getDay()] + " " + months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear()
  + " " + date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  ;
}
</script>

<template>
  <v-container>
    <div id="body">
      <v-row v-if="user !== null && role == 1" class="mb-2">
        <v-card-title v-if="user !== null && role == 1" class="pl-0 text-h4 font-weight-bold"
            >Welcome Clerk!
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
      <v-card-title v-if="user !== null && role >= 1" class="pl-0 text-h4 font-weight-bold"
            >Orders
          </v-card-title>
      <v-row v-if="user !== null && role >= 1" class="mb-4">
        <v-col cols="11">
      
        </v-col>
        <v-table theme="dark">
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
              <th class="text-left">
                Driver
              </th>
              <th class="text-left">
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
              <td>{{ order.customerId }}</td>
              <td>{{ order.deliverToCustomerId }}</td>
              <td>{{ order.blocks }}</td>
              <td>{{ order.quotedPrice }}</td>
              <td>{{ order.finalBill }}</td>
              <td>{{  }}</td>
              <td><v-icon
                  v-if="user !== null"
                  size="small"
                  icon="mdi-delete"
                  @click="handleDelete(order.id)"
                ></v-icon>&nbsp;
                <v-icon
                  v-if="user !== null"
                  size="small"
                  icon="mdi-pencil"
                  @click="navigateToEditOrder(order.id)"
                ></v-icon></td>
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
        <v-col cols="11">
      
        </v-col>
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
                  v-if="user !== null"
                  size="small"
                  icon="mdi-delete"
                  @click="handleDelete(driver.id)"
                ></v-icon>&nbsp;
                <v-icon
                  v-if="user !== null"
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
                Name
              </th>
              <th class="text-left">
                Address
              </th>
              <th class="text-left">
                Instructions
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
              v-for="customer in customers"
              :key="customer.id"
            >
              <td>{{ customer.name }}</td>
              <td>{{ customer.address }}</td>
              <td>{{ customer.instructions }}</td>
              <td>{{ customer.phoneNumber }}</td>
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
          <!-- <v-card-title v-if="user !== null && role == 0" class="pl-0 text-h4 font-weight-bold"
            >Subscribed Itineraries
          </v-card-title> -->
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <!-- <v-btn v-if="user !== null && role > 0" color="accent" @click="openAdd()"
            >Create Itinerary</v-btn> -->
        </v-col>
      </v-row>
      <v-row v-if="user !== null && role == 0" class="mb-4">
        <v-col cols="4">
      <ItineraryCard
        v-for="itinerary in subscribedItinerariesList[0].value"
        :key="itinerary.id"
        :itinerary="itinerary"
        @dblclick="navigateToItinerary(itinerary.id)"
      />
    </v-col>
    
        <v-col cols="4">
      <ItineraryCard
        v-for="itinerary in subscribedItinerariesList[1].value"
        :key="itinerary.id"
        :itinerary="itinerary"
        @dblclick="navigateToItinerary(itinerary.id)"
      />
    </v-col>
    
        <v-col cols="4">
      <ItineraryCard
        v-for="itinerary in subscribedItinerariesList[2].value"
        :key="itinerary.id"
        :itinerary="itinerary"
        @dblclick="navigateToItinerary(itinerary.id)"
      />
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
