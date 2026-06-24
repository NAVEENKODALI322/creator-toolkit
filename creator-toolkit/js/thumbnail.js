function getThumbnail() {

  const url = document.getElementById("videoUrl").value.trim();

  if (!url) {
    alert("Please enter a YouTube video URL");
    return;
  }

  let videoId = "";

  // Normal YouTube URL
  if (url.includes("watch?v=")) {
    videoId = url.split("v=")[1].split("&")[0];
  }

  // Short YouTube URL
  else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0];
  }

  else {
    alert("Invalid YouTube URL");
    return;
  }

  const thumbnailUrl =
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  document.getElementById("thumbnailPreview").innerHTML = `
    <img
      src="${thumbnailUrl}"
      alt="Thumbnail"
      style="max-width:100%; border-radius:10px; margin-top:15px;"
    >

    <br><br>

    <a href="${thumbnailUrl}" target="_blank">
      <button class="format-btn">
        Download Thumbnail
      </button>
    </a>
  `;
}
