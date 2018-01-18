// manifest.json's `run_at` declaration acts as a DOM ready listener
//  when set to "document_end" so the whole script in run only then
const context = getContext();
const system = getSystem();

const CHAT_ONLY = context === 'chat';

let chat;

if(context){
  chat = new Chat();

  const badges = new Badges();
  const points = new Points();

  // Prepare to observe/listen to mutations in the DOM and react to them;
  const twitchObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      // When a big change in the page happens (usually navigation),
      //  recheck if we want to observeChat, and do other things
      let chatIdentifier = CHAT_ONLY
        ? "ul.chat-lines"
        : "div.tw-full-height.tw-flex.tw-flex-nowrap.tw-relative"
      ;
      if(elementIdentifier(mutation.target) === chatIdentifier){
        chat.observeChat();
      }

      let chatOptionsIdentifier = CHAT_ONLY
        ? "div.js-chat-buttons.chat-buttons-container.clearfix"
        : "div.top-nav__nav-items-container.tw-align-items-stretch.tw-flex.tw-flex-grow-1.tw-flex-shrink-0.tw-flex-nowrap"
      ;
      if(elementIdentifier(mutation.target) === chatOptionsIdentifier){
        points.initialize();
      }
    });
  });

  //Start observing twitch
  const twitch = CHAT_ONLY
    ? document.querySelectorAll("body")[0]
    : document.querySelectorAll("#root")[0]
  ;
  twitchObserver.observe(twitch, {childList: true, subtree: true});
}
