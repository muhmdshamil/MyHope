document.addEventListener("DOMContentLoaded", () => {
    const donateForm = document.getElementById("donate-form");
    const requestForm = document.getElementById("request-form");
    const donorList = document.getElementById("donor-list-items");

    // Load existing donors from localStorage
    function loadDonors() {
        const donors = JSON.parse(localStorage.getItem("donors")) || [];
        return donors;
    }

    // Save donor to localStorage
    function saveDonor(donor) {
        const donors = loadDonors();
        donors.push(donor);
        localStorage.setItem("donors", JSON.stringify(donors));
    }

    // Display filtered donors
    function displayDonors(bloodType) {
        donorList.innerHTML = ""; // Clear the list
        const donors = loadDonors();
        const filteredDonors = donors.filter(donor => donor.bloodType === bloodType);

        if (filteredDonors.length > 0) {
            filteredDonors.forEach(donor => {
                const listItem = document.createElement("li");
                listItem.textContent = `${donor.name}, Contact: ${donor.contact}, Location: ${donor.location}`;
                donorList.appendChild(listItem);
            });
        } else {
            const noDonors = document.createElement("li");
            noDonors.textContent = "No donors available for this blood type.";
            donorList.appendChild(noDonors);
        }
    }

    // Handle donation form submission
    donateForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("donorname").value;
        const bloodType = document.getElementById("Donatetype").value;
        const contact = document.getElementById("donorcontact").value;
        const location = document.getElementById("donorLocation").value;

        const donor = { name, bloodType, contact, location };
        saveDonor(donor);

        // Clear form fields
        donateForm.reset();
        alert("Donor information saved successfully!");
    });

    // Handle request form submission
    requestForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const bloodType = document.getElementById("need-type").value;

        // Display donors matching the blood type
        displayDonors(bloodType);
        alert("request information saved successfully!");
    });
});
