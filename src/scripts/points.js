class Points {
  constructor(socketBuilder) {
    this.pId = 'slaw-badges-points';
    this.gId = 'slaw-badges-gamble';
    this.usernameHolder = 'div.top-nav-user-menu__username p';
    this.pointsSiblingIdentifier = "div.chat-input__buttons-container > .tw-flex";
    this.socketBuilder = socketBuilder;
    this.leaderboard;
    this.user;
    this.username;
    this.interval;
    this.flags = {
      subscriber: 'Subscriber',
      notifications: 'Notifications On',
      hosting: 'Hosting',
      following: 'Following',
    }
    this.flagsKeys = Object.keys(this.flags).sort();

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
    this.waitForMarkup(CHAT_ONLY).then(({username, sibling}) => {
      //Only initialize if we can't find the added markup
      if(this.isStarted()){
        return;
      }
      if(CHAT_ONLY){
        //Get a random Coat of Arms for chat only view, until we can get a way to know who's logged in
        this.user = {house: {name: Object.keys(HOUSES).randomElement()}};
        this.showHouseCoatOfArms();

        //For now this Slaw's place. Since we can't confirm who's accessing this page assume it's him and show all houses' points.
        sibling.insertAdjacentHTML('afterEnd', `<div id="${this.pId}" class="float-left"></div>`);
        this.apiSocket = this.socketBuilder.currentSocket('');
        this.socketLeaderboard();
      }else{
        this.username = username.innerText.toLowerCase();
        this.apiSocket = this.socketBuilder.currentSocket(this.username);

        sibling.insertAdjacentHTML('afterEnd', `<div id="${this.gId}" class="slaw-flex tw-flex-row"></div>`);//Gamble
        sibling.insertAdjacentHTML('afterEnd', `<div id="${this.pId}" class="slaw-flex tw-flex-row"></div>`);//Points

        this.socketRoulette();
        this.socketUser();
      }
    });
  }

  isStarted() {
    return document.querySelector(`#${this.pId}`) || document.querySelector(`#${this.gId}`);
  }

  listener(mutation) {
    //console.log('Points listener');
  }

  initLeaderboardDOM(h1, h2, h3) {
    let container = document.querySelector(`#${this.pId}`);
    container.insertAdjacentHTML('afterBegin', this.pointsMarkup('h3', 'House Ironbeard', h3));
    container.insertAdjacentHTML('afterBegin', this.pointsMarkup('h2', 'House Lannistark', h2));
    container.insertAdjacentHTML('afterBegin', this.pointsMarkup('h1', 'House Gryffinclaw', h1));
  }

  updateLeaderboardDOM(body) {
    if(body) {
      this.leaderboard = body;
    }

    let keys = Object.keys(this.leaderboard);
    let gc = keys.map(k => {if(this.leaderboard[k].houseName === 'Gryffinclaw'){ return this.leaderboard[k]; }}).filter(i => !!i)[0];
    let ls = keys.map(k => {if(this.leaderboard[k].houseName === 'Lannistark'){ return this.leaderboard[k]; }}).filter(i => !!i)[0];
    let ib = keys.map(k => {if(this.leaderboard[k].houseName === 'Ironbeard'){ return this.leaderboard[k]; }}).filter(i => !!i)[0];

    let h1 = Math.floor(gc.points.current + gc.points.tips + gc.points.cheers + gc.points.subscriptions);
    let h2 = Math.floor(ls.points.current + ls.points.tips + ls.points.cheers + ls.points.subscriptions);
    let h3 = Math.floor(ib.points.current + ib.points.tips + ib.points.cheers + ib.points.subscriptions);

    let container = document.querySelector(`#${this.pId}`);
    if(!container.childNodes.length) {
      this.initLeaderboardDOM(h1, h2, h3);
    }

    container.querySelectorAll(".points.h1")[0].innerText = formatNumber(h1);
    container.querySelectorAll(".points.h2")[0].innerText = formatNumber(h2);
    container.querySelectorAll(".points.h3")[0].innerText = formatNumber(h3);
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
      : "<strong>Gambled OUT</strong><hr />I'm never gonna gamble again,<br />(Guilty feet have got...)"
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
    } else {
      status = this.gambleTimer.running ? 'on' : 'off';
    }

    let gambleIcon = document.querySelector(`#${this.gId} .gamble`);
    gambleIcon.classList.remove('on', 'off');
    gambleIcon.classList.add(status);

    document.querySelector(`#${this.gId} .title`).innerHTML = this.getGambleTitle(status);

    switch(status) {
      case 'on':
        if(!this.gambleTimer.running) {
          this.gambleTimer.updateDuration(duration);
          this.gambleTimer.start();
        }
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
    if(this.user && body && this.user.house.name !== body.house.name) {
      // House has changed! update Coat of Arms and Points className;
      this.changeUserHouse(this.user.house.name, body.house.name);
    }

    if(body) {
      this.user = body;
    }

    let multiplier = Math.pow(2, this.flagsKeys.filter(f => body.pointFlags[f]).length);

    let house = HOUSES[this.user.house.name.toLowerCase()];
    let title = `Points multiplier x${multiplier}`;
    this.flagsKeys.forEach(flag => {
      title += `<br/ ><span style="display: inline-block; width: 10px;">${body.pointFlags[flag] ? '✓' : ''}</span> ${this.flags[flag]}`;
    });
    let points = Math.floor(this.user.points.current);

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

  socketLeaderboard() {
    if (!this.leaderboardChannel) {
      this.leaderboardChannel = SlawAPI.channelConnect(
        this.apiSocket,
        'houses', // Channel Key
        null, // Channel parameters
        { // Channel callbacks
          update: {
            path: 'house_points:update',
            func: this.updateLeaderboardDOM.bind(this),
          },
        }
      );
    } else {
      this.updateLeaderboardDOM();
    }
  }

  socketRoulette() {
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
    } else {
      this.updateGambleDOM();
    }
  }

  socketUser() {
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
    } else {
      this.updatePointsDOM();
    }
  }

  waitForMarkup(chatOnly) {
    return new Promise(resolve => {
      const wait = () => {
        let ps = document.querySelector(this.pointsSiblingIdentifier);
        let un = chatOnly ? true : document.querySelector(this.usernameHolder)
        ;
        if(un && ps) {
          resolve({username: un, sibling: ps});
        } else {
          window.requestAnimationFrame(wait);
        }
      };
      wait();
    });
  }
}
