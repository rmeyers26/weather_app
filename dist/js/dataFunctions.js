

export const setLocationObject = (locationObj, coordsObj) => {
    const { lat, lon, name, unit } = coordsObj;
    locationObj.setLat(lat);
    locationObj.setLon(lon);
    locationObj.setName(name);
    if (unit) {
      locationObj.setUnit(unit);
    }
  };

  export const getHomeLocation = () => {
    return localStorage.getItem("defaultWeatherLocation");
  };


export const getWeatherFromCoords=async (locationObj) =>{
  const lat = locationObj.getLat();
  const lon = locationObj.getLon();
  const units = locationObj.getUnit();
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${WEATHER_API_KEY}`;
  try {
    const weatherStream = await fetch(url);
    const weatherJson = await weatherStream.json();
    console.log("lat",lat, "lon",lon);
    return weatherJson;
  } catch (err) {
    console.error(err);
  }

}



  export const getCoordsFromApi = async (entryText, units) => {
    console.log(entryText);
    const regex = /^\d+$/g;
    const flag = regex.test(entryText) ? "zip" : "q";
    /* const url = `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&${flag}=${entryText}&aqi=no`; */
    const url = `https://api.openweathermap.org/data/2.5/weather?${flag}=${entryText}&units=${units}&appid=${WEATHER_API_KEY}`;
    const encodedUrl = encodeURI(url);
    console.log("url=",encodedUrl);
    try {
      const dataStream = await fetch(encodedUrl);
      const jsonData = await dataStream.json();
      return jsonData;
    } catch (err) {
      console.error(err.stack);
    }
  }


    export const cleanText = (text) => {
      const regex = / {2,}/g;
      const entryText = text.replaceAll(regex, " ").trim();
      return entryText;
    };