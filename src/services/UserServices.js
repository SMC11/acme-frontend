import apiClient from "./services";

export default {
  getUser(id) {
    return apiClient.get("users/" + id);
  },
  getUsers() {
    return apiClient.get("users");
  },
  getClerks() {
    return apiClient.get("clerks");
  },
  getUserSubscriptions(id) {
    return apiClient.get("users/" + id + "/subscriptions/");
  },
  subscribe(id, itineraryId) {
    return apiClient.post("users/" + id + "/subscriptions/" + itineraryId);
  },
  unsubscribe(id, itineraryId) {
    return apiClient.delete("users/" + id + "/subscriptions/" + itineraryId);
  },
  addUser(user) {
    return apiClient.post("users", user);
  },
  loginUser(user) {
    console.log(user);
    return apiClient.post("login", user.value, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        crossDomain: true,
        Authorization:
          "Basic " + btoa(user.value.email + ":" + user.value.password),
      },
    });
  },
  logoutUser() {
    return apiClient.post("logout");
  },
};
