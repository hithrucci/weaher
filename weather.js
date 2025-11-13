let input = document.querySelector("input");
let button = document.querySelector("#searchBtn");
let place = document.querySelector("#location");
let tempEls = document.querySelectorAll("li .temp");
let iconEls = document.querySelectorAll("li img");
let timeEls = document.querySelectorAll("li p");

let APIkey = "e62600eea10cc3f1c1755f3360075d0c";
let chart = null;

const iconMap = {
  "01d": "img/weather/clear-day.png",
  "01n": "img/weather/clear-night.png",
  "02d": "img/weather/fewclouds-day.png",
  "02n": "img/weather/fewclouds-night.png",
  "03d": "img/weather/scattered.png",
  "03n": "img/weather/scattered-night.png",
  "04d": "img/weather/broken.png",
  "04n": "img/weather/broken-night.png",
  "09d": "img/weather/shower.png",
  "09n": "img/weather/shower-night.png",
  "10d": "img/weather/rain.png",
  "10n": "img/weather/rain-night.png",
  "11d": "img/weather/thunder.png",
  "11n": "img/weather/thunder-night.png",
  "13d": "img/weather/snow.png",
  "13n": "img/weather/snow-night.png",
  "50d": "img/weather/mist.png",
  "50n": "img/weather/mist-night.png",
};

getLocation();
function getLocation() {
  navigator.geolocation.getCurrentPosition(success);
}

async function success(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;

  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIkey}&units=metric&lang=kr`
  );
  let data = await response.json();
  render(data);
}

weather = async (cityname) => {
  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${cityname}&appid=${APIkey}&units=metric&lang=kr`
  );
  let data = await response.json();
  render(data);
};

button.addEventListener("click", () => {
  let city = input.value;
  input.value = "";
  weather(city);
});
input.addEventListener("keydown", (e) => {
  if (e.key == "Enter") {
    let city = input.value;
    input.value = "";
    weather(city);
  }
});

function render(data) {
  place.textContent = data.city.name;

  let temps = [];
  let labels = [];
  for (let i = 0; i < tempEls.length; i++) {
    let temp = Math.round(data.list[i].main.temp);
    tempEls[i].textContent = `${temp}℃`;

    let icon = data.list[i].weather[0].icon;
    let iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
    iconEls[i].src = iconUrl;

    let label = data.list[i].dt_txt.slice(11, 16);
    timeEls[i].textContent = label;

    temps.push(temp);
    labels.push(label);
    console.log(data);
  }

  drawChart(labels, temps);

  function drawChart(labels, temps) {
    let ctx = document.querySelector("#weatherChart").getContext("2d");

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "시간별 기온",
            data: temps,
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            min: 10,
            max: 20,
            ticks: {
              stepSize: 2,
            },
            title: {
              display: true,
              text: "기온",
              color: "orange",
              font: {
                size: 14,
              },
            },
          },
        },
      },
    });
  }
}
