class User {
  constructor() {
    this.apiSocket = null;
    this.userChannel = null;
    this.listeners = [
      /*{
        id: unique_listener_id,
        callback: callback_function(),
      }*/
    ]
    this.user = {};
    this.username;

    return new Proxy(this, {
      get: (user, field) => {
        if(field in user) return user[field];
        if(field in user.user) return user.user[field];
        return null;
      }
    });
  }

  initialize() {
    if(CHAT_ONLY) {
      // Assign random houseClass to the user object
      this.user = {
        houseClass: HOUSES[Object.keys(HOUSES).randomElement()],
      }
    }

    return this.waitForMarkup(CHAT_ONLY).then(({username}) => {
      this.username = username;
      this.apiSocket = newApiSocket.currentSocket(username);
      this.socket();
    });
  }

  registerListener(id, callback) {
    let i = this.listeners.findIndex(e => {return e.id === id});
    if(i > -1) {
      this.listeners[i].callback = callback;
    } else {
      this.listeners.push({id, callback});
    }

    if(this.user.house) {
      // Call right away if some data is ready
      callback();
    }
  }

  socket() {
    if (!this.userChannel) {
      this.userChannel = SlawAPI.channelConnect(
        this.apiSocket,
        'user_data', // Channel Key
        {username: this.username}, // Channel parameters
        { // Channel callbacks
          [this.username]: {
            func: this.socketCallback.bind(this),
          },
        }
      );
    } else {
      this.socketCallback();
    }
  }

  socketCallback(user) {
    if(user) {
      let pointsMultiplier = Math.pow(2, Object.keys(user.pointFlags).filter(f => user.pointFlags[f]).length);
      let flags = {
        'Subscriber': user.pointFlags.subscriber,
        'Notifications On': user.pointFlags.notifications,
        'Hosting': user.pointFlags.hosting,
        'Following': user.pointFlags.following,
      }

      this.user = {
        flags,
        house: user.house.name,
        houseClass: HOUSES[user.house.name.toLowerCase()],
        points: Math.floor(user.points.current),
        pointsMultiplier,
      };
    }

    this.listeners.map(l => { l.callback(); });
  }

  unregisterListener(id) {
    this.listeners = this.listeners.filter(l => l.id !== id);
  }

  waitForMarkup(chatOnly) {
    return new Promise(resolve => {
      const wait = () => {
        let markup = chatOnly
          ? 'div.chat-settings__content span[data-a-target="edit-display-name"]'
          : 'div.top-nav-user-menu__username p'
        ;
        let username = document.querySelector(markup);

        if(username) {
          username = username.innerText.toLowerCase();
          resolve({username});
        } else {
          window.requestAnimationFrame(wait);
        }
      };
      wait();
    });
  }
}
