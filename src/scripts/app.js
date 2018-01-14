// manifest.json's `run_at` declaration acts as a DOM ready listener
//  when set to "document_end" so the whole script in run only then
//console.log('Loading...');

const system = getSystem();
const context = getContext();

const badges = new Badges();
const points = new Points();

// Prepare to observe/listen to mutations in the DOM and react to them;
const twitchObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    //console.log({target: mutation.target, identifier: elementIdentifier(mutation.target)});
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
      ? "div.js-chat-buttons.chat-buttons-container.clearfix"
      : "div.top-nav__nav-items-container.tw-align-items-stretch.tw-flex.tw-flex-grow-1.tw-flex-shrink-0.tw-flex-nowrap"
    ;
    //if(document.querySelectorAll(chatOptionsIdentifier)[0]){
    if(elementIdentifier(mutation.target) === chatOptionsIdentifier){
      points.initialize();
    }
  });
});

//Start observing twitch
const twitch = context === 'chat'
  ? document.querySelectorAll("body")[0]
  : document.querySelectorAll("#root div div")[0]
;
twitchObserver.observe(twitch, {childList: true, subtree: true});
