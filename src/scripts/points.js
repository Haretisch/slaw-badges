class Points {
  constructor() {
    this.id = 'slaw-badges-points';
    this.chatOnly = context === 'chat';
    this.usernameHolder = 'div.top-nav-user-menu__username p';
    this.pointsSiblingIdentifier = context === 'chat'
      ? "div.js-chat-buttons.chat-buttons-container.clearfix .chat-interface__viewer-list"
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
      console.log('chat points');
      document.querySelectorAll(this.pointsSiblingIdentifier)[0].insertAdjacentHTML('afterEnd', '<div id="' + this.id + '" class="float-left"></div>');
      let container = document.querySelectorAll('#' + this.id)[0];

      SlawAPI.getLeaderboard().then(json => {
        container.insertAdjacentHTML('afterBegin', this.pointsMarkup('h3', 'House Ironbeard', Math.floor(json.h3)));
        container.insertAdjacentHTML('afterBegin', this.pointsMarkup('h2', 'House Lannistark', Math.floor(json.h2)));
        container.insertAdjacentHTML('afterBegin', this.pointsMarkup('h1', 'House Gryffinclaw', Math.floor(json.h1)));
        this.interval = window.setInterval(this.getLeaderboard.bind(this), 300000);
      })
    }else{
      let username; //Check if user is logged in, or if we can get the username at all
      if(username = document.querySelectorAll(this.usernameHolder)[0]){
        this.username = username.innerText.toLowerCase();
        document.querySelectorAll(this.pointsSiblingIdentifier)[0].insertAdjacentHTML('afterEnd', '<div id="' + this.id + '" class="tw-flex tw-flex-row"></div>');
        this.getUser();
      }
    }
  }

  getLeaderboard() {
    SlawAPI.getLeaderboard().then(json => {
      //TODO handle real response
      const h1 = Math.floor(json.h1);
      const h2 = Math.floor(json.h2);
      const h3 = Math.floor(json.h3);

      document.querySelectorAll('#' + this.id + ' .points.h1')[0].innerText = formatNumber(h1);
      document.querySelectorAll('#' + this.id + ' .points.h2')[0].innerText = formatNumber(h2);
      document.querySelectorAll('#' + this.id + ' .points.h3')[0].innerText = formatNumber(h3);
    });
  }

  getPoints() {
    SlawAPI.getPoints(this.username).then(json => {
      const points = Math.floor(json.currentPoints);

      document.querySelectorAll('#' + this.id + ' .points')[0].innerText = formatNumber(points);
    });
  }

  getUser() {
    let container = document.querySelectorAll('#' + this.id)[0];
    
    SlawAPI.getCultist(this.username).then(json => {
      const house = HOUSES[json.house.name.toLowerCase()];
      const title = 'House ' + json.house.name;
      const points = Math.floor(json.currentPoints);

      container.insertAdjacentHTML('afterBegin', this.pointsMarkup(house, title, points));

      clearInterval(this.interval);
      this.interval = window.setInterval(this.getPoints.bind(this), 600000);
    }).catch(err => {
      //depending on error, use this.interval to refetch follower
      //  for now don't check for the cause
      clearInterval(this.interval);
      this.interval = window.setInterval(this.getUser.bind(this), 360000);
    });
  }

  pointsMarkup(house, title, points) {
    return ''
      + '<div class="slaw-points">'
        + '<i class="tw-tooltip-wrapper badge ' + house + '">'
          + '<div class="title tw-tooltip tw-tooltip--up tw-tooltip--align-left" data-a-target="tw-tooltip-label" style="margin-bottom: 0.9rem;">' + title + '</div>'
        + '</i>'
        + '<span class="points ' + house + '">' + formatNumber(points) + '</span>'
      + '</div>'
    ;
  }
}