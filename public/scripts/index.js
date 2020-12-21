// DOM elements
const guideList = document.querySelector('.guides');
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
  console.log(`Data: ${data}`)
  if (data.length) {
    let html = '<option value="" disabled selected>Choose your option</option>';
    data.forEach(doc => {
      const artist = doc.data();
      const li = `
        <option value="${doc.id}">${artist.name}</option>
      `;
      html += li;
    });
    artistList.innerHTML = html

  } else {
    artistList.innerHTML = '';
  }
  $('select').formSelect();
}


// setup guides
const setupGuides = (data) => {

  if (data.length) {
    let html = '';
    data.forEach(doc => {
      const guide = doc.data();
      const li = `
        <li>
          <div class="collapsible-header grey lighten-4"> ${guide.name} </div>
          <div class="collapsible-body white"> ${guide.position} </div>
        </li>
      `;
      html += li;
    });
    guideList.innerHTML = html
  } else {
    guideList.innerHTML = '<h5 class="center-align">Login to view guides</h5>';
  }


};

// setup materialize components
document.addEventListener('DOMContentLoaded', function() {

  var modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);

  var items = document.querySelectorAll('.collapsible');
  M.Collapsible.init(items);

});
