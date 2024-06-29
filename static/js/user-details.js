const genderInputSection = document.getElementById('gender-field');
const otherGender = document.getElementById('gender_other');
const genderInput = document.getElementById('gender_custom');
if (otherGender.checked) {
  genderInput.setAttribute('type', 'text');
}
genderInputSection.addEventListener('click', event => {
  if (otherGender.checked) {
    genderInput.setAttribute('type', 'text');
  } else {
    genderInput.setAttribute('type', 'hidden');
  }
});

const submitUserForm = () => {
  let form = document.getElementById('user-details');
  form.submit();
};
