// Format Rupiah
function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}

// Modal
function showModal(title, message) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalMessage").textContent = message;
  document.getElementById("customModal").classList.remove("hidden");
  document.getElementById("customModal").classList.add("flex");
}

function closeModal() {
  document.getElementById("customModal").classList.remove("flex");
  document.getElementById("customModal").classList.add("hidden");
}

document.getElementById("closeModalBtn").addEventListener("click", closeModal);

// Cetak
function printReport() {
  const today = new Date();
  const dateString = today.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  document.getElementById("printDate").textContent = `Dicetak pada: ${dateString}`;
  window.print();
  setTimeout(() => {
    document.getElementById("printDate").textContent = "";
  }, 100);
}

// Hitung Angsuran
document.getElementById("loanForm").addEventListener("submit", function (e) {
  e.preventDefault();
  document.getElementById("loading").classList.remove("hidden");
  document.getElementById("resultSummary").innerHTML = "";
  document.getElementById("scheduleContainer").classList.add("hidden");

  const OTR = parseFloat(document.getElementById("otrPrice").value);
  const dpPercent = parseFloat(document.getElementById("dpPercent").value);
  const tenureMonths = parseInt(document.getElementById("tenureMonths").value);

  if (isNaN(OTR) || OTR <= 0 || isNaN(dpPercent) || dpPercent < 0 || dpPercent > 100 || isNaN(tenureMonths) || tenureMonths <= 0) {
    document.getElementById("loading").classList.add("hidden");
    showModal("Input Tidak Valid", "Pastikan semua input diisi dengan benar.");
    return;
  }

  const dpAmount = OTR * (dpPercent / 100);
  const pokokUtang = OTR - dpAmount;
  let bungaTahunan = tenureMonths <= 12 ? 0.12 : tenureMonths <= 24 ? 0.14 : 0.165;
  const totalBunga = pokokUtang * bungaTahunan;
  const totalPembayaran = pokokUtang + totalBunga;
  const angsuranPerBulan = totalPembayaran / tenureMonths;

  setTimeout(() => {
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("resultSummary").innerHTML = `
      <div class="bg-red-50 p-4 rounded-lg border border-red-200">
        <p class="text-lg font-bold text-red-800">Angsuran Bulanan:</p>
        <p class="text-3xl font-extrabold text-red-700 mt-1">${formatRupiah(Math.round(angsuranPerBulan))}</p>
      </div>
      <div class="mt-4 space-y-2 text-sm">
        <div class="flex justify-between border-b pb-1"><span>Harga OTR:</span><span class="font-semibold">${formatRupiah(OTR)}</span></div>
        <div class="flex justify-between border-b pb-1"><span>Nilai DP (${dpPercent}%):</span><span class="font-semibold text-green-600">${formatRupiah(dpAmount)}</span></div>
        <div class="flex justify-between border-b pb-1"><span>Pokok Utang:</span><span class="font-bold">${formatRupiah(pokokUtang)}</span></div>
        <div class="flex justify-between border-b pb-1"><span>Jangka Waktu:</span><span class="font-bold">${tenureMonths} Bulan</span></div>
        <div class="flex justify-between"><span>Suku Bunga Tahunan:</span><span class="font-bold text-red-600">${(bungaTahunan * 100).toFixed(1)}%</span></div>
      </div>`;
    generateSchedule(Math.round(angsuranPerBulan), tenureMonths);
  }, 500);
});

// Generate Jadwal
function generateSchedule(angsuranBulanan, tenureMonths) {
  const scheduleBody = document.getElementById("scheduleBody");
  scheduleBody.innerHTML = "";
  const today = new Date();
  let initialDueDate = new Date(today.getFullYear(), today.getMonth() + 1, 25);
  if (today.getDate() > 25)
    initialDueDate = new Date(today.getFullYear(), today.getMonth() + 2, 25);

  for (let i = 1; i <= tenureMonths; i++) {
    const dueDate = new Date(initialDueDate.getFullYear(), initialDueDate.getMonth() + i - 1, initialDueDate.getDate());
    const dueDateString = dueDate.toISOString().slice(0, 10);
    scheduleBody.innerHTML += `
      <tr class="hover:bg-gray-100 transition">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${i}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-red-700">${formatRupiah(angsuranBulanan)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${dueDateString}</td>
      </tr>`;
  }
  document.getElementById("scheduleContainer").classList.remove("hidden");
}

// Auto-run default
window.onload = () =>
  document.getElementById("loanForm").dispatchEvent(new Event("submit"));
