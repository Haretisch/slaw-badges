class Events {
  constructor(socketBuilder, ) {
    this.socketBuilder = socketBuilder;
  }

  initialize(pointsObj) {
    this.creatureSocket(pointsObj.apiSocket);
    this.houseRaidsSocket(pointsObj.apiSocket);
  }

  creatureSocket(apiSocket) {
    if (!this.creatureChannel) {
      console.log('here')
      this.creatureChannel = SlawAPI.channelConnect(
        apiSocket,
        'creature', // Channel Key
        {username: this.username}, // Channel parameters
        { // Channel callbacks
          update: {
            path: 'creature_attack:points:current',
            func: this.updateCreatureAttackBoard.bind(this),
          },
        }
      );
    }
  }

  houseRaidsSocket(apiSocket) {
    if (!this.houseRaidsChannel) {
      console.log('here')
      this.houseRaidsChannel = SlawAPI.channelConnect(
        apiSocket,
        'house_raids', // Channel Key
        {username: this.username}, // Channel parameters
        { // Channel callbacks
          update: {
            path: 'house_raids:points:current',
            func: this.updateCreatureAttackBoard.bind(this),
          },
          end: {
            path: 'house_raids:events:end',
            func: this.updateCreatureAttackBoard.bind(this),
          }
        }
      );
    }
  }

  updateCreatureAttackBoard(body) {
    console.log('here in update attack board')
    console.log(body)
  }
}
