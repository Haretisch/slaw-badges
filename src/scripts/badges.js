class Badges {
  constructor() {
    this.commentClassName = CHAT_ONLY ? ['message-line'] : ['chat-line__message', 'chat-line__subscribe'];

    chat.registerListener('badges', this.listener.bind(this));
  }

  destructor() {
    //Destructors aren't really a thing in js, but /shrug
    chat.unregisterListener('badges');
  }

  addBadges(container, user){
    container = this.findBadgeContainer(container);
    let badge = system.extension.getURL('src/assets/badges/' + user.house + '/');
    let position = 'afterBegin';

    if(container.classList.contains('viewer-card__banner')){
      position = 'beforeEnd';
    }

    this.prependBadge(container, badge, user.title, position);
  }

  badge(badge, title) {
    return ''
      + '<div class="tw-tooltip-wrapper tw-inline viewer-card-drag-cancel' + (CHAT_ONLY ? ' float-left' : '') + '" data-a-target="chat-badge">'
        + '<img alt="' + title + '" class="chat-badge" src="' + badge + '18.png" srcset="' + badge + '18.png 1x, ' + badge + '36.png 2x, ' + badge + '72.png 4x">'
        + '<div class="tw-tooltip tw-tooltip--up tw-tooltip--align-left" data-a-target="tw-tooltip-label" style="margin-bottom: 0.9rem;">' + title + '</div>'
      + '</div>'
    ;
  }

  findBadgeContainer(container) {
    if(container.classList.contains('viewer-card__banner')){
      return container;
    }

    if(CHAT_ONLY){
      return container.querySelectorAll('.badges')[0];
    }

    let spanList = container.querySelectorAll('span');
    container = spanList[0];

    if (spanList[0].classList.contains('chat-line__timestamp')) {
        container = spanList[1];
    }

    return container;
  }

  getUserInfo(comment){
    let subMessage;
    if(subMessage = comment.querySelector('.chat-line__subscribe--message')){
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
    this.userBadge(mutation);
    this.userCard(mutation);
  }

  prependBadge(container, badge, title, position = 'afterbegin'){
    let newBadge = this.badge(badge, title);

    //Also find sub badge and move it to first position (second after house badge), just to make things prettier
    let subBadge = container.querySelector('a[href*="/subscribe?ref=in_chat_subscriber_link"]');
    if(subBadge){
      container.prepend(subBadge);
    }

    container.insertAdjacentHTML(position, newBadge);
  }

  userBadge(mutation) {
    //Only want to add badges to actual user messages, not system alerts or w/e;
    let classList = mutation.addedNodes[0].classList;
    if(classList && classList.value.containsOneOf(this.commentClassName)){
      if(!CHAT_ONLY || !classList.contains('admin')){
        this.getUserInfo(mutation.addedNodes[0]);
      }
    }
  }

  userCard(mutation) {
    let banner;
    if(mutation.addedNodes[0].classList.value.containsOneOf(['viewer-card', 'viewer-card-layer__draggable'])
      && (banner = mutation.addedNodes[0].querySelector('.viewer-card__banner'))
    ){
      //let banner = mutation.addedNodes[0].querySelector('.viewer-card__banner');
      let username = banner.querySelector('.viewer-card__display-name a').innerText;

      users.load({username: username.toLowerCase(), UserName: username}, this.addBadges.bind(this, banner));
    }
  }
}
