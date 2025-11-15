//---------------------------------------------
// DOM 요소 & 전역 변수
//---------------------------------------------

let input = document.querySelector("input");
let button = document.querySelector("#searchBtn");
let place = document.querySelector("#location");

let timeEls = document.querySelectorAll("li .time");
let iconEls = document.querySelectorAll("li .iconWrap img");
let descEls = document.querySelectorAll("li .iconWrap .desc");
let tempEls = document.querySelectorAll("li .temp");
let liEls = document.querySelectorAll("ul li");

let APIkey = "e62600eea10cc3f1c1755f3360075d0c";
let chart = null;

//---------------------------------------------
// input focus 효과
//---------------------------------------------

input.addEventListener("focusin", () => {
  input.classList.add("focused");
});

input.addEventListener("focusout", () => {
  input.classList.remove("focused");
});

//---------------------------------------------
// 아이콘 d/n 보정
//---------------------------------------------

function getCorrectIcon(iconCode, dtText) {
  const base = iconCode.slice(0, 2);
  const hour = parseInt(dtText.slice(11, 13), 10);
  const isDay = hour >= 6 && hour < 18;
  return `${base}${isDay ? "d" : "n"}`;
}

//---------------------------------------------
// 시간대별 배경 변경
//---------------------------------------------

function updateBackgroundByLocalTime() {
  const hour = new Date().getHours();
  const body = document.body;
  const dayBg = document.querySelector("#dayBg");
  const nightBg = document.querySelector("#nightBg");

  if (hour >= 6 && hour < 18) {
    body.classList.add("day");
    body.classList.remove("night");
    if (body.classList.contains("day")) {
      dayBg.classList.add("on");
    }
  } else {
    body.classList.add("night");
    body.classList.remove("day");
    if (body.classList.contains("night")) {
      nightBg.classList.add("on");
    }
  }
}

updateBackgroundByLocalTime();

//---------------------------------------------
// 아이콘 / 설명 맵
//---------------------------------------------

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

const descMap = {
  맑음: "맑음",
  "구름 조금": "구름 조금",
  "약간의 구름이 낀 하늘": "구름 보통",
  튼구름: "구름 많음",
  온흐림: "흐림",
  "실 비": "이슬비",
  "약한 비": "약한 비",
  "보통 비": "비",
  "강한 비": "강한 비",
  소나기: "소나기",
  "가벼운 눈": "약한 눈",
  "보통 눈": "눈",
  "강한 눈": "강한 눈",
  안개: "안개",
};

//---------------------------------------------
// 현재 위치 기준 초기 호출
//---------------------------------------------

getLocation();

function getLocation() {
  navigator.geolocation.getCurrentPosition(success);
}

async function success(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  fetchWeatherByCoords(lat, lon);
}

//---------------------------------------------
// API 호출 (좌표 / 도시명)
//---------------------------------------------

async function fetchWeatherByCoords(lat, lon) {
  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIkey}&units=metric&lang=kr`
  );
  let data = await response.json();
  render(data);
}

async function fetchWeatherByCityName(cityname) {
  if (!cityname.trim()) return;

  const encodedCity = encodeURIComponent(cityname.trim());

  const geoRes = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodedCity}&limit=5&appid=${APIkey}`
  );
  const geoData = await geoRes.json();

  if (!geoData || geoData.length === 0) {
    alert("일치하는 도시를 찾을 수 없어요. 다른 이름으로 검색해볼까요?");
    return;
  }

  const { lat, lon } = geoData[0];
  fetchWeatherByCoords(lat, lon);
}

//---------------------------------------------
// 검색 이벤트 (버튼 / 엔터)
//---------------------------------------------

button.addEventListener("click", () => {
  const city = input.value.trim();
  if (!city) return;

  if (!document.body.classList.contains("searched")) {
    document.body.classList.add("searched");
  }

  fetchWeatherByCityName(city);
  input.value = "";
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = input.value.trim();
    if (!city) return;

    if (!document.body.classList.contains("searched")) {
      document.body.classList.add("searched");
    }

    fetchWeatherByCityName(city);
    input.value = "";
  }
});

//---------------------------------------------
// 렌더링
//---------------------------------------------

