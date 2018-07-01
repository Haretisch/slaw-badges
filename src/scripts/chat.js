class Chat {
  constructor() {
    this.listeners = [
      //{id: unique_listener_id, callback: callback_function()}
    ]
    this.chatIdentifier = ".chat-list__lines .simplebar-scroll-content .simplebar-content .tw-full-height";

    this.chatObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if(mutation.type === 'childList' && mutation.addedNodes.length === 1){
          this.listeners.map(l => {
            l.callback(mutation);
          });
        }
      });
    });

    this.chat;
    this.observeChat();
  }

  disconnect() {
    this.chatObserver.disconnect();
  }

  observeChat() {
    this.waitForMarkup().then(chat => {
      // Listen for children (add/remove) mutations only: {childList: true}
      //  If we are on Slaw's page
      if(window.location.pathname.includes(STREAMER)){
        this.chatObserver.observe(chat, {childList: true});
        this.chatObserver.observe(document.querySelector(".viewer-card-layer"), {childList: true, subtree: true});
      }
    });

    this.registerListener('cleanupGreetings', this.cleanupGreetings);
  }

  registerListener(id, callback) {
    let i = this.listeners.findIndex(e => {return e.id === id});
    if(i > -1) {
      this.listeners[i].callback = callback;
    } else {
      this.listeners.push({id, callback});
    }
  }

  unregisterListener(id) {
    this.listeners = this.listeners.filter(l => l.id !== id);
  }

  greet(username) {
    system.storage.sync.get('slaw_enableChubTracker', data => {
      if(('slaw_enableChubTracker' in data) ? data.slaw_enableChubTracker : true) {
        let message = ''
          + '<div class="tw-mg-y-05 tw-pd-r-2 tw-pd-y-05 user-notice-line slaw-greet">'
            + '<div class="tw-c-text-alt-2">'
              + `<span class="tw-c-text tw-strong">${username}</span> is new here. Show them some ${emotes.forceChannelEmote('sirsLove')}!`
            + '</div>'
          + '</div>'
        ;

        document.querySelector('.simplebar-content div[role=log]').insertAdjacentHTML('beforeEnd', message);
      }
    });
  }

  cleanupGreetings() {
    let chatList = document.querySelector('.chat-list__lines div[role="log"]');
    if(chatList.childNodes.length >= 149) {
      let oldestMessage = chatList.firstChild;
      if(oldestMessage && oldestMessage.classList.contains('slaw-greet')) {
        oldestMessage.remove();
      }
    }
  }

  waitForMarkup() {
    return new Promise(resolve => {
      const wait = () => {
        let elm = document.querySelector(this.chatIdentifier);
        if(elm) {
          resolve(elm);
        } else {
          window.requestAnimationFrame(wait);
        }
      };
      wait();
    });
  }
}
