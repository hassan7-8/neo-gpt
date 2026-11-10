/**
 * Stamps every generated image with a tiny "Cheap Mind AI" mark: a very small corner label plus a
 * faint repeating pattern across the whole picture (so cropping the corner does not remove it).
 * No watermark can be made impossible to remove, but this makes removal hard and visible work.
 */
const TEXT = "Cheap Mind AI";

export function stampImage(img: HTMLImageElement): Promise<string> {
  return new Promise((resolve, reject) => {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return reject(new Error("empty image"));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("no canvas"));
    ctx.drawImage(img, 0, 0, w, h);

    const side = Math.min(w, h);

    // Faint pattern across the whole image (light + dark so it works on any picture).
    const fs = Math.max(10, Math.round(side / 60));
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 7);
    ctx.font = `600 ${fs}px sans-serif`;
    ctx.textBaseline = "middle";
    const stepX = fs * 11;
    const stepY = fs * 6;
    const span = Math.hypot(w, h);
    let row = 0;
    for (let y = -span; y < span; y += stepY, row++) {
      for (let x = -span + (row % 2) * (stepX / 2); x < span; x += stepX) {
        ctx.globalAlpha = 0.035;
        ctx.fillStyle = "#000";
        ctx.fillText(TEXT, x + 1, y + 1);
        ctx.fillStyle = "#fff";
        ctx.fillText(TEXT, x, y);
      }
    }
    ctx.restore();

    // Tiny corner mark.
    const cs = Math.max(8, Math.round(side / 105));
    ctx.font = `600 ${cs}px sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    const m = Math.round(cs * 0.9);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#000";
    ctx.fillText(TEXT, w - m + 1, h - m + 1);
    ctx.fillStyle = "#fff";
    ctx.fillText(TEXT, w - m, h - m);

    canvas.toBlob(
      (blob) => (blob ? resolve(URL.createObjectURL(blob)) : reject(new Error("no blob"))),
      "image/jpeg",
      0.95,
    );
  });
}
