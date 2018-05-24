// "wss://api.sirslaw.com/socket"
// "ws://localhost:4000/socket"
// "wss://sir-slaw-test-api.herokuapp.com/socket"

class NewApiSocket {
  constructor() {
    this.currentSocket = this.currentSocket.bind(this)
  }

  currentSocket(username) {
    if (this.currentApiSocket) { return this.currentApiSocket }
    //console.log("what are we even?")
    let socket = new Socket("wss://api.sirslaw.com/socket",
      {
        params: {user: username || ''}
      }
    )

    let connected = false
    socket.connect();
    socket.onOpen( () => {
      connected = true
      //console.log("Websockets opened...")
    })
    socket.onClose( (event) => {
      //console.log("close")
      connected = false
      //console.log(event)
    })
    socket.onError( (arg) => {
      console.log("socket error")
      console.log(arg)
    })
    this.currentApiSocket = socket;
    return socket
  }
}
