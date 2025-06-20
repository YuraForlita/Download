const fetchBtn = document.getElementById("fetchBtn");
const urlInput = document.getElementById("urlInput");
const gallery = document.getElementById("gallery");

fetchBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  if (!url) return alert("Введіть посилання!");

  gallery.innerHTML = "Завантаження...";

  try {
    const response = await fetch("https://download-ze8s.onrender.com/api/fetch-images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const images = await response.json();
    if (response.ok) {
      renderImages(images);
    } else {
      gallery.innerHTML = `<p>Помилка: ${images.error}</p>`;
    }
  } catch (err) {
    gallery.innerHTML = `<p>Помилка з'єднання</p>`;
  }
});

function renderImages(images) {
  gallery.innerHTML = "";

  if (images.length === 0) {
    gallery.innerHTML = "<p>Фото не знайдено 😢</p>";
    return;
  }

  images.forEach(imgUrl => {
    const card = document.createElement("div");
    card.className = "image-card";

    const img = document.createElement("img");
    img.src = imgUrl;
    img.alt = "Фото";
    img.addEventListener("click", () => openPreview(imgUrl));

    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "Скачати";
    downloadBtn.onclick = () => {
      const downloadScript = `
        <html>
        <body>
          <a id="a" href="${imgUrl}" download></a>
          <script>
            document.getElementById('a').click();
            setTimeout(() => window.close(), 3000);
          <\/script>
        </body>
        </html>
      `;
      const blob = new Blob([downloadScript], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    };

    card.appendChild(img);
    card.appendChild(downloadBtn);
    gallery.appendChild(card);
  });
}

// === Modal Preview ===
const modal = document.getElementById("previewModal");
const modalImg = document.getElementById("previewImage");
const closeBtn = document.querySelector(".close");

function openPreview(src) {
  modal.style.display = "block";
  modalImg.src = src;
}

closeBtn.onclick = () => {
  modal.style.display = "none";
};

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};