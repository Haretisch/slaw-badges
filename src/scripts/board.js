class Board {
  constructor() {
    this.pId = 'slaw-badges-points';
    this.lId = 'slaw-badges-lboard';
    this.gId = 'slaw-badges-gamble';

    this.pointsSiblingIdentifier = "div.chat-input__buttons-container > .tw-flex";
    this.house = new House(this.pId);
    this.points = new Points(this.pId, this.house);
    this.leaderboard = new Leaderboard(this.lId, this.points);
    this.gamble = new Gamble(this.gId);
  }

  initialize() {
    return this.waitForMarkup(CHAT_ONLY).then(({sibling}) => {
      let pullLeft = CHAT_ONLY ? 'pull-left' : '';
      sibling.insertAdjacentHTML('afterEnd', `<div id="slaw-board" class="${pullLeft}"></div>`);
      let board = document.querySelector("#slaw-board");

      board.insertAdjacentHTML('beforeEnd', `<div id="${this.pId}" class="slaw-flex tw-flex-row"></div>`);
      board.insertAdjacentHTML('beforeEnd', `<div id="${this.lId}" class="slaw-flex tw-flex-row"></div>`);
      board.insertAdjacentHTML('beforeEnd', `<div id="${this.gId}" class="slaw-flex tw-flex-row"></div>`);

      this.house.showHouseCoatOfArms();
      this.points.initialize();
      this.leaderboard.initialize();
      this.gamble.initialize();
    });
  }

  disconnect() {
    this.house.hideHouseCoatOfArms();

    this.points.close();
    this.leaderboard.stop();
    this.gamble.stop();
  }

  waitForMarkup(chatOnly) {
    return new Promise(resolve => {
      const wait = () => {
        let sibling = document.querySelector(this.pointsSiblingIdentifier);
        if(sibling) {
          resolve({sibling});
        } else {
          window.requestAnimationFrame(wait);
        }
      };
      wait();
    });
  }

  toggleCoatOfArms(message) {
    this.house.toggleCoatOfArms(message);
  }
}
