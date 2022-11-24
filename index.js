const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let start_time = 0.0;

const video = document.getElementById("videoElement");
video.hidden = true;

function playVideo() {
  video.play();
}
function pauseVideo() {
  video.pause();
}

video.addEventListener(
  "loadedmetadata",
  function (e) {
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    video.requestVideoFrameCallback(updateCanvas);

    function updateCanvas(now) {
      if (start_time == 0.0) start_time = now;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const effect = new AsciiEffect(ctx, width, height);
      effect.draw(5);

      video.requestVideoFrameCallback(updateCanvas);
    }

    class Cell {
      constructor(x, y, symbol, color) {
        this.x = x;
        this.y = y;
        this.symbol = symbol;
        this.color = color;
      }

      draw(ctx) {
        ctx.fillStyle = "white";
        ctx.fillText(this.symbol, this.x, this.y, 3);
      }
    }

    class AsciiEffect {
      #ctx;
      #width;
      #height;
      #pixels;
      #imageCellArray;

      constructor(ctx, width, height) {
        this.#ctx = ctx;
        this.#height = height;
        this.#width = width;
        this.#ctx.drawImage(video, 0, 0);
        this.#pixels = this.#ctx.getImageData(0, 0, this.#width, this.#height);
      }

      #scanImage(cellSize) {
        this.#imageCellArray = [];
        for (let y = 0; y < this.#pixels.height; y += cellSize) {
          for (let x = 0; x < this.#pixels.width; x += cellSize) {
            const posX = x * 4;
            const posY = y * 4;
            const pos = posY * this.#pixels.width + posX;

            if (this.#pixels.data[pos + 3] > 128) {
              const red = this.#pixels.data[pos];
              const green = this.#pixels.data[pos + 1];
              const blue = this.#pixels.data[pos + 2];
              const total = red + green + blue;
              const averageColorValue = total / 3;
              const color = "rgb(" + red + "," + green + "," + blue + ")";
              const symbol = this.#convertToSymbol(averageColorValue);
              this.#imageCellArray.push(new Cell(x, y, symbol, color));
            }
          }
        }
      }

      #convertToSymbol(averageColorValue) {
        if (averageColorValue > 250) return "";
        if (averageColorValue > 220) return "=";
        if (averageColorValue > 200) return "?";
        if (averageColorValue > 180) return "+";
        if (averageColorValue > 160) return "^";
        if (averageColorValue > 140) return "%";
        if (averageColorValue > 120) return "&";
        if (averageColorValue > 100) return "*";
        if (averageColorValue > 80) return "3";
        if (averageColorValue > 60) return ")";
        if (averageColorValue > 40) return "!";
        if (averageColorValue > 20) return ",";
        return ".";
      }

      draw(cellSize) {
        this.#scanImage(cellSize);
        this.#drawAscii();
      }

      #drawAscii() {
        this.#ctx.clearRect(0, 0, this.#width, this.#height);
        this.#imageCellArray.forEach((cell) => {
          cell.draw(this.#ctx);
        });
      }
    }
  },
  false
);
