async function getJoke() {

    let setup = document.getElementById("setup");
    let punchline = document.getElementById("punchline");
    let button = document.getElementById("jokeBtn");

    setup.innerText = "Loading joke...";
    punchline.innerText = "";

    button.disabled = true;

    try {

        // Fetch joke from API
        let response = await fetch(
            "https://v2.jokeapi.dev/joke/Any?type=twopart&safe-mode"
        );

        // Check response
        if (!response.ok) {
            throw new Error("API is not responding");
        }

        // Convert response into JSON
        let data = await response.json();

        // Check API error
        if (data.error) {
            throw new Error(data.message);
        }

        // Display joke
        setup.innerText = data.setup;
        punchline.innerText = data.delivery;

    }

    catch (error) {

        setup.innerText = "Oops! Something went wrong.";

        punchline.innerText =
            "Please check your internet connection and try again.";

        console.log(error);

    }

    finally {

        button.disabled = false;

    }
}
