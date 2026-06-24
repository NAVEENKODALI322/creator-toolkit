function getThumbnail() {

  const url =
    document.getElementById("videoUrl").value.trim();

  const result =
    document.getElementById("thumbResult");

  if (!url) {
    result.innerHTML =
      "⚠️ Please enter YouTube URL";
    return;
  }

  let videoId = "";

  if (url.includes("watch?v=")) {
    videoId = url.split("watch?v=")[1].split("&")[0];
  }
  else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0];
  }

  if (!videoId) {
    result.innerHTML =
      "❌ Invalid YouTube URL";
    return;
  }

  const thumbUrl =
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  result.innerHTML = `
    <img
      src="${thumbUrl}"
      style="max-width:100%;
      border-radius:10px;
      margin-top:15px;">

    <br><br>

    <a href="${thumbUrl}"
       target="_blank"
       class="copy-btn">
       Download Thumbnail
    </a>
  `;
}
