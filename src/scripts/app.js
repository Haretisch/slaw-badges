// manifest.json's `run_at` declaration acts as a DOM ready listener
//  when set to "document_end" so the whole script in run only then
const system = getSystem();
let context = getContext();
let CHAT_ONLY = context === 'chat';
let chat;
let emotes;
let badges;
let points;

// Prepare to observe/listen to mutations in the DOM and react to them;
const twitchObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    // When a big change in the page happens (usually navigation),
    //  recheck if we want to observeChat, and do other things
    let chatIdentifiers = CHAT_ONLY
      ? ["ul.chat-lines"]
      : [
          "div.tw-full-height.tw-flex.tw-flex-nowrap.tw-relative",
          "div.tw-full-height.tw-overflow-hidden.tw-flex.tw-flex-nowrap.tw-relative"
        ]
    ;
    if(chatIdentifiers.includes(elementIdentifier(mutation.target))){
      chat.observeChat();
    }

    let chatOptionsIdentifiers = CHAT_ONLY
      ? ["div.js-chat-buttons.chat-buttons-container.clearfix"]
      : [
          "div.top-nav__nav-items-container.tw-align-items-stretch.tw-flex.tw-flex-grow-1.tw-flex-shrink-0.tw-flex-nowrap",
          "textarea.tw-textarea.tw-textarea--no-resize",
          "div.root-scrollable__wrapper.tw-full-width.tw-relative"
        ]
    ;
    if(chatOptionsIdentifiers.includes(elementIdentifier(mutation.target))){
      points.initialize();
    }
  });
});
const twitch = CHAT_ONLY
  ? document.querySelectorAll("body")[0]
  : document.querySelectorAll("#root")[0]
;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if(sender.id === system.runtime.id && message.action ==='contextChange'){
    context = message.context;
    CHAT_ONLY = context === 'chat';
    if(context){
      start();
    } else {
      stop();
    }
  }
});

function start() {
  if(!chat) chat = new Chat();
  if(!emotes) emotes = new Emotes();
  if(!badges) badges = new Badges();
  if(!points) points = new Points();

  twitchObserver.observe(twitch, {childList: true, subtree: true});
  chat.observeChat();
}

function stop() {
  //stop twich observation
  twitchObserver.disconnect();
  //stop chat observation
  chat.disconnect();
  //stop points fetching
  points.disconnect();
}

if(context) {
  start();
}
