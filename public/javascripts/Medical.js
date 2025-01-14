       
/* JavaScript for Local Storage Integration */
document.addEventListener("DOMContentLoaded", function () {
    const donateForm = document.getElementById("donate-form");
    const donorList = document.getElementById("donor-list-items");
    const requestForm = document.getElementById("request-form");

    // Save donor details to local storage
    donateForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const donorName = document.getElementById("donor-name").value;
        const donorBloodType = document.getElementById("donor-blood-type").value;
        const donorContact = document.getElementById("donor-contact").value;
        const donorLocation = document.getElementById("donor-location").value;

        const donorDetails = {
            name: donorName,
            bloodType: donorBloodType,
            contact: donorContact,
            location: donorLocation,
        };

        let donors = JSON.parse(localStorage.getItem("donors")) || [];
        donors.push(donorDetails);
        localStorage.setItem("donors", JSON.stringify(donors));

        alert("Donor details saved successfully!");
        donateForm.reset();
    });

    // Display matching donors for requested blood type
    requestForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const requestedBloodType = document.getElementById("request-blood-type").value;
        const donors = JSON.parse(localStorage.getItem("donors")) || [];

        const matchingDonors = donors.filter(
            (donor) => donor.BloodType.toLowerCase() === requestedBloodType.toLowerCase()
        );

        donorList.innerHTML = "";

        if (matchingDonors.length > 0) {
            matchingDonors.forEach((donor) => {
                const listItem = document.createElement("li");
                listItem.textContent = `${donor.name} (${donor.bloodType}) - ${donor.contact}, ${donor.location}`;
                donorList.appendChild(listItem);
            });
        } else {
            donorList.innerHTML = "<li>No donors found for the requested blood type.</li>";
        }
    });
});