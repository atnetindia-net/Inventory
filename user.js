/* ============================= */
/* SIDEBAR + THEME SYSTEM */
/* ============================= */

const sidebarToggleBtns = document.querySelectorAll(".sidebar-toggle");
const sidebar = document.querySelector(".sidebar");
const searchForm = document.querySelector(".search-form");
const themeToggleBtn = document.querySelector(".theme-toggle");
const themeIcon = themeToggleBtn.querySelector(".theme-icon");

const updateThemeIcon = () => {
  const isDark = document.body.classList.contains("dark-theme");
  themeIcon.textContent =
    sidebar.classList.contains("collapsed")
      ? (isDark ? "light_mode" : "dark_mode")
      : "dark_mode";
};

const savedTheme = localStorage.getItem("theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const shouldUseDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

document.body.classList.toggle("dark-theme", shouldUseDarkTheme);
updateThemeIcon();

themeToggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeIcon();
});

sidebarToggleBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    updateThemeIcon();
  });
});

searchForm.addEventListener("click", () => {
  if (sidebar.classList.contains("collapsed")) {
    sidebar.classList.remove("collapsed");
    searchForm.querySelector("input").focus();
  }
});

if (window.innerWidth > 768) {
  sidebar.classList.remove("collapsed");
}

/* ================================= */
/* GOOGLE APPS SCRIPT API CONNECTION */
/* ================================= */

const API_URL = "https://script.google.com/macros/s/AKfycbzHKe7HT-iKoM3sXoqa8ZWjNuBC1c1Ms6HZfhx6ERNsPpCR7X7Ap7DTEMLkgb3LT54jDg/exec";

async function fetchSheet(sheetName) {
  try {
    const response = await fetch(`${API_URL}?sheet=${encodeURIComponent(sheetName)}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

/* ============================= */
/* PAGE HEADER */
/* ============================= */

const mainContent = document.querySelector(".main-content");

function renderPageHeader(title) {
  mainContent.innerHTML = `
    <h1 class="page-title">${title}</h1>
    <button class="logout-btn" onclick="openLogoutPopup()">Logout</button>
  `;
}

/* ============================= */
/* ANIMATED COUNTERS */
/* ============================= */

function animateCounter(el, target) {
  let start = 0;
  const step = target / 40;
  const counter = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(counter);
    }
    el.innerText = Math.floor(start);
  }, 20);
}

/* ============================= */
/* SUMMARY CARDS */
/* ============================= */

function createSummaryCards(cards) {

  const container = document.createElement("div");
  container.className = "summary-cards";

  cards.forEach(c => {

    const card = document.createElement("div");
    card.className = "summary-card";

    card.innerHTML = `
      <h3>${c.title}</h3>
      <h2>${c.value}</h2>
    `;

    container.appendChild(card);

  });

  setTimeout(() => {
    document.querySelectorAll(".summary-card h2").forEach(el => {
      animateCounter(el, parseInt(el.innerText));
    });
  }, 200);

  return container;
}

/* ============================= */
/* TOP 5 UTILITY */
/* ============================= */

function getTopFive(obj) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

/* ============================= */
/* CHARTS */
/* ============================= */

let barChart = null;
let donutChart = null;

function createCharts(categoryTotals, productTotals) {
  const chartRow = document.createElement("div");
  chartRow.className = "chart-row";

  const barCard = document.createElement("div");
  barCard.className = "chart-card";
  barCard.innerHTML = `<h3 class="chart-title">Top 5 Categories</h3><canvas id="barChart"></canvas>`;

  const donutCard = document.createElement("div");
  donutCard.className = "chart-card";
  donutCard.innerHTML = `<h3 class="chart-title">Top 5 Products</h3><canvas id="donutChart"></canvas>`;

  chartRow.appendChild(barCard);
  chartRow.appendChild(donutCard);
  mainContent.appendChild(chartRow);

  if (barChart) barChart.destroy();
  if (donutChart) donutChart.destroy();

  const topCat = getTopFive(categoryTotals);
  const topProd = getTopFive(productTotals);

  const catLabels = topCat.map(x => x[0]);
  const catValues = topCat.map(x => x[1]);
  const prodLabels = topProd.map(x => x[0]);
  const prodValues = topProd.map(x => x[1]);

  const ctx = document.getElementById("barChart").getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, "#695cfe");
  gradient.addColorStop(1, "#9f97ff");

  barChart = new Chart(ctx, {
    type: "bar",
    data: { labels: catLabels, datasets: [{ data: catValues, backgroundColor: gradient, borderRadius: 10 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "nearest", intersect: true },
      plugins: { legend: { display: false }, tooltip: { backgroundColor: "#111", titleColor: "#fff", bodyColor: "#ddd", displayColors: false } },
      scales: { x: { ticks: { display: false }, grid: { display: false } }, y: { ticks: { display: false }, grid: { color: "rgba(0,0,0,0.05)" } } }
    }
  });

  const isDark = document.body.classList.contains("dark-theme");

  donutChart = new Chart(document.getElementById("donutChart"), {
    type: "doughnut",
    data: { labels: prodLabels, datasets: [{ data: prodValues, backgroundColor: ["#695cfe","#8a80ff","#a7a0ff","#c5c0ff","#e3e1ff"], borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: "50%", plugins: { legend: { position: "left", labels: { color: isDark ? "#fff" : "#111827", font: { family: "Poppins", size: 14, weight: "500" } } } } }
  });
}

/* ============================= */
/* TABLE */
/* ============================= */

function createTable(headers, rows) {

  const wrapper = document.createElement("div");
  wrapper.className = "table-section";

  const search = document.createElement("input");
  search.className = "table-search";
  search.placeholder = "Search product...";

  const table = document.createElement("table");
  table.className = "inventory-table";

  let html = "<thead><tr>";

  headers.forEach(h => html += `<th>${h}</th>`);

  html += "</tr></thead><tbody>";

  rows.forEach(r => {
    html += "<tr>";
    r.forEach(c => html += `<td>${c}</td>`);
    html += "</tr>";
  });

  html += "</tbody>";

  table.innerHTML = html;

  search.addEventListener("keyup", function () {

    const term = this.value.toLowerCase();

    table.querySelectorAll("tbody tr").forEach(row => {

      row.style.display =
        row.innerText.toLowerCase().includes(term) ? "" : "none";

    });

  });

  wrapper.appendChild(search);
  wrapper.appendChild(table);

  return wrapper;

}

/* ============================= */
/* DASHBOARD LOADER */
/* ============================= */

async function loadStockDashboard(sheetName, pageTitle) {

  renderPageHeader(pageTitle);

  const data = await fetchSheet(sheetName);

  let totalSalable = 0;

  let categoryTotals = {};
  let productTotals = {};

  const rows = [];

  data.forEach(d => {

    const category = d["Category"] || "";
    const product = d["Product Model"] || "";

    const stock =
      Number(d["Total Salable Stock"]) ||
      Number(d["Salable Stock"]) ||
      0;

    totalSalable += stock;

    if(category){
      categoryTotals[category] = (categoryTotals[category] || 0) + stock;
    }

    if(product){
      productTotals[product] = (productTotals[product] || 0) + stock;
    }

    rows.push([
      category,
      product,
      stock
    ]);

  });

  const cards = createSummaryCards([
    { title: "Categories", value: Object.keys(categoryTotals).length },
    { title: "Products", value: rows.length },
    { title: "Total Salable Stock", value: totalSalable }
  ]);

  mainContent.appendChild(cards);

  createCharts(categoryTotals, productTotals);

  const table = createTable(
    ["Category","Product Model","Total Salable Stock"],
    rows
  );

  mainContent.appendChild(table);

}

/* ============================= */
/* MENU HANDLER */
/* ============================= */

const menuLinks = document.querySelectorAll(".menu-link");

menuLinks.forEach(link => {

  link.addEventListener("click", function(e){

    e.preventDefault();

    menuLinks.forEach(l => l.classList.remove("active"));
    this.classList.add("active");

    const label = this.querySelector(".menu-label").innerText.trim();

    if(label === "Aver Stocks"){
      loadStockDashboard("Regional Visibility Stock - Aver","Aver Stocks");
    }

    if(label === "A&T Stocks"){
      loadStockDashboard("Regional Visibility Stock - A&T","A&T Stocks");
    }

  });

});

/* ============================= */
/* DEFAULT PAGE */
/* ============================= */

loadStockDashboard(
  "Regional Visibility Stock - A&T",
  "A&T Stocks"
);