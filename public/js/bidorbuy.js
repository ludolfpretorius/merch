fetch('http://localhost:3000/bidorbuy', {
	method: 'post',
	headers: {'Content-Type': 'application/json'}
	// body: JSON.stringify({
	// 	username: username,
	// 	email: email,
	// 	password: password
	// })
})
.then(res => res.json())
.then(data => {
	const app = document.querySelector('#bidorbuy');
	app.innerHTML = JSON.stringify(data);
	console.log(data)
})

