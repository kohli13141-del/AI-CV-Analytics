// ==========================================
// 1. GLOBAL CONFIGURATION & GSAP SETUP
// ==========================================


const RENDER_BACKEND_URL = "https://ai-cv-analytics.onrender.com";

const API_BASE = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" 
    ? "http://127.0.0.1:5000" 
    : RENDER_BACKEND_URL;

if (typeof gsap !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Navbar Animation
  gsap.from("nav", { y: -100, opacity: 0, duration: 1 });

  // Hero Animations
  gsap.from(".title", { opacity: 0, y: 100, duration: 1.2, delay: 0.5 });
  gsap.from(".hero p", { opacity: 0, y: 50, duration: 1, delay: 1 });
  gsap.from(".hero-btn", { opacity: 0, scale: 0, duration: 1, delay: 1.5 });

  // Cards Scroll Animation
  gsap.from(".card", {
    opacity: 0,
    y: 80,
    duration: 1,
    stagger: 0.2,
    scrollTrigger: {
      trigger: ".cards",
      start: "top 80%"
    }
  });
}

// ==========================================
// 2. PARTICLES & VISUAL EFFECTS
// ==========================================

window.onload = function () {
  if (typeof particlesJS !== "undefined") {
    particlesJS("particles-js", {
      particles: {
        number: { value: 60 },
        color: { value: "#a855f7" },
        shape: { type: "circle" },
        opacity: { value: 0.3 },
        size: { value: 3 },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#7c3aed",
          opacity: 0.2,
          width: 1
        },
        move: { enable: true, speed: 2 }
      }
    });
  }
};

// 3D Card Hover Effect
if (window.innerWidth > 768) {
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = (-1 / 5 * x + 20);
      const rotateX = (1 / 5 * y - 20);
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(700px) rotateX(0) rotateY(0) scale(1)";
    });
  });
}

// Cursor Glow
document.addEventListener("mousemove", (e) => {
  const glow = document.querySelector(".bg-glow");
  if (glow) {
    glow.style.left = e.clientX - 350 + "px";
    glow.style.top = e.clientY - 350 + "px";
  }
});

// ==========================================
// 3. ANALYTICS CHARTS
// ==========================================

const chartCanvas = document.getElementById("chart");
if (chartCanvas) {
  new Chart(chartCanvas, {
    type: "line",
    data: {
      labels: ["Python", "SQL", "Power BI", "Machine Learning", "AI"],
      datasets: [{
        label: "Skill Demand %",
        data: [95, 88, 80, 75, 99],
        borderColor: "#a855f7",
        borderWidth: 3,
        tension: 0.4,
        fill: false
      }]
    },
    options: { responsive: true }
  });
}

const salaryCanvas = document.getElementById("salaryChart");
if (salaryCanvas) {
  new Chart(salaryCanvas, {
    type: "bar",
    data: {
      labels: ["India", "USA", "UK", "Germany"],
      datasets: [{
        label: "Average Salary (LPA)",
        data: [18, 145, 110, 98],
        backgroundColor: ["#7c3aed", "#9333ea", "#a855f7", "#c084fc"]
      }]
    },
    options: { responsive: true }
  });
}

// ==========================================
// 4. RESUME UPLOAD & ANALYSIS
// ==========================================

async function uploadResume() {
  const fileInput = document.getElementById("resumeFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please upload a resume.");
    return;
  }

  const formData = new FormData();
  formData.append("resume", file);

  const uploadBtn = document.getElementById("uploadBtn");
  const resultDiv = document.getElementById("result");
  const scannerDiv = document.getElementById("scanner-container");
  const scanText = document.getElementById("scan-text");

  // UI State Reset
  uploadBtn.style.display = "none";
  resultDiv.innerHTML = "";
  scannerDiv.style.display = "block";

  const scanMessages = ["Extracting text...", "Matching keywords...", "Generating AI insights..."];
  let msgIndex = 0;
  const msgInterval = setInterval(() => {
    msgIndex++;
    if (msgIndex < scanMessages.length) scanText.innerText = scanMessages[msgIndex];
  }, 1000);

  try {
    // API Call to dynamic URL
    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData
    });
    
    const data = await response.json();

    if (data.error) throw new Error(data.error);

    // Simulated scanning delay for UX
    setTimeout(() => {
      clearInterval(msgInterval);
      scannerDiv.style.display = "none";
      uploadBtn.style.display = "inline-block";
      scanText.innerText = "Extracting text...";

      resultDiv.innerHTML = `
        <div id="report-content" style="padding: 30px; background: #12040f; border: 1px solid #a855f7; border-radius: 15px; text-align: left; margin-bottom: 20px;">
          <h2 style="color: #c084fc; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 15px;">
            AI CV Analytics Report
          </h2>
          <h3 style="color: #ffffff; margin-bottom: 5px;">Detected Skills:</h3>
          <p style="color: #a855f7; font-weight: 600; font-size: 16px;">${data.skills.join(", ") || "No relevant skills found."}</p>
          <br>
          <h3 style="color: #ffffff; margin-bottom: 5px;">Recommended Role:</h3>
          <p style="color: #ff4d4d; font-weight: 600; font-size: 20px;">${data.recommended_role}</p>
        </div>
        <button onclick="downloadReport()" style="padding: 12px 25px; border-radius: 10px; border: none; background: linear-gradient(90deg, #9333ea, #4f46e5); color: white; cursor: pointer; font-weight: 600;">
          📥 Download PDF Report
        </button>
      `;
    }, 2500);

  } catch (error) {
    console.error(error);
    clearInterval(msgInterval);
    scannerDiv.style.display = "none";
    uploadBtn.style.display = "inline-block";
    alert("Backend error! Ensure Flask is running or Render is awake.");
  }
}

