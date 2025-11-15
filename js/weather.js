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
  const dayBg = document.querySelector("#dayBg");
  const nightBg = document.querySelector("#nightBg");
  //낮
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

// ---------------------------------------------
// #searchArea 젤리 / 물결 효과 (GSAP)
// ---------------------------------------------
const searchArea = document.querySelector("#searchArea");

if (searchArea) {
  // 마우스가 올라왔을 때 한 번 "통통" 튕기는 젤리 효과
  searchArea.addEventListener("mouseenter", () => {
    gsap.fromTo(
      searchArea,
      { scaleX: 1, scaleY: 1 },
      {
        scaleX: 1.06,
        scaleY: 0.94,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: "power1.out",
      }
    );
  });

  // 마우스가 영역 안에서 움직일 때, 부드러운 물결/틸트 느낌
  searchArea.addEventListener("mousemove", (e) => {
    const rect = searchArea.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // -1 ~ 1 사이 값으로 정규화
    const relX = (e.clientX - centerX) / (rect.width / 2);
    const relY = (e.clientY - centerY) / (rect.height / 2);

    // 너무 과하게 안 가게 clamp
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
    const x = clamp(relX, -1, 1);
    const y = clamp(relY, -1, 1);

    gsap.to(searchArea, {
      // 마우스 위치에 따라 살짝 기울고, 찌그러지듯 변형
      rotation: x * 4, // 좌우 이동에 따라 약간 회전
      skewX: x * 6, // 좌우 찌그러짐
      skewY: y * -4, // 위/아래에 따른 찌그러짐
      scaleX: 1 + x * 0.03, // 좌우로 약간 늘어남
      scaleY: 1 - y * 0.03, // 위/아래에 따라 눌리는 느낌
      transformOrigin: "center",
      duration: 0.25,
      ease: "power2.out",
    });
  });

  // 영역 밖으로 나가면 천천히 원래대로 되돌아오기
  searchArea.addEventListener("mouseleave", () => {
    gsap.to(searchArea, {
      rotation: 0,
      skewX: 0,
      skewY: 0,
      scaleX: 1,
      scaleY: 1,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)", // 통통~ 하고 돌아오는 젤리
    });
  });
}
// // ---------------------------------------------
// div.bg 아이콘 눈동자: 커서를 따라가는 눈알 효과
// ---------------------------------------------
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
      return; // 이 눈은 여기서 처리 끝
    }
    // 눈동자가 움직일 수 있는 최대 반경 (눈 크기에 비례)
    const maxOffset = rect.width * 0.4; // 눈 안에서만 움직이도록

    const angle = Math.atan2(dy, dx);
    const distance = Math.min(Math.hypot(dx, dy), maxOffset);

    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;

    // pupil은 이미 CSS에서 중앙 기준(translate(-50%, -50%))이라
    // GSAP의 x, y로 추가적인 이동만 줌
    gsap.to(pupil, {
      x: offsetX,
      y: offsetY,
      duration: 0.15,
      ease: "power2.out",
    });
  });
});
