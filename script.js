// Load breed data from the JSON file
let breedData = [];

// Fetch the JSON file and initialize the data
fetch("breedData.json")
    .then(response => response.json())
    .then(data => {
        breedData = data;
    })
    .catch(error => console.error("Error loading breed data:", error));

// Collect user answers
let userAnswers = {
    trainability: 5,
    longevity: 10,
    initialCost: 5000,
    foodCost: 1000,
    grooming: 2,
    children: "yes", // Matching the "yes"/"no" format in the data
    hdb: "Yes" // Ensure this matches "Yes"/"No" in the breed data
};

// Update the value displayed next to the range input
function updateValue(id) {
    const value = document.getElementById(id).value;

    if (id === "initialCost" || id === "foodCost") {
        // Format value as USD for the slider value
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
        document.getElementById(id + "Value").textContent = formatter.format(value); // Display formatted USD value
    } else {
        document.getElementById(id + "Value").textContent = value; // Display raw value for other sliders
    }

    userAnswers[id] = id === "children" || id === "hdb" ? value : parseInt(value, 10);
}

// Submit Quiz
function submitQuiz() {
    document.getElementById("quizContainer").style.display = "none";
    document.getElementById("resultContainer").style.display = "block";

    // Filter breeds based on HDB approval
    let filteredBreeds = breedData.filter(breed => {
        if (userAnswers.hdb === "Yes") {
            return breed["HDB approved"] === "Yes"; // Only show HDB approved breeds
        } else if (userAnswers.hdb === "No") {
            return breed["HDB approved"] === "No"; // Only show non-HDB approved breeds
        }
        return true; // Default case (if no HDB preference provided, include all breeds)
    });

    let matches = filteredBreeds.map(breed => {
        let score = 0;

        // Invert breed.Obedience: higher means easier to train
        const adjustedObedience = 100 - breed.Obedience;

        // Map userAnswers.trainability (1-10) to a 0-100 scale where 1 ~ 100 (easiest) and 10 ~ 0 (hardest)
        const userTrainabilityMapped = 100 - ((userAnswers.trainability - 1) * (100 / 9));
        score += Math.abs(adjustedObedience - userTrainabilityMapped);

        // Map userAnswers.longevity (1-10) to prioritize breeds based on longevity
        const userLongevityMapped = (userAnswers.longevity - 1) * (20 / 9); // Scale user input (1-10) to longevity range (0-20)
        score += Math.abs(breed.Longevity - userLongevityMapped);

        // Prioritize matching Purchase Price
        score += Math.abs(breed["Purchase Price"] - userAnswers.initialCost) / 100;

        // Match food costs strictly within the user's budget
        if (breed["Food Costs"] > userAnswers.foodCost) {
            // Exclude breeds exceeding the budget by assigning a very high score
            score += 10000; 
        } else {
            // Slight penalty for being below or close to the budget
            score += Math.abs(breed["Food Costs"] - userAnswers.foodCost) / 50; 
        }

        // Match grooming preference
        score += Math.abs(breed.Grooming - userAnswers.grooming);

        return { ...breed, score };
    });

    // Sort breeds by score (lower is better)
    matches.sort((a, b) => a.score - b.score);

    // Display top 3 results
    displayResults(matches.slice(0, 3));
}

// Display Results
function displayResults(topBreeds) {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = '';

    // Format price in USD
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

    topBreeds.forEach(breed => {
        const breedElement = document.createElement("div");
        breedElement.className = "breed-card";

        // Calculate percentages
        const obediencePercentage = breed.Obedience; // Already 0-100
        const longevityPercentage = (breed.Longevity / 20) * 100;
        const purchasePriceFormatted = formatter.format(breed["Purchase Price"]);
        const foodCostsPercentage = (breed["Food Costs"] / 2000) * 100;
        const groomingPercentage = (breed.Grooming / 3) * 100;
        const childrenPercentage = (breed["Suitability for children"] / 3) * 100;

breedElement.innerHTML = `
    <h3>${breed.Breed}</h3>
    <div>
        <label>Training Difficulty:</label>
        <progress value="${obediencePercentage}" max="100" style="--progress-bar-color: #48cbc1;"></progress> (${obediencePercentage.toFixed(1)}%)
    </div>
    <div>
        <label>Longevity:</label>
        <progress value="${longevityPercentage}" max="100" style="--progress-bar-color: #48cbc1;"></progress> (${breed.Longevity.toFixed(1)} years)
    </div>
    <div>
        <label>Purchase Price:</label> ${purchasePriceFormatted}
    </div>
    <div>
        <label>Food Costs:</label>
        <progress value="${foodCostsPercentage}" max="100" style="--progress-bar-color: #48cbc1;"></progress> (${formatter.format(breed["Food Costs"])})
    </div>
    <div>
        <label>Grooming Needs:</label>
        <progress value="${groomingPercentage}" max="100" style="--progress-bar-color: #48cbc1;"></progress> (${groomingPercentage.toFixed(1)}%)
    </div>
    <div>
        <label>Suitability for Children:</label>
        <progress value="${childrenPercentage}" max="100" style="--progress-bar-color: #48cbc1;"></progress> (${childrenPercentage.toFixed(1)}%)
    </div>
    <div>
        <label>HDB Approved:</label> ${breed["HDB approved"]}
    </div>
`;

        resultsContainer.appendChild(breedElement);
    });
}

function nextQuestion(currentQuestionNumber) {
    // Get the current question and hide it
    const currentQuestion = document.getElementById("question" + currentQuestionNumber);
    if (currentQuestion) {
        currentQuestion.style.display = "none";
    }

    // Show the next question
    const nextQuestion = document.getElementById("question" + (currentQuestionNumber + 1));
    if (nextQuestion) {
        nextQuestion.style.display = "block";
    } else {
        // If no more questions, show the submit button
        document.getElementById("submitBtnContainer").style.display = "block";
    }
}