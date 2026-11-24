const schedule = [
  { day: "Mon", events: [{ time: "21:00", title: "Live Blitz Chess", duration: "1 hr" }] },
  { day: "Tue", events: [{ time: "21:00", title: "Subscriber Chess Gauntlet", duration: "1 hr" }] },
  { day: "Wed", events: [{ time: "20:00", title: "AAA Story Gaming", duration: "2 hrs" }] },
  { day: "Thu", events: [{ time: "18:00", title: "Chess Openings", duration: "1 hr" }, { time: "20:00", title: "AAA Story Gaming", duration: "2 hrs" }] },
  { day: "Fri", events: [{ time: "20:00", title: "AAA Story Gaming", duration: "2 hrs" }] },
  { day: "Sat", events: [{ time: "20:00", title: "AAA Story Gaming", duration: "2 hrs" }, { time: "22:00", title: "International Blitz Showdown", duration: "1 hr" }] },
  { day: "Sun", events: [{ time: "21:00", title: "Speed Chess & Weekly Recap", duration: "1 hr" }] },
];

const zones = {
  IST: { label: "IST · India", offset: 330 },
  GMT: { label: "GMT · United Kingdom", offset: 0 },
  CET: { label: "CET · Central Europe", offset: 60 },
  EST: { label: "EST · US East", offset: -300 },
};
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const istOffset = zones.IST.offset;

function convertEvent(day, time, targetOffset) {
  const [hours, minutes] = time.split(":").map(Number);
  const sourceDay = dayNames.indexOf(day);
  const totalMinutes = sourceDay * 1440 + hours * 60 + minutes + targetOffset - istOffset;
  const targetDay = ((Math.floor(totalMinutes / 1440) % 7) + 7) % 7;
  const minuteOfDay = ((totalMinutes % 1440) + 1440) % 1440;
  const displayHour = Math.floor(minuteOfDay / 60);
  const displayMinute = minuteOfDay % 60;
  const suffix = displayHour >= 12 ? "PM" : "AM";
  const hour12 = displayHour % 12 || 12;
  return {
    day: dayNames[targetDay],
    time: `${hour12}:${String(displayMinute).padStart(2, "0")} ${suffix}`,
  };
}

function renderSchedule(zoneKey) {
  const zone = zones[zoneKey];
  const convertedDays = new Map(dayNames.map((day) => [day, []]));
  schedule.forEach(({ day, events }) => {
    events.forEach((event) => {
      const converted = convertEvent(day, event.time, zone.offset);
      convertedDays.get(converted.day).push({ ...event, time: converted.time });
    });
  });

  const grid = document.querySelector("#schedule-grid");
  grid.innerHTML = dayNames.map((day, index) => {
    const events = convertedDays.get(day);
    const eventMarkup = events.length
      ? events.map((event) => `
          <div class="stream-item">
            <span class="stream-time">${event.time}</span>
            <span class="stream-details">${event.title}<span class="stream-duration">${event.duration}</span></span>
          </div>
        `).join("")
      : '<div class="stream-item"><span class="stream-details">No scheduled stream</span></div>';
    return `
      <article class="day-card">
        <div class="day-card-top"><span class="day-name">${day}</span><span class="day-index">0${index + 1}</span></div>
        ${eventMarkup}
      </article>
    `;
  }).join("");
  document.querySelector("#timezone-label").textContent = zone.label;
}

const games = [
  { title: "Subnautica", symbol: "⌁", status: "NOW PLAYING", colors: ["#075160", "#123a52", "#101d2a"] },
  { title: "Subnautica: Below Zero", symbol: "❄", colors: ["#317886", "#183c55", "#101d2a"] },
  { title: "Subnautica 2", symbol: "◉", colors: ["#14636b", "#17425b", "#101d2a"] },
  { title: "007 First Light", symbol: "◈", colors: ["#8b6428", "#3a3b3b", "#121b22"] },
  { title: "Uncharted 4", symbol: "✦", colors: ["#96703c", "#4b4134", "#1a2023"] },
  { title: "Uncharted: The Lost Legacy", symbol: "❖", colors: ["#587448", "#354333", "#181e21"] },
  { title: "Alan Wake", symbol: "☾", colors: ["#29384e", "#292d3b", "#11161e"] },
  { title: "Hogwarts Legacy", symbol: "✧", colors: ["#755e39", "#393644", "#171a24"] },
  { title: "Red Dead Redemption 2", symbol: "♢", colors: ["#9a512c", "#563325", "#1b1b1c"] },
  { title: "Red Dead Redemption", symbol: "♧", colors: ["#8d4829", "#513723", "#1b1b1c"] },
  { title: "Cyberpunk 2077", symbol: "⌘", colors: ["#ae6f3a", "#583544", "#1b1b24"] },
  { title: "Cities: Skylines", symbol: "▥", colors: ["#507880", "#364f53", "#171e24"] },
  { title: "Minecraft", symbol: "▧", colors: ["#668a49", "#3b664c", "#18271e"] },
  { title: "GTA V", symbol: "Ⅴ", colors: ["#72874c", "#3d5945", "#18221d"] },
  { title: "No Man's Sky", symbol: "✺", colors: ["#b06a37", "#75424b", "#261e2b"] },
];

document.querySelector("#game-grid").innerHTML = games.map((game, index) => {
  const [top, middle, bottom] = game.colors;
  const background = `radial-gradient(ellipse at 72% 22%, ${top} 0%, transparent 40%), radial-gradient(ellipse at 20% 65%, ${middle} 0%, transparent 53%), linear-gradient(145deg, ${middle}, ${bottom})`;
  const isCurrent = index === 0;
  return `
    <article class="game-card${isCurrent ? " is-current" : ""}" style="--game-bg: ${background}">
      <span class="game-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="game-symbol" aria-hidden="true">${game.symbol}</span>
      <h3 class="game-title">${game.title}</h3>
      <span class="game-status"><span class="game-status-dot"></span>${game.status || "UP NEXT"}</span>
    </article>
  `;
}).join("");

const timezoneSelect = document.querySelector("#timezone-select");
timezoneSelect.addEventListener("change", (event) => renderSchedule(event.target.value));
renderSchedule(timezoneSelect.value);

document.querySelector("#current-year").textContent = new Date().getFullYear();

const toast = document.querySelector("#toast");
let toastTimeout;
document.querySelectorAll("[data-toast]").forEach((button) => {
  button.addEventListener("click", () => {
    toast.textContent = button.dataset.toast;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
  });
});
