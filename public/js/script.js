const socket = io('/')
const videoGrid = document.getElementById('Dish')
const peer = new Peer()
let myVideoStream;
const myVideo = document.createElement('video')
const myScreen = document.createElement('video')
myVideo.muted = true;
let peerInstance;
let screenSharing = false;
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream)
})



peer.on('call', call => {
    call.answer(myVideoStream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream, call.peer)
        console.log("came in ");
        peerInstance = call
        peers[call.peer] = call
    })
})


socket.on('user-connected', remoteID => {
    connectToNewUser(remoteID, myVideoStream)
})

socket.on('screen-shared', screenID => {
    console.log("connecting to new user");
    connectToNewUser(screenID, myVideoStream)
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


socket.on('user-disconnected', remoteID => {

    if (peers[remoteID]) peers[remoteID].close()

    if(remoteID){
        var remoteVideo = document.getElementById(remoteID)
        remoteVideo.remove(); 
        resizeVideoWrappers();
    }

})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(remoteID, stream) {
    const call = peer.call(remoteID, stream)
    peers[remoteID] = call
    const video = document.createElement('video')
    call.on('stream', remoteVideoStream => {
        addVideoStream(video, remoteVideoStream, remoteID)
    })
    call.on('close', () => {
        video.remove()
    })

    peerInstance = call

}


function resizeVideoWrappers(){
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


function addVideoStream(video, stream, remoteID) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    const videoDiv = document.createElement('div')
    videoDiv.classList.add("videoWrapper")
    videoDiv.setAttribute('id', remoteID)
    
    videoDiv.append(video)
    videoGrid.append(videoDiv)
    resizeVideoWrappers();

}

const endCall = () => {
    if(confirm("Are you sure to end this call?")) {
        socket.emit('end-call');
        window.location = '/'
    }
}



const scrollToBottom = () => {
    var d = $('.main-chat_window');
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
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}


const setUnmuteButton = () => $('.mic').html('mic_off')
const setMuteButton = () => $('.mic').html('mic')
const setStopVideo = () => $('.videocam').html('videocam')
const setPlayVideo = () => $('.videocam').html('videocam_off')
const setStopShareScreen = () => $('.shareUnshare').html('stop_screen_share')
const setShareScreen = () => $('.shareUnshare').html('screen_share')
const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        $('.copy').html('check_circle');
        setTimeout(() => {$('.copy').html('content_copy')}, 2000);
        
    });
}

const toggleChat = () => {
    $('.chat').toggleClass("bring-in")
}

const toggleWhiteboard = () => {
    $('.whiteboard-wrapper').toggleClass("bring-in")

}