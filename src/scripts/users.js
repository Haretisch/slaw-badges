class Users {
  constructor() {
    this.houses = {
      'gryffinclaw': 'h1',
      'lannistark': 'h2',
      'ironbeard': 'h3',
    };
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
      }
    };
    this.pendingRequests = {};

    this.API = {
      auth: '',
      endpoint: 'https://mighty-citadel-48930.herokuapp.com/api/grizzly/followed',
      version: 'v1',
    };

    if(this.storage = storageAvailable('localStorage')){
      this.users = {...JSON.parse(localStorage.getItem('slawCultists')), ...this.users};
    }
    //console.log(this.users);
  }

  completePendingRequests(username, user) {
    //console.log('Pending requests for ' + username, this.pendingRequests[username]);
    if(this.pendingRequests[username]) {
      //console.log('Fulfilling pending requests for ' + username);
      this.pendingRequests[username].map(callback => {
        callback(user);
      });
      delete this.pendingRequests[username];
    }
  }

  get(username, callback) {
    this.updateUser(username, {fetching: true});

    //console.log('Fetching: ' + username);
    let response = {username, ...this.lostChub, age: Date.now()}; // Assume the worst D:

    const request = new Request(
      this.API.endpoint + '?name=' + username.toLowerCase(),
      {method: 'GET', mode: 'cors'}
    );
    fetch(request).then(res => {
      const contentType = res.headers.get('content-type');
      if(res.ok && contentType && contentType.includes('application/json')){
        return res.json();
      }
    }).then(json => {
      response = {
        ...response,
        house: this.houses[json.house.name.toLowerCase()],
        title: 'House '+json.house.name
      }
      //console.log('got:' + username);
      this.save(username, response);
      callback(response);
    }).catch(err => {
      //console.log('catched: ' + username, err);
      this.save(username, response);
      callback(response);
    });
  }

  load(username, callback) {
    let user = null;
    if(typeof(callback) !== 'function') {
      callback = user => user;
    }

    //console.log('Requested: ' + username, this.users[username])
    if(user = this.users[username]) {
      if(user.fetching) {
        //API has already been contacted for this user, add callback to queue;
        //console.log('Already in fetching: ' + username, 'Adding to queue');
        if(!this.pendingRequests[username]) {
          this.pendingRequests[username] = [];
        }
        this.pendingRequests[username].push(callback);
        //console.log(this.pendingRequests);
        return;
      }

      let age = Date.now() - user.age;
      //console.log('data age : ' + age);
      if((user.house !== 'h0' && age <= this.maxAge) || age <= this.minAge || !!user.immortal) {
        //console.log('Using from memory: ' + username);
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
    //console.log('Writing to memory: ' + username, this.users);
    this.completePendingRequests(username, user);
  }

  updateUser(username, update){
    let user = this.users[username];
    this.users[username] = {...user, ...update};
  }
}
