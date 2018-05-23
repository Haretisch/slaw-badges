class Emotes {
  constructor() {
    this.commentClassName = CHAT_ONLY ? ['message-line'] : ['chat-line__message', 'chat-line__subscribe'];
    this.messageTextSelector = CHAT_ONLY ? '.message' : 'span[data-a-target="chat-message-text"]';
    this.emotes = [ //Emotes should be available in 3 sizes, 28, 56 and 112 pixels-squared
      'GC', 'GCHD',
      'LS', 'LSHD',
      'IB', 'IBHD',
      'sirsChallenge',
    ];
    this.channelEmotes = {
      'sirsLove': '793552',
    };
    this.template = CHAT_ONLY
      ? '<span class="balloon-wrapper">'
           + '<img src="URL28.png" srcset="URL56.png 2x" alt="TITLE" class="emoticon" />'
           + '<div class="balloon balloon--tooltip balloon--up balloon--center mg-t-1">TITLE</div>'
        + '</span>'

      //ELSE (Skip the javascript on-hover-transformation and just output the transformed markup. Added .slaw-extension so the tooltip only shows on hover)
      : '<div class="tw-tooltip-wrapper tw-inline slaw-extension" data-a-target="emote-name">'
        + '<img class="chat-image chat-line__message--emote tw-inline-block"'
          + ' src="URL28.png"'
          + ' srcset="URL28.png 1x, URL56.png 2x,URL112.png 4x"'
          + ' alt="TITLE"'
        + ' />'
        + '<div class="tw-tooltip tw-tooltip--up tw-tooltip--align-center" data-a-target="tw-tooltip-label" role="tooltip" style="margin-bottom: 0.9rem" >TITLE</div>'
      + '</div>'
    ;

    chat.registerListener('emotes', this.listener.bind(this));
  }

  destructor() {
    //Destructors aren't really a thing in js, but /shrug
    chat.unregisterListener('emotes');
  }

  convertEmotes(message) {
    let messageText = message.querySelectorAll(this.messageTextSelector);
    messageText.forEach (mt => {
      let text = mt.innerHTML;

      this.emotes.map( e => {
        let pattern = new RegExp("\\b" + e + "\\b", 'g');
        text = text.replace(pattern, this.getTemplate.bind(this));
      });
      mt.innerHTML = text;
    });
  }

  forceChannelEmote(emoteTitle) {
    const emoteId = this.channelEmotes[emoteTitle];
    return this.template.replace(/(URL\d+\.png)|(TITLE)/g, m => {
      if(m === 'TITLE') {
        return emoteTitle;
      }
      let zoom = '1.0';
      if(m.includes('56')) zoom = '2.0';
      if(m.includes('112')) zoom = '3.0';
      return `https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/${zoom}`
    });
  }

  getTemplate(match) {
    return this.template.replace(/(URL)|(TITLE)/g, m => {
      if(m === 'URL') {
        return system.extension.getURL(`src/assets/emotes/${match}/`);
      }
      return match;
    });
  }

  listener(mutation) {
    //Only want to use emotes with actual user messages, not system alerts or w/e;
    if(mutation.addedNodes[0].classList && mutation.addedNodes[0].classList.value.containsOneOf(this.commentClassName)){
      if(!CHAT_ONLY || !mutation.addedNodes[0].classList.contains('admin')){
        this.convertEmotes(mutation.addedNodes[0]);
      }
    }
  }
}
