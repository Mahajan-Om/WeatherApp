const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

//initially vairables need????

let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");
getfromSessionStorage(); // intially el getfromSessionStorage call kr diya becz agr intially koi present hoga ilat long me se to de dega


function switchTab(newTab) {
    if(newTab != oldTab) { // agr clicked tab cuurent tab ke equal nhi hai to pehle currenttab ke piche ka grey nikal do aur ab cuurenttab nhyi clicked tab ho gyi ab isme piche wala gry colour add krdo current-tab add kreke jisme css prop defined hai..
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")) {
            //kya search form wala container is invisible, if yes then make it visible i.e jo tab visisble hoga usme pehle hi class active present hogi but agr active claass nhi hai aur uspe click hua hai mtln whi tab dikhana hai to dusre tab me se active class nikal denge AUR  is tab me active class lga denge
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            //main pehle search wale tab pr tha, ab your weather tab visible karna h 
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //ab main your weather tab me aagya hu, toh weather bhi display karna poadega, so let's check local storage first
            //for coordinates, if we haved saved them there.
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => { // jese hi userTab pe click kiya switchtab wala function call hoga jisme parameter usertab hi jayega 
    //pass clicked tab as input paramter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(searchTab);
});

//check if cordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");   // agr local storage me coordinates save honge to nikal lo
    if(!localCoordinates) {
        //agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");  
    }
    else {
        const coordinates = JSON.parse(localCoordinates);  // here JSON capital // cordinates ko JSON me convert kr diya  json .psrse json string ko json object me convert krta hai (seesionstorage or local storage string me data save krta hai to isliye usko json.parse use kiya json object me convert krne ke liyee)...
        fetchUserWeatherInfo(coordinates);
    }

}

async function fetchUserWeatherInfo(coordinates) {   // API call kiya hai to asyncs function ka use karenge becz dusre functions ko wait nhi kra sakte jb tk API ka result nhi aata isliye async use kiya taki API queue me jaye aur jese hi stack empty hua run ho jaye 
    const {lat, lon} = coordinates;
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API CALL
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
        const  data = await response.json(); //here json small  // api call krne pr jo stream aayi usko josn object me convert kr diya here json.parse krne ne koi need nhi hai becz ye stream hai string nhi

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");  // jese api ka response aaya loding scrreen hata di aur info wala container ko dikha diya i.e usko active kr diya ab userinfo me values dalne ke liye renderweather info wala function use kiya jo API me se values nikal kr userinfo me dal dega
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        //HW

    }

}

function renderWeatherInfo(weatherInfo) {
    //fistly, we have to fethc the elements 

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    console.log(weatherInfo);

    //fetch values from weatherINfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;// weather info ke ander direct main function
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`; // weather info ke nader sys ke ander countryko lowercase me covert kr diya 
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`; // Weather Icons → From OpenWeatherMap API docs Country Flags → You as a dev can use a third-party API like FlagCDN
    temp.innerText = `${weatherInfo?.main?.temp} °C`; // this is not links it is just raw data using back tick character 
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;  /* 💡 What is ${} in backticks?
    That’s called template literals or template strings in JavaScript.
    It allows string interpolation, meaning you can embed variables or expressions directly in strings. */
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;


}

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        //HW - show an alert for no gelolocation support available
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));  //sessionStorage or local storage always string me hi data save krta hai isliye json.stringify ka use krke string me convert kiya 
    fetchUserWeatherInfo(userCoordinates);

}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        //hW
    }
}