class Badges {
  constructor() {
    this.commentClassName = CHAT_ONLY ? 'message-line' : 'chat-line__message';

    chat.registerListener('badges', this.listener.bind(this));
  }

  destructor() {
    //Destructors aren't really a thing in js, but /shrug
    chat.unregisterListener('badges');
  }

  addBadges(comment, user){
    const badgeContainer = this.findBadgeContainer(comment);
    const houseBadge = system.extension.getURL('src/assets/' + user.house + '.png')
    this.prependBadge(badgeContainer, houseBadge, user.title)

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
    let selector = CHAT_ONLY ? '.from' : '.chat-author__display-name';
    const username = comment.querySelectorAll(selector)[0].innerText.toLowerCase();
    users.load(username, this.addBadges.bind(this, comment));
  }

  listener(mutation) {
    //Only want to add badges to actual user messages, not system alerts or w/e;
    if(mutation.addedNodes[0].classList && mutation.addedNodes[0].classList.contains(this.commentClassName)){
      if(!CHAT_ONLY || !mutation.addedNodes[0].classList.contains('admin')){
        this.getUserInfo(mutation.addedNodes[0]);
      }
    }
  }

  prependBadge(container, badge, title){
    const newBadge =
      '<div class="tw-tooltip-wrapper tw-inline' + (CHAT_ONLY ? ' float-left' : '') + '" data-a-target="chat-badge">'
        + '<img alt="' + title + '" class="chat-badge" src="' + badge + '">'
        + '<div class="tw-tooltip tw-tooltip--up tw-tooltip--align-left" data-a-target="tw-tooltip-label" style="margin-bottom: 0.9rem;">' + title + '</div>'
      + '</div>'
    ;

    container.insertAdjacentHTML('afterbegin', newBadge);
  }
}
