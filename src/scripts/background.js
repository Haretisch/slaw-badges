const system = getSystem();

// Shows icon as active only when on https://www.twitch.tv/sirslaw
if(system.declarativeContent){
  system.runtime.onInstalled.addListener(function() {
    system.declarativeContent.onPageChanged.removeRules(undefined, function() {
      system.declarativeContent.onPageChanged.addRules([{
        conditions: [
          new system.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: 'https://www.twitch.tv/sirslaw' },
          })
        ],
        actions: [ new system.declarativeContent.ShowPageAction() ]
      }]);
    });
  });
}
