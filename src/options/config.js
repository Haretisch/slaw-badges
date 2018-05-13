const system = getSystem();

let enableBackground = document.getElementById('enableCoatOfArms');

system.storage.sync.get('slaw_enableCoatOfArms', data => {
  enableBackground.checked = ('slaw_enableCoatOfArms' in data) ? data.slaw_enableCoatOfArms : true;
});

enableBackground.onchange = event => {
  let checked = event.target.checked;
  system.storage.sync.set({slaw_enableCoatOfArms: checked}, () => {
    //sendMessage
    system.tabs.query({active: true, currentWindow: true}, tabs => {
      system.tabs.sendMessage(tabs[0].id, {action: "toggleCoatOfArms", display: checked});
    })
  })
}
