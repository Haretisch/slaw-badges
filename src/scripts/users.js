class Users {
  constructor() {
    this.lostChub = {
      house: 'h0', //Lost chubs, not in a house yet.
      title: 'A lost chub',
      hc: 0, //House cup holding house? add a housecup badge?
      age: 0, //Will be raplaced with timestamp of last fetch/attempt
    };
    this.maxAge = 36000000; //Time we wait before refetching a known user's data (10 hours)
    this.minAge = 600000; //Time we wait before refetching an unknown user's data or when last attempt at user was unsuccessful (10 minutes)
    this.users = {
      sirslaw: {
        house: HOUSES[Math.floor(Math.random()*5)].key,
        title: 'Totally biased',
        immortal: true,
      },
      slaw_bot: {
        house: HOUSES[Math.floor(Math.random()*5)].key,
        title: 'The only real Slaw here',
        immortal: true,
      },
      nightbot: {
        house: HOUSES[Math.floor(Math.random()*5)].key,
        title: 'WHAT AM I FIGHTING FOR',
        immortal: true,
      },
      stay_hydrated_bot: {
        house: HOUSES[Math.floor(Math.random()*5)].key,
        title: 'Water you doing!?!? D:',
        immortal: true,
      },
      haretisch: {
        house: HOUSES[Math.floor(Math.random()*5)].key,
        title: "Didn't do it",
        temp: true,
      }
    };
    this.pendingRequests = {};

    if(this.storage = storageAvailable('localStorage')){
      this.users = {...JSON.parse(localStorage.getItem('slawCultists')), ...this.users};
    }
  }

  completePendingRequests(username, user) {
    if(this.pendingRequests[username]) {
      this.pendingRequests[username].map(callback => {
        callback(user);
      });
      delete this.pendingRequests[username];
    }
  }

  get(username, callback) {
    this.updateUser(username, {fetching: true});
    let randomHouse = HOUSES[Math.floor(Math.random()*5)];
    let response = {username, ...this.lostChub, house: randomHouse.key, title: randomHouse.title, age: Date.now()};
    this.save(username, response);
    callback(response);

    /*SlawAPI.getCultist(username).then(json => {
      response = {
        ...response,
        house: HOUSES[json.house.name.toLowerCase()],
        title: 'House ' + json.house.name
      }
      this.save(username, response);
      callback(response);
    }).catch(err => {
      this.save(username, response);
      callback(response);
    });*/
  }

  load(username, callback) {
    let user = null;
    if(typeof(callback) !== 'function') {
      callback = user => user;
    }

    if(user = this.users[username]) {
      if(user.fetching) {
        //API has already been contacted for this user, add callback to queue;
        if(!this.pendingRequests[username]) {
          this.pendingRequests[username] = [];
        }
        this.pendingRequests[username].push(callback);
        return;
      }

      let age = Date.now() - user.age;
      //if((user.house !== 'h0' && age <= this.maxAge) || age <= this.minAge || !!user.immortal) {
      if(age <= this.maxAge || !!user.immortal || !!user.temp) {
        return callback(user);
      }
    }

    this.get(username, callback);
  }

  save(username, user) {
    this.updateUser(username, {...user, fetching: false, age: Date.now()});
    if(this.storage){
      localStorage.setItem('slawCultists', JSON.stringify(this.users))
    }
    this.completePendingRequests(username, user);
  }

  updateUser(username, update){
    let user = this.users[username];
    this.users[username] = {...user, ...update};
  }
}
