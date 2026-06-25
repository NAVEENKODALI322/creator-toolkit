function getThumbnail() {
  const url = document.getElementById("videoUrl").value.trim();
  if (!url) { alert("Please enter a YouTube URL"); return; }

  let videoId = "";
  if (url.includes("watch?v=")) {
    videoId = url.split("v=")[1].split("&")[0];
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0];
  } else {
    alert("Invalid YouTube URL"); return;
  }

  const previewUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const downloadUrl = `/api/thumbnail?videoId=${videoId}`;

  document.getElementById("thumbnailPreview").innerHTML = `
    <img src="${previewUrl}" alt="Thumbnail"
      style="max-width:100%; border-radius:10px; margin-top:15px;">
    <br><br>
    <a href="${downloadUrl}" download="thumbnail_${videoId}.jpg">
      <button class="format-btn">📥 Download HD Thumbnail</button>
    </a>
  `;
  document.getElementById("getBtn").style.display = "none";
}
