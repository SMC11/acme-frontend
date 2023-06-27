import apiClient from "./services";

export default {
  getItineraries() {
    return apiClient.get("itineraries");
  },
  getItinerariesByUserId(userId) {
    return apiClient.get("itineraries/user/" + userId);
  },
  getItinerary(id) {
    return apiClient.get("itineraries/" + id);
  },
  addItinerary(itinerary) {
    return apiClient.post("itineraries/", itinerary);
  },
  addItineraryPhoto(formData) {
    let config = {
      headers: {'Content-Type': 'multipart/form-data'}
    };
    return apiClient.post("itineraries/", formData, config)
    .then( response => {
      console.log(response);
    });
  },
  updateItinerary(itineraryId, itinerary) {
    return apiClient.put("itineraries/" + itineraryId, itinerary);
  },
  deleteItinerary(itineraryId) {
    return apiClient.delete("itineraries/" + itineraryId);
  },
};