function render(data) {
  gsap.killTweensOf(liEls);

  liEls.forEach((li, i) => {
    gsap.fromTo(
      li,
      {
        marginTop: 50,
        opacity: 0,
      },
      {
        marginTop: 0,
        opacity: 1,
        duration: 0.4,
        delay: i * 0.1,
        ease: "power2.out",
      }
    );
  });

  place.innerHTML = `<i class="fa-solid fa-location-dot"></i>현재위치 : ${data.city.name}`;

  let temps = [];
  let labels = [];

  const now = new Date();
  let nearestIndex = 0;
  let nearestDiff = Infinity;

  for (let i = 0; i < tempEls.length; i++) {
    let temp = Math.round(data.list[i].main.temp);
    tempEls[i].textContent = `현재 기온 : ${temp}℃`;

    let rawIconCode = data.list[i].weather[0].icon;
    let dtText = data.list[i].dt_txt;

    let fixedIconCode = getCorrectIcon(rawIconCode, dtText);
    let iconUrl = iconMap[fixedIconCode] || iconMap[rawIconCode];
    iconEls[i].src = iconUrl;

    let label = data.list[i].dt_txt.slice(11, 16);
    timeEls[i].textContent = label;

    let rawDesc = data.list[i].weather[0].description;
    let shortDesc = descMap[rawDesc] || rawDesc;
    descEls[i].textContent = shortDesc;

    temps.push(temp);
    labels.push(label);

    const forecastTime = new Date(data.list[i].dt_txt);
    const diff = Math.abs(forecastTime.getTime() - now.getTime());

    if (diff < nearestDiff) {
      nearestDiff = diff;
      nearestIndex = i;
    }
  }

  liEls.forEach((li) => li.classList.remove("current"));
  if (liEls[nearestIndex]) {
    liEls[nearestIndex].classList.add("current");
  }

  //---------------------------------------------
  // 차트 (옵션: 필요 시 drawChart 호출)
  //---------------------------------------------

  // drawChart(labels, temps);

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

//---------------------------------------------
// 카드 hover 인터랙션 (젤리 / 기울기)
//---------------------------------------------

const cards = document.querySelectorAll("ul li");

function getBaseScale(el) {
  return el.classList.contains("current") ? 1.2 : 1;
}

cards.forEach((card) => {
  card.addEventListener("mouseenter", () => {
    const base = getBaseScale(card);

    gsap.fromTo(
      card,
      { scaleX: base, scaleY: base },
      {
        scaleX: base * 1.06,
        scaleY: base * 0.94,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: "power1.out",
      }
    );
  });

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const relX = (e.clientX - centerX) / (rect.width / 2);
    const relY = (e.clientY - centerY) / (rect.height / 2);

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const x = clamp(relX, -1, 1);
    const y = clamp(relY, -1, 1);
    const base = getBaseScale(card);

    gsap.to(card, {
      rotation: x * 4,
      skewX: x * 6,
      skewY: y * -4,
      scaleX: base + x * 0.03,
      scaleY: base - y * 0.03,
      transformOrigin: "center",
      duration: 0.25,
      ease: "power2.out",
    });
  });

  card.addEventListener("mouseleave", () => {
    const base = getBaseScale(card);

    gsap.to(card, {
      rotation: 0,
      skewX: 0,
      skewY: 0,
      scaleX: base,
      scaleY: base,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
    });
  });
});

//---------------------------------------------
// 얼굴 아이콘 눈동자: 커서 따라가기
//---------------------------------------------

const eyeEls = document.querySelectorAll(".bg .eye");

document.addEventListener("mousemove", (e) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  eyeEls.forEach((eye) => {
    const pupil = eye.querySelector(".pupil");
    if (!pupil) return;

    const rect = eye.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;

    if (dx > 0) {
      gsap.to(pupil, {
        x: 0,
        y: 0,
        duration: 0.15,
        ease: "power2.out",
      });
      return;
    }

    const maxOffset = rect.width * 0.4;
    const angle = Math.atan2(dy, dx);
    const distance = Math.min(Math.hypot(dx, dy), maxOffset);

    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;

    gsap.to(pupil, {
      x: offsetX,
      y: offsetY,
      duration: 0.15,
      ease: "power2.out",
    });
  });
});

//---------------------------------------------
// 가로 드래그 스크롤 (PC / 모바일)
//---------------------------------------------

const weatherList = document.querySelector("ul");

let isDown = false;
let startX;
let scrollLeft;

if (weatherList) {
  weatherList.addEventListener("mousedown", (e) => {
    isDown = true;
    weatherList.classList.add("dragging");
    startX = e.pageX - weatherList.offsetLeft;
    scrollLeft = weatherList.scrollLeft;
  });

  weatherList.addEventListener("mouseleave", () => {
    isDown = false;
    weatherList.classList.remove("dragging");
  });

  weatherList.addEventListener("mouseup", () => {
    isDown = false;
    weatherList.classList.remove("dragging");
  });

  weatherList.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - weatherList.offsetLeft;
    const walk = (x - startX) * 1.5;
    weatherList.scrollLeft = scrollLeft - walk;
  });

  weatherList.addEventListener("touchstart", (e) => {
    isDown = true;
    weatherList.classList.add("dragging");
    startX = e.touches[0].pageX - weatherList.offsetLeft;
    scrollLeft = weatherList.scrollLeft;
  });

  weatherList.addEventListener("touchend", () => {
    isDown = false;
    weatherList.classList.remove("dragging");
  });

  weatherList.addEventListener("touchmove", (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - weatherList.offsetLeft;
    const walk = (x - startX) * 1.5;
    weatherList.scrollLeft = scrollLeft - walk;
  });
}
