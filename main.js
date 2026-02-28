// ===== CONFIG =====
const gallery = document.getElementById("gallery");
const template = document.getElementById("photoTemplate");

const SHEET_URL = "https://script.google.com/macros/s/AKfycbxRRoz_ShvRUjXCuxUlKIVNsWe0Uvud554p1Pe9nej-LBw0GgftULTGkYLS-kxzrA3G/exec";

const imageList = [
    "001.jpg","002.jpg","003.jpg","004.jpg","005.jpg",
    "006.jpg","007.jpg","008.jpg","009.jpg","010.jpg",
    "011.jpg","012.jpg","014.jpg","015.jpg","016.jpg",
    "017.jpg","018.jpg","019.jpg","020.jpg","021.jpg",
	"022.jpg","023.jpg","024.jpg","025.jpg","026.jpg",
	"027.jpg","028.jpg","029.jpg","030.jpg",
];


// ===== LOAD IMAGES + HEART =====
imageList.forEach(file => {

    const clone = template.content.cloneNode(true);
    const item = clone.querySelector(".grid-item");
    const img = clone.querySelector("img");
    const heartBtn = clone.querySelector(".heart-btn");
    const heartCount = clone.querySelector(".heart-count");

    img.src = "assets/images/" + file;
    img.loading = "lazy";

    // Load count
    fetch(`${SHEET_URL}?image=${file}`)
        .then(res => res.text())
        .then(count => heartCount.textContent = count)
        .catch(() => heartCount.textContent = "0");

    // Click heart
    heartBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        heartBtn.style.pointerEvents = "none";

        fetch(SHEET_URL, {
            method: "POST",
            body: JSON.stringify({ image: file })
        })
        .then(res => res.text())
        .then(newCount => {
            heartCount.textContent = newCount;
            heartBtn.style.pointerEvents = "auto";
        })
        .catch(() => heartBtn.style.pointerEvents = "auto");
    });

    gallery.appendChild(clone);
});


// ===== MASONRY FIX =====
function resizeMasonryItem(item){
    const grid = document.querySelector(".masonry");

    const rowHeight = parseInt(getComputedStyle(grid).getPropertyValue("grid-auto-rows"));
    const gap = parseInt(getComputedStyle(grid).getPropertyValue("gap"));

    const rowSpan = Math.ceil(
        (item.querySelector("img").getBoundingClientRect().height + gap)
        / (rowHeight + gap)
    );

    item.style.gridRowEnd = "span " + rowSpan;
}

function resizeAll(){
    document.querySelectorAll(".grid-item").forEach(item=>{
        resizeMasonryItem(item);
    });
}

document.addEventListener("load", e=>{
    if(e.target.tagName === "IMG"){
        resizeMasonryItem(e.target.closest(".grid-item"));
    }
}, true);

window.addEventListener("resize", resizeAll);


// ===== SCROLL ANIMATION =====
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.classList.add("visible");
        }
    });
},{threshold:0.15});

setTimeout(()=>{
    document.querySelectorAll(".masonry img").forEach(img=>{
        observer.observe(img);
    });
},300);


// ===== LIGHTBOX =====
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const closeBtn = document.getElementById("closeBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const counter = document.getElementById("counter");

let currentIndex = 0;
let isAnimating = false;

function showImage(index){
    currentIndex = index;
    lightboxImg.src = "assets/images/" + imageList[index];
    counter.textContent = (index+1) + " / " + imageList.length;
}

function changeImage(newIndex){
    if(isAnimating) return;
    isAnimating = true;

    lightboxImg.style.opacity = 0;

    setTimeout(()=>{
        showImage(newIndex);
        lightboxImg.style.opacity = 1;
        isAnimating = false;
    },200);
}

function nextImage(){
    changeImage((currentIndex + 1) % imageList.length);
}

function prevImage(){
    changeImage((currentIndex - 1 + imageList.length) % imageList.length);
}

gallery.addEventListener("click", e=>{
    if(e.target.tagName === "IMG"){
        const src = e.target.src.split("/").pop();
        currentIndex = imageList.indexOf(src);
        showImage(currentIndex);

        lightbox.style.display = "flex";
        setTimeout(()=> lightbox.classList.add("show"),10);
    }
});

closeBtn.onclick = ()=>{
    lightbox.classList.remove("show");
    setTimeout(()=> lightbox.style.display="none",300);
};

nextBtn.onclick = nextImage;
prevBtn.onclick = prevImage;

document.addEventListener("keydown", e=>{
    if(lightbox.style.display === "flex"){
        if(e.key === "ArrowRight") nextImage();
        if(e.key === "ArrowLeft") prevImage();
        if(e.key === "Escape") closeBtn.onclick();
    }
});


// ===== SWIPE MOBILE =====
let startX = 0;
let currentX = 0;
let isSwiping = false;

lightboxImg.addEventListener("touchstart", e=>{
    startX = e.touches[0].clientX;
    isSwiping = true;
});

lightboxImg.addEventListener("touchmove", e=>{
    if(!isSwiping) return;
    currentX = e.touches[0].clientX;
});

lightboxImg.addEventListener("touchend", ()=>{
    if(!isSwiping) return;

    const diff = currentX - startX;
    const threshold = 70;

    if(diff < -threshold){
        nextImage();
    }
    else if(diff > threshold){
        prevImage();
    }

    isSwiping = false;
});
// ===== MUSIC =====
const music = document.getElementById("bgMusic");
const toggleBtn = document.getElementById("musicToggle");

music.play().catch(()=>{
    document.body.addEventListener("click", ()=>music.play(),{once:true});
});

toggleBtn.addEventListener("click",()=>{
    if(music.paused){
        music.play();
        toggleBtn.textContent="🔊";
    }else{
        music.pause();
        toggleBtn.textContent="🔇";
    }
});
// ===== SHARE BUTTON (NEW) =====
const shareBtn = document.getElementById("shareBtn");

if(shareBtn){
    shareBtn.addEventListener("click", async () => {

        const url = window.location.href;
        const title = document.title;

        if (navigator.share) {
            try {
                await navigator.share({ title: title, url: url });
            } catch {}
        } else {

            const zalo = `https://zalo.me/share?url=${encodeURIComponent(url)}`;
            const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

            const choice = prompt(
`Chọn nền tảng:
1 - Zalo
2 - Facebook
3 - Sao chép liên kết`
            );

            if (choice === "1") window.open(zalo, "_blank");
            else if (choice === "2") window.open(fb, "_blank");
            else if (choice === "3") {
                navigator.clipboard.writeText(url);
                alert("Đã sao chép liên kết");
            }
        }
    });
}


// ===== FALLING ICON EFFECT =====
const container = document.createElement("div");
container.className = "fall-container";
document.body.appendChild(container);

function createIcon(){
    const icon = document.createElement("img");
    icon.src = "assets/images/icon.png";
    icon.className = "fall-icon";

    const size = Math.random() * 30 + 30;
    icon.style.width = size + "px";
    icon.style.left = Math.random() * window.innerWidth + "px";

    const duration = Math.random() * 10 + 15;
    icon.style.animationDuration = duration + "s";

    container.appendChild(icon);

    setTimeout(() => {
        icon.remove();
    }, duration * 1000);
}

setInterval(createIcon, 1500);

// ===== GLOBAL SLIDESHOW =====
const globalSlideBtn = document.getElementById("globalSlideBtn");

let globalInterval = null;
let globalPlaying = false;

function startGlobalSlideshow(){

    globalPlaying = true;
    globalSlideBtn.textContent = "⏸ Đang trình chiếu";

    currentIndex = 0;
    showImage(currentIndex);
    lightbox.style.display = "flex";
    setTimeout(()=>lightbox.classList.add("show"),10);

    globalInterval = setInterval(()=>{
        nextImage();
    },3000);
}

function stopGlobalSlideshow(){
    globalPlaying = false;
    globalSlideBtn.textContent = "▶ Trình chiếu toàn bộ";
    clearInterval(globalInterval);
}

globalSlideBtn.addEventListener("click",()=>{
    if(globalPlaying){
        stopGlobalSlideshow();
    }else{
        startGlobalSlideshow();
    }
});