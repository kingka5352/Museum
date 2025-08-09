document.addEventListener('DOMContentLoaded', () => {
  // grab the form
  const form = document.querySelector('.login-form');

  // on submit
  form.addEventListener('submit', e => {
    e.preventDefault(); // stop page reload

    // read inputs
    const username = form.username.value;
    const password = form.password.value;

    // show what was entered
    alert(`You entered:\nUsername: ${username}\nPassword: ${password}`);
  });
});