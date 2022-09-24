import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import { getCookie } from "../utils/cookie";
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "Home",
    component: Home,
    // beforeEnter: (to, from, next) => {
    //   // reject the navigation
    //   if (to.name === "Home") {
    //     if (getCookie("status")) {
    //       next();
    //     } else {
    //       next({ path: "/login" });
    //     }
    //   }
    // },
  },
  // {
  //   path: "/login",
  //   name: "Login",
  //   component: () => import("../views/Login.vue"),
  // },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
