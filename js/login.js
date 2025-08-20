

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.login-form');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const username = form.username.value;
    const password = form.password.value;

    alert(`You entered:\nUsername: ${username}\nPassword: ${password}`);
  });
});
