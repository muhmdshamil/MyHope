document.addEventListener("DOMContentLoaded", () => {
    const donateForm = document.getElementById("donate-form");
    const requestForm = document.getElementById("request-form");
    const donorList = document.getElementById("donor-list-items");

    // Load donors from localStorage and display
    function loadDonors() {
        const donors = JSON.parse(localStorage.getItem("donors")) || [];
        donorList.innerHTML = ""; // Clear current list

        donors.forEach(donor => {
            const li = document.createElement("li");
            li.textContent = `${donor.name} - ${donor.type} - ${donor.location} - ${donor.contact}`;
            donorList.appendChild(li);
        });
    }

    // Save donor to localStorage
    function saveDonor(donor) {
        const donors = JSON.parse(localStorage.getItem("donors")) || [];
        donors.push(donor);
        localStorage.setItem("donors", JSON.stringify(donors));
        loadDonors();
    }

    // Event listener for donate form submission
    donateForm.addEventListener("submit", event => {
        event.preventDefault();

        const donor = {
            name: document.getElementById("donor-name").value,
            type: document.getElementById("Donate-type").value,
            contact: document.getElementById("donor-contact").value,
            location: document.getElementById("donor-Location").value,
        };

        saveDonor(donor);
        donateForm.reset();
        alert("Thank you for donating! Your details have been saved.");
    });

    // Event listener for request form submission
    requestForm.addEventListener("submit", event => {
        event.preventDefault();

        const requestDetails = {
            name: document.getElementById("requester-name").value,
            type: document.getElementById("need-type").value,
            contact: document.getElementById("request-contact").value,
            location: document.getElementById("request-location").value,
        };

        alert(`Your request has been submitted. We will contact you shortly.`);
        requestForm.reset();
    });

    // Initial load of donors
    loadDonors();
});

