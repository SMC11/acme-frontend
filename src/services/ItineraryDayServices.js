import apiClient from "./services";

export default {
  getItinerariesDaysByItineraryId(itineraryId) {
    return apiClient.get("itineraries/" + itineraryId + "/itinerarydays/");
  },
  getItineraryDay(itineraryId, itineraryDayId) {
    return apiClient.get("itineraries/" + itineraryId + "/itinerarydays/" + itineraryDayId);
  },
  addItineraryDay(itineraryId, itineraryDay) {
    return apiClient.post("itineraries/" + itineraryId + "/itinerarydays/", itineraryDay);
  },
  // deleteItineraryDaySite(itineraryId, itineraryDayId, siteId) {
  //   return apiClient.post("itineraries/" + itineraryId + "/itinerarydays/" + itineraryDayId, siteId);
  // },
  updateItineraryDay(itineraryId, itineraryDayId, itineraryDay) {
    return apiClient.put("itineraries/" + itineraryId + "/itinerarydays/" + itineraryDayId, itineraryDay);
  },
  deleteItineraryDay(itineraryId, itineraryDayId) {
    return apiClient.delete("itineraries/" + itineraryId + "/itinerarydays/" + itineraryDayId);
  },
};
