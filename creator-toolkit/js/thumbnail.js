function getThumbnail() {

    const url =
        document.getElementById("videoUrl").value;

    const videoId =
        url.split("v=")[1];

    if (!videoId) {
        alert("Invalid URL");
        return;
    }

    const thumbnail =
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    document.getElementById(
        "thumbnailPreview"
    ).innerHTML = `
        <img src="${thumbnail}"
        style="width:100%;
        max-width:600px;
        border-radius:10px;">
        <br><br>
        <a href="${thumbnail}"
        download
        target="_blank">
        <button class="format-btn">
        Download Thumbnail
        </button>
        </a>
    `;
}
