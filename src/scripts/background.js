const system = getSystem();
const targetUrl = 'https://www.twitch.tv/sirslaw';

// Shows icon as active only when on https://www.twitch.tv/sirslaw
if(system.declarativeContent){
  system.runtime.onInstalled.addListener(function() {
    system.declarativeContent.onPageChanged.removeRules(undefined, function() {
      system.declarativeContent.onPageChanged.addRules([{
        conditions: [
          new system.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: targetUrl },
          })
        ],
        actions: [ new system.declarativeContent.ShowPageAction() ]
      }]);
    });
  });
} else {
  function initializePageAction(tab) {
    if(tab.url.includes(targetUrl)){
        system.pageAction.show(tab.id);
    }
  }

  system.tabs.onUpdated.addListener((id, changeInfo, tab) => {
    initializePageAction(tab);
  });
}
