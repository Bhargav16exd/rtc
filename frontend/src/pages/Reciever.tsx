import { useEffect, useRef, useState} from "react"


export default function Reciever(){

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<any>(null)

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
    console.log(stream)
    if(remoteVideoRef.current && stream){
      remoteVideoRef.current.srcObject = stream
    } 
  },[stream])

  function audioPlay(){
    //@ts-ignore
    remoteVideoRef.current.muted = false
  }

 
    return(
        <>

         <div style={{width:"100vh" , height:'100wv'}}>

           <Video remoteVideoRef={remoteVideoRef} stream={stream} audioPlay={audioPlay} /> 
         
         </div>
        </>
    )
}

function Video({stream , remoteVideoRef , audioPlay }:any){

  return<>{
    stream ? 
    <div>
     <video autoPlay ref={remoteVideoRef} muted style={{width:"400px" , height:'400px'}}/> 
     <button onClick={audioPlay}>Connect the audio </button>
    </div>
      : <>Nothing to load</>} 
    
    </>
}