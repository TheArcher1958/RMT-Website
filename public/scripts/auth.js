// add admin cloud function

const adminForm = document.querySelector('.admin-actions');
adminForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const adminEmail = document.querySelector('#admin-email').value;
  const addAdminRole = functions.httpsCallable('addAdminRole');
  addAdminRole({ email: adminEmail }).then(result => {
    console.log(result);
    adminForm.reset();
  });
});

// listen for auth status changes
auth.onAuthStateChanged(user => {
  if (user) {
    user.getIdTokenResult().then(idTokenResult => {
      user.admin = idTokenResult.claims.admin;
      setupUI(user);
    });
    // db.collection('artists').get().then(function(doc) {
    //   setupArtists(doc.docs);
    // })
    //   .catch(function(error) {
    //   console.log("Error getting documents: ", error);
    // });;
    db.collection('artists').onSnapshot(snapshot => {
      setupGuides(snapshot.docs);
      setupArtists(snapshot.docs);
    }, err => console.log(err.message));
  } else {
    setupUI();
    setupGuides([]);

  }
});

// create new artist

const createArtist = document.querySelector('#createArtist-form');
createArtist.addEventListener('submit', (e) => {
  showLoadingBars();
  e.preventDefault();
  var positionValues = $('#positionSelect').val();
  if (positionValues.length == 0) {
    M.toast({html: 'The form is incomplete!'})
    hideLoadingBars();
    return
  }
  document.getElementById("artSub").disabled = true;
  db.collection('artists').add({
    name: createArtist.artistName.value,
    position: positionValues.join(", "),
  }).then(() => {
    M.toast({html: 'Artist Created!'})
    const modal = document.querySelector('#modal-createArtist');
    hideLoadingBars();
    document.getElementById("artSub").disabled = false;
    createArtist.reset();
    M.Modal.getInstance(modal).close();
  }).catch(err => {
    console.log(err.message);
    M.toast({html: 'A problem has occurred!\nCode: 63'})
    hideLoadingBars();
    document.getElementById("artSub").disabled = false;
  });

});



// add work

const createWork = document.querySelector('#addWork-form');
createWork.addEventListener('submit', (e) => {
  showLoadingBars();
  e.preventDefault();
  if (createWork.workType.value== "") {
    M.toast({html: 'The form is incomplete!'})
    hideLoadingBars();
    return
  }
  document.getElementById("workSub").disabled = true;
  var uploadedFile = $('#workUploadFile').prop('files');
  var fileRef = storageRef.child(createWork.workType.value + '/' + uploadedFile[0].name);
  fileRef.put(uploadedFile[0]).then(function(snapshot) {
    db.collection('work').add({
      path: snapshot.ref.fullPath,
      type: createWork.workType.value,
      artist: createWork.workArtist.value,
    }).then(function(workDocRef) {
      db.collection('artists').doc(createWork.workArtist.value).update({
        work: firebase.firestore.FieldValue.arrayUnion(workDocRef.id),
      }).then(() => {
        // close the create modal & reset form
        M.toast({html: 'Added work to artist!'})
        const modal = document.querySelector('#modal-addWork');
        createWork.reset();
        hideLoadingBars()
        document.getElementById("workSub").disabled = false;
        M.Modal.getInstance(modal).close();
      }).catch(err => {
        M.toast({html: 'A problem has occurred!\nCode: 96'})
        hideLoadingBars();
        document.getElementById("workSub").disabled = false;
      });
    }).catch(err => {
      M.toast({html: 'A problem has occurred!\nCode: 99'})
      hideLoadingBars();
      document.getElementById("workSub").disabled = false;
    });

  });
});


// logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut();
});

