class Points {
  constructor() {
    this.chatOnly = context === 'chat';
    this.userNameHolder = 'div.chat-settings__content div.tw-mg-t-2 span.tw-strong > span';
    this.userName = document.querySelectorAll(this.userNameHolder);//[0].innerText.toLowerCase();
    //console.log(this.userName);
  }
}