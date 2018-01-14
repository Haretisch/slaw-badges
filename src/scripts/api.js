class SlawAPI{
  static config() {
    return {
      auth: '',
      endpoint: 'https://mighty-citadel-48930.herokuapp.com/api/grizzly',
      version: 'v1',
    };
  }

  static fetch(req) {
    return fetch(req).then(res => {
      const contentType = res.headers.get('content-type');
      if(res.ok && contentType && contentType.includes('application/json')){
        return res.json();
      }
    });
  }

  static getFollower(username) {
    const endpoint = SlawAPI.config().endpoint;
    const req =  new Request(
      endpoint + '/followed?name=' + username.toLowerCase(),
      {method: 'GET', mode: 'cors'}
    );

    return SlawAPI.fetch(req);
  }

  //Return points ??and title??
  static getPoints(username) {
    const endpoint = SlawAPI.config().endpoint;
    const req =  new Request(
      //For now the enpoints for followers and points are the same
      endpoint + '/followed?name=' + username.toLowerCase(),
      {method: 'GET', mode: 'cors'}
    );

    return SlawAPI.fetch(req);
  }
}
