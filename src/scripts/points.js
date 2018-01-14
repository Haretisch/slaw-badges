class Points {
  constructor() {
    this.id = 'slaw-badges-points';
    this.chatOnly = context === 'chat';
    this.userNameHolder = 'div.top-nav-user-menu__username p';
    this.chatButtonsContainerIdentifier = context === 'chat'
      ? "div.js-chat-buttons.chat-buttons-container.clearfix"
      : "div.chat-input__buttons-container > .tw-flex"
    ;
    this.username;
    this.interval;
  }

  initialize() {
    //Only initialize if we can't find the added markup
    if(document.querySelectorAll('#' + this.id)[0]){
      return;
    }
    if(this.chatOnly){
      //For now this Slaw's place. Since we can't confirm who's accessing this page assume it's him and show all houses' points.
      // TODO  GET ALL THE POINTS
    }else{
      this.username = document.querySelectorAll(this.userNameHolder)[0].innerText.toLowerCase();
      document.querySelectorAll(this.chatButtonsContainerIdentifier)[0].insertAdjacentHTML('afterEnd', '<div id="' + this.id + '" class="tw-flex tw-flex-row"></div>');
      this.getUser();
    }
  }

  getPoints(){
    SlawAPI.getPoints(this.username).then(json => {
      const points = Math.floor(json.currentPoints);

      document.querySelectorAll('#' + this.id + ' .points')[0].innerText =formatNumber(points);
    });
  }

  getUser(){
    let container = document.querySelectorAll('#' + this.id)[0];
    
    SlawAPI.getFollower(this.username).then(json => {
      const house = HOUSES[json.house.name.toLowerCase()];
      const title = 'House ' + json.house.name;
      const points = Math.floor(json.currentPoints);

      container.insertAdjacentHTML('afterBegin',
        '<div class="slaw-points">'
          + '<i class="tw-tooltip-wrapper badge ' + house + '">'
            + '<div class="title tw-tooltip tw-tooltip--up tw-tooltip--align-left" data-a-target="tw-tooltip-label" style="margin-bottom: 0.9rem;">' + title + '</div>'
          + '</i>'
          + '<span class="points ' + house + '">' + formatNumber(points) + '</span>'
        + '</div>'
      );

      clearInterval(this.interval);
      this.interval = window.setInterval(this.getPoints.bind(this), 600000);
    }).catch(err => {
      //depending on error, use this.interval to refetch follower
      //  for now don't check for the cause
      clearInterval(this.interval);
      this.interval = window.setInterval(this.getUser.bind(this), 360000);
    });
  }

  getUsername() {
    return this.username || document.querySelectorAll(this.userNameHolder)[0].innerText.toLowerCase();
  }
}