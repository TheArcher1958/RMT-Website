// DOM elements
// const guideList = document.querySelector('.guides');
const artistList = document.querySelector('#workArtist');
const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
const accountDetails = document.querySelector('.account-details');
const adminItems = document.querySelectorAll('.admin');
const loadingBars = document.querySelectorAll('.progress');
const ui = new firebaseui.auth.AuthUI(firebase.auth());

const hideLoadingBars = () => {
  loadingBars.forEach(item => item.style.display = 'none');
}
const showLoadingBars = () => {
  loadingBars.forEach(item => item.style.display = 'block');
}


const setupUI = (user) => {
  if (user) {
    if (user.admin) {
      adminItems.forEach(item => item.style.display = 'block');
      hideLoadingBars();
    }
    // account info
    db.collection('users').doc(user.uid).get().then(doc => {
      const html = `
        <div>Logged in as ${user.email}</div>
        <div class="pink-text">${user.admin ? 'Admin' : ''}</div>
      `;
      accountDetails.innerHTML = html;
    });


    // toggle user UI elements
    loggedInLinks.forEach(item => item.style.display = 'block');
    loggedOutLinks.forEach(item => item.style.display = 'none');
  } else {

    console.log("starting ui")
    ui.start('#firebaseui-auth-container', {
      callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
          console.log(authResult);
          const modal = document.querySelector('#modal-login');
          M.Modal.getInstance(modal).close();
          // User successfully signed in.
          // Return type determines whether we continue the redirect automatically
          // or whether we leave that to developer to handle.
          return false;
        },
        uiShown: function() {
          // The widget is rendered.
          // Hide the loader.
          document.getElementById('loader').style.display = 'none';
        }
      },
      signInFlow: 'popup',
      //signInSuccessUrl: '',
      signInOptions: [
        // List of OAuth providers supported.
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      ],
      // Other config options...
    });

    // clear account info
    accountDetails.innerHTML = '';
    // toggle user elements
    adminItems.forEach(item => item.style.display = 'none');
    loggedInLinks.forEach(item => item.style.display = 'none');
    loggedOutLinks.forEach(item => item.style.display = 'block');
  }
};

const setupArtists = (data) => {
  if (data.length) {
    let html = '<option value="" disabled selected>Choose your option</option>';
    data.forEach(doc => {
      const artist = doc.data();
      const li = `
        <option value="${artist.name}:${doc.id}">${artist.name}</option>
      `;
      html += li;
    });
    artistList.innerHTML = html

  } else {
    artistList.innerHTML = '';
  }
  $('select').formSelect();
}


// setup Work Showcase
const setupWork = (data) => {

  // {artist: "TitanJin", artistID: "Tw45XpyWB3UtV85HpoDs", type: "banner", url: "https://firebasestorage.googleapis.com/v0/b/person…=media&token=0ca1bfb0-c85d-44ad-9cd1-8b0536b4e5a3"}

  if (data.length) {

    const workTypes = {
      "banner": '',
      "pfp": '',
      "thumbnail": '',
      "mascotlogo": '',
      "logo": '',
      "wallpaper": ''
    };
    data.forEach(doc => {
      console.log(doc.data());
      const work = doc.data();
      const li = `
        <div class="col s3 hoverable card">
            <div class="card-image">
              <img class="responsive-img materialboxed" src="${work.url}">
              <span class="indigo-text darken-4 card-title">${work.artist}</span>
            </div>
            <div class="card-action">
              <a class="" href="artists.html?artistID=${work.artistID}">View more by ${work.artist}</a>
            </div>
        </div>
      `;

      workTypes[work.type] += li
    });
    ["banner","pfp","thumbnail","mascotlogo","logo","wallpaper"].forEach(item => {
      let workListCards = document.querySelector(`#${item}`);
        workListCards.innerHTML = workTypes[item];
    });
      $('.materialboxed').materialbox();
      $('.tabs').tabs();
  } else {
    ["banner","pfp","thumbnail","mascotlogo","logo","wallpaper"].forEach(item => {
      let workListCards = document.querySelector(`#${item}`);
      workListCards.innerHTML = '<h5 class="center-align">Unable to find anything.</h5>';
    });
  }


};

// setup materialize components
document.addEventListener('DOMContentLoaded', function() {

  var modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);

  var items = document.querySelectorAll('.collapsible');
  M.Collapsible.init(items);


});
