function searchRider() {
  const fullName = document.getElementById('riderName').value;
  const [firstName, lastName] = fullName.split(' '); // Simple split by space, assuming two-part names

  fetch(`/api/riders/full-name/${firstName}/${lastName}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('result').textContent = JSON.stringify(data, null, 2);
    })
    .catch(error => console.error('Error:', error));