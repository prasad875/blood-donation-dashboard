/* =========================
   DOM REFERENCES
========================= */

const donorForm = document.getElementById("donor-form");
const successMessage = document.getElementById("success-message");

const inputs = {
  fullName: document.getElementById("fullName"),
  bloodGroup: document.getElementById("bloodGroup"),
  age: document.getElementById("age"),
  gender: document.getElementById("gender"),
  phone: document.getElementById("phone"),
  city: document.getElementById("city"),
  state: document.getElementById("state"),
  address: document.getElementById("address"),
  medicalHistory: document.getElementById("medicalHistory")
};

const searchBloodGroup = document.getElementById("searchBloodGroup");
const searchLocation = document.getElementById("searchLocation");
const searchAge = document.getElementById("searchAge");

const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");

const donorTableBody = document.getElementById("donorTableBody");

/* =========================
   FETCH & ANIMATE STATS
========================= */

async function fetchStats() {
  try {
    const res = await fetch("http://localhost:3000/stats");
    const data = await res.json();

    animateCounter(
      document.getElementById("donorCount"),
      data.registeredDonors
    );

    animateCounter(
      document.getElementById("livesCount"),
      data.livesSaved
    );
  } catch (err) {
    console.error("Failed to load stats", err);
  }
}

function animateCounter(element, target) {
  if (!element) return;

  let count = 0;
  const increment = Math.max(1, Math.ceil(target / 50));

  const interval = setInterval(() => {
    count += increment;
    if (count >= target) {
      element.textContent = target;
      clearInterval(interval);
    } else {
      element.textContent = count;
    }
  }, 30);
}

/* =========================
   MOBILE NAV
========================= */

const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger?.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  hamburger.classList.toggle("active");
});

/* =========================
   DONOR REGISTRATION (POST)
========================= */

donorForm?.addEventListener("submit", async e => {
  e.preventDefault();

  if (
    !inputs.fullName.value ||
    !inputs.bloodGroup.value ||
    !inputs.age.value ||
    !inputs.phone.value ||
    !inputs.city.value ||
    !inputs.state.value
  ) {
    alert("Please fill all required fields");
    return;
  }

  const donor = {
    fullName: inputs.fullName.value.trim(),
    bloodGroup: inputs.bloodGroup.value,
    age: Number(inputs.age.value),
    gender: inputs.gender.value,
    phone: inputs.phone.value.trim(),
    city: normalize(inputs.city.value),
    state: normalize(inputs.state.value),
    address: inputs.address.value.trim(),
    medicalHistory: inputs.medicalHistory.checked
  };

  try {
    const res = await fetch("http://localhost:3000/donors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(donor)
    });

    if (!res.ok) throw new Error("Failed to save donor");

    donorForm.reset();

    if (successMessage) {
      successMessage.style.display = "flex";
    }

    renderTable();
    fetchStats(); // 🔥 update counter immediately

  } catch (err) {
    alert("Server error. Please try again.");
    console.error(err);
  }
});

/* =========================
   SUCCESS MESSAGE
========================= */

function closeSuccessMessage() {
  if (successMessage) {
    successMessage.style.display = "none";
  }
}
window.closeSuccessMessage = closeSuccessMessage;

/* =========================
   TABLE RENDER (GET)
========================= */

async function renderTable() {
  const params = new URLSearchParams({
    bloodGroup: searchBloodGroup.value,
    location: searchLocation.value.trim(),
    maxAge: searchAge.value
  });

  donorTableBody.innerHTML = "";

  try {
    const res = await fetch(`http://localhost:3000/donors?${params}`);
    const donors = await res.json();

    if (!donors || donors.length === 0) {
      donorTableBody.innerHTML = `
        <tr>
          <td colspan="6">No donors found</td>
        </tr>
      `;
      return;
    }

    donors.forEach(donor => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${donor.fullName}</td>
        <td>${donor.bloodGroup}</td>
        <td>${donor.age}</td>
        <td>${capitalize(donor.city)}</td>
        <td>${capitalize(donor.state)}</td>
        <td>${donor.phone}</td>
      `;
      donorTableBody.appendChild(row);
    });
  } catch (err) {
    donorTableBody.innerHTML = `
      <tr>
        <td colspan="6">Error loading data</td>
      </tr>
    `;
    console.error(err);
  }
}

/* =========================
   SEARCH & RESET
========================= */

searchBtn?.addEventListener("click", renderTable);

resetBtn?.addEventListener("click", () => {
  searchBloodGroup.value = "";
  searchLocation.value = "";
  searchAge.value = "";

  donorTableBody.innerHTML = `
    <tr>
      <td colspan="6">No donors to display</td>
    </tr>
  `;
});

/* =========================
   UTILITIES
========================= */

function normalize(text) {
  return text.trim().toLowerCase();
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* =========================
   SMOOTH SCROLL
========================= */

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    document
      .querySelector(link.getAttribute("href"))
      .scrollIntoView({ behavior: "smooth" });
  });
});

/* =========================
   HEADER SCROLL EFFECT
========================= */

const header = document.getElementById("header");
let lastScroll = 0;

window.addEventListener("scroll", () => {
  const current = window.pageYOffset;
  if (!header) return;

  header.style.transform =
    current > lastScroll && current > 100
      ? "translateY(-100%)"
      : "translateY(0)";

  lastScroll = current;
});

/* =========================
   INITIAL LOAD
========================= */

renderTable();
fetchStats();
