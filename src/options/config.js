const system = getSystem();

let enableBanner = document.getElementById('enableBanner');
let enableMentions = document.getElementById('enableMentions');

system.storage.sync.get('codeiaksFamilies_enableBanner', data => {
  enableBanner.checked = ('codeiaksFamilies_enableBanner' in data) ? data.codeiaksFamilies_enableBanner : true;
});

system.storage.sync.get('codeiaksFamilies_enableMentions', data => {
  enableMentions.checked = ('codeiaksFamilies_enableMentions' in data) ? data.codeiaksFamilies_enableMentions : true;
});

enableBanner.onchange = event => {
  let checked = event.target.checked;
  system.storage.sync.set({codeiaksFamilies_enableBanner: checked}, () => {
    system.tabs.query({url: "*://*.twitch.tv/*"}, tabs => {
      tabs.forEach(tab => system.tabs.sendMessage(tab.id, {action: "user.family.toggleBanner", display: checked}))
    })
  });
}

enableMentions.onchange = event => {
  let checked = event.target.checked;
  system.storage.sync.set({codeiaksFamilies_enableMentions: checked}, () => {
    system.tabs.query({url: "*://*.twitch.tv/*"}, tabs => {
      tabs.forEach(tab => system.tabs.sendMessage(tab.id, {action: "user.family.toggleMentions", listen: checked}))
    })
  });
}
