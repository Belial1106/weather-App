let searchBox = document.querySelector('.weather-search');


let city = document.querySelector('.weather-city');
let day = document.querySelector('.weather-day');
let humidity = document.querySelector('.weather-current-humidity>.value');
let wind = document.querySelector('.weather-current-wind>.value');
let pressure = document.querySelector('.weather-current-pressure>.value');

let image = document.querySelector('.weather-image');
let temperature = document.querySelector('.weather-temperature>.value');
let forecastBlock = document.querySelector('.weather-forecast');

let weatherAPIKey = '056b4e06e279f29075f3375d7191eae9';
let weatherBaseEndPoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid='+weatherAPIKey;
let forecastEndPoint = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid='+weatherAPIKey;

let cityBasedEndPoint = 'https://api.teleport.org/api/cities/?search=';
let suggestions = document.querySelector('#suggestions');



let weatherImages= [
    {
        url : 'images/clear-sky.png',
        ids : [800]
    },

    {
        url : 'images/broken-clouds.png',
        ids : [803,804]
    },

    {
        url : 'images/few-clouds.png',
        ids : [801]
    },

    {
        url : 'images/mist.png',
        ids : [701,711,721,731,741,751,761,762,771,781]
    },

    {
        url : 'images/rain.png',
        ids : [501,502,503,504]
    },

    {
        url : 'images/scattered-clouds.png',
        ids : [802]
    },

    {
        url : 'images/shower-rain.png',
        ids : [520,521,522,531,300,301,302,310,311,312,313,314,321] 
    },



    {
        url : 'images/snow.png',
        ids : [511,600,601,602,611,612,613,615,616,620,621,622]
    },

    {
        url : 'images/thunderstorm.png',
        ids : [200,201,202,210,211,212,221,230,231,232]
    },


];

let weatherForCity = async (city) =>{
    let weather = await getWeatherByCityName(city);

        if(!weather){
            return;
        }

        let cityID = weather.id;
        updateCurrentWeather(weather);
       

        let forecast = await  getforecastByCityID(cityID);
        updateForecast(forecast);
}




let getWeatherByCityName = async (cityString) =>{
    let city;
    if (cityString.includes(',')){
        city = cityString.substring(0,cityString.indexOf(',')) + cityString.substring(cityString.lastIndexOf(','));

    }else{
        city = cityString;
    }
    let endpPoint = weatherBaseEndPoint +'&q=' + city;
    let response = await fetch(endpPoint);
    
    if (response.status !==200){
        alert('city not found');
        return;

    }
    
    let weather = await response.json();      
        return weather;
}

let getforecastByCityID = async (id) => {
    let endpPoint = forecastEndPoint + '&id=' + id;
    let result = await fetch(endpPoint);
    let forecast = await result.json();
    let forecastList = forecast.list;
    let daily = [];

    forecastList.forEach(day => {

        let date = new Date(day.dt_txt.replace(' ','T'));
        let hours = date.getHours();

        if (hours===12){
            daily.push(day);
        }
        
    }) 

    return daily;

}

let init = () =>{
    weatherForCity('Kolkata').then(()=>document.body.style.filter = 'blur(0)');
}

init();

searchBox.addEventListener('keydown', async(e)=>{
    if (e.keyCode === 13){
      weatherForCity(searchBox.value);
        
    }
});



searchBox.addEventListener('input',async () =>{
    let endpPoint = cityBasedEndPoint + searchBox.value;
    let result = await (await fetch(endpPoint)).json();
    suggestions.innerHTML = '';
    let cities = result._embedded['city:search-results'];
    let length = cities.length >5 ? 5 : cities.length;
    for (var i = 0;i<length;i++){
        let option = document.createElement('option')
        option.value = cities[i].matching_full_name;
        suggestions.appendChild(option)

    }
    

})



let updateCurrentWeather = (data) =>{

    city.textContent = data.name + ', '+ data.sys.country;
    day.textContent = dayOfWeek();
    temperature.textContent = data.main.temp > 0 ? '+ ' + Math.round(data.main.temp) :  Math.round(data.main.temp);
    humidity.textContent = data.main.humidity;
    pressure.textContent = data.main.pressure;
    
    

    let windDirection;
    let deg = data.wind.deg;
   
    if (deg > 315 && deg <= 45) {
        windDirection = 'North';
    }

    else if (deg > 45 && deg <= 135) {
        windDirection = 'East';
    }

    else if (deg > 135 && deg <= 225) {
        windDirection = 'South';
    }

    else {
        windDirection = 'West';
    }

    wind.textContent = windDirection+", "+ data.wind.speed;

    let imgID = data.weather[0].id;
    weatherImages.forEach(obj => {
        if(obj.ids.includes(imgID)){
            image.src = obj.url;
        }
    })


}

let updateForecast = (forecast) => {
    forecastBlock.innerHTML = '';
    forecast.forEach(day => {
        let iconUrl = 'http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png';
        let dayName = dayOfWeek(day.dt * 1000);
        let temp = day.main.temp > 0 ? 
                    '+' + Math.round(day.main.temp) : 
                    Math.round(day.main.temp);
        let forecastItem = `
            <article class="weather-forecast-items">
                <img src="${iconUrl}" alt="${day.weather[0].description}" class="weather-forecast-icons">
                <h3 class="weather-forecast-day">${dayName}</h3>
                <p class="weather-forecast-temperature"><span class="value">${temp }</span> &deg;C</p>
            </article>
        `;
        forecastBlock.insertAdjacentHTML('beforeend', forecastItem);
    })
}

let dayOfWeek = (dt = new Date().getTime()) => {
    return new Date(dt).toLocaleDateString('en-EN', {'weekday': 'long'});
}


