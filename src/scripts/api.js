class SlawAPI{
  static config() {
    return {
      auth: '',
      address: 'https://mighty-citadel-48930.herokuapp.com/api/grizzly',
      channels: {
        roulette: 'roulette_participants:$v:$username',
        user_data: 'user_data:$v',
        houses: 'houses:$v',
        creature: 'creature_attack:$v',
        house_raids: 'house_raid:$v'
      },
      version: 'v0',
    };
  }

  static fetch(req) {
    return fetch(req).then(res => {
      const contentType = res.headers.get('content-type');
      if(res.ok && contentType && contentType.includes('application/json')){
        return res.json();
      }
    });
  }

  static get(endpoint, data) {
    return SlawAPI.fetch(
      new Request(
        SlawAPI.config().address + endpoint + data.toQueryString(),
        {
          method: 'GET',
          mode: 'cors',
          cache: "no-cache",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );
  }

  static post(enpoint, body) {
    return SlawAPI.fetch(
      new Request(
        SlawAPI.config().address + endpoint,
        {
          method: 'POST',
          mode: 'cors',
          cache: "no-cache",
          body,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );
  }

  static getCultist(username) {
    return SlawAPI.get('/followed', {name: username.toLowerCase()});
  }

  static getLeaderboard() {
    return SlawAPI.get('/housestats', {name: 'undefined'});
  }

  static getPoints(username) {
    //Waiting for points endpoint
    return SlawAPI.getCultist(username);
  }

  static channelConnect(apiSocket, channelName, parameters, callbacks) {
    let pattern = new RegExp("\\$(\\w+)\\b", 'g');
    let connectionString = SlawAPI.config().channels[channelName]
      .replace(pattern, (match, param) => {
        if(param === 'v') {
          return SlawAPI.config().version;
        } else if(parameters[param]) {
          return parameters[param];
        } else {
          throw `Missing parameter "${match}" for connection to "${channelName}"`;
        }
      })
    ;

    let channel = apiSocket.channel(connectionString, parameters || {});
    channel.join().receive('ok', body => {
      if(typeof callbacks.onOpen === 'function') {
        callbacks.onOpen(body);
      }
    });

    SlawAPI.channelAddListener(channel, callbacks);

    return channel;
  }

  static channelAddListener(channel, callbacks) {
    let connectionName = channel.topic.substring(0, channel.topic.indexOf(':'));

    for(let callback in callbacks) {
      if(callback === 'onOpen') { continue; }
      if(typeof callbacks[callback].func === 'function') {
        let listenerString;
        let f = callbacks[callback];
        if(f.path){
          listenerString = f.path;
        } else {
          listenerString = `${connectionName}:${callback}`;
          if(f.endpoint) {
            listenerString += `:${f.endpoint}`;
          }
        }

        channel.on(listenerString, body => {
          f.func(body);
        });
      }
    }
  }

  static channelPush(channel, action, endpoint, body = {}) {
    let connectionName = channel.topic.substring(0, channel.topic.indexOf(':'));
    let pushString = `${connectionName}:${action}`;
    if(endpoint) {pushString += `:${endpoint}`}

    channel.push(pushString, body);
  }
}
