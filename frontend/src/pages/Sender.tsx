import { useEffect, useRef, useState } from "react"

export default function Sender(){

    const [socket , setSocket] = useState<WebSocket | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(()=>{
        const socket = new WebSocket('ws://localhost:8080')
    
        socket.onopen = () => {
            socket.send(JSON.stringify({type:'sender'}))
        }

       setSocket(socket)       

    },[])

    async function startSendingVideo(){

        const stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true})
        setStream(stream)

        if(!socket){
            return
        }

        const pc = new RTCPeerConnection();
        stream.getTracks().forEach(track => pc?.addTrack(track, stream));
          
        
        pc.onnegotiationneeded = async() => { 
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer)
            socket?.send(JSON.stringify({type:'createOffer', sdp:pc.localDescription}))
        }

        pc.onicecandidate = (event) => {
            if(event.candidate){
                socket?.send(JSON.stringify({type:'iceCandidate', candidate:event.candidate}))
            }
        }

        socket.onmessage = async (event) => {

            const message = JSON.parse(event.data)

            if(message.type === 'answerOffer'){
                await pc.setRemoteDescription(message.sdp)
            }
            else if(message.type === 'iceCandidate'){
                await pc.addIceCandidate(message.candidate)
            }

        }

    }
    useEffect(()=>{
        console.log(stream?.getVideoTracks())
        if(remoteVideoRef.current && stream){
          remoteVideoRef.current.srcObject = stream 
        }
      },[stream])


    return(
        <>
         <button onClick={startSendingVideo}>Start the call</button>
         {/* <video autoPlay ref={remoteVideoRef} playsInline  style={{width:"300px" , height:'300px'}}/> */}
        </>
    )
}