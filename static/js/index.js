const passwordToggle = document.getElementById('password-toggle');
const passwordField = document.getElementById('password');
const confirmPasswordField = document.getElementById('password1');


if (passwordToggle && !passwordToggle.checked) {
  passwordField.setAttribute('name', '');
  passwordField.style.display = 'none';
  confirmPasswordField.setAttribute('name', '');
  confirmPasswordField.style.display = 'none';
};

passwordToggle && passwordToggle.addEventListener('change', event => {
  if (passwordToggle.checked) {
    passwordField.setAttribute('name', 'password');
    passwordField.style.display = 'block';
    confirmPasswordField.setAttribute('name', 'password1');
    confirmPasswordField.style.display = 'block';
  } else {
    passwordField.setAttribute('name', '');
    passwordField.style.display = 'none';
    confirmPasswordField.setAttribute('name', '');
    confirmPasswordField.style.display = 'none';
  }
});

const consumedCalories = document.querySelector('#food-items-table .table-row-total');
const spentCalories = document.querySelector('#activities-table .table-row-total');
const totalCalories = (consumedCalories && parseInt(consumedCalories.getAttribute('data-total'))) - (spentCalories && parseInt(spentCalories.getAttribute('data-total')));

const divConclusion = document.querySelector('.conclusion');
const tee = document.getElementById('tee');
const teeAmount = tee.innerHTML;
const calorieBalance = totalCalories - teeAmount;
const conclusion = document.createElement('div');
conclusion.innerHTML = `<b>Your calorie balance is:</b> ${totalCalories} cal`;
const conclusion1 = document.createElement('div');
conclusion1.innerHTML = `<b>Your calorie ${calorieBalance < 0 ? 'deficit' : 'surplus'} is:</b> ${Math.abs(calorieBalance)} cal`;
const goal = document.getElementById('goal').innerHTML.trim();
let tip;
if (
  (goal == 'Lose weight' && calorieBalance < -100) ||
  (goal == 'Gain weight' && calorieBalance > 100) ||
  (goal == 'Maintain weight' && Math.abs(calorieBalance) < 100)
) {
  tip = 'You are on track with your goal.';

} else {
  tip = 'You are not exactly on track with your goal. Please review your diet and exercises schedule'
};
if (Math.abs(calorieBalance) > 700) {
  tip += '\nYou might want to take a slower pace with calorie difference! Gaining/losing over 500 calories a day can have a negative impact on your health'
};
const conclusion2 = document.createElement('div');
conclusion2.innerHTML = `<b>Tip:</b> ${tip}`;

divConclusion.appendChild(conclusion);
divConclusion.appendChild(conclusion1);
divConclusion.appendChild(conclusion2);

const userDetails = document.querySelector('.collapsible');
userDetails.addEventListener("click", function () {
  var content = this.nextElementSibling;
  if (content.style.maxHeight) {
    content.style.maxHeight = null;
  } else {
    content.style.maxHeight = content.scrollHeight + "px";
  };
});

const calendarCollapsible = document.querySelector('.collapsible-calendar');
calendarCollapsible.addEventListener("click", function () {
  var content = this.nextElementSibling;
  if (content.style.maxHeight) {
    content.style.maxHeight = null;
  } else {
    content.style.maxHeight = content.scrollHeight + "px";
  };
});
