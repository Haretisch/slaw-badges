class Points {
  constructor(pId, house) {
    this.pId = pId;
    this.house = house;
  }

  initialize() {
    user.registerListener('points', this.updatePointsDOM.bind(this));
  }

  stop() {
    document.querySelector(`#${this.pId}`).remove();
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
  }

  updatePointsDOM() {
    let house = user.houseClass;
    let title = `Points multiplier x${user.multiplier}`;
    Object.keys(user.flags).forEach(flag => {
      title += `<br/ ><span style="display: inline-block; width: 10px;">${user.flags[flag] ? '✓' : ''}</span> ${flag}`;
    });
    let points = user.points;

    let container = document.querySelector(`#${this.pId}`);
    if(!container.childNodes.length) {
      this.initPointsDOM(house, title, points);
    }

    container = document.querySelector(`#${this.pId} .points`);
    if(container){
      container.innerText = formatNumber(points);
    }

    this.house.changeUserHouse();
  }
}
