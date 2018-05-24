class Commands {
  constructor() {
    this.usernameHolder = 'div.top-nav-user-menu__username p';
    this.username;
    this.commands = {
      '!giftlink': this.giftlink.bind(this),
      '!merch': this.sirslawtv.bind(this, 'merch'),
      '!mercheu': this.sirslawtv.bind(this, 'merch/eu'),
      '!tip': this.sirslawtv.bind(this, 'tip'),
      '!twitter': this.sirslawtv.bind(this, 'twitter'),
      '!instagram': this.sirslawtv.bind(this, 'instagram'),
      '!podcast': this.sirslawtv.bind(this, 'podcast'),
      '!slawcast': this.sirslawtv.bind(this, 'podcast'),
      '!charity' : this.stjudelink.bind(this),
    };
  }

  destructor() {
    chat.unregisterListener('commands');
  }

  disconnect() {
    this.destructor();
  }

  initialize() {
    //Check if user is logged in, or if we can get the username at all
    let username = document.querySelector(this.usernameHolder);
    if(username){
      this.username = username.innerText.toLowerCase();
      chat.registerListener('commands', this.listener.bind(this));
    }
  }

  listener(mutation) {
    if(mutation.addedNodes[0].classList) {
      const comment = mutation.addedNodes[0];
      const isSystemMessage = () => comment.classList.contains('admin') || !comment.classList.contains('chat-line__message');
      const postedByCurrentUser = () => comment.querySelector('.chat-author__display-name').innerText.toLowerCase() === this.username;
      const hasMessageText = () => !!comment.querySelector('span[data-a-target=chat-message-text]');
      const isUserCommand = () => comment.querySelector('span[data-a-target=chat-message-text]').innerText.substring(0, 1) === '!';

      if(!isSystemMessage() && postedByCurrentUser() && hasMessageText() && isUserCommand()) {
        let args = comment.querySelector('span[data-a-target=chat-message-text]').innerText.split(' ');
        let command = args.splice(0, 1).join().toLowerCase();

        if(command in this.commands) {
          this.commands[command](args);
        }
      }
    }
  }

  giftlink([giftee]) {
    if(typeof giftee === 'string') {
      system.runtime.sendMessage({
        action: 'newTab',
        target: `https://www.twitch.tv/products/sirslaw/ticket?no-mobile-redirect=true&recipient=${giftee}`,
      });
    }
  }

  sirslawtv(path/*, [...args]*/) {
    if(typeof path === 'string') {
      system.runtime.sendMessage({
        action: 'newTab',
        target: `https://sirslaw.tv/${path}?utm_source=twitchBrowserExtension`,
      });
    }
  }

  stjudelink() {
    system.runtime.sendMessage({
      action: 'newTab',
      target: 'https://tiltify.com/@sirslaw/sirslaws-charity-event-may-2018/donate'
    });
  }
}
