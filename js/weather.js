let input = document.querySelector("input");
let button = document.querySelector("#searchBtn");
let place = document.querySelector("#location");
let tempEls = document.querySelectorAll("li .temp");
let iconEls = document.querySelectorAll("li img");
let timeEls = document.querySelectorAll("li p");

let APIkey = "e62600eea10cc3f1c1755f3360075d0c";
let chart = null;

//---------------------------------------------
// 시간에 따라 bg 변경
//---------------------------------------------

function updateBackgroundByLocalTime() {
  const hour = new Date().getHours();
  const body = document.body;
  //낮
  if (hour >= 6 && hour < 18) {
    body.classList.add("day");
    body.classList.remove("night");
  } else {
    body.classList.add("night");
    body.classList.remove("day");
  }
}

//---------------------------------------------
//  날씨 아이콘 변경
//---------------------------------------------
updateBackgroundByLocalTime();
const iconMap = {
  "01d": "img/01d.png",
  "01n": "img/01n.png",
  "02d": "img/02d.png",
  "02n": "img/02n.png",
  "03d": "img/03d.png",
  "03n": "img/03n.png",
  "04d": "img/04d.png",
  "04n": "img/04n.png",
  "09d": "img/09d.png",
  "09n": "img/09n.png",
  "10d": "img/10d.png",
  "10n": "img/10n.png",
  "11d": "img/11d.png",
  "11n": "img/11n.png",
  "13d": "img/13d.png",
  "13n": "img/13n.png",
  "50d": "img/50d.png",
  "50n": "img/50n.png",
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
  place.innerHTML = `<i class="fa-solid fa-location-dot"></i>현재위치 : ${data.city.name}`;

  let temps = [];
  let labels = [];
  for (let i = 0; i < tempEls.length; i++) {
    let temp = Math.round(data.list[i].main.temp);
    tempEls[i].textContent = `${temp}℃`;

    let iconCode = data.list[i].weather[0].icon;
    let iconUrl = iconMap[iconCode];
    iconEls[i].src = iconUrl;

    let label = data.list[i].dt_txt.slice(11, 16);
    timeEls[i].textContent = label;

    temps.push(temp);
    labels.push(label);
    console.log(data);
  }

  //---------------------------------------------
  // 차트 임시 막음
  //---------------------------------------------
  i = 0;
  if (i == 1) {
    drawChart(labels, temps);
  }

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
