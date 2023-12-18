import { setLocationObject, getHomeLocation, getWeatherFromCoords, getCoordsFromApi, cleanText} from "./dataFunctions.js";
import{ setPlaceholderText, addSpinner, displayError, displayApiError, updateScreenReaderConfirmation,updateDisplay} from "./domFunctions.js";
import CurrentLocation from "./CurrentLocation.js";
const currentLoc = new CurrentLocation();

const initApp = ()=>{
// add listeners
const geoButton = document.getElementById("getLocation");
geoButton.addEventListener("click", getGeoWeather);
const homeButton = document.getElementById("home");
homeButton.addEventListener("click", loadWeather);
const saveButton = document.getElementById("saveLocation");
saveButton.addEventListener("click", saveLocation);
const unitButton = document.getElementById("unit");
unitButton.addEventListener("click", setUnitPref);
const refreshButton = document.getElementById("reFresh");
refreshButton.addEventListener("click", refreshWeather);
const locationEntry = document.getElementById("searchBar__form");
locationEntry.addEventListener("submit", submitNewLocation);

//setup
setPlaceholderText();
//load weather
  loadWeather();
}

document.addEventListener("DOMContentLoaded", initApp);

const getGeoWeather = (event) => {
    if (event && event.type === "click") {
      const mapIcon = document.querySelector(".fa-map-marker-alt");
      addSpinner(mapIcon);
    }
    if (!navigator.geolocation) return geoError();
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
  };

  const geoError = (errObj) => {
    const errMsg = errObj ? errObj.message : "Geolocation not supported";
    displayError(errMsg, errMsg);
  };

  const geoSuccess = (position) => {
    const myCoordsObj = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      name: `Lat:${position.coords.latitude} Long:${position.coords.longitude}`
    };
    //set location object
    console.log(myCoordsObj);
    setLocationObject(currentLoc, myCoordsObj);
    updateDataAndDisplay(currentLoc);
  };



const loadWeather = (event)=>{
  const savedLocation=getHomeLocation();
    /* console.log(savedLocation,event); */
  if (!savedLocation && !event) return getGeoWeather();
  if (!savedLocation && event.type ==="click") {
    displayError(
      "No Home Location Saved",
      "Sorry . Please save your home location first"
    );
  } else if (savedLocation && !event){
    displayHomeLocationWeather(savedLocation);
  } else {
    const homeIcon = document.querySelector(".fa-home");
    addSpinner(homeIcon);
    displayHomeLocationWeather(savedLocation);
  };
}
const displayHomeLocationWeather=(home)=>{
  if (typeof home==="string"){
    const locationJson=JSON.parse(home);
    const myCoordsObj={
      lat: locationJson.lat,
      lon: locationJson.lon,
      name: locationJson.name,
      unit: locationJson.unit
    }
    setLocationObject(currentLoc,myCoordsObj);
    updateDataAndDisplay(currentLoc);
  }
}

const saveLocation= () =>{
  if (currentLoc.getLat() && currentLoc.getLon()){
    const saveIcon = document.querySelector(".fa-save");
    addSpinner(saveIcon);
    const location={
      name: currentLoc.getName(),
      lat: currentLoc.getLat(),
      lon: currentLoc.getLon(),
      unit: currentLoc.getUnit()
    };
    localStorage.setItem("defaultWeatherLocation", JSON.stringify(location));
    updateScreenReaderConfirmation(`Saved ${currentLoc.getName()} as home location.`);
  }
}
const setUnitPref = () => {
  const unitIcon = document.querySelector(".fa-chart-bar");
  addSpinner(unitIcon);
  currentLoc.toggleUnit();
  updateDataAndDisplay(currentLoc);
}

const refreshWeather = () => {
  const refreshIcon = document.querySelector(".fa-sync-alt");
  addSpinner(refreshIcon);
  updateDataAndDisplay(currentLoc);
};

const submitNewLocation = async (event)=>{
  event.preventDefault();
  const text = document.getElementById("searchBar__text").value;
  const entryText=cleanText(text);
  console.log(entryText,(!entryText.lenght));
  if (!entryText.length) return;
    console.log("got here==");
    const locationIcon = document.querySelector(".fa-search");
    addSpinner(locationIcon);
    const coordsData=await getCoordsFromApi(entryText,currentLoc.getUnit());
    console.log("data=", coordsData);
    console.log("datacode=", coordsData.cod);
//work with API data
  
if (coordsData){
  if (coordsData.cod===200){
      //success
      const myCoordsObj={
        lat: coordsData.coord.lat,
        lon: coordsData.coord.lon,
        name: coordsData.sys.country
          ? `${coordsData.name}, ${coordsData.sys.country}`
          : coordsData.name
      };
      setLocationObject(currentLoc, myCoordsObj);
      console.log("success",setLocationObject);
      updateDataAndDisplay(currentLoc);
    }else {
      displayApiError(coordsData);
    }
  } else {
    displayError("Connection Error", "Connection Error")
  }
}


    // update data and display
    const updateDataAndDisplay = async (locationObj) => {
      const weatherJson = await getWeatherFromCoords(locationObj);
      if (weatherJson) updateDisplay(weatherJson, locationObj);
    };