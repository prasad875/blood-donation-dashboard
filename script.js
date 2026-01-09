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
   LOCAL STORAGE HELPERS
========================= */

function getDonors() {
    return JSON.parse(localStorage.getItem("donors")) || [];
}

function saveDonors(donors) {
    localStorage.setItem("donors", JSON.stringify(donors));
}

/* =========================
   COUNTER ANIMATION
========================= */

let counterPlayed = false;

function animateCounters() {
    if (counterPlayed) return;
    counterPlayed = true;

    document.querySelectorAll(".counter").forEach(counter => {
        const target = Number(counter.dataset.target);
        let count = 0;

        const interval = setInterval(() => {
            count += Math.ceil(target / 100);
            if (count >= target) {
                counter.textContent = target;
                clearInterval(interval);
            } else {
                counter.textContent = count;
            }
        }, 20);
    });
}

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) animateCounters();
    });
});

document.querySelectorAll(".counter").forEach(c => observer.observe(c));

/* =========================
   MOBILE NAV
========================= */

const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    hamburger.classList.toggle("active");
});

/* =========================
   DONOR REGISTRATION
========================= */

donorForm.addEventListener("submit", e => {
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

    const donors = getDonors();
    donors.push(donor);
    saveDonors(donors);

    donorForm.reset();
    successMessage.style.display = "flex";

    renderTable(); // refresh dashboard
});

/* =========================
   SUCCESS MESSAGE
========================= */

function closeSuccessMessage() {
    successMessage.style.display = "none";
}
window.closeSuccessMessage = closeSuccessMessage;

/* =========================
   TABLE RENDER (SEARCH LOGIC)
========================= */

function renderTable() {
    const donors = getDonors();

    const blood = searchBloodGroup.value;
    const location = searchLocation.value.toLowerCase();
    const maxAge = searchAge.value;

    donorTableBody.innerHTML = "";

    const filteredDonors = donors.filter(d =>
        (!blood || d.bloodGroup === blood) &&
        (!location || d.city.includes(location) || d.state.includes(location)) &&
        (!maxAge || d.age <= Number(maxAge))
    );

    if (filteredDonors.length === 0) {
        donorTableBody.innerHTML = `
            <tr>
                <td colspan="6">No donors found</td>
            </tr>
        `;
        return;
    }

    filteredDonors.forEach(donor => {
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
}

/* =========================
   SEARCH & RESET BUTTONS
========================= */

searchBtn.addEventListener("click", () => {
    renderTable();
});

resetBtn.addEventListener("click", () => {
    searchBloodGroup.value = "";
    searchLocation.value = "";
    searchAge.value = "";

    renderTable(); // reload all donors
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
        document.querySelector(link.getAttribute("href"))
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
