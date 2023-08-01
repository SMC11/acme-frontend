import apiClient from "./services";

export default {
  findRoute(c1, c2) {
    return apiClient.get("direction/"+c1+"/"+c2);
  },
};
