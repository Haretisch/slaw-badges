class Badges {
  constructor() {
    // Prepare to observe/listen to mutations in the DOM and react to them;
    this.twitchObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        // When a big change in the page happens (usually navigation),
        //  recheck if we want to observeChat
        if(elementIdentifier(mutation.target) === "div.tw-full-height.tw-flex.tw-flex-nowrap.tw-relative"){
          this.observeChat();
        }
      });
    });

    // Prepare to observe/listen to mutations in the chatbox and react to them;
    this.chatObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if(mutation.type === 'childList' && mutation.addedNodes.length === 1){
          //Only want to add badges to actual user messages, not system alerts or w/e;
          if(mutation.addedNodes[0].classList && mutation.addedNodes[0].classList.contains('chat-line__message')){
            this.getUserInfo(mutation.addedNodes[0]);
          }
        }
      });
    });

    // manifest.json's `run_at` declaration acts as a DOM ready listener
    //  when set to "document_end" so the whole script in run only then
    //console.log('Loading...');
    this.users = new Users();

    //Start observing twitch
    this.twitch = document.querySelectorAll("#root div div")[0];
    this.twitchObserver.observe(this.twitch, {childList: true, subtree: true});

    this.chat;
    this.observeChat();
  }

  observeChat(){
    // Listen for children (add/remove) mutations only: {childList: true}
    //  If we are on Slaw's page
    this.chat = document.querySelectorAll(".chat-list__lines .simplebar-scroll-content .simplebar-content .tw-full-height")[0]
    if(this.chat && window.location.pathname.includes('sirslaw')){
      //console.log('SlawBadges loaded');
      this.chatObserver.observe(this.chat, {childList: true});
    }
  }

  getUserInfo(comment){
    const username = comment.querySelectorAll('.chat-author__display-name')[0].innerHTML.toLowerCase();
    this.users.load(username, this.addBadges.bind(this, comment));
  }

  addBadges(comment, user){
    const badgeContainer = this.findBadgeContainer(comment);
    const houseBadge = system.extension.getURL('src/assets/'+user.house+'.png')
    this.prependBadge(badgeContainer, houseBadge, user.title)

    //if(!!user.hc){
    //  const cupBadge = system.extension.getURL('src/assets/hc.png')
    //  this.prependBadge(badgeContainer, cupBadge, 'House cup!');
    //}
  }

  findBadgeContainer(comment) {
    let spanList = comment.querySelectorAll('span'),
      container = spanList[0];

    if (spanList[0].classList.contains('chat-line__timestamp')) {
        container = spanList[1];
    }

    return container;
  }

  prependBadge(container, badge, title){
    const newBadge =
      '<div class="tw-tooltip-wrapper tw-inline" data-a-target="chat-badge">'
        +'<img alt="'+title+'" class="chat-badge" src="'+badge+'">'
        +'<div class="tw-tooltip tw-tooltip--up tw-tooltip--align-left" data-a-target="tw-tooltip-label" style="margin-bottom: 0.9rem;">'+title+'</div>'
      +'</div>'
    ;

    container.insertAdjacentHTML('afterbegin', newBadge);
  }
}
