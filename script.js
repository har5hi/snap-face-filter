const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 640;
canvas.height = 480;

// Webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  });

  video.addEventListener("loadedmetadata", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
});

// Load images
function loadImg(src) {
  const img = new Image();
  img.src = src;
  return img;
}

const filters = {
  glasses: loadImg("glasses.png"),
  crown: loadImg("crown.png"),
  dog: loadImg("dog.png"),
  hearts: loadImg("hearts.png"),
  flower: loadImg("flower.png"),
  mask: loadImg("mask.png"),
  nose: loadImg("nose.png"),
  cap: loadImg("cap.png"),
  ghost: loadImg("ghost.png"),
  none: null
};

let currentFilter = "glasses";
function changeFilter(name) {
  currentFilter = name;
}

// FaceMesh
const faceMesh = new FaceMesh({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

faceMesh.onResults((results) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
  ctx.restore();

  if (!results.multiFaceLandmarks || currentFilter === "none") return;

  const landmarks = results.multiFaceLandmarks[0];

  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const nose = landmarks[1];
  const forehead = landmarks[10];

  const x1 = leftEye.x * canvas.width;
  const y1 = leftEye.y * canvas.height;
  const x2 = rightEye.x * canvas.width;

  const width = Math.abs(x2 - x1) * 1.6;
  const centerX = (x1 + x2) / 2;
  const centerY = y1;

  const img = filters[currentFilter];
  if (!img) return;

  switch (currentFilter) {

  // 😎 GLASSES (bigger)
  case "glasses":
    ctx.drawImage(img,
      centerX - width * 0.5,
      centerY - width * 0.25,
      width,
      width * 0.5
    );
    break;

  // 👑 CROWN
  case "crown":
    ctx.drawImage(img,
      centerX - width * 0.5,
      (forehead.y * canvas.height) - width * 0.8,
      width,
      width * 0.6
    );
    break;

  // 🐶 DOG 
  case "dog":
    ctx.drawImage(img,
      centerX - width * 0.8,
      (forehead.y * canvas.height) - width * 0.7,
      width * 1.9,
      width * 1.1
    );
    break;

  // ❤️ HEARTS 
  case "hearts":
    ctx.drawImage(img,
      centerX - width * 0.8,
      (forehead.y * canvas.height) - width * 0.85,
      width * 1.6,
      width
    );
    break;

  // 🌸 FLOWER 
  case "flower":
    const leftEar = landmarks[234];
    ctx.drawImage(img,
      (leftEar.x * canvas.width) - 35,
      (leftEar.y * canvas.height) - 35,
      70,
      70
    );
    break;

  // 😷 MASK 
  case "mask":
    ctx.drawImage(img,
      centerX - width * 0.7,
      (nose.y * canvas.height) - width * 0.8,
      width * 1.4,
      width * 1.4
    );
    break;

  // 🤡 NOSE
  case "nose":
    ctx.drawImage(img,
      (nose.x * canvas.width) - 40,
      (nose.y * canvas.height) - 40,
      60,
      60
    );
    break;

  // 🧢 CAP 
  case "cap":
    ctx.drawImage(img,
      centerX - width * 0.6,
      (forehead.y * canvas.height) - width * 0.7,
      width * 1.2,
      width * 0.7
    );
    break;

  // 👀 GHOST 
  case "ghost":
    ctx.drawImage(img,
      centerX - width * 0.5,
      centerY - width * 0.25,
      width,
      width * 0.5
    );
    break;
}
});

// Camera
const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 640,
  height: 480
});

camera.start();

// 📸 FIXED CAPTURE
const captureBtn = document.getElementById("captureBtn");
const preview = document.getElementById("preview");

captureBtn.addEventListener("click", () => {
  const image = canvas.toDataURL("image/png");

  preview.src = image;
  preview.style.display = "block";

  const link = document.createElement("a");
  link.href = image;
  link.download = "snapaura.png";
  link.click();
});