const drawLoop = () => {
  // This loop stores the Marker mode/info before the current timestamp
  let pgId = 0;
  for (let i = 0; i < parsed_data.length; i++) {
    if (parsed_data[i].p_time / 1000 > video.currentTime * 1000) break;
    pgId = parsed_data[i].data.id - 1;
    parseInfo(parsed_data[i]);
  }
  loadBg(pgId);
  for (let i = lastIndex + 1; i < parsed_data.length; i++) {
    if (parsed_data[i].p_time / 1000 > video.currentTime * 1000) {
      if (parsed_data[i].plugin == "cw") {
        if (parsed_data[i].data.data.e) {
          if (
            parsed_data[i].data.data.e == "un" ||
            parsed_data[i].data.data.e == "ea"
          ) {
            setTimeout(() => onSeek(), 100);
            break;
          } else if (
            parsed_data[i].data.data.e == "pdo2" ||
            parsed_data[i].data.data.e == "tf"
          ) {
            onSeek();
            break;
          }
        }
        pointer.style.top =
          (parsed_data[i].data.data.p.y * height).toString() + "px";
        pointer.style.left =
          (parsed_data[i].data.data.p.x * width).toString() + "px";
        draw(i);
      }

      break;
    }
  }
};

const parseInfo = (data) => {
  if (data.plugin == "dcn" && data.p_time / 1000 < video.currentTime * 1000) {
    if ("m" in data.data) {
      mode = data.data.m == "selection" ? mode : data.data.m;
      if ("v" in data.data) shape_url = data.data.v;
      if ("dc" in data.data) dash = data.data.dc;
    } else if (data.data.e == "cc") color = data.data.c;
    else if (data.data.e == "pstc") strokeSize = data.data.s * strokeMultiplier;
    else if (data.data.e == "estc") eraserSize = data.data.s * strokeMultiplier;
    else if (data.data.e == "as") slideList.splice(data.data.i, 0, data.data);
  }
};

