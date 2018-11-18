class VIP {
  constructor() {
    // TODO get this list from the API
    this.vipList = ["omeed", "sacriel", "cohhcarnage", "kitboga", "kawaiigamii", "missrubyfalls", "mariathegerman", "sirslaw", "professorbroman", "dizzydizaster", "rxysurfchic", "thabuttress", "lowco", "anthony_kongphan", "kmagic101", "blessious", "xd1x", "gogcom", "originpcceo", "tkbreezy", "shesnaps", "dethridge", "cobaltstreak", "joshtuckertv", "screamkiwi", "sabre_ap", "questlevelawesome", "zeecorona", "zacgalsim", "audreyrawr", "danotage", "kcco_monty", "gogganz", "shlomo", "coffee4fuel", "ellohime", "bikeman", "luckymisfit", "dill_ampersand", "caliverse", "friskk", "podsofwar", "guardianoutpost", "faucius", "sequisha", "rustlingrose", "fairlight_excalibur" ];
    this.vipAwareUsers = ["sirslaw", "haretisch"];

    chat.registerListener('vips', this.listener.bind(this));
  }


  getUserInfo(comment){
    let poster;
    if(poster = comment.querySelector('.chat-author__display-name')) {
      return poster.textContent.toLowerCase();
    }
    return '';
  }

  listener(mutation) {
    if(this.vipAwareUsers.includes(user.username)) {
      let comment = mutation.addedNodes[0];
      let poster = this.getUserInfo(comment);

      if(this.vipList.includes(poster)) {
        comment.classList.add('slaw-vip-highlight');
      }
    }
  }
}
