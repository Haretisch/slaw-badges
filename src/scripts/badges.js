class Badges {
  constructor() {
    this.commentClassName = CHAT_ONLY ? ['message-line'] : ['chat-line__message', 'chat-line__subscribe'];

    chat.registerListener('badges', this.listener.bind(this));
  }

  destructor() {
    //Destructors aren't really a thing in js, but /shrug
    chat.unregisterListener('badges');
  }

  addBadges(comment, user){
    const badgeContainer = this.findBadgeContainer(comment);
    const houseBadge = system.extension.getURL('src/assets/badges/' + user.house + '/');
    //TODO refactor this part to get the url for each badge formats: 18, 36, 72
    this.prependBadge(badgeContainer, houseBadge, user.title);

    //if(!!user.hc){
    //  const cupBadge = system.extension.getURL('src/assets/hc.png')
    //  this.prependBadge(badgeContainer, cupBadge, 'House cup!');
    //}
  }

  findBadgeContainer(comment) {
    if(CHAT_ONLY){
      return comment.querySelectorAll('.badges')[0];
    }

    let spanList = comment.querySelectorAll('span'),
      container = spanList[0];

    if (spanList[0].classList.contains('chat-line__timestamp')) {
        container = spanList[1];
    }

    return container;
  }

  getUserInfo(comment){
    let subMessage;
    if(subMessage = comment.querySelector('chat-line__subscribe--message')){
      comment = subMessage;
    }

    let selector = CHAT_ONLY ? '.from' : '.chat-author__display-name';
    let holder;
    if(holder = comment.querySelectorAll(selector)[0]){
      const username = comment.querySelectorAll(selector)[0].innerText;
      users.load({username: username.toLowerCase(), UserName: username}, this.addBadges.bind(this, comment));
    }
  }

  listener(mutation) {
    //Only want to add badges to actual user messages, not system alerts or w/e;
    if(mutation.addedNodes[0].classList && mutation.addedNodes[0].classList.value.containsOneOf(this.commentClassName)){
      if(!CHAT_ONLY || !mutation.addedNodes[0].classList.contains('admin')){
        this.getUserInfo(mutation.addedNodes[0]);
      }
    }
  }

  prependBadge(container, badge, title){
    const newBadge = //TODO add srcset=""
      '<div class="tw-tooltip-wrapper tw-inline' + (CHAT_ONLY ? ' float-left' : '') + '" data-a-target="chat-badge">'
        + '<img alt="' + title + '" class="chat-badge" src="' + badge + '18.png" srcset="' + badge + '18.png 1x, ' + badge + '36.png 2x, ' + badge + '72.png 4x">'
        + '<div class="tw-tooltip tw-tooltip--up tw-tooltip--align-left" data-a-target="tw-tooltip-label" style="margin-bottom: 0.9rem;">' + title + '</div>'
      + '</div>'
    ;

    //Also find sub badge and move it to first position (second after house badge), just to make things prettier
    let subBadge = container.querySelector('a[href*="/subscribe?ref=in_chat_subscriber_link"]');
    if(subBadge){
      container.prepend(subBadge);
    }

    container.insertAdjacentHTML('afterbegin', newBadge);
  }
}
