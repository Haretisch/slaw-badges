class House {
  constructor(pId) {
    this.cbg = '.chat-list__lines .simplebar-content';
    this.current = '';
    this.pId = pId;
  }

  showHouseCoatOfArms(house = '') {
    house = user.houseClass;

    if(context){
      system.storage.sync.get('slaw_enableCoatOfArms', data => {
        if(('slaw_enableCoatOfArms' in data) ? data.slaw_enableCoatOfArms : true) {
          this.hideHouseCoatOfArms();
          document.querySelector(this.cbg).classList.add(house);
        }
      });
    }
  }

  hideHouseCoatOfArms() {
    document.querySelector(this.cbg).classList.remove('h1', 'h2', 'h3');
  }

  toggleCoatOfArms({display}) {
    display ? this.showHouseCoatOfArms() : this.hideHouseCoatOfArms()
  }

  changeUserHouse() {
    let houseClass = user.houseClass;
    if(this.current === houseClass) return;

    this.current = houseClass;

    let badge = document.querySelector(`#${this.pId} .badge`);
    let points = document.querySelector(`#${this.pId} .points`);

    //Isn't updating properly
    this.showHouseCoatOfArms();

    badge.classList.remove('h1', 'h2', 'h3');
    badge.classList.add(houseClass);

    points.classList.remove('h1', 'h2', 'h3');
    points.classList.add(houseClass);
  }
}