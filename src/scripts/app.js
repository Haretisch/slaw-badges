// manifest.json's `run_at` declaration acts as a DOM ready listener
//  when set to "document_end" so the whole script in run only then
//console.log('Loading...');

const STREAMER = 'sirslaw';

const system = getSystem();
const context = getContext();

const badges = new Badges();

// Prepare to observe/listen to mutations in the DOM and react to them;
const twitchObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    // When a big change in the page happens (usually navigation),
    //  recheck if we want to observeChat, and do other things
    let chatIdentifier = context === 'chat'
      ? "ul.chat-lines"
      : "div.tw-full-height.tw-flex.tw-flex-nowrap.tw-relative"
    ;
    if(elementIdentifier(mutation.target) === chatIdentifier){
      badges.observeChat();
    }

    let chatOptionsIdentifier = context === 'chat'
      ? ""
      : ".chat-input__buttons-container"
    ;
    if(document.querySelectorAll(chatOptionsIdentifier)[0]){
      let points = new Points();
    }
  });
});

//Start observing twitch
const twitch = context === 'chat'
  ? document.querySelectorAll("body")[0]
  : document.querySelectorAll("#root div div")[0]
;
twitchObserver.observe(twitch, {childList: true, subtree: true});
