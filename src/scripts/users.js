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
        house: 'hs',
        title: 'Cult Leader',
        immortal: true,
      },
      slaw_bot: {
        house: 'hs',
        title: 'Chub Master',
        immortal: true,
      },
      nightbot: {
        house: 'hs',
        title: 'The Finger',
        immortal: true,
      },
      stay_hydrated_bot: {
        house: 'hs',
        title: 'He cares',
        immortal: true,
      },
      pretzelrocks: {
        house: 'hs',
        title: 'Musically inclined',
        immortal: true,
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

  get({username, UserName}, callback, user) {
    this.updateUser(username, {fetching: true});
    let response = {username, ...this.lostChub, age: Date.now()}; // Assume the worst D:

    SlawAPI.getCultist(username).then(json => {
      user = (user||{greeted:false});
      if(json.status === 'not_found' && !user.greeted){
        chat.greet(UserName);
        response.greeted = true;
      }

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
    });
  }

  load({username, UserName}, callback) {
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
      if((user.house !== 'h0' && age <= this.maxAge) || age <= this.minAge || !!user.immortal) {
        return callback(user);
      }
    }

    this.get({username, UserName}, callback, user);
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
