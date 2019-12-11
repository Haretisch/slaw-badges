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
    this.clicked = false;

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
      console.log(`Welcome back, ${username}!`)

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
      let multiplier = Math.pow(2, Object.keys(user.pointFlags).filter(f => user.pointFlags[f]).length);
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
        multiplier,
      };
    }

    if(this.username !== 'sirslaw') {
      this.listeners.map(l => { l.callback(); });
    }
  }

  unregisterListener(id) {
    this.listeners = this.listeners.filter(l => l.id !== id);
  }

  waitForMarkup(chatOnly) {
    return new Promise(resolve => {
      const wait = async () => {
        let element = document.querySelector('button[data-a-target="chat-settings"]');

        if(element) {
          // 'click' on the settings menu dropdown, opening it.
          //  Allows the menu to be generated and username to be found;
          //  (Is it going to work on all browsers?, previously this was blocked behavior)
          if(!this.clicked) {
            await sleep(10);
            element.click();
            this.clicked = true;
          }

          // Mods chat settings version, return to regular user-mode to get username
          let modeButton = document.querySelector('button[data-a-target="switch-chat-settings-mode"]');
          if(modeButton) {
            modeButton.click();
          }

          let menu = document.querySelector('div[data-a-target="chat-settings-balloon"]');
          if(menu) {
            // Close the menu, by swtiching the necessary class-names;
            menu.classList.remove('tw-block');
            menu.classList.add('tw-hide');
          }

          let username = document.querySelector('span[data-a-target="edit-display-name"]');
          if(username) {
            return resolve({username: username.innerText.toLowerCase()});
          }
        }

        window.requestAnimationFrame(wait);
      };
      wait();
    });
  }
}
