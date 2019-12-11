class Emotes {
  constructor() {
    this.commentClassName = ['chat-line__message', 'chat-line__subscribe'];
    this.messageTextSelector = 'span[data-a-target="chat-message-text"]';
    this.emotes = [ //Emotes should be available in 3 sizes, 28, 56 and 112 pixels-squared
      'GC', 'GCHD',
      'LS', 'LSHD',
      'IB', 'IBHD',
      'sirsChallenge',
      'sirsMiss',
      'sirsFab1', 'sirsFab2', 'sirsLips1', 'sirsLips2',
      'sirsFab',
      'sirsLips',
      'sirsFab3', 'sirsFab4', 'sirsLips3', 'sirsLips4',
      'sirsSun',
      'sirsPromises',
      'sirsLine',
      'sirsChub',
      'sirsLezah',
    ];
    this.channelEmotes = {
      'sirsLove': '793552',
    };
    this.template =
      '<div class="tw-tooltip-wrapper tw-inline slaw-extension" data-a-target="emote-name">'
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

  fillTemplate(tmpl, emote) {
    return tmpl.replace(/(URL)|(TITLE)/g, m => {
      if(m === 'URL') {
        return system.extension.getURL(`src/assets/emotes/${emote}/`);
      }
      return emote;
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
    return this.fillTemplate(this.template, match);
  }

  initialize() {
    this.waitForMarkup("button[aria-label='Emote picker']").then(emoteButton => {
      emoteButton.onclick = this.insertList.bind(this);
    });
  }

  insertList() {
    if(document.querySelector("#slawmotes")) {return;}

    this.waitForMarkup(".emote-picker__content-block").then(emotesList => {
      emotesList.insertAdjacentHTML('afterEnd', ''
        + '<div id="slawmotes" class="emote-picker__content-block">'
          + '<div class="tw-pd-b-1 tw-pd-t-05 tw-pd-x-1 tw-relative">'
            + '<div class="emote-grid-section__header-title tw-align-items-center tw-flex tw-pd-x-1 tw-pd-y-05">'
              + '<p class="tw-align-middle tw-c-text-alt tw-strong">Cult Emotes</p>'
           + '</div>'
            + '<div id="slawmotes-list" class="tw-flex tw-flex-wrap"></div>'
          + '</div>'
        + '</div>'
      );

      const listHolder = document.querySelector("#slawmotes-list");
      this.emotes.forEach(e => {
        listHolder.insertAdjacentHTML('beforeEnd', this.fillTemplate(''
          + '<div class="tw-pd-x-05">'
            + '<div class="emote-button">'
              + '<div class="tw-inline-flex tw-relative tw-tooltip-wrapper">'
                + '<button data-test-selector="emote-button-clickable" class="emote-button__link tw-align-items-center tw-flex tw-justify-content-center" aria-label="TITLE" name="TITLE" data-a-target="TITLE">'
                  + '<figure>'
                    + '<img class="emote-picker__emote-image tw-image" alt="TITLE" srcset="URL28.png 1.0x, URL56.png 2.0x, URL112.png 3.0x" src="URL28.png">'
                  + '</figure>'
                + '</button>'
                + '<div class="tw-tooltip tw-tooltip--align-center tw-tooltip--down" data-a-target="tw-tooltip-label" role="tooltip">TITLE</div>'
              + '</div>'
            + '</div>'
          + '</div>', e)
        );
      });

      document.querySelectorAll("#slawmotes button").forEach(button => {
        button.onclick = () => {
          const emoteName = button.getAttribute('name');
          const TA = document.querySelector("textarea[data-a-target='chat-input']");
          const curMessage = TA.value;
          let c = curMessage.slice(-1);

          TA.value += (c && c !== " ") ? ` ${emoteName} ` : `${emoteName} `;

          // Properly dispatch event to react's state;
          let event = new Event('input', {bubbles: true});
          event.simulated = true;
          let tracker = TA._valueTracker;
          if(tracker) {
            tracker.setValue(TA.value);
          }
          TA.dispatchEvent(event);
        }
      });
    });
  }

  listener(mutation) {
    //Only want to use emotes with actual user messages, not system alerts or w/e;
    if(mutation.addedNodes[0].classList && mutation.addedNodes[0].classList.value.containsOneOf(this.commentClassName)){
      if(!mutation.addedNodes[0].classList.contains('admin')){
        this.convertEmotes(mutation.addedNodes[0]);
      }
    }
  }

  waitForMarkup(selector) {
    return new Promise(resolve => {
      const wait = () => {
        let markup = document.querySelector(selector);
        ;
        if(markup) {
          resolve(markup);
        } else {
          window.requestAnimationFrame(wait);
        }
      };
      wait();
    });
  }
}
