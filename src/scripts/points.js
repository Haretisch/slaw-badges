class Points {
  constructor() {
    this.id = 'slaw-badges-points';
    this.usernameHolder = 'div.top-nav-user-menu__username p';
    this.pointsSiblingIdentifier = CHAT_ONLY
      ? "div.js-chat-buttons.chat-buttons-container.clearfix .chat-interface__viewer-list"
      : "div.chat-input__buttons-container > .tw-flex"
    ;
    this.username;
    this.interval;
  }

  disconnect() {
    clearInternval(this.interval);
  }

  destructor() {
    chat.unregisterListener('points');
  }

  initialize() {
    //Only initialize if we can't find the added markup
    if(document.querySelectorAll('#' + this.id)[0]){
      return;
    }
    if(CHAT_ONLY){
      //For now this Slaw's place. Since we can't confirm who's accessing this page assume it's him and show all houses' points.
      document.querySelectorAll(this.pointsSiblingIdentifier)[0].insertAdjacentHTML('afterEnd', '<div id="' + this.id + '" class="float-left"></div>');
      let container = document.querySelectorAll('#' + this.id)[0];

      SlawAPI.getLeaderboard().then(json => {
        let gcProfile = json.houseProfiles[0].profiles[0];
        let lsProfile = json.houseProfiles[1].profiles[0];
        let ibProfile = json.houseProfiles[2].profiles[0];

        const h1 = Math.floor(gcProfile.points.current + gcProfile.points.tips + gcProfile.points.cheers + gcProfile.points.subscriptions);
        const h2 = Math.floor(lsProfile.points.current + lsProfile.points.tips + lsProfile.points.cheers + lsProfile.points.subscriptions);
        const h3 = Math.floor(ibProfile.points.current + ibProfile.points.tips + ibProfile.points.cheers + ibProfile.points.subscriptions);

        container.insertAdjacentHTML('afterBegin', this.pointsMarkup('h3', 'House Ironbeard', h3));
        container.insertAdjacentHTML('afterBegin', this.pointsMarkup('h2', 'House Lannistark', h2));
        container.insertAdjacentHTML('afterBegin', this.pointsMarkup('h1', 'House Gryffinclaw', h1));
        clearInterval(this.interval);
        this.interval = window.setInterval(this.getLeaderboard.bind(this), 300000);
      });
    }else{
      //Check if user is logged in, or if we can get the username at all
      //  and that the sibling, and therefore the expected container, exists before inserting
      let username = document.querySelectorAll(this.usernameHolder)[0];
      let sibling = document.querySelectorAll(this.pointsSiblingIdentifier)[0];
      if(username && sibling){
        this.username = username.innerText.toLowerCase();
        sibling.insertAdjacentHTML('afterEnd', '<div id="' + this.id + '" class="tw-flex tw-flex-row"></div>');
        this.getUser();
      }
    }
  }

  getLeaderboard() {
    SlawAPI.getLeaderboard().then(json => {
      let gcProfile = json.houseProfiles[0].profiles[0];
      let lsProfile = json.houseProfiles[1].profiles[0];
      let ibProfile = json.houseProfiles[2].profiles[0];

      const h1 = Math.floor(gcProfile.points.current + gcProfile.points.tips + gcProfile.points.cheers + gcProfile.points.subscriptions);
      const h2 = Math.floor(lsProfile.points.current + lsProfile.points.tips + lsProfile.points.cheers + lsProfile.points.subscriptions);
      const h3 = Math.floor(ibProfile.points.current + ibProfile.points.tips + ibProfile.points.cheers + ibProfile.points.subscriptions);

      document.querySelectorAll('#' + this.id + ' .points.h1')[0].innerText = formatNumber(h1);
      document.querySelectorAll('#' + this.id + ' .points.h2')[0].innerText = formatNumber(h2);
      document.querySelectorAll('#' + this.id + ' .points.h3')[0].innerText = formatNumber(h3);
    });
  }

  getPoints() {
    SlawAPI.getPoints(this.username).then(json => {
      const points = Math.floor(json.currentPoints * Math.random() * 101);
      const container = document.querySelectorAll('#' + this.id + ' .points')[0];

      if(container){
        container.innerText = formatNumber(points);
      } else {
        clearInterval(this.interval);
      }
    });
  }

  getUser() {
    let container = document.querySelectorAll('#' + this.id)[0];

    SlawAPI.getCultist(this.username).then(json => {
      let randomHouse = HOUSES[Math.floor(Math.random()*5)];
      const house = randomHouse.key;
      const title = randomHouse.title;
      const points = Math.floor(json.currentPoints * Math.random() * 101);

      //chat.registerListener('points', this.listener.bind(this));

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

  listener(mutation) {
    //console.log('Points listener');
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
