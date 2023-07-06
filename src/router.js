import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: to => {
        if(to.query.redirect == null){
          return {path: "/login"}
        }
        return JSON.parse(decodeURI(to.query.redirect));
      },
      name: "redirect",
    },
    {
      path: "/login",
      name: "login",
      component: () => import("./views/Login.vue"),
    },
    {
      path: "/signup",
      name: "signup",
      component: () => import("./views/SignUp.vue"),
    },
    {
      path: "/home",
      name: "home",
      component: () => import("./views/Home.vue"),
    },
    {
      path: "/createclerk",
      name: "createclerk",
      component: () => import("./views/CreateClerk.vue"),
    },
    {
      path: "/createcustomer",
      name: "createcustomer",
      component: () => import("./views/CreateCustomer.vue"),
    },
    {
      path: "/createdriver",
      name: "createdriver",
      component: () => import("./views/CreateDriver.vue"),
    },
    {
      path: "/createhotel",
      name: "createhotel",
      component: () => import("./views/CreateHotel.vue"),
    },
    {
      path: "/itinerary/:id",
      name: "itinerary",
      component: () => import("./views/Itinerary.vue"),
    },
    {
      path: "/edititinerary/:id",
      name: "edititinerary",
      component: () => import("./views/EditItinerary.vue"),
    },
    {
      path: "/additineraryday/:id",
      name: "addItineraryDay",
      component: () => import("./views/AddItineraryDay.vue"),
    },
    {
      path: "/edititineraryday/:id/:itineraryDayId",
      name: "editItineraryDay",
      component: () => import("./views/AddItineraryDay.vue"),
    },
    {
      path: "/edithotel/:id",
      name: "edithotel",
      component: () => import("./views/EditHotel.vue"),
    },
    {
      path: "/viewhotels",
      name: "viewhotels",
      component: () => import("./views/ViewHotels.vue"),
    },
    {
      path: "/createsite",
      name: "createsite",
      component: () => import("./views/CreateSite.vue"),
    },
    {
      path: "/editclerk/:id",
      name: "editclerk",
      component: () => import("./views/EditClerk.vue"),
    },
    {
      path: "/viewsites",
      name: "viewsites",
      component: () => import("./views/ViewSites.vue"),
    },
  ],
});

export default router;
