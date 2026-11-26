async function searchUniversity() {
    const country = document.getElementById("country").value.trim();
    const message = document.getElementById("message");
    const result = document.getElementById("result");

    result.innerHTML = "";

    if (country === "") {
        message.innerText = "Please enter a country name.";
        return;
    }

    message.innerText = "Loading universities...";

    try {
        // Important: use HTTP, not HTTPS
        const url = "http://universities.hipolabs.com/search?country="
                    + encodeURIComponent(country);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("API error: " + response.status);
        }

        const data = await response.json();

        if (data.length === 0) {
            message.innerText = "No universities found. Check the country name.";
            return;
        }

        message.innerText = data.length + " universities found.";

        data.forEach(function(university) {
            const card = document.createElement("div");
            card.className = "card";

            const name = document.createElement("h3");
            name.innerText = university.name;

            const state = document.createElement("p");
            state.innerText = "State: " +
                (university["state-province"] || "Not available");

            const link = document.createElement("a");
            const website = university.web_pages?.[0];

            if (website) {
                link.href = website;
                link.innerText = "Visit Website";
                link.target = "_blank";
                link.rel = "noopener noreferrer";
            } else {
                link.innerText = "Website not available";
            }

            card.appendChild(name);
            card.appendChild(state);
            card.appendChild(link);

            result.appendChild(card);
        });

    } catch (error) {
        console.error("Error:", error);
        message.innerText = "Unable to load data. Check your internet connection or API.";
    }
}
