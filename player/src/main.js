let canvas = document.getElementById("canvas");
let imgCanvas = document.getElementById("imgCanvas");
let animCanvas = document.getElementById("animCanvas");

let ctx = canvas.getContext("2d");
let imgCtx = imgCanvas.getContext("2d");
let animCtx = animCanvas.getContext("2d");

let pointer = document.getElementById("img");

var video = document.getElementById("video");

var hls = new Hls({
  debug: false,
});

let controls_ui = document.getElementById("controls");
let controls_index = 0;
const showControls = () => {
  controls_ui.classList.remove("hide");
  controls_index++;
  let temp = controls_index;
  setTimeout(() => {
    if (temp == controls_index && !video.paused) {
      controls_index = 0;
      controls_ui.classList.add("hide");
    }
  }, 5000);
};

// init/reset canvas after window resize (or Orientation change)
const initCanvas = () => {
  aspectratio = width / height;
  width = Scale * window.innerWidth;
  height = width / aspectratio;
  canvas.height = height * 2;
  canvas.width = width * 2;
  canvas.style.height = height + "px";
  canvas.style.width = width + "px";
  const dpi = window.devicePixelRatio;
  ctx.scale(dpi, dpi);

  document.getElementById("controls").style = "width:" + width + "px";
  imgCanvas.height = height;
  imgCanvas.width = width;
  animCanvas.height = height * 2;
  animCanvas.width = width * 2;
  animCanvas.style.height = height + "px";
  animCanvas.style.width = width + "px";
  animCtx.scale(dpi, dpi);

  // 360 is the constant value __cademy used
  strokeMultiplier = width / 360;

  // Landscape or Portrait?
  video.height = height > width ? width * 0.3 : height * 0.3;
  loadBg(lastBg, true);
};
window.onkeydown = vidCtrl;
let idd;
function init(data, video_url, uid) {
  idd = uid;
  if (video_url.includes(".mp4")) {
    video.src = video_url;
  } else if (video_url.includes(".webm")) video.src = video_url;
  else if (Hls.isSupported()) {
    hls.loadSource(video_url);
    hls.attachMedia(video);
  }
  hls.on(Hls.Events.MEDIA_ATTACHED, function () {
    video.muted = false;
  });
  // Convert data.json into a single array
  for (x in data) {
    for (y in data[x]) {
      parsed_data.push(data[x][y]);
    }
  }

  initCanvas();

  loadBg(0);
  setTimeout(() => {
    document.getElementById("duration").innerHTML = secondsToHms(
      video.duration
    );
  }, 2000);
  dragElement(video);
  console.log(video_url, video);
  // Hls is implemented natively in some devices i.e Apple's

  // Update Video controls

  // Make video Draggable

  // usual shit
  window.addEventListener("resize", () => {
    initCanvas();
    video.currentTime = video.currentTime;
  });

  // Start handling seeking, renders every 50ms.
  video.onseeking = function () {
    seekC++;
    let temp = seekC;
    document.getElementById("progressBar").value =
      (video.currentTime / video.duration) * 100;
    document.getElementById("currentTime").innerHTML = secondsToHms(
      video.currentTime
    );
    setTimeout(() => {
      if (seekC == temp) {
        onSeek(true);

        /*setTimeout(() => {
          onSeek();
        }, 1000); // Temp fix for inaccurate seeking, less performant*/
        seekC = 0;
      }
    }, 50);
  };

  // Re-render every 3 seconds (Debugging, can be used in production after saving shapes)
  setInterval(() => {
    if (video.paused) return;
    onSeek();
  }, 3000);

  //update video progress
  setInterval(() => {
    if (video.paused) return;
    document.getElementById("progressBar").value =
      (video.currentTime / video.duration) * 100;
    document.getElementById("currentTime").innerHTML = secondsToHms(
      video.currentTime
    );
  }, 1000);

  // Check for strokes
  setInterval(() => {
    if (video.paused) return;
    drawLoop();
  }, 10);
}