// Fixed PDF Export Function
function downloadReport() {
  const element = document.getElementById('report-content');
  const opt = {
    margin: 0.5,
    filename: 'AI_CV_Analytics_Report.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, backgroundColor: "#12040f", useCORS: true, scrollY: 0, scrollX: 0 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

// ==========================================
// 5. NAVBAR & CHATBOT LOGIC
// ==========================================

window.addEventListener("scroll", () => {
  const nav = document.getElementById("navbar");
  if (window.scrollY > 50) nav.classList.add("scrolled");
  else nav.classList.remove("scrolled");
});

// Chatbot Knowledge Base
const responses = {
    "hello": "Namaste! Main badhiya hoon, aap kaise hain?",
    "kaise ho": "Main ek dum fit aur fine hoon! Aap bataiye?",
    "naam kya hai": "Mera naam AI Career Assistant hai.",
    "help": "Zaroor! Main aapka resume analyze kar sakta hoon aur career tips de sakta hoon.",
    "kisne banaya": "Mujhe Mukul ne apne AI CV Analytics project ke liye banaya hai.",
    "ats": "ATS ek software hai jo resumes ko filter karta hai. Isliye hamesha keywords use karein.",
    "pdf": "Hamesha PDF format use karein taaki resume ki design na bigde.",
    "bye": "Alvida! Apna khayal rakhein aur career par focus karein."
};

let chatHistory = [];

function toggleChat() {
  const chatWindow = document.getElementById("chatWindow");
  const chatBody = document.getElementById("chatBody");

  if (chatWindow.style.display === "none") {
    chatBody.innerHTML = ""; 
    chatHistory = [];
    chatWindow.style.display = "block";
    
    const currentHour = new Date().getHours();
    let greeting = currentHour < 12 ? "Good morning" : (currentHour < 18 ? "Good afternoon" : "Good evening");
    const savedName = localStorage.getItem("userName");
    const welcomeMsg = savedName 
      ? `${greeting}, ${savedName}! How can I help you today?` 
      : `${greeting}! I am your AI Assistant. How can I help you?`;
    
    chatBody.innerHTML = `<div class="bot-msg">${welcomeMsg}</div>`;
    saveToMemory("bot", welcomeMsg);
  } else {
    chatWindow.style.display = "none";
  }
}

function handleEnter(event) { if (event.key === "Enter") sendMessage(); }

function sendMessage() {
  const inputField = document.getElementById("chatInput");
  const message = inputField.value.trim();
  if (message === "") return;

  const chatBody = document.getElementById("chatBody");
  chatBody.innerHTML += `<div class="user-msg">${message}</div>`;
  saveToMemory("user", message);
  inputField.value = ""; 
  chatBody.scrollTop = chatBody.scrollHeight;

  setTimeout(() => {
    let botReply = "I'm still learning! Ask me about ATS or resume tips.";
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes("my name is") || lowerMsg.includes("mera naam")) {
      const words = message.split(" ");
      const name = words[words.length - 1].replace(/[?!.]/g, "");
      localStorage.setItem("userName", name);
      botReply = `Nice to meet you, ${name}! How can I assist you?`;
    } else {
      for (let key in responses) {
        if (lowerMsg.includes(key)) { botReply = responses[key]; break; }
      }
    }

    chatBody.innerHTML += `<div class="bot-msg">${botReply}</div>`;
    saveToMemory("bot", botReply);
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 1000);
}

function saveToMemory(role, text) {
  chatHistory.push({ role: role, content: text });
  if (chatHistory.length > 10) chatHistory.shift(); 
}

// Contact Page Logic
if (document.getElementById("contactForm")) {
    gsap.from("#infoPanel", { opacity: 0, x: -50, duration: 1, ease: "power3.out" });
    gsap.from("#formPanel", { opacity: 0, x: 50, duration: 1, ease: "power3.out" });

    document.getElementById("contactForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const name = document.getElementById("userName").value;
        alert(`Thanks ${name}! Your message has been sent.`);
        this.reset();
    });
}
