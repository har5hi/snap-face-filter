// Global Variables for Screen Logic
let currentFilter = "none";
let cameraStarted = false;
let images = [];
let faceMesh;

// Global Switch Functions handling HTML 'onclick' directly
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

function openCamera() {
  showScreen("camera");
  if (window.startCameraRef) {
    window.startCameraRef();
  }
}

function openGallery() {
  showScreen("gallery");
  if (window.renderGalleryRef) {
    window.renderGalleryRef();
  }
}

function goHome() {
  showScreen("home");
}

function setFilter(filter) {
  currentFilter = filter;
}

function capturePhoto() {
  if (window.capturePhotoRef) {
    window.capturePhotoRef();
  }
}


// Engine Init after DOM Loads
document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const galleryGrid = document.getElementById("galleryGrid");

  const imgs = {
    glasses: new Image(), crown: new Image(), dog: new Image(),
    hearts: new Image(), flower: new Image(), mask: new Image(),
    cap: new Image(), nose: new Image(), ghost: new Image()
  };
  imgs.glasses.src = "glasses.png"; imgs.crown.src = "crown.png"; imgs.dog.src = "dog.png";
  imgs.hearts.src = "hearts.png"; imgs.flower.src = "flower.png"; imgs.mask.src = "mask.png";
  imgs.cap.src = "cap.png"; imgs.nose.src = "nose.png"; imgs.ghost.src = "ghost.png";

  faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  });

  faceMesh.setOptions({
    maxNumFaces: 1, 
    refineLandmarks: true,
    minDetectionConfidence: 0.5, 
    minTrackingConfidence: 0.5
  });

  function drawFilter(img, x, y, width, height) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    ctx.drawImage(img, x, y, width, height);
  }

  // Draw loop logic executing correctly every frame
  function renderFilters(landmarks) {
    const leftEye = landmarks[33]; 
    const rightEye = landmarks[263];
    const nose = landmarks[1];
    const top = landmarks[10];
    const leftEar = landmarks[234] || landmarks[33]; 

    const cx = (leftEye.x + rightEye.x) / 2 * canvas.width;
    const cy = (leftEye.y + rightEye.y) / 2 * canvas.height;
    const width = Math.abs(rightEye.x - leftEye.x) * canvas.width;
    
    // Executes correctly based on `currentFilter` variable updated by `setFilter()`
    switch (currentFilter) {
      case "glasses":
        drawFilter(imgs.glasses, leftEye.x * canvas.width - (width*0.3), leftEye.y * canvas.height - (width*0.4), width * 1.6, width * 0.8);
        break;
      case "crown":
        drawFilter(imgs.crown, cx - (width*1.1), cy - (width*2.0), width * 2.2, width * 2.2);
        break;
      case "dog":
        const leftFace = landmarks[234];
        const rightFace = landmarks[454];
        const faceWidth = (rightFace.x - leftFace.x) * canvas.width;
        
        const earWidth = faceWidth * 2.2; // FORCE BIG
        const earHeight = earWidth * 0.9;
        
        const dogCenterX = (leftFace.x * canvas.width + rightFace.x * canvas.width) / 2;
        const topHead = top; 
        const dogTopY = topHead.y * canvas.height - 160; 
        
        drawFilter(imgs.dog, dogCenterX - (earWidth / 2), dogTopY, earWidth, earHeight);
        break;
      case "hearts":
        drawFilter(imgs.hearts, cx - (width*1.1), cy - (width*2.0), width * 2.2, width * 2.2);
        break;
      case "flower":
        const flowerSize = 60;
        const flowerX = leftEar.x * canvas.width - 30;
        const flowerY = leftEar.y * canvas.height - 20;
        drawFilter(imgs.flower, flowerX, flowerY, flowerSize, flowerSize);
        break;
      case "mask":
        drawFilter(imgs.mask, nose.x * canvas.width - (width*1.1), nose.y * canvas.height - (width*0.9), width * 2.2, width * 1.76);
        break;
      case "cap":
        drawFilter(imgs.cap, top.x * canvas.width - (width*1.25), top.y * canvas.height - (width*2.0), width * 2.5, width * 2.25);
        break;
      case "clown":
        const noseSize = 45;
        const noseX = nose.x * canvas.width - (noseSize / 2);
        const noseY = nose.y * canvas.height - (noseSize / 2) + 5;
        drawFilter(imgs.nose, noseX, noseY, noseSize, noseSize);
        break;
      case "eyes":
        const leftX = leftEye.x * canvas.width;
        const leftY = leftEye.y * canvas.height;
        const rightX = rightEye.x * canvas.width;
        const rightY = rightEye.y * canvas.height;

        const eyeDistance = Math.hypot(rightX - leftX, rightY - leftY);

        const ghostWidth = eyeDistance * 1.4;
        const ghostHeight = ghostWidth * 0.6;

        const centerX = (leftX + rightX) / 2;
        const centerY = (leftY + rightY) / 2;
        
        const yOffset = ghostHeight * 0.15;

        drawFilter(
          imgs.ghost,
          centerX - ghostWidth / 2,
          centerY - ghostHeight / 2 - yOffset,
          ghostWidth,
          ghostHeight
        );
        break;
    }
  }

  faceMesh.onResults((results) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    
    ctx.filter = "brightness(1.1)";
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      renderFilters(results.multiFaceLandmarks[0]);
    }
    ctx.restore();
  });

  async function detectFace() {
    if (!video.paused && !video.ended && video.readyState >= 2) {
      try { 
        await faceMesh.send({ image: video }); 
      } catch (err) { 
        console.error(err); 
      }
    }
    requestAnimationFrame(detectFace);
  }

  // Bind internal logic functions properly to the accessible references
  window.startCameraRef = async function () {
    if (cameraStarted) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.play();
      cameraStarted = true;
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        detectFace(); 
      };
    } catch (err) { 
      console.error("Camera access denied or failed:", err);
      alert("Could not access camera. Please allow permissions.");
      cameraStarted = false; 
    }
  };

  window.capturePhotoRef = function () {
    const flash = document.createElement("div");
    flash.style.position = "fixed"; flash.style.top = "0"; flash.style.left = "0";
    flash.style.width = "100%"; flash.style.height = "100%";
    flash.style.background = "white"; flash.style.opacity = "0.8"; flash.style.zIndex = "999";
    flash.style.transition = "opacity 0.15s ease-out";
    document.body.appendChild(flash);
    setTimeout(() => {
      flash.style.opacity = "0";
      setTimeout(() => flash.remove(), 150);
    }, 50);

    const dataUrl = canvas.toDataURL("image/png");
    images.push(dataUrl);

    openGallery();
  };

  window.renderGalleryRef = function () {
    galleryGrid.innerHTML = "";
    if (images.length === 0) {
      galleryGrid.innerHTML = "<p style='color: white; opacity: 0.7;'>No snaps yet!</p>";
      return;
    }
    images.forEach(imgSrc => {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.className = "gallery-img";
      galleryGrid.appendChild(img);
    });
  };
});