
const screenPeer = new Peer()
let screenStream = null;
let screenID;


screenPeer.on('open', id => {
    screenID = id;
})

let sharingScreen = false

function shareUnshare(){
    if(sharingScreen === true){
        console.log("came in screen disconnected");
        screenPeer.disconnect();
        screenSharing = false;
    }
    else{
        console.log("came in sharing");
        var displayMediaOptions = {
            video: {
                cursor: "always"
            },
            audio: false
        };

        
        navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
        .then(function (stream) {
            socket.emit('join-room', ROOM_ID, screenID)
            // console.log("i am screenpeer");
            screenPeer.on('call', call => {
                // console.log("i am screen and i answer call here");
                call.answer(stream)
            }) 
        });

        sharingScreen = true;


    }
}