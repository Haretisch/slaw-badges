class Chat {
  constructor() {
    this.loaded = false;
    this.listeners = [
      //{id: unique_listener_id, callback: callback_function()}
    ]

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
    // Listen for children (add/remove) mutations only: {childList: true}
    //  If we are on Slaw's page
    this.chat = CHAT_ONLY
      ? document.querySelectorAll("ul.chat-lines")[0]
      : document.querySelectorAll(".chat-list__lines .simplebar-scroll-content .simplebar-content .tw-full-height")[0]
    ;
    console.log(this.chat);
    if(!this.loaded && this.chat && window.location.pathname.includes(STREAMER)){
      this.chatObserver.observe(this.chat, {childList: true});
      this.loaded = CHAT_ONLY;
    }
  }

  registerListener(id, callback) {
    this.listeners.push({id, callback});
  }

  unregisterListener(id) {
    this.listeners = this.listeners.filter(l => l.id !== id);
  }
}

