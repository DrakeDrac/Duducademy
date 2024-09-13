// Basic Utility functions
const secondsToHms = (d) => {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);

  var hDisplay = h > 0 ? h + ":" : "";
  var mDisplay = m > 0 ? (m < 10 ? "0" + m + ":" : m + ":") : "00";
  var sDisplay = s > 0 ? (s < 10 ? "0" + s : s) : "";

  return hDisplay + mDisplay + sDisplay;
};
// basically end-start
const getShiftedDeltasForRect = (x1, y1, x2, y2, isShifted) => {
  var dx = x2 - x1;
  var dy = y2 - y1;
  if (isShifted) {
    if (Math.abs(dx) > Math.abs(dy)) {
      dy = Math.abs(dx) * (dy > 0 ? 1 : -1);
    } else {
      dx = Math.abs(dy) * (dx > 0 ? 1 : -1);
    }
  }
  return {
    dx: dx,
    dy: dy,
  };
};

// as the name suggests
const dragElement = (elmnt) => {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  elmnt.onpointerdown = dragpointerDown;

  function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }
  function dragpointerDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the pointer cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onpointerup = closeDragElement;
    // call a function whenever the cursor moves
    document.onpointermove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top =
      clamp(elmnt.offsetTop - pos2, 0, window.innerHeight - elmnt.height) +
      "px";
    elmnt.style.left =
      clamp(
        elmnt.offsetLeft - pos1,
        0,
        window.innerWidth - elmnt.height * 1.7
      ) + "px";
    console.log(elmnt.offsetTop - pos2, elmnt.offsetLeft - pos1);
  }

  function closeDragElement() {
    // stop moving when pointer button is released
    document.onpointerup = null;
    document.onpointermove = null;
  }
};

// Video controls

const togglePause = (vid) => {
  if (vid.paused || vid.ended) {
    vid.play();
    document.getElementById("playButton").classList.add("vjs-playing");

    document.getElementById("playButton").classList.remove("vjs-paused");
  } else {
    document.getElementById("playButton").classList.remove("vjs-playing");

    document.getElementById("playButton").classList.add("vjs-paused");
    vid.pause();
  }
};

const seekForward = (vid) => {
  vid.currentTime += 10;
  if (vid.currentTime > vid.duration) {
    vid.pause();
    vid.currentTime = 0;
  }
};

const seekBackward = (vid) => {
  vid.currentTime -= 10;
  if (vid.currentTime < 0) {
    vid.pause();
    vid.currentTime = 0;
  }
};

// Keyboard events

const vidCtrl = (e) => {
  const vid = document.querySelector("video");
  const key = e.code;

  if (key === "ArrowLeft") {
    seekBackward(vid);
  } else if (key === "ArrowRight") {
    seekForward(vid);
  } else if (key === "Space") {
    togglePause(vid);
  }
  e.preventDefault();
};

// funcs triggered by buttonsa

const videoSlider = (e) => {
  video.currentTime = (video.duration * e) / 100;
};

// To be fixed in ios
const toggleFullScreen = () => {
  if (window.innerHeight != screen.height) {
    if (document.body.requestFullscreen) {
      document.body.requestFullscreen();
    } else if (document.body.webkitRequestFullscreen) {
      /* Safari */
      document.body.webkitRequestFullscreen();
    } else if (document.body.msRequestFullscreen) {
      /* IE11 */
      document.body.msRequestFullscreen();
    }
  } else document.exitFullscreen();
};

// Load Background Image tp Canvas
const loadBg = (index, forced) => {
  if ((index == lastBg && !forced) || !slideList[index + 1]) return;
  index = index || 0;
  //ctx.clearRect(0, 0, width, height);
  var img = new Image();
  //background.src = "./data/slides/" + index + ".jpg";
  let bgImg;
  if (slideList[index + 1].u) img.src = slideList[index + 1].u.substring(1);
  else if (slideList[index + 1].bg) {
    bgImg = slideList[index + 1].bg.substring(1);
    img.src = bgImg;
  } else if (slideList[index + 1].bc) {
    imgCtx.fillStyle = slideList[index + 1].bc;
    imgCtx.fillRect(0, 0, width, height);
    console.log("blank slide");
  }
  img.onload = function () {
    var wrh = img.width / img.height;
    var newWidth = imgCanvas.width;
    var newHeight = newWidth / wrh;
    if (newHeight > imgCanvas.height) {
      newHeight = imgCanvas.height;
      newWidth = newHeight * wrh;
    }
    imgCtx.clearRect(0, 0, width, height);
    if (bgImg) {
      var bg = new Image();
      bg.src = bgImg;
      bg.onload = () => {
        imgCtx.drawImage(bg, 0, 0, width, height);
        if (img.src != undefined)
          imgCtx.drawImage(
            img,
            width == newWidth ? 0 : width / 2 - newWidth / 2,
            Math.floor(width / height) == Math.floor(wrh)
              ? 0
              : height / 2 - newHeight / 2,
            newWidth,
            newHeight
          );
      };
    } else {
      imgCtx.fillStyle = slideList[index + 1].bc;
      imgCtx.fillRect(0, 0, width, height);
      console.log(width, newWidth);
      if (img.src != undefined)
        imgCtx.drawImage(
          img,
          width == newWidth ? 0 : width / 2 - newWidth / 2,
          Math.floor(width / height) == Math.floor(wrh)
            ? 0
            : height / 2 - newHeight / 2,
          newWidth,
          newHeight
        );
    }
    onSeek();
  };
  lastBg = index;
};
