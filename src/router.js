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
      path: "/createorder",
      name: "createorder",
      component: () => import("./views/CreateOrder.vue"),
    },
    {
      path: "/editcustomer/:id",
      name: "editcustomer",
      component: () => import("./views/EditCustomer.vue"),
    },
    {
      path: "/createdriver",
      name: "createdriver",
      component: () => import("./views/CreateDriver.vue"),
    },
    {
      path: "/editclerk/:id",
      name: "editclerk",
      component: () => import("./views/EditClerk.vue"),
    },
    {
      path: "/editdriver/:id",
      name: "editdriver",
      component: () => import("./views/EditDriver.vue"),
    },
    {
      path: "/editorder/:id",
      name: "editorder",
      component: () => import("./views/EditOrder.vue"),
    },
  ],
});

export default router;
