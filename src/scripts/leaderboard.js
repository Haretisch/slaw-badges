class Leaderboard {
  constructor(lId, points) {
    this.lId = lId;
    this.leaderboard = null;
    this.leaderboardChannel = null;
    this.points = points;
  }

  initialize() {
    this.socket();
    user.registerListener('leaderboard', this.userFound.bind(this));
  }

  stop() {
    document.querySelector(`#${this.lId}`).remove();
  }

  userFound() {
    if(!!this.leaderboard) {
      this.updateLeaderboardDOM();
      user.unregisterListener('leaderboard');
    }
  }

  socket() {
    if (!this.leaderboardChannel) {
      this.leaderboardChannel = SlawAPI.channelConnect(
        newApiSocket.currentSocket(''),
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


  leaderboardList(h1, h2, h3) {
    let container = document.querySelector(`#${this.lId}`);
    container.innerHTML = '';
    container.insertAdjacentHTML('beforeEnd', this.points.pointsMarkup('h1', 'House Gryffinclaw', h1));
    container.insertAdjacentHTML('beforeEnd', this.points.pointsMarkup('h2', 'House Lannistark', h2));
    container.insertAdjacentHTML('beforeEnd', this.points.pointsMarkup('h3', 'House Ironbeard', h3));
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

    if(CHAT_ONLY && !user.house) {
      this.leaderboardList(h1, h2, h3);
    } else {
      this.leaderboardIcon(h1, h2, h3);
    }
  }

  leaderboardIcon(h1, h2, h3) {
    let container = document.querySelector(`#${this.lId}`);
    let icon = ''
      + '<div class="slaw-lboard tw-tooltip-wrapper">'
        + '<button aria-label="Leaderboard" class="tw-button-icon" data-a-target="leaderboard">'
         + '<span class="tw-button-icon__icon">'
            + `<i class="gamble icon-lboard">`
              + `<div class="title tw-tooltip tw-tooltip--up tw-tooltip--align-center" data-a-target="tw-tooltip-label" style="margin-bottom: 0.9rem;"></div>`
            + '</i>'
          + '</span>'
        + '</button>'
      + '</div>'
    ;

    container.innerHTML = icon;

    let label = container.querySelector('.title');
    label.insertAdjacentHTML('afterBegin', this.tooltipPointsMarkup('h3', h3));
    label.insertAdjacentHTML('afterBegin', this.tooltipPointsMarkup('h2', h2));
    label.insertAdjacentHTML('afterBegin', this.tooltipPointsMarkup('h1', h1));
  }

  tooltipPointsMarkup(house, points) {
    return ''
      + '<div class="slaw-points">'
        + `<i class="tw-tooltip-wrapper badge ${house}"></i>`
        + `<span class="points ${house}">${formatNumber(points)}</span>`
      + '</div>'
    ;
  }
}
