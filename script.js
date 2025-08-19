// DOM helpers
const $ = (id) => document.getElementById(id);

// Live binding from inputs to preview
const bind = () => {
  $("pname").textContent = $("name").value;
  $("pcategory").textContent = $("category").value;
  $("pcategory2").textContent = $("category").value || "Caretaker";

  $("pfname").textContent  = $("fname").value;
  $("pdob").textContent    = $("dob").value;
  $("pms").textContent     = $("ms").value;
  $("pheight").textContent = $("height").value;
  $("pweight").textContent = $("weight").value;
  $("plocation").textContent = $("location").value;

  $("pabout").textContent = $("about").value;

  const exp = parseFloat($("experience").value || "0");
  $("pexpYearsBig").textContent = isFinite(exp) ? exp : 0;
  // Patients
  const b = parseInt($("basic").value || "0", 10);
  const a = parseInt($("advance").value || "0", 10);
  const c = parseInt($("critical").value || "0", 10);
  const total = b + a + c;

  $("pbasic").textContent   = b;
  $("padvance").textContent = a;
  $("pcritical").textContent= c;
  $("ptotal").textContent   = total;

  // Update chart
  patientsChart.data.datasets[0].data = [b, a, c];
  patientsChart.update();
};

// Photo preview
$("photo").addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = (ev) => { $("pphoto").src = ev.target.result; };
  reader.readAsDataURL(f);
});

// Bind all inputs
document.querySelectorAll("input, textarea").forEach(el => {
  el.addEventListener("input", bind);
});

// Chart.js pie
const chartCtx = $("patientsChart").getContext("2d");
const patientsChart = new Chart(chartCtx, {
  type: "pie",
  data: {
    labels: ["Basic", "Advance", "Critical"],
    datasets: [{
      data: [8, 2, 2],
      backgroundColor: ["#66bb6a", "#42a5f5", "#ef5350"],
      borderColor: "#ffffff",
      borderWidth: 2
    }]
  },
  options: {
    responsive: false,
    plugins: { legend: { display: false } }
  }
});

// First paint
bind();

$("btn-download").addEventListener("click", async () => {
  const sheet = $("sheet");

  // Force A4 size
  sheet.style.width = "794px";
  sheet.style.minHeight = "1123px";

  // Ensure chart is updated
  patientsChart.update();

  // Capture sheet at slightly lower scale for compression
  const canvas = await html2canvas(sheet, {
    useCORS: true,
    backgroundColor: "#ffffff",
    scale: 1.5   // was 2 → reduce file size while keeping good quality
  });

  // Convert to JPEG (smaller than PNG)
  const imgData = canvas.toDataURL("image/jpeg", 0.85); 
  // 0.85 = 85% quality (balance between clarity + compression)

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "pt", "a4");

  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pageHeight);

  pdf.save(`${$("name").value || "StaffProfile"}.pdf`);
});





