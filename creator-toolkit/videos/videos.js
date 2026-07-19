const videos = [

{
title:"How I Earn Money Using Canva",
description:"Complete Canva earning tutorial.",
thumbnail:"https://i.ytimg.com/vi/8G8uoNNb_PM/hqdefault.jpg",
url:"https://www.youtube.com/watch?v=8G8uoNNb_PM",
channel:"naveenkodali",
duration:"12:30",
date:"2 days ago"
},

{
title:"How I Earn Money Using Canva",
description:"This Simple Design Paid Me Dollars 🤑🤑 | Canva | Earn money online",
thumbnail:"https://i.ytimg.com/vi/8G8uoNNb_PM/hqdefault.jpg",
url:"https://www.youtube.com/watch?v=8G8uoNNb_PM",
channel:"sheela",
duration:"0:45",
date:"5 days ago"
},

{
title:"Best AI Tools for YouTubers",
description:"Save hours every week.",
thumbnail:"https://i.ytimg.com/vi/YOUR_VIDEO_ID3/hqdefault.jpg",
url:"https://youtube.com/watch?v=YOUR_VIDEO_ID3",
channel:"kodali",
duration:"8:12",
date:"1 week ago"
}

];

const grid=document.getElementById("videoGrid");
const search=document.getElementById("searchInput");
const featured=document.getElementById("featuredVideo");
const empty=document.getElementById("emptyState");

let currentFilter="all";

function createCard(video){

return`

<div class="video-card">

<div class="video-thumb">

<img src="${video.thumbnail}" loading="lazy">

<div class="channel-badge">

${video.channel==="kodali"?"Kodali Type":"Sheela Smart Vantalu"}

</div>

<div class="video-duration">

${video.duration}

</div>

</div>

<div class="video-body">

<div class="video-title">

${video.title}

</div>

<div class="video-desc">

${video.description}

</div>

<div class="video-meta">

<span>${video.date}</span>

</div>

<a
class="watch-btn"
target="_blank"
href="${video.url}">

▶ Watch on YouTube

</a>

</div>

</div>

`;

}

function render(){

let keyword=search.value.toLowerCase();

let filtered=videos.filter(video=>{

let matchChannel=currentFilter==="all" || video.channel===currentFilter;

let matchSearch=

video.title.toLowerCase().includes(keyword) ||

video.description.toLowerCase().includes(keyword);

return matchChannel && matchSearch;

});

grid.innerHTML=filtered.map(createCard).join("");

empty.style.display=filtered.length?"none":"block";

}

function loadFeatured(){

let video=videos[0];

featured.innerHTML=`

<div>

<div class="continue-label">

FEATURED

</div>

<h3>

${video.title}

</h3>

<a

class="continue-cta"

target="_blank"

href="${video.url}">

Watch Now →

</a>

</div>

<div class="continue-progress"></div>

`;

featured.onclick=()=>{

window.open(video.url,"_blank");

};

}

document.querySelectorAll(".filter").forEach(btn=>{

btn.onclick=()=>{

document

.querySelectorAll(".filter")

.forEach(b=>b.classList.remove("active"));

btn.classList.add("active");

currentFilter=btn.dataset.channel;

render();

};

});

search.addEventListener("input",render);

loadFeatured();

render();
