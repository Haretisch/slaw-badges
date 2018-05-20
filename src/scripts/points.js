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
      console.log(this.user);
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
        let usernameText = username.innerText.toLowerCase();
        this.username = usernameText;

        let apiSocket = this.socketBuilder.currentSocket(username);
        console.log(apiSocket)
        this.apiSocket = apiSocket;
        if (!this.rouletteChannel) {
          console.log("what are we going on")
          let rouletteChannel = apiSocket.channel(`roulette_participants:v0:${usernameText}`);
          rouletteChannel.join().receive("ok", body => {
            // do nothing
          })
          this.rouletteChannel = rouletteChannel
          rouletteChannel.on(`roulette_participants:status_change:${usernameText}`, body => {
            console.log(body)
            let isOn = body.current_participant;
            this.updateGambleDOM(isOn ? 'on' : 'off');
          })
        }
        sibling.insertAdjacentHTML('afterEnd', `<div id="${this.gId}" class="tw-flex tw-flex-row"></div>`);
        sibling.insertAdjacentHTML('afterEnd', `<div id="${this.pId}" class="tw-flex tw-flex-row"></div>`);
        this.getUser();
      }
    }
  }


  isStarted() {
    return document.querySelector(`#${this.pId}`);
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


  getGamble() {
    //SlawAPI.getGamble(this.username).then(json => {
      //show the things
      // this.updateGambleDOM('on');
    //});
  }

  getPoints() {
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

      gContainer.insertAdjacentHTML('afterBegin', this.gambleMarkup('on'));
      pContainer.insertAdjacentHTML('afterBegin', this.pointsMarkup(house, title, points));
      gContainer.addEventListener('click', this.toggleGamble.bind(this));

      window.clearInterval(this.interval);
      this.interval = window.setInterval(() => {
        this.getPoints.bind(this);
        this.getGamble.bind(this);
      }, 600000);
    }).catch(err => {
      //depending on error, use this.interval to refetch follower
      //  for now don't check for the cause
      window.clearInterval(this.interval);
      this.interval = window.setInterval(this.getUser.bind(this), 360000);
    });
  }

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
      ? "<strong>Gambled IN</strong><hr />Glintering gold.<br />Trinkets and baubles...<br />Paid for in blood."
      : "<strong>Gambled OUT</strong><hr />I'm never gamble again,<br />(Guilty feet have got...)"
    ;
  }

  updateGambleDOM(status) {
    let gambleIcon = document.querySelector(`#${this.gId} .gamble`);
    gambleIcon.classList.remove('on', 'off');
    gambleIcon.classList.add(status);

    document.querySelector(`#${this.gId} .title`).innerHTML = this.getGambleTitle(status);
  }

  toggleGamble() {
    document.querySelector(`#${this.gId} button`).blur();
    let newState = document.querySelector(`#${this.gId} i`).className.includes('off');
    //SlawAPI.setGambleSetting(this.user.username, newState)
    // this.updateGambleDOM(newState ? 'on' : 'off');
    let rc = this.rouletteChannel,
        username = this.username;
    if (rc && username) {
      rc.push(`roulette_participants:change_gamble_status:${username}`, {})
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

  showHouseCoatOfArms() {
    const house = HOUSES[this.user.house.name.toLowerCase()];
    if(context){
      system.storage.sync.get('slaw_enableCoatOfArms', data => {
        if(('slaw_enableCoatOfArms' in data) ? data.slaw_enableCoatOfArms : true) {
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
}
