const socket = io('/')
const videoGrid = document.getElementById('Dish')
const peer = new Peer()
let myVideoStream;
let screenStream;
const myVideo = document.createElement('video')
const myScreen = document.createElement('video')
myVideo.muted = true;
let peerInstance;
let screenSharing = false;
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)
})



peer.on('call', call => {
    call.answer(myVideoStream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
        console.log("came in ");
        peerInstance = call
    })
})


socket.on('user-connected', userId => {
    connectToNewUser(userId, myVideoStream)
})
// input value
let message = $("input");
// when press enter send message

$('html').keydown(function (e) {
    if (e.which == 13 && message.val().length !== 0) {
        socket.emit('send-message', message.val());
        $(".messages").append(`
        <div class="message my-message">${message.val()}</div>`);
        message.val('')
    }
});

socket.on("receive-message", data => {
    console.log("message received in frontend")
    $(".messages").append(`
    <div class="message other-message">
        <span style="font-size: 0.7rem; color: rgb(0, 0, 0, 0.4)">${data.by}</span><br>
        ${data.message}
    </div>
    `);
    scrollToBottom()
})


socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peerInstance = call

    peers[userId] = call
}


// const shareUnshare = () => {
    

// }


function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    const videoDiv = document.createElement('div')
    videoDiv.classList.add("videoWrapper")
    
    videoDiv.append(video)
    videoGrid.append(videoDiv)
    
    var allVideos = document.querySelectorAll('.videoWrapper')
    var n = allVideos.length
    var rows = Math.ceil(n / 3);
    var columns = Math.min(3, n)
    var width = `${95 / columns}%`
    var height = `${95 / rows}%`
    console.log(n);
    allVideos.forEach(item => {
        item.style.width = width;
        item.style.height = height;
    })
}



const scrollToBottom = () => {
    var d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
  `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video"></i>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
  <i class="stop fas fa-video-slash"></i>
  `
    document.querySelector('.main__video_button').innerHTML = html;
}


const toggleChat = () => {
    $('.chat').toggleClass("bring-in")
}