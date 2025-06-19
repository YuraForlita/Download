const fetchBtn = document.getElementById("fetchBtn");
const urlInput = document.getElementById("urlInput");
const gallery = document.getElementById("gallery");

// Поки фейкові фото — замість справжнього бекенду
const mockImages = [
  "https://via.placeholder.com/500x500.png?text=Фото+1",
  "https://via.placeholder.com/400x300.png?text=Фото+2",
  "https://via.placeholder.com/350x350.png?text=Фото+3",
  "https://via.placeholder.com/600x400.png?text=Фото+4"
];

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
      const a = document.createElement("a");
      a.href = imgUrl;
      a.download = "";
      a.click();
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