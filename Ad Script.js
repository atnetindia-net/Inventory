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
/* TABLE SEARCH + PAGINATION */
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
  rows.forEach(r => { html += "<tr>"; r.forEach(c => html += `<td>${c}</td>`); html += "</tr>"; });
  html += "</tbody>";
  table.innerHTML = html;

  search.addEventListener("keyup", function () {
    const term = this.value.toLowerCase();
    table.querySelectorAll("tbody tr").forEach(row => {
      row.style.display = row.innerText.toLowerCase().includes(term) ? "" : "none";
    });
  });

  wrapper.appendChild(search);
  wrapper.appendChild(table);
  return wrapper;
}

/* ============================= */
/* PRODUCT POPUP FUNCTION */
/* ============================= */

function showProductPopup(category, model, data, headings){

  const existing = document.querySelector(".inventory-popup");
  if(existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.className = "inventory-popup";

  const popup = document.createElement("div");
  popup.className = "inventory-popup-box";

  let html = "";

  html += `
  <table class="popup-table">
  <thead>

  <tr>
  <th colspan="2" class="category-row">${category}</th>
  </tr>

  <tr>
  <th colspan="2" class="model-row">${model}</th>
  </tr>

  <tr>
  <th>Heading</th>
  <th>Details</th>
  </tr>

  </thead>
  <tbody>
  `;

  headings.forEach(h => {

    let val = data[h];

    /* FIXED CONDITION */
    if(val === undefined || val === null || val === "") return;

    html += `
    <tr>
      <td class="head">${h}</td>
      <td>${val}</td>
    </tr>
    `;

  });

  html += `</tbody></table>`;

  popup.innerHTML = html;

  const close = document.createElement("button");
  close.className = "popup-close";
  close.textContent = "Close";

  close.onclick = () => overlay.remove();

  popup.appendChild(close);
  overlay.appendChild(popup);

  document.body.appendChild(overlay);
}


/* ============================= */
/* LOAD AVER PRODUCTS */
/* ============================= */

async function loadAverProducts(){

renderPageHeader("Aver Products");

const data = await fetchSheet("Aver - Current Stock");

let totalSalable = 0;
let totalReserved = 0;

let categoryTotals = {};
let productTotals = {};
let categoryMap = {}; // ✅ for popup flow

data.forEach(d => {

const salable = Number(d["Salable Stock"]) || 0;

// ✅ RESERVED FIX
const reservedRaw = d["Reserved Stock"] || "";
const reserved = parseInt(reservedRaw.toString().match(/\d+/)) || 0;

totalSalable += salable;
totalReserved += reserved;

const cat = d["Category"];
const prod = d["Product Model"];

/* CATEGORY TOTAL */
categoryTotals[cat] = (categoryTotals[cat] || 0) + salable;

/* PRODUCT TOTAL */
productTotals[prod] = (productTotals[prod] || 0) + salable;

/* ✅ CATEGORY → PRODUCTS MAP */
if(!categoryMap[cat]) categoryMap[cat] = [];
categoryMap[cat].push(d);

});

/* ============================= */
/* SUMMARY CARDS */
/* ============================= */

const cards = createSummaryCards([
{title:"Categories",value:Object.keys(categoryTotals).length},
{title:"Products",value:data.length},
{title:"Total Salable Stock",value:totalSalable},
{title:"Total Reserved Stock",value:totalReserved}
]);

mainContent.appendChild(cards);

/* ============================= */
/* ✅ MAKE ONLY 2 CARDS CLICKABLE */
/* ============================= */

const cardElements = cards.querySelectorAll(".summary-card");

/* CATEGORY CARD CLICK */
cardElements[0].style.cursor = "pointer";
cardElements[0].addEventListener("click", () => {
openCategoryPopup(categoryMap);
});

/* PRODUCT CARD CLICK */
cardElements[1].style.cursor = "pointer";
cardElements[1].addEventListener("click", () => {
openAllProductsPopup(data);
});

/* ============================= */
/* CHART */
/* ============================= */

createCharts(categoryTotals, productTotals);

/* ============================= */
/* TABLE */
/* ============================= */

const table = createTable(
["Category","Product Model","Salable Stock","Reserved Stock"],
data.map(d => [
d["Category"],
d["Product Model"],
d["Salable Stock"],
d["Reserved Stock"]
])
);

mainContent.appendChild(table);

/* ============================= */
/* TABLE POPUP (UNCHANGED) */
/* ============================= */

const rows = table.querySelectorAll("tbody tr");

rows.forEach((row,idx) => {

row.style.cursor="pointer";

row.addEventListener("click", () => {

const d = data[idx];

showProductPopup(
d["Category"],
d["Product Model"],
d,
[
"Salable Stock",
"Reserved Stock",
"OEM Support Stock / FOC DP",
"Saleable Stock given for Demo",
"Demo",
"Standby",
"RMA",
"Material Intransit",
"Remarks"
]
);

});

});

}

/* ===================================================== */
/* 🔥 CATEGORY POPUP */
/* ===================================================== */

function openCategoryPopup(categoryMap){

const overlay = document.createElement("div");
overlay.className = "inventory-popup";

const box = document.createElement("div");
box.className = "inventory-popup-box";

box.innerHTML = `<h3>Select Category</h3>`;

Object.keys(categoryMap).forEach(cat => {

const card = document.createElement("div");
card.className = "popup-card";
card.textContent = cat;

card.onclick = () => {
overlay.remove();
openProductPopup(cat, categoryMap[cat]);
};

box.appendChild(card);

});

const close = document.createElement("button");
close.textContent = "Close";
close.className = "popup-close";
close.onclick = () => overlay.remove();

box.appendChild(close);
overlay.appendChild(box);
document.body.appendChild(overlay);

}

/* ===================================================== */
/* 🔥 PRODUCT POPUP (FROM CATEGORY) */
/* ===================================================== */

function openProductPopup(category, products){

const overlay = document.createElement("div");
overlay.className = "inventory-popup";

const box = document.createElement("div");
box.className = "inventory-popup-box";

box.innerHTML = `<h3>${category}</h3>`;

products.forEach(d => {

const card = document.createElement("div");
card.className = "popup-card";
card.textContent = d["Product Model"];

card.onclick = () => {
overlay.remove();

showProductPopup(
d["Category"],
d["Product Model"],
d,
[
"Salable Stock",
"Reserved Stock",
"OEM Support Stock / FOC DP",
"Saleable Stock given for Demo",
"Demo",
"Standby",
"RMA",
"Material Intransit",
"Remarks"
]
);

};

box.appendChild(card);

});

const close = document.createElement("button");
close.textContent = "Close";
close.className = "popup-close";
close.onclick = () => overlay.remove();

box.appendChild(close);
overlay.appendChild(box);
document.body.appendChild(overlay);

}

/* ===================================================== */
/* 🔥 ALL PRODUCTS POPUP */
/* ===================================================== */

function openAllProductsPopup(data){

const overlay = document.createElement("div");
overlay.className = "inventory-popup";

const box = document.createElement("div");
box.className = "inventory-popup-box";

box.innerHTML = `<h3>All Products</h3>`;

data.forEach(d => {

const card = document.createElement("div");
card.className = "popup-card";
card.textContent = d["Product Model"];

card.onclick = () => {
overlay.remove();

showProductPopup(
d["Category"],
d["Product Model"],
d,
[
"Salable Stock",
"Reserved Stock",
"OEM Support Stock / FOC DP",
"Saleable Stock given for Demo",
"Demo",
"Standby",
"RMA",
"Material Intransit",
"Remarks"
]
);

};

box.appendChild(card);

});

const close = document.createElement("button");
close.textContent = "Close";
close.className = "popup-close";
close.onclick = () => overlay.remove();

box.appendChild(close);
overlay.appendChild(box);
document.body.appendChild(overlay);

}


/* ============================= */
/* LOAD A&T PRODUCTS */
/* ============================= */

async function loadATProducts(){

renderPageHeader("A&T Products");

const data = await fetchSheet("A&T - Current Stock");

let totalHO = 0;
let totalMFG = 0;
let totalSalable = 0;

let categoryTotals = {};
let productTotals = {};

data.forEach(d => {

const ho = Number(d["Stock at HO"]) || 0;
const mfg = Number(d["Stock at MFG"]) || 0;
const salable = Number(d["Salable Stock"]) || 0;

totalHO += ho;
totalMFG += mfg;
totalSalable += salable;

const cat = d["Category"];
const prod = d["Product Model"];

categoryTotals[cat] = (categoryTotals[cat] || 0) + salable;
productTotals[prod] = (productTotals[prod] || 0) + salable;

});

/* ============================= */
/* SUMMARY CARDS */
/* ============================= */

const cards = createSummaryCards([
{title:"Products",value:data.length},
{title:"Stock at HO",value:totalHO},
{title:"Stock at MFG",value:totalMFG},
{title:"Salable Stock",value:totalSalable}
]);

mainContent.appendChild(cards);

/* ============================= */
/* ✅ MAKE ONLY PRODUCT CARD CLICKABLE */
/* ============================= */

const cardElements = cards.querySelectorAll(".summary-card");

/* ONLY FIRST CARD CLICKABLE */
cardElements[0].style.cursor = "pointer";

cardElements[0].addEventListener("click", () => {
openATProductPopup(data);
});

/* ============================= */
/* CHART */
/* ============================= */

createCharts(categoryTotals, productTotals);

/* ============================= */
/* TABLE */
/* ============================= */

const table = createTable(
["Category","Product Model","Stock at HO","Stock at MFG","Salable Stock"],
data.map(d => [
d["Category"],
d["Product Model"],
d["Stock at HO"],
d["Stock at MFG"],
d["Salable Stock"]
])
);

mainContent.appendChild(table);

/* ============================= */
/* TABLE POPUP (UNCHANGED) */
/* ============================= */

const rows = table.querySelectorAll("tbody tr");

rows.forEach((row,idx) => {

row.style.cursor="pointer";

row.addEventListener("click", () => {

const d = data[idx];

showProductPopup(
d["Category"],
d["Product Model"],
d,
[
"Stock at HO",
"Stock at MFG",
"Salable Stock",
"Reserved",
"Remarks"
]
);

});

});

}

/* ===================================================== */
/* 🔥 PRODUCT POPUP (2 PER ROW GRID) */
/* ===================================================== */

function openATProductPopup(data){

const overlay = document.createElement("div");
overlay.className = "inventory-popup";

const box = document.createElement("div");
box.className = "inventory-popup-box";

box.innerHTML = `<h3>All Products</h3>`;

/* ✅ GRID CONTAINER */
const grid = document.createElement("div");
grid.className = "popup-grid";

data.forEach(d => {

const card = document.createElement("div");
card.className = "popup-card";
card.textContent = d["Product Model"];

card.onclick = () => {

overlay.remove();

showProductPopup(
d["Category"],
d["Product Model"],
d,
[
"Stock at HO",
"Stock at MFG",
"Salable Stock",
"Reserved",
"Remarks"
]
);

};

grid.appendChild(card);

});

/* ADD GRID */
box.appendChild(grid);

/* CLOSE BUTTON */
const close = document.createElement("button");
close.textContent = "Close";
close.className = "popup-close";
close.onclick = () => overlay.remove();

box.appendChild(close);
overlay.appendChild(box);
document.body.appendChild(overlay);

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

const label = this.querySelector(".menu-label")?.innerText.trim() || "";

if(label === "Aver Products") loadAverProducts();
if(label === "A&T Products") loadATProducts();

});

});
/* ============================= */
/* DEFAULT PAGE */
/* ============================= */

loadATProducts();

/* ============================= */
/* DEMO PRODUCTS – SaaS VERSION */
/* AUTO SYNC ENABLED */
/* ============================= */

document.addEventListener("DOMContentLoaded", function () {

let currentSheetName="";
let currentPageTitle="";
let lastDataHash="";

/* MENU */

const demoToggle = document.querySelector(".demo-toggle");
const submenu = document.querySelector(".submenu");

if (!demoToggle || !submenu) return;

demoToggle.addEventListener("click", e => {
e.preventDefault();
submenu.classList.toggle("open");
});

const demoLinks = submenu.querySelectorAll(".menu-link");

/* ============================= */
/* LOAD SHEET */
/* ============================= */

async function loadDemoSheet(sheetName,pageTitle){

currentSheetName = sheetName;
currentPageTitle = pageTitle;

const mainContent = document.querySelector(".main-content");
mainContent.innerHTML="";

renderPageHeader(pageTitle);

const data = await fetchSheet(sheetName);

lastDataHash = JSON.stringify(data);

renderDashboard(data);

}

/* ============================= */
/* RENDER DASHBOARD */
/* ============================= */

function renderDashboard(data){

const mainContent = document.querySelector(".main-content");

/* GROUP DATA */

const productMap={};

data.forEach(d=>{

const model=d["PRODUCT MODEL"];
if(!model) return;

if(!productMap[model]){

productMap[model]={
CATEGORY:d["CATEGORY"],
MODEL:model,
TYPES:{}
};

}

const type=d["TYPE"];

productMap[model].TYPES[type]={

HO:Number(d["HO"]||0),
AHD:Number(d["AHD"]||0),
BLR:Number(d["BLR"]||0),
CHN:Number(d["CHN"]||0),
PUN:Number(d["PUN"]||0),
MUM:Number(d["MUM"]||0),
DEL:Number(d["DEL"]||0),
"STAND BY":Number(d["STAND BY"]||0),
PARTNER:Number(d["PARTNER"]||0),
"END CUSTOMER":Number(d["END CUSTOMER"]||0),

TOTAL:Number(d["TOTAL"]||0) // ✅ moved to last

};

});

const tableData=Object.values(productMap);

/* SUMMARY */

const totalCategories=new Set(tableData.map(d=>d.CATEGORY)).size;
const totalProducts=tableData.length;

let totalStock=0;

tableData.forEach(p=>{
Object.values(p.TYPES).forEach(t=>{
totalStock+=t.TOTAL||0;
});
});

const cards=document.createElement("div");
cards.className="summary-cards";

[
{title:"Total Categories",value:totalCategories},
{title:"Total Products",value:totalProducts},
{title:"Total Stock",value:totalStock}
].forEach(c=>{

const card=document.createElement("div");
card.className="summary-card";

card.innerHTML=`
<h3>${c.title}</h3>
<h2>${c.value}</h2>
`;

cards.appendChild(card);

});


mainContent.appendChild(cards);

/* DASHBOARD TABLE */

const tableColumns=["CATEGORY","PRODUCT MODEL","DEMO","SUPPORT","TOTAL"];

const tableRows=tableData.map(p=>{

const demo=p.TYPES["Demo"]?p.TYPES["Demo"].TOTAL:0;
const support=p.TYPES["Support"]?p.TYPES["Support"].TOTAL:0;

const total=demo+support;

return[
p.CATEGORY,
p.MODEL,
demo===0?"-":demo,
support===0?"-":support,
total
];

});

const table=createTable(tableColumns,tableRows);
mainContent.appendChild(table);

/* POPUP */

const rows=table.querySelectorAll("tbody tr");

rows.forEach((row,idx)=>{

row.style.cursor="pointer";

row.addEventListener("click",()=>{

const existing=document.querySelector(".inventory-popup");
if(existing) existing.remove();

const product=tableData[idx];

const overlay=document.createElement("div");
overlay.className="inventory-popup";

const popup=document.createElement("div");
popup.className="inventory-popup-box";

const hasSupport=product.TYPES["Support"];
const hasDemo=product.TYPES["Demo"];

let columns=[];

if(hasSupport&&hasDemo) columns=["SUPPORT","DEMO"];
else if(hasSupport) columns=["SUPPORT"];
else columns=["DEMO"];

const headings=[
"HO","AHD","BLR","CHN",
"PUN","MUM","DEL","STAND BY",
"PARTNER","END CUSTOMER","TOTAL"
];

const tableEl=document.createElement("table");
tableEl.className="popup-table";

/* HEADER */

let thead="<thead>";

/* CATEGORY */

thead+=`
<tr>
<th colspan="${columns.length+1}" class="category-row">
${product.CATEGORY}
</th>
</tr>
`;

/* MODEL */

thead+=`
<tr>
<th colspan="${columns.length+1}" class="model-row">
${product.MODEL}
</th>
</tr>
`;

/* DETAILS + TYPE */

thead+=`
<tr>
<th rowspan="2">DETAILS</th>
<th colspan="${columns.length}">TYPE</th>
</tr>
<tr>
`;

columns.forEach(c=>{
thead+=`<th>${c}</th>`;
});

thead+="</tr></thead>";

tableEl.innerHTML=thead;

/* BODY */

const tbody=document.createElement("tbody");

headings.forEach(h=>{

let values=[];


columns.forEach(c=>{

const key=c==="SUPPORT"?"Support":"Demo";
const v=product.TYPES[key]?product.TYPES[key][h]:0;

values.push(v);

});

if(values.every(v=>v===0)) return;

const tr=document.createElement("tr");

let html=`<td class="head">${h}</td>`;

values.forEach(v=>{
html+=`<td>${v||"-"}</td>`;
});

tr.innerHTML=html;
tbody.appendChild(tr);

});

tableEl.appendChild(tbody);
popup.appendChild(tableEl);

const close=document.createElement("button");
close.className="popup-close";
close.textContent="Close";

close.onclick=()=>overlay.remove();

popup.appendChild(close);

overlay.appendChild(popup);
document.body.appendChild(overlay);

});

});

}

/* ============================= */
/* AUTO DATA SYNC */
/* ============================= */

async function autoSync(){

if(!currentSheetName) return;

const newData=await fetchSheet(currentSheetName);

const newHash=JSON.stringify(newData);

if(newHash!==lastDataHash){

lastDataHash=newHash;

const mainContent=document.querySelector(".main-content");
mainContent.innerHTML="";
renderPageHeader(currentPageTitle);

renderDashboard(newData);

}

}

/* CHECK EVERY 10s */

setInterval(autoSync,10000);

/* MENU EVENTS */

demoLinks.forEach(link=>{

link.addEventListener("click",function(e){

e.preventDefault();

const label=this.querySelector(".menu-label").innerText.trim();

let sheetName="",pageTitle="";

if(label==="Aver - Demo Stocks"){

sheetName="Aver - Demo Stock";
pageTitle="Aver Demo Stock";

}

else if(label==="A&T - Demo Stocks"){

sheetName="A&T - Demo Stock";
pageTitle="A&T Demo Stock";

}

loadDemoSheet(sheetName,pageTitle);

});

});

});


/* ============================= */
/* SaaS POPUP STYLE */
/* ============================= */

const style=document.createElement("style");

style.innerHTML=`

.category-row{
background:#dcdcdc;
font-size:18px;
font-weight:700;
text-align:center;
}

.model-row{
background:#e8e8e8;
font-size:16px;
font-weight:700;
text-align:center;
}

.inventory-popup{
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,0.45);
display:flex;
align-items:center;
justify-content:center;
z-index:9999;
animation:fadeIn .25s ease;
}

.inventory-popup-box{
background:white;
width:720px;
max-width:95%;
border-radius:14px;
padding:25px;
box-shadow:0 20px 40px rgba(0,0,0,0.25);
animation:popupScale .25s ease;
}

.popup-table{
width:100%;
border-collapse:collapse;
font-size:14px;
}

.popup-table th{
background:#f4f6fb;
padding:8px;
border:1px solid #ddd;
}

.popup-table td{
padding:8px;
border:1px solid #ddd;
text-align:center;
}

.popup-table .head{
font-weight:600;
text-align:left;
}

.popup-close{
margin:20px auto 0;
display:block;
padding:10px 26px;
border:none;
border-radius:6px;
background:#ff3b3b;
color:white;
font-weight:600;
cursor:pointer;
}

@keyframes fadeIn{
from{opacity:0}
to{opacity:1}
}

@keyframes popupScale{
from{transform:scale(.9);opacity:0}
to{transform:scale(1);opacity:1}
}

`;

document.head.appendChild(style);
