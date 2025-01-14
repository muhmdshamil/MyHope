document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value,
    };

    fetch("http://localhost:3000/contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    })
        .then(response => response.text())
        .then(data => {
            alert(data);
        })
        .catch(error => {
            console.error("Error:", error);
        });
});