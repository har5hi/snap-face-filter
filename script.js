let currentFilter = "none";
function setFilter(filter) {
  currentFilter = filter;
}

document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const galleryGrid = document.getElementById("galleryGrid");
  const capturedImage = document.getElementById("capturedImage");

  let cameraStarted = false;
  let images = [];
  let currentFacingMode = "user";
  let lastCapturedTemp = null; // Stores image temporarily before saving

  // Preload Images
  const imgs = {
    glasses: new Image(), crown: new Image(), dog: new Image(),
    hearts: new Image(), flower: new Image(), mask: new Image(),
    cap: new Image(), clown: new Image(), eyes: new Image()
  };
  imgs.glasses.src = "glasses.png"; imgs.crown.src = "crown.png"; imgs.dog.src = "dog.png";
  imgs.hearts.src = "hearts.png"; imgs.flower.src = "flower.png"; imgs.mask.src = "mask.png";
  imgs.cap.src = "cap.png"; imgs.clown.src = "clown.png"; imgs.eyes.src = "eyes.png";

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(screen => {
      screen.classList.remove("active");
    });
    document.getElementById(id).classList.add("active");
  }

  /* --- FACEMESH INIT --- */
  const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  });
  faceMesh.setOptions({
    maxNumFaces: 1, refineLandmarks: true,
    minDetectionConfidence: 0.5, minTrackingConfidence: 0.5
  });

  // Filter Drawings (same exact math)
  function drawGlasses(landmarks) {
    const left = landmarks[33]; const right = landmarks[263];
    const x = left.x * canvas.width; const y = left.y * canvas.height;
    const width = (right.x - left.x) * canvas.width * 1.6;
    ctx.drawImage(imgs.glasses, x - width / 4, y - width / 4, width, width / 2);
  }
  function drawDogEars(landmarks) {
    const left = landmarks[33]; const right = landmarks[263];
    const centerX = (left.x + right.x) / 2 * canvas.width;
    const centerY = (left.y + right.y) / 2 * canvas.height;
    const width = (right.x - left.x) * canvas.width * 2.2;
    const x = centerX; const y = centerY - 70;
    ctx.drawImage(imgs.dog, x - width / 2, y - width / 2, width, width);
  }
  function drawCrown(landmarks) {
    const left = landmarks[33]; const right = landmarks[263];
    const centerX = (left.x + right.x) / 2 * canvas.width;
    const centerY = (left.y + right.y) / 2 * canvas.height;
    const width = (right.x - left.x) * canvas.width * 2.2;
    const x = centerX; const y = centerY - 70;
    ctx.drawImage(imgs.crown, x - width / 2, y - width / 2, width, width);
  }
  function drawHearts(landmarks) {
    const left = landmarks[33]; const right = landmarks[263];
    const centerX = (left.x + right.x) / 2 * canvas.width;
    const centerY = (left.y + right.y) / 2 * canvas.height;
    const width = (right.x - left.x) * canvas.width * 2.2;
    const x = centerX; const y = centerY - 70;
    ctx.drawImage(imgs.hearts, x - width / 2, y - width / 2, width, width);
  }
  function drawFlower(landmarks) {
    const left = landmarks[33]; const right = landmarks[263];
    const centerX = (left.x + right.x) / 2 * canvas.width;
    const centerY = (left.y + right.y) / 2 * canvas.height;
    const width = (right.x - left.x) * canvas.width * 2.2;
    const x = centerX; const y = centerY - 70;
    ctx.drawImage(imgs.flower, x - width / 2, y - width / 2, width, width);
  }
  function drawMask(landmarks) {
    const nose = landmarks[1]; const left = landmarks[33]; const right = landmarks[263];
    const x = nose.x * canvas.width; const y = nose.y * canvas.height;
    const width = Math.abs(right.x - left.x) * canvas.width * 2.2;
    ctx.drawImage(imgs.mask, x - width / 2, y - width / 2.5, width, width * 0.8);
  }
  function drawCap(landmarks) {
    const top = landmarks[10]; const left = landmarks[33]; const right = landmarks[263];
    const x = top.x * canvas.width; const y = top.y * canvas.height;
    const width = Math.abs(right.x - left.x) * canvas.width * 2.5;
    ctx.drawImage(imgs.cap, x - width / 2, y - width * 0.8, width, width * 0.9);
  }
  function drawClown(landmarks) {
    const nose = landmarks[1]; const left = landmarks[33]; const right = landmarks[263];
    const x = nose.x * canvas.width; const y = nose.y * canvas.height;
    const width = Math.abs(right.x - left.x) * canvas.width * 2;
    ctx.drawImage(imgs.clown, x - width / 2, y - width / 1.2, width, width * 1.5);
  }
  function drawGooglyEyes(landmarks) {
    const left = landmarks[33]; const right = landmarks[263];
    const x = left.x * canvas.width; const y = left.y * canvas.height;
    const width = Math.abs(right.x - left.x) * canvas.width * 1.5;
    ctx.drawImage(imgs.eyes, x - width / 4, y - width / 4, width, width / 2);
  }

  faceMesh.onResults((results) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    if (currentFacingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.filter = "brightness(1.2) contrast(1.1)";
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];

      if (currentFilter === "glasses" && imgs.glasses.complete) drawGlasses(landmarks);
      if (currentFilter === "crown" && imgs.crown.complete) drawCrown(landmarks);
      if (currentFilter === "dog" && imgs.dog.complete) drawDogEars(landmarks);
      if (currentFilter === "hearts" && imgs.hearts.complete) drawHearts(landmarks);
      if (currentFilter === "flower" && imgs.flower.complete) drawFlower(landmarks);
      if (currentFilter === "mask" && imgs.mask.complete) drawMask(landmarks);
      if (currentFilter === "cap" && imgs.cap.complete) drawCap(landmarks);
      if (currentFilter === "clown" && imgs.clown.complete) drawClown(landmarks);
      if (currentFilter === "eyes" && imgs.eyes.complete) drawGooglyEyes(landmarks);
    }
    ctx.restore();
  });

  async function detectFace() {
    if (!video.paused && !video.ended && video.readyState >= 2) {
      try { await faceMesh.send({ image: video }); } catch (err) { }
    }
    requestAnimationFrame(detectFace);
  }

  /* --- CAMERA INIT --- */
  async function startCamera() {
    if (cameraStarted) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacingMode }
      });
      video.srcObject = stream;
      cameraStarted = true;
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        detectFace();
      };
    } catch (err) { cameraStarted = false; }
  }

  /* --- MICRO-INTERACTIONS --- */
  function flashEffect() {
    const flash = document.createElement("div");
    flash.style.position = "fixed";
    flash.style.top = "0";
    flash.style.left = "0";
    flash.style.width = "100%";
    flash.style.height = "100%";
    flash.style.background = "white";
    flash.style.opacity = "0.8";
    flash.style.zIndex = "999";
    flash.style.transition = "opacity 0.1s";

    document.body.appendChild(flash);

    // Slight screen scale micro-interaction
    const app = document.querySelector(".app");
    app.style.transform = "scale(0.98)";
    app.style.transition = "transform 0.1s";

    setTimeout(() => {
      flash.style.opacity = "0";
      app.style.transform = "scale(1)";
      setTimeout(() => flash.remove(), 100);
    }, 50);
  }

  function renderGallery() {
    galleryGrid.innerHTML = "";
    images.forEach(imgSrc => {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.className = "gallery-img";
      galleryGrid.appendChild(img);
    });
  }

  /* --- EVENT LISTENERS --- */
  document.getElementById("startBtn").addEventListener("click", () => {
    showScreen("cameraScreen");
    startCamera();
  });

  document.getElementById("captureBtn").addEventListener("click", () => {
    flashEffect();
    // Cache the image physically into temp instead of active gallery stream yet
    lastCapturedTemp = canvas.toDataURL("image/png");
    capturedImage.src = lastCapturedTemp;

    // Automatically transition to new Snapchat preview view
    setTimeout(() => showScreen("previewScreen"), 150);
  });

  document.getElementById("saveBtn").addEventListener("click", () => {
    if (lastCapturedTemp) {
      images.push(lastCapturedTemp);
      lastCapturedTemp = null;
    }
    showScreen("galleryScreen");
    renderGallery();
  });

  document.getElementById("retakeBtn").addEventListener("click", () => {
    lastCapturedTemp = null;
    showScreen("cameraScreen");
  });

  document.getElementById("backToCameraBtn").addEventListener("click", () => {
    showScreen("cameraScreen");
  });

  document.getElementById("galleryBtn").addEventListener("click", () => {
    showScreen("galleryScreen");
    renderGallery();
  });

  document.getElementById("switchBtn").addEventListener("click", async () => {
    currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
    const currentStream = video.srcObject;
    if (currentStream) currentStream.getTracks().forEach(track => track.stop());
    cameraStarted = false;
    await startCamera();
  });

});