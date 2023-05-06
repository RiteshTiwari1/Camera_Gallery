let video = document.querySelector("video");
let recordBtnCont=document.querySelector(".record-btn-cont");
let captureBtnCont=document.querySelector(".capture-btn-cont");
let recordBtn=document.querySelector(".record-btn");
let captureBtn=document.querySelector(".capture-btn");
let recorder;
let recordflag=false;
let transparentColor = "transparent";

let chunks=[]; // media data in chunks

let constaints={
    video:true,
    audio:true
}
navigator.mediaDevices.getUserMedia(constaints)
.then((stream)=>{
    video.srcObject=stream;

    recorder=new MediaRecorder(stream);
    recorder.addEventListener("start",(e)=>{
        chunks=[]; // baar baar record karna chahenge har baar chunks ko empty karna padega varna data sath ke 
        //sath store hota jayega 
    })
    recorder.addEventListener("dataavailable",(e)=>{
        chunks.push(e.data);
    })
    recorder.addEventListener("stop",(e)=>{
        // conversion of media chunks data to video
        // blob ek datatype hai joh ki file type me represent karta hai.jisme aap joh bhi data hai 
        // daalke represent kar sakte ho us hisab se

        let blob = new Blob(chunks,{type: "video/mp4"});
        // let videoURL= URL.createObjectURL(blob);
        // let a=document.createElement("a");
        // a.href=videoURL;
        // a.download="stream.mp4";
        // a.click();

        if(db){
            let videoID=shortid();
            let dbTransaction= db.transaction("video","readwrite");
            let videostore = dbTransaction.objectStore("video");
            let videoEntry = {
                id:`vid-${videoID}`,
                blobData: blob
            }
            videostore.add(videoEntry);
        }

    })
})


recordBtnCont.addEventListener("click",(e)=>{
    if(!recorder) return;
    recordflag=!recordflag;
    if(recordflag){ // start
        recorder.start();
        recordBtn.classList.add("scale-record");
        startTimer();
    }else{  // stop
        recorder.stop();
        recordBtn.classList.remove("scale-record");
        stopTimer();
    }
})

captureBtnCont.addEventListener("click",(e) =>{
    // console.log("hello");
    captureBtn.classList.add("scale-capture");
    let canvas=document.createElement("canvas");
    canvas.width=video.videoWidth;
    canvas.height=canvas.videoHeight;

    let tool=canvas.getContext("2d");
    tool.drawImage(video,0,0,canvas.width,canvas.height);

    tool.fillStyle=transparentColor;
    tool.fillRect(0,0,canvas.width,canvas.height);
    let imageURL=canvas.toDataURL();
    if(db){
        let imageId=shortid();
        let dbTransaction= db.transaction("image","readwrite");
        let imageStore = dbTransaction.objectStore("image");
        let imageEntry = {
            id:`img-${imageId}`,
            url: imageURL
        }
        imageStore.add(imageEntry);
    }
    // let a=document.createElement("a");
    // a.href=imageURL;
    // a.download="img.jpg";
    // a.click();
    setTimeout(() =>{
        captureBtn.classList.remove("scale-capture");
    },500)
    
});

let timerID;
let counter=0;
let timer=document.querySelector(".timer")
function startTimer(){
    timer.style.display="block";
    function dispalyTimer(){
        let totalsecond=counter;
        let hours=Number.parseInt(totalsecond/3600);
        totalsecond=totalsecond%3600;
        let minutes=Number.parseInt(totalsecond/60);
        totalsecond=totalsecond%60;
        let seconds=totalsecond;
        hours = (hours<10)?`0${hours}` : hours;
        minutes = (minutes<10)?`0${minutes}` : minutes;
        seconds = (seconds<10)?`0${seconds}` : seconds;
        
        timer.innerText=`${hours}:${minutes}:${seconds}`;
        counter++;
    }
    timerID = setInterval(dispalyTimer,1000);
}

function stopTimer(){
    clearInterval(timerID);
    timer.innerText="00.00.00"; 
    timer.style.display="none";
}

let allfilters=document.querySelectorAll(".filter");
let filterLayer= document.querySelector(".filter-layer");

allfilters.forEach((filterElem)=>{
    filterElem.addEventListener("click",(e)=>{
        // filterElem.style.background

        transparentColor  = getComputedStyle(filterElem).getPropertyValue("background-color");
        filterLayer.style.backgroundColor=transparentColor;
    })
})

