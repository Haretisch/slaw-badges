class Gamble {
  constructor(gId) {
    this.gId = gId;
    this.rouletteChannel = null;

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

  initialize() {
    user.registerListener('gamble', this.start.bind(this));
  }

  start() {
    this.socket();
    user.unregisterListener('gamble');
  }

  stop() {
    document.querySelector(`#${this.gId}`).remove();
  }

  socket() {
    if (!this.rouletteChannel) {
      this.rouletteChannel = SlawAPI.channelConnect(
        user.apiSocket,
        'roulette', // Channel Key
        {username: user.username}, // Channel parameters
        { // Channel callbacks
          status_change: {
            endpoint: user.username,
            func: this.updateGambleDOM.bind(this),
          },
        }
      );
    } else {
      this.updateGambleDOM();
    }
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

    if (this.rouletteChannel && user.username) {
      SlawAPI.channelPush(this.rouletteChannel, 'change_gamble_status', user.username);
    }
  }
}
