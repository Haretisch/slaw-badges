class App {
  channelIds = [
    106798225, // SirSlaw
  ];

  constructor({ cid, cname, uid, uname }, system) {
    this.system = system;

    this.cid = cid;
    this.cname = cname;
    this.uid = uid;
    this.uname = uname;

    this.board;
    this.chat;
    this.user;

    // Check if channel is setup for extension use
    if (this.channelIds.includes(cid)) {
      this.chat = new Chat(this);
      this.user = new User(this);
      this.board = new Board(this);
    }
  }

  destruct() {
    this.cid = null;
    this.cname = null;
    this.uid = null;
    this.uname = null;

    //this.board.destruct();
    //this.chat.destruct();
    this.user.destruct();

    this.board = null;
    this.chat = null;
    this.user = null;
  }
}
