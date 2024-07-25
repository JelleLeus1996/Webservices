function searchRider() {
  const riderName = document.getElementById('riderName').value;
  fetch(`/api/riders/search?name=${riderName}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('result').textContent = JSON.stringify(data, null, 2);
    })
    .catch(error => console.error('Error:', error));
}
  