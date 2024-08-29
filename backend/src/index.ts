import { WebSocket } from "ws";

const wss = new WebSocket.Server({port:8080})

let senderSocket : null | WebSocket = null 
let recieverSocket : null | WebSocket = null 

wss.on("connection",function connection(ws){


    ws.on('message',function connection(data:any){

        const message = JSON.parse(data)

        if(message.type === 'sender'){
            senderSocket = ws 
            console.log('sender connected')
        }
        else if(message.type === 'reciever'){
            recieverSocket = ws 
            console.log('reciever connected')
        }
        else if(message.type === 'createOffer'){
            if(ws!== senderSocket){
                return
            }

            recieverSocket?.send(JSON.stringify({type:'createOffer',sdp:message.sdp}))
            console.log('offer sent')
        }
        else if(message.type === 'answerOffer'){
            if(ws!== recieverSocket){
                return
            }

            senderSocket?.send(JSON.stringify({type:'answerOffer',sdp:message.sdp}))
            console.log('answer sent')
        }
        else if(message.type === 'iceCandidate'){

            if(ws === senderSocket){
               console.log('ice candidate from sender',message.candidate)
              recieverSocket?.send(JSON.stringify({type:'iceCandidate',candidate:message.candidate}))
            }
            else if( ws == recieverSocket){
                console.log('ice candidate from reciever',message.candidate)
                senderSocket?.send(JSON.stringify({type:'iceCandidate',candidate:message.candidate}))
            }
        }
        

    })

})