class Toasts {
  constructor() {
    this.position = 'topLeft'; // TODO get from settings, default to top-left

    this.settings = {
      theme: 'dark',
      close: false, //Hides "x" button
      closeOnClick: true,
      progressBar: true,
      position: this.position,
      //maxWidth: '150px',
      animateInside: false,
      wrapperTarget: '.player-root',

      //timeout: false, // For testing only
    };

    chat.registerListener('badges', this.test.bind(this));
  }

  toast(message) {
    let container = document.querySelector('.player-root');
    if(container /* && feature is ON*/) {
      iziToast.show({
        ...this.settings,
        message,
      });
    }
  }

  test(mutation) {
    if(mutation.addedNodes[0].classList) {
      const comment = mutation.addedNodes[0];
      const isSystemMessage = () => comment.classList.contains('admin') || !comment.classList.contains('chat-line__message');
      const hasMessageText = () => !!comment.querySelector('span[data-a-target=chat-message-text]');
      const isUserCommand = () => comment.querySelector('span[data-a-target=chat-message-text]').innerText.substring(0, 1) === '!';

      if(!isSystemMessage() && hasMessageText() && isUserCommand()) {
        let args = comment.querySelector('span[data-a-target=chat-message-text]').innerText === '!tt';
        console.log(comment.querySelector('span[data-a-target=chat-message-text]').innerText, args);
        if(args) {
          this.toast('<strong>Häretisch</strong> has attacked Midir, the Darkeater for 784 points! <br />Join them for the glory of House Lannistark!');
        }
      }
    }
  }
}
