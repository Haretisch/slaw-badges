class Points {
  constructor(socketBuilder) {
    this.pId = 'slaw-badges-points';
    this.gId = 'slaw-badges-gamble';
    this.usernameHolder = 'div.top-nav-user-menu__username p';
    this.pointsSiblingIdentifier = CHAT_ONLY
      ? "div.js-chat-buttons.chat-buttons-container.clearfix .chat-interface__viewer-list"
      : "div.chat-input__buttons-container > .tw-flex"
    ;
    this.socketBuilder = socketBuilder;
    this.user;
    this.username;
    this.interval;

    this.gambleTimerSelector = "slaw-gamble-timer"
    this.gambleTimer = new SlawTimer(15 * 60); // 15 Minutes by default
    this.gambleTimer.onTick((minutes, seconds) => {
      if(this.gambleTimer.running) {
        seconds = ('0' + seconds).slice(-2);
        document.querySelector(`.${this.gambleTimerSelector}`).innerText = `${minutes}:${seconds}`;
      }
    });
    this.gambleTimer.onEnd(() => {this.updateGambleDOM()});
  }

  disconnect() {
    this.hideHouseCoatOfArms();
    window.clearInterval(this.interval);
    // this.socketBuilder.disconnect();
    document.querySelector(`#${this.gId}`).remove();
    document.querySelector(`#${this.pId}`).remove();
  }

  destructor() {
    chat.unregisterListener('points');
  }

  initialize() {
    //Only initialize if we can't find the added markup
    if(this.isStarted()){
      return;
    }
    if(context === 'chat'){
      //Get a random Coat of Arms for chat only view, until we can get a way to know who's logged in
      this.user = {house: {name: Object.keys(HOUSES).randomElement()}};
      this.showHouseCoatOfArms();

      //For now this Slaw's place. Since we can't confirm who's accessing this page assume it's him and show all houses' points.
      document.querySelectorAll(this.pointsSiblingIdentifier)[0].insertAdjacentHTML('afterEnd', `<div id="${this.pId}" class="float-left"></div>`);
      let container = document.querySelectorAll(`#${this.pId}`)[0];

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
        window.clearInterval(this.interval);
        this.interval = window.setInterval(this.getLeaderboard.bind(this), 300000);
      });
    }else{
      //Check if user is logged in, or if we can get the username at all
      //  and that the sibling, and therefore the expected container, exists before inserting
      let username = document.querySelectorAll(this.usernameHolder)[0];
      let sibling = document.querySelectorAll(this.pointsSiblingIdentifier)[0];
      if(username && sibling){
        sibling.insertAdjacentHTML('afterEnd', `<div id="${this.gId}" class="tw-flex tw-flex-row"></div>`);//Gamble
        sibling.insertAdjacentHTML('afterEnd', `<div id="${this.pId}" class="tw-flex tw-flex-row"></div>`);//Points

        this.username = username.innerText.toLowerCase();
        this.socketConnections();
        //this.getUser();
      }
    }
  }

  socketConnections() {
    this.apiSocket = this.socketBuilder.currentSocket(this.username);

    if (!this.rouletteChannel) {
      this.rouletteChannel = SlawAPI.channelConnect(
        this.apiSocket,
        'roulette', // Channel Key
        {username: this.username}, // Channel parameters
        { // Channel callbacks
          status_change: {
            endpoint: this.username,
            func: this.updateGambleDOM.bind(this),
          },
        }
      );
    }

    if (!this.userChannel) {
      this.userChannel = SlawAPI.channelConnect(
        this.apiSocket,
        'user_data', // Channel Key
        {username: this.username}, // Channel parameters
        { // Channel callbacks
          [this.username]: {
            func: this.updatePointsDOM.bind(this),
          },
        }
      );
    }
  }

  isStarted() {
    return document.querySelector(`#${this.pId}`) || document.querySelector(`#${this.gId}`);
  }

  getLeaderboard() {
    SlawAPI.getLeaderboard().then(json => {
      let gcProfile = json.houseProfiles[0].profiles[0];
      let lsProfile = json.houseProfiles[1].profiles[0];
      let ibProfile = json.houseProfiles[2].profiles[0];

      const h1 = Math.floor(gcProfile.points.current + gcProfile.points.tips + gcProfile.points.cheers + gcProfile.points.subscriptions);
      const h2 = Math.floor(lsProfile.points.current + lsProfile.points.tips + lsProfile.points.cheers + lsProfile.points.subscriptions);
      const h3 = Math.floor(ibProfile.points.current + ibProfile.points.tips + ibProfile.points.cheers + ibProfile.points.subscriptions);

      document.querySelectorAll(`#${this.pId}.points.h1`)[0].innerText = formatNumber(h1);
      document.querySelectorAll(`#${this.pId}.points.h2`)[0].innerText = formatNumber(h2);
      document.querySelectorAll(`#${this.pId}.points.h3`)[0].innerText = formatNumber(h3);
    });
  }

  /*getPoints() {
    SlawAPI.getPoints(this.username).then(json => {
      const points = Math.floor(json.currentPoints);
      const container = document.querySelector(`#${this.pId} .points`);

      if(container){
        container.innerText = formatNumber(points);
      } else {
        window.clearInterval(this.interval);
      }
    });
  }

  getUser() {
    let pContainer = document.querySelector(`#${this.pId}`);
    let gContainer = document.querySelector(`#${this.gId}`);

    SlawAPI.getCultist(this.username).then(json => {
      this.user = json;
      const house = HOUSES[json.house.name.toLowerCase()];
      const title = 'House ' + json.house.name;
      const points = Math.floor(json.currentPoints);

      //chat.registerListener('points', this.listener.bind(this));
      this.showHouseCoatOfArms();

      //TODO set status properly and start timer with proper duration;
      gContainer.insertAdjacentHTML('afterBegin', this.gambleMarkup('off'));
      pContainer.insertAdjacentHTML('afterBegin', this.pointsMarkup(house, title, points));
      gContainer.addEventListener('click', this.toggleGamble.bind(this));

      window.clearInterval(this.interval);
      this.interval = window.setInterval(() => {
        this.getPoints.bind(this);
      }, 600000);
    }).catch(err => {
      //depending on error, use this.interval to refetch follower
      //  for now don't check for the cause
      window.clearInterval(this.interval);
      this.interval = window.setInterval(this.getUser.bind(this), 360000);
    });
  }*/

  listener(mutation) {
    //console.log('Points listener');
  }

  gambleMarkup(status) {
    let label = this.getGambleTitle(status);

    return ''
      + '<div class="slaw-gamble tw-tooltip-wrapper">'
        + '<button aria-label="Gamble settings" class="tw-button-icon" data-a-target="gamble-settings">'
         + '<span class="tw-button-icon__icon">'
            + `<i class="gamble icon-dice ${status}">`
              + `<div class="title tw-tooltip tw-tooltip--up tw-tooltip--align-center" data-a-target="tw-tooltip-label" style="margin-bottom: 0.9rem;">${label}</div>`
            + '</i>'
          + '</span>'
        + '</button>'
      + '</div>'
    ;
  }

  getGambleTitle(status) {
    return status === 'on'
      ? `<strong>Gambled IN</strong><br />For: <span class="${this.gambleTimerSelector}">15:00</span><hr />Glintering gold.<br />Trinkets and baubles...<br />Paid for in blood.`
      : "<strong>Gambled OUT</strong><hr />I'm never gamble again,<br />(Guilty feet have got...)"
    ;
  }

  initGambleDOM() {
    let container = document.querySelector(`#${this.gId}`);
    container.insertAdjacentHTML('afterBegin', this.gambleMarkup('off'));
    container.addEventListener('click', this.toggleGamble.bind(this));
  }

  updateGambleDOM(body, status = 'off', duration = 0) {
    let container = document.querySelector(`#${this.gId}`);
    if(!container.childNodes.length) {
      this.initGambleDOM();
    }

    if(body) {
      status = body.current_participant ? 'on' : 'off';
      duration = parseInt(body.time_remaining_in_ms / 1000);
    }

    let gambleIcon = document.querySelector(`#${this.gId} .gamble`);
    gambleIcon.classList.remove('on', 'off');
    gambleIcon.classList.add(status);

    document.querySelector(`#${this.gId} .title`).innerHTML = this.getGambleTitle(status);

    switch(status) {
      case 'on':
        this.gambleTimer.updateDuration(duration);
        this.gambleTimer.start();
        break;
      default:
        this.gambleTimer.stop();
    }
  }

  toggleGamble() {
    document.querySelector(`#${this.gId} button`).blur();

    if (this.rouletteChannel && this.username) {
      SlawAPI.channelPush(this.rouletteChannel, 'change_gamble_status', this.username);
    }
  }

  pointsMarkup(house, title, points) {
    return ''
      + '<div class="slaw-points">'
        + `<i class="tw-tooltip-wrapper badge ${house}">`
          + `<div class="title tw-tooltip tw-tooltip--up tw-tooltip--align-center" data-a-target="tw-tooltip-label" style="margin-bottom: 0.9rem;">${title}</div>`
        + '</i>'
        + `<span class="points ${house}">${formatNumber(points)}</span>`
      + '</div>'
    ;
  }

  initPointsDOM(house, title, points) {
    let container = document.querySelector(`#${this.pId}`);
    container.insertAdjacentHTML('afterBegin', this.pointsMarkup(house, title, points));

    //Also show Coat of Arms
    this.showHouseCoatOfArms();
  }

  updatePointsDOM(body) {
    if(this.user && this.user.house.name !== body.house.name) {
      // House has changed! update Coat of Arms and Points className;
      this.changeUserHouse(this.user.house.name, body.house.name);
    }

    this.user = body;
    let house = HOUSES[body.house.name.toLowerCase()];
    let title = `House ${body.house.name}`;
    let points = Math.floor(body.points.current);

    let container = document.querySelector(`#${this.pId}`);
    if(!container.childNodes.length) {
      this.initPointsDOM(house, title, points);
    }

    container = document.querySelector(`#${this.pId} .points`);
    if(container){
      container.innerText = formatNumber(points);
    } else {
      // this.socketBuilder.disconnect(); ??
    }
  }

  showHouseCoatOfArms(house = '') {
    house = (HOUSES[house.toLowerCase()] || HOUSES[this.user.house.name.toLowerCase()]);

    if(context){
      system.storage.sync.get('slaw_enableCoatOfArms', data => {
        if(('slaw_enableCoatOfArms' in data) ? data.slaw_enableCoatOfArms : true) {
          this.hideHouseCoatOfArms();
          document.querySelector('.chat-list__lines .simplebar-content').classList.add(house);
        }
      });
    }
  }

  hideHouseCoatOfArms() {
    document.querySelector('.chat-list__lines .simplebar-content').classList.remove('h1', 'h2', 'h3');
  }

  toggleCoatOfArms({display}) {
    display ? this.showHouseCoatOfArms() : this.hideHouseCoatOfArms()
  }

  changeUserHouse(oldHouse, newHouse) {
    let oldClass = HOUSES[oldHouse.toLowerCase()];
    let newClass = HOUSES[newHouse.toLowerCase()];

    let badge = document.querySelector(`#${this.pId} .badge`);
    let title = document.querySelector(`#${this.pId} .title`);
    let points = document.querySelector(`#${this.pId} .points`);

    //Isn't updating properly
    this.showHouseCoatOfArms(newHouse);

    badge.classList.remove(oldClass);
    badge.classList.add(newClass);
    title.innerText = `House ${newHouse}`;

    points.classList.remove(oldClass);
    points.classList.add(newClass);

  }
}
