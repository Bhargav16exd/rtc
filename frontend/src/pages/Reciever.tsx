import { useEffect, useRef, useState} from "react"
import ReactPlayer from "react-player";

export default function Reciever(){

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(()=>{

    let pc : RTCPeerConnection | null = null
   const socket = new WebSocket('ws://localhost:8080')

    socket.onopen = () => {
        socket.send(JSON.stringify({type:'reciever'}))
    }

    socket.onmessage = async (event) => {
      
      const message = JSON.parse(event.data)
      
      if(message.type == 'createOffer'){

        pc = new RTCPeerConnection();
        pc.setRemoteDescription(message.sdp)


        pc.onicecandidate = (event) => {
          if(event.candidate){
              socket?.send(JSON.stringify({type:'iceCandidate', candidate:event.candidate}))
          }
        }


        pc.ontrack = (event) => {
          
          if(event.streams && event.streams[0]){
            setStream(event.streams[0])
            
          }
        }

        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer) 
        socket?.send(JSON.stringify({type:'answerOffer',sdp:pc.localDescription}))


      }else if( message.type == 'iceCandidate'){
        // @ts-ignore
        pc?.addIceCandidate(message.candidate)
      }

    }




  },[])


  useEffect(()=>{

    console.log(stream?.getVideoTracks())

    if(remoteVideoRef.current && stream){
      remoteVideoRef.current.srcObject = stream
      remoteVideoRef.current.muted = false
    }
  },[stream])



    return(
        <>

         {
          stream ? <video autoPlay ref={remoteVideoRef}  playsInline style={{width:"300px" , height:'300px'}}/> : <>Nothing to load</>
         }
          

        </>
    )
}