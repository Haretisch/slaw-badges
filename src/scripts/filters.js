class Filters {
  constructor() {
    this.house;

    this.refreshHouse();
  }

  destructor() {
    //Destructors aren't really a thing in js, but /shrug
    chat.unregisterListener('filters');
  }

  hide(comment) {
    comment.style['display'] = 'none';
  }

  listener(mutation) {
    if(mutation.addedNodes[0].classList) {
      const comment = mutation.addedNodes[0];
      const isSystemMessage = () => comment.classList.contains('admin') || !comment.classList.contains('message-line');
      const isUserCommand = () => comment.querySelectorAll('.message')[0].innerText.substring(0, 1) === '!';

      if(isSystemMessage() || isUserCommand()) {
        this.hide(comment);
      } else {
        const username = comment.querySelectorAll('.from')[0].innerText.toLowerCase();

        users.load(username, user => {
          if(user.house !== 'h' + this.house) {
            this.hide(comment);
          }
        });
      }
    }
  }

  register() {
    if(CHAT_ONLY && this.house) {
      chat.registerListener('filters', this.listener.bind(this));
    }
  }

  refreshHouse() {
    var url = new URL(window.location.href);
    this.house = url.searchParams.get("h");
  }

  unregister() {
    chat.unregisterListener('filters');
  }
}