const draw = (i) => {
  lastIndex = i - 1;
  let dash = mode == "dashed-line" ? mode : [];
  ctx.setLineDash(dash);
  animCtx.setLineDash(dash);
  if (mode == "eraser" && parsed_data[i].data.data.e != "p") {
    ctx.globalCompositeOperation = "destination-out";
    if (parsed_data[i].data.data.e == "d") {
      ctx.beginPath();
      ctx.moveTo(
        parsed_data[i].data.data.p.x * width,
        parsed_data[i].data.data.p.y * height
      );
    }
    ctx.lineWidth = eraserSize;
    ctx.lineTo(
      parsed_data[i].data.data.p.x * width,
      parsed_data[i].data.data.p.y * height
    );
    ctx.stroke();
    ctx.lineWidth = strokeSize;
    ctx.globalCompositeOperation = "source-over";
  } else if (mode == "marker") {
    if (parsed_data[i].plugin == "cw" && parsed_data[i].data.data.e) {
      let event = parsed_data[i].data.data.e;
      animCtx.lineWidth = strokeSize;
      animCtx.strokeStyle = color;
      if (event == "d") {
        animCtx.stroke();
        //animCtx.clearRect(0, 0, width, height);
        temp.moveTo(
          parsed_data[i].data.data.p.x * width,
          parsed_data[i].data.data.p.y * height
        );
        animCtx.moveTo(
          parsed_data[i].data.data.p.x * width,
          parsed_data[i].data.data.p.y * height
        );
      }
      if (
        event != "p" &&
        parsed_data[i].data.data.p &&
        !("s" in parsed_data[i].data.data.p)
      ) {
        // smoothing lines, (ik it complicates things) simpler version is: path.lineTo(parsed_data[i].data.data.p.x * width,parsed_data[i].data.data.p.y * height);
        for (let j = i; j < parsed_data.length; j++) {
          try {
            if (parsed_data[j].data.data.e != "p" && i != j) {
              const c =
                (parsed_data[i].data.data.p.x * width +
                  parsed_data[j].data.data.p.x * width) /
                2;
              const d =
                (parsed_data[i].data.data.p.y * height +
                  parsed_data[j].data.data.p.y * height) /
                2;
              animCtx.quadraticCurveTo(
                parsed_data[i].data.data.p.x * width,
                parsed_data[i].data.data.p.y * height,
                c,
                d
              );
              temp.quadraticCurveTo(
                parsed_data[i].data.data.p.x * width,
                parsed_data[i].data.data.p.y * height,
                c,
                d
              );
              if (i % 2 == 0) animCtx.stroke();
              break;
            }
          } catch {}
        }
      } else if (event == "m") {
        animCtx.moveTo(
          parsed_data[i].data.data.p.x * width,
          parsed_data[i].data.data.p.y * height
        );
        temp.moveTo(
          parsed_data[i].data.data.p.x * width,
          parsed_data[i].data.data.p.y * height
        );
      } else if (event == "u") {
        ctx.lineWidth = strokeSize;
        ctx.strokeStyle = color;
        ctx.stroke(temp);
        temp = new Path2D();
        animCtx.clearRect(0, 0, width, height);
        animCtx.beginPath();
      }
    }
  } else if (mode == "rectangle") {
    if (parsed_data[i].data.data.e == "d") {
      recX = parsed_data[i].data.data.p.x * width;
      recY = parsed_data[i].data.data.p.y * height;
      animCtx.lineWidth = strokeSize;
      animCtx.strokeStyle = color;
    } else if (parsed_data[i].data.data.e == "m") {
      animCtx.clearRect(0, 0, width, height);
      let endX = parsed_data[i].data.data.p.x * width;
      let endY = parsed_data[i].data.data.p.y * height;
      animCtx.beginPath();
      animCtx.rect(recX, recY, endX - recX, endY - recY);
      animCtx.stroke();
    } else if (parsed_data[i].data.data.e == "u") {
      let endX = parsed_data[i].data.data.p.x * width;
      let endY = parsed_data[i].data.data.p.y * height;
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = strokeSize;
      ctx.strokeStyle = color;
      ctx.rect(recX, recY, endX - recX, endY - recY);
      ctx.stroke();
      animCtx.clearRect(0, 0, width, height);
    }
  } else if (mode == "circle") {
    try {
      ctx.globalCompositeOperation = "source-over";
      if (parsed_data[i].data.data.e == "d") {
        ctx.beginPath();
        recX = parsed_data[i].data.data.p.x * width;
        recY = parsed_data[i].data.data.p.y * height;
        animCtx.lineWidth = strokeSize;
        animCtx.strokeStyle = color;
        ctx.lineWidth = strokeSize;
        ctx.strokeStyle = color;
      } else if (parsed_data[i].data.data.e == "m" && recX != -1) {
        animCtx.clearRect(0, 0, width, height);
        let endX = parsed_data[i].data.data.p.x * width;
        let endY = parsed_data[i].data.data.p.y * height;
        animCtx.beginPath();
        let delta = getShiftedDeltasForRect(recX, recY, endX, endY, false);
        let centerX = recX + delta.xDiff / 2;
        let centerY = recY + delta.yDiff / 2;
        animCtx.ellipse(
          centerX,
          centerY,
          Math.abs(delta.xDiff / 2),
          Math.abs(delta.yDiff / 2),
          0,
          0,
          Math.PI * 2
        );
        animCtx.stroke();
      } else if (parsed_data[i].data.data.e == "u") {
        let endX = parsed_data[i].data.data.p.x * width;
        let endY = parsed_data[i].data.data.p.y * height;
        ctx.beginPath();
        let delta = getShiftedDeltasForRect(recX, recY, endX, endY, false);
        let centerX = recX + delta.xDiff / 2;
        let centerY = recY + delta.yDiff / 2;
        ctx.ellipse(
          centerX,
          centerY,
          Math.abs(delta.xDiff / 2),
          Math.abs(delta.yDiff / 2),
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        animCtx.clearRect(0, 0, width, height);
      }
    } catch {}
  } else if (mode == "shape") {
    ctx.globalCompositeOperation = "source-over";
    if (parsed_data[i].data.data.e == "d") {
      ctx.beginPath();
      shapeX = parsed_data[i].data.data.p.x * width;
      shapeY = parsed_data[i].data.data.p.y * height;
      animCtx.lineWidth = strokeSize;
      animCtx.strokeStyle = color;
      ctx.lineWidth = strokeSize;
      ctx.strokeStyle = color;
    } else if (parsed_data[i].data.data.e == "m") {
      animCtx.clearRect(0, 0, width, height);
      let endX = parsed_data[i].data.data.p.x * width;
      let endY = parsed_data[i].data.data.p.y * height;
      fetch(shape_url, { cache: "force-cache" })
        .then((d) => d.text())
        .then((d) => {
          let xml = d.replaceAll("#000001", color);
          var svg64 = btoa(xml);
          var b64Start = "data:image/svg+xml;base64,";
          var image64 = b64Start + svg64;
          var img = new Image();
          img.onload = function () {
            // draw the shape onto the canvas
            animCtx.drawImage(
              img,
              shapeX,
              shapeY,
              endX - shapeX,
              endY - shapeY
            );
          };
          img.src = image64;
        });
    } else if (parsed_data[i].data.data.e == "u") {
      let endX = parsed_data[i].data.data.p.x * width;
      let endY = parsed_data[i].data.data.p.y * height;
      var imgg = new Image();
      fetch(shape_url, { cache: "force-cache" })
        .then((d) => d.text())
        .then((d) => {
          let xml = d.replaceAll("#000001", color);
          var svg64 = btoa(xml);
          var b64Start = "data:image/svg+xml;base64,";
          var image64 = b64Start + svg64;

          ctx.beginPath();
          imgg.onload = function () {
            // draw the shape onto the canvas
            ctx.drawImage(imgg, shapeX, shapeY, endX - shapeX, endY - shapeY);
            animCtx.clearRect(0, 0, width, height);
          };
          imgg.src = image64;
        });
    }
  } else if (mode == "dashed-line" || mode == "line") {
    if (parsed_data[i].data.data.e == "d") {
      ctx.beginPath();

      lineX = parsed_data[i].data.data.p.x * width;
      lineY = parsed_data[i].data.data.p.y * height;
      animCtx.lineWidth = strokeSize;
      animCtx.strokeStyle = color;
      ctx.lineWidth = strokeSize;
      ctx.strokeStyle = color;
    } else if (parsed_data[i].data.data.e == "m") {
      animCtx.clearRect(0, 0, width, height);
      let endX = parsed_data[i].data.data.p.x * width;
      let endY = parsed_data[i].data.data.p.y * height;
      animCtx.beginPath();
      animCtx.moveTo(lineX, lineY);
      animCtx.lineTo(endX, endY);
      animCtx.stroke();
    }
    if (parsed_data[i].data.data.e == "u") {
      let endX = parsed_data[i].data.data.p.x * width;
      let endY = parsed_data[i].data.data.p.y * height;
      ctx.beginPath();
      ctx.moveTo(lineX, lineY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      animCtx.clearRect(0, 0, width, height);
    }
  }
};

const getCurrentFrame = () => {
  console.log("getting current frame");
  for (i in Paths) {
    let e = Paths[i];
    try {
      // NOTE [0] does not work in ios devices
      let dash = e.mode == "dashed-line" ? e.dash : [];
      ctx.setLineDash(dash);
      animCtx.setLineDash(dash);
      // Set Default state of MainCanvas's Context
      ctx.beginPath();

      ctx.globalCompositeOperation =
        e.mode == "eraser" ? "destination-out" : "source-over";
      ctx.lineWidth = e.size;
      ctx.strokeStyle = e.color;
      // Parse the Paths array.
      if (e.mode == "marker" || e.mode == "eraser") {
        ctx.stroke(e.path);
      } else if (e.mode == "shape") {
        fetch(e.url, { cache: "force-cache" })
          .then((d) => d.text())
          .then((d) => {
            let xml = d.replaceAll("#000001", color);
            var image64 = "data:image/svg+xml;base64," + btoa(xml);
            var img = new Image();
            img.onload = function () {
              // draw the shape onto the canvas (TODO: Convert into Path to enable dashed lines in custom shapes, Currently acts as Image)
              if (e.shifted) {
                ctx.drawImage(
                  img,
                  e.x + e.dx,
                  e.y + e.dy,
                  e.delta.dx,
                  e.delta.dy
                );
              } else ctx.drawImage(img, e.x, e.y, e.delta.dx, e.delta.dy);
            };
            img.src = image64;
          });
      } else if (e.mode == "line" || e.mode == "dashed-line") {
        if (e.shifted) {
          e.x += e.dx;
          e.y += e.dy;
          e.endX += e.dx;
          e.endY += e.dy;
        }
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.endX, e.endY);
      } else if (e.mode == "rectangle") {
        console.log(e);
        ctx.rect(e.x, e.y, e.delta.dx, e.delta.dy);
      } else if (e.mode == "circle") {
        let centerX = e.x + e.delta.dx / 2;
        let centerY = e.y + e.delta.dy / 2;
        ctx.ellipse(
          centerX,
          centerY,
          Math.abs(e.delta.dx / 2),
          Math.abs(e.delta.dy / 2),
          0,
          0,
          Math.PI * 2
        );
      }
      // Finally Draw the current Path/Shape
      ctx.stroke();
    } catch (ee) {
      console.error(ee);
      console.log(e);
    }
  }
};

const parseSeekEvents = () => {
  console.log("parsing");
  for (let x = 0; x < parsed_data.length; x++) {
    if (parsed_data[x].p_time / 1000 > video.currentTime * 1000) break;
    parseInfo(parsed_data[x]);
    try {
      if (parsed_data[x].data.id - 1 == pgId) {
        if (parsed_data[x].plugin == "cw") {
          if (parsed_data[x].data.data.e == "un") {
            Paths.pop();
          } else if (parsed_data[x].data.data.e == "ea") {
            Paths = [];
          } else if (parsed_data[x].data.data.e == "pdo2") {
            for (let i = x; i > 0; i--) {
              if (
                parsed_data[i].plugin == "cw" &&
                parsed_data[i].data.data.e &&
                parsed_data[i].data.data.e == "d" &&
                parsed_data[i].data.data.p.oid ==
                  parsed_data[x].data.data.path.copyId
              ) {
                console.log("paste");
                let tempMode = mode;
                for (let j = i; j > 0; j--) {
                  if (
                    parsed_data[j].plugin == "dcn" &&
                    parsed_data[j].data.e == "mc"
                  ) {
                    parseInfo(parsed_data[j]);

                    break;
                  }
                }
                parseSeekPaths(
                  i,
                  parsed_data[x].data.data.path.pasteId,
                  parsed_data[x].data.data.path
                );
                mode = tempMode;
                break;
              }
            }
          } else if (parsed_data[x].data.data.e == "tf") {
            console.log("transform");
            if (parsed_data[x].data.data.t == "s") {
              let ids = parsed_data[x].data.data.data.ids;
              for (let i = x; i < parsed_data.length; i++) {
                try {
                  if (parsed_data[i].data.data.t == "ts") {
                    //console.log("Move el", parsed_data[j], ids, Paths);
                    let Dx = parsed_data[i].data.data.data.dx * width;
                    let Dy = parsed_data[i].data.data.data.dy * height;
                    for (p in Paths) {
                      for (id in ids) {
                        if (Paths[p].id == ids[id]) {
                          // Check if dx/dy exists, if not assign Dx (also verifies if Dx==NaN)
                          Paths[p].dx = Paths[p].dx
                            ? Paths[p].dx + Dx || 0
                            : Dx;
                          Paths[p].dy = Paths[p].dy
                            ? Paths[p].dy + Dy || 0
                            : Dx;

                          Paths[p].shifted = true;
                        }
                      }
                    }
                  } else if (parsed_data[i].data.data.t == "e") {
                    break;
                  }
                } catch {}
              }
            }
          }
        }
        parseInfo(parsed_data[x]);

        parseSeekPaths(x);
      }
    } catch {}
  }
};

const parseSeekPaths = (x, pasteId, pathh) => {
  tempId = pasteId || parsed_data[x].data.data.p.oid;
  let Dx = 0;
  let Dy = 0;
  if (pasteId) {
    // This means we are pasting the object, here we will check for transformations made on the object
    Dx = pathh.dx * width;
    Dy = pathh.dy * height;
    if (Dx != 0 || Dy != 0) {
      console.log(pathh);
    }
  }
  if (
    mode == "eraser" &&
    parsed_data[x].data.data.e &&
    parsed_data[x].data.data.e != "p"
  ) {
    if (parsed_data[x].data.data.e == "d") {
      let path = new Path2D();
      path.lineWidth = eraserSize;
      path.strokeStyle = color;
      path.moveTo(
        parsed_data[x].data.data.p.x * width,
        parsed_data[x].data.data.p.y * height
      );
      for (var j = x; j < parsed_data.length; j++) {
        try {
          if (parsed_data[j].data.data.e == "u") break;
          if (parsed_data[j].data.data.e != "p") {
            path.lineTo(
              parsed_data[j].data.data.p.x * width,
              parsed_data[j].data.data.p.y * height
            );
          }
        } catch {}
      }
      Paths.push({
        id: tempId,
        mode: "eraser",
        path: path,
        color: color,
        size: eraserSize,
        shifted: Dx == 0 ? (Dy == 0 ? false : true) : true,
        Dx: Dx,
        Dy: Dy,
      });
    }
  } else if (mode == "marker") {
    if (parsed_data[x].data.data.e && parsed_data[x].data.data.e == "d") {
      let path = new Path2D();
      path.lineWidth = strokeSize;
      path.strokeStyle = color;
      path.moveTo(
        parsed_data[x].data.data.p.x * width,
        parsed_data[x].data.data.p.y * height
      );

      for (var j = x + 1; j < parsed_data.length; j++) {
        try {
          parseInfo(parsed_data[j]);
          let event = parsed_data[j].data.data.e;
          if (event && event != "p" && !("s" in parsed_data[j].data.data.p)) {
            // smoothing lines, (ik it complicates things) simpler version is: path.lineTo(parsed_data[j].data.data.p.x * width,parsed_data[j].data.data.p.y * height);
            if (parsed_data[j + 1].data.data.e != "p") {
              const c =
                (parsed_data[j].data.data.p.x * width +
                  parsed_data[j + 1].data.data.p.x * width) /
                2;
              const d =
                (parsed_data[j].data.data.p.y * height +
                  parsed_data[j + 1].data.data.p.y * height) /
                2;
              path.quadraticCurveTo(
                parsed_data[j].data.data.p.x * width,
                parsed_data[j].data.data.p.y * height,
                c,
                d
              );
            } else
              path.lineTo(
                parsed_data[j].data.data.p.x * width,
                parsed_data[j].data.data.p.y * height
              );
          } else if (event && event == "m") {
            path.moveTo(
              parsed_data[j].data.data.p.x * width,
              parsed_data[j].data.data.p.y * height
            );
          } else if (event && event == "u") {
            lastIndex = j;
            Paths.push({
              id: tempId,
              mode: "marker",
              path: path,
              color: color,
              size: strokeSize,
              shifted: Dx == 0 ? (Dy == 0 ? false : true) : true,
              Dx: Dx,
              Dy: Dy,
            });
            break;
          } else if (event && event == "d") {
            lastIndex = j - 1;
            Paths.push({
              id: tempId,
              mode: "marker",
              path: path,
              color: color,
              size: strokeSize,
              shifted: Dx == 0 ? (Dy == 0 ? false : true) : true,
              Dx: Dx,
              Dy: Dy,
            });
            break;
          }
        } catch {}
      }
    }
  } else if (
    mode == "rectangle" ||
    mode == "circle" ||
    mode == "line" ||
    mode == "dashed-line" ||
    mode == "shape"
  ) {
    if (parsed_data[x].data.data.e == "d") {
      let startX = parsed_data[x].data.data.p.x * width;
      let startY = parsed_data[x].data.data.p.y * height;
      for (var j = x - 1; j < parsed_data.length; j++) {
        try {
          if (parsed_data[j].data.data.e == "u") {
            lastIndex = j;
            let endX = parsed_data[j].data.data.p.x * width;
            let endY = parsed_data[j].data.data.p.y * height;

            if (mode == "shape") {
              if (Dx == 0 ? (Dy == 0 ? false : true) : true)
                console.log(Dx, Dy, startX, startY);
              Paths.push({
                id: tempId,
                mode: mode,
                url: shape_url,
                x: startX + Dx,
                y: startY + Dy,
                endX: endX,
                endY: endY,
                delta: getShiftedDeltasForRect(startX, startY, endX, endY),
                color: color,
                size: strokeSize,
                shifted: Dx == 0 ? (Dy == 0 ? false : true) : true,
                Dx: Dx,
                Dy: Dy,
              });
            } else {
              let temp = {
                id: tempId,
                mode: mode,
                dash: mode == "dashed-line" ? dash : [0],
                x: startX,
                y: startY,
                shifted: Dx == 0 ? (Dy == 0 ? false : true) : true,
                Dx: Dx,
                Dy: Dy,
                endX: endX,
                endY: endY,
                delta: getShiftedDeltasForRect(startX, startY, endX, endY),
                color: color,
                size: strokeSize,
              };
              console.log("moj", temp);
              Paths.push(temp);
            }

            break;
          }
        } catch {}
      }
    }
  }
};

const onSeek = (reRenderImg) => {
  console.log("onSeek");
  Paths = [];
  ctx.clearRect(0, 0, width, height);
  animCtx.clearRect(0, 0, width, height);

  ctx.beginPath();
  animCtx.beginPath();
  let s = -1000;
  let sI = 0;
  s = video.currentTime * 1000 - parsed_data[0].p_time / 1000;
  for (let y = 0; y < parsed_data.length; y++) {
    let diff = video.currentTime * 1000 - parsed_data[y].p_time / 1000;
    if (diff < s && diff > 0 && parsed_data[y].plugin == "cw") {
      sI = y;
      s = video.currentTime * 1000 - parsed_data[y].p_time / 1000;
    }
  }
  pgId = parsed_data[sI].data.id - 1;
  console.log(pgId);
  parseSeekEvents();

  getCurrentFrame();
  if (reRenderImg) loadBg(pgId);
};
