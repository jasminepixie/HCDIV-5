// Load breed data from the JSON file
let breedData = [];

// Fetch the JSON file and initialize the data
fetch("./breedData.json")
  .then((response) => response.json())
  .then((data) => {
    breedData = data;
  })
  .catch((error) => console.error("Error loading breed data:", error));

// Collect user answers
let userAnswers = {
  trainability: 5,
  longevity: 10,
  initialCost: 1000,
  foodCost: 1000,
  grooming: 2,
  children: "yes", // Matching the "yes"/"no" format in the data
  hdb: "Yes", // Ensure this matches "Yes"/"No" in the breed data
};

function updateGroomingLabel() {
  const groomingInput = document.getElementById("grooming");
  const groomingLabel = document.getElementById("groomingValue");

  // Define labels for the grooming levels (reversed scale)
  const labels = {
    1: "Every other week",
    2: "Every week",
    3: "Every day",
  };

  // Update the displayed label based on the slider input
  groomingLabel.textContent = labels[groomingInput.value];

  // Update the userAnswers object with the selected grooming level
  userAnswers.grooming = parseInt(groomingInput.value, 10);
}

// Update the value displayed next to the range input
function updateValue(id) {
  const value = document.getElementById(id).value;

  if (id != "children" && id != "hdb") {
    if (id === "initialCost" || id === "foodCost") {
      // Format value as USD for the slider value
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });
      document.getElementById(id + "Value").textContent =
        formatter.format(value); // Display formatted USD value
    } else {
      document.getElementById(id + "Value").textContent = value; // Display raw value for other sliders
    }
  }
  userAnswers[id] =
    id === "children" || id === "hdb" ? value : parseInt(value, 10);
}

// Submit Quiz
function submitQuiz() {
  document.getElementById("quizContainer").style.display = "none";
  document.getElementById("resultContainer").style.display = "block";

  // Filter breeds based on HDB approval and other criteria
  let filteredBreeds = breedData.filter((breed) => {
    // Filter based on HDB approval
    const hdbCondition = userAnswers.hdb === "Yes" ? breed["HDB approved"] === "Yes" : true;
    return hdbCondition;
  });

  // Map filtered breeds with scores based on user preferences
  let matches = filteredBreeds.map((breed) => {
    let score = 0;

    // Training difficulty preference (inverted)
    const adjustedObedience = 100 - breed.Obedience;
    const userTrainabilityMapped =
      100 - (userAnswers.trainability*10);
    score += Math.abs(adjustedObedience - userTrainabilityMapped);

    // Longevity preference mapping
    const userLongevityMapped = (userAnswers.longevity) * (20 / 10);
    score += Math.abs(breed.Longevity - userLongevityMapped);

    // Purchase price preference
    score += Math.abs(breed["Purchase Price"] - userAnswers.initialCost) / 100;

    // Food cost preference
    let foodCostDifference = breed["Food Costs"] - userAnswers.foodCost;
    if (foodCostDifference > 0) {
      score += foodCostDifference / 100; // Penalty for exceeding budget
    }

    // Grooming preference
    score += Math.abs(breed.Grooming - userAnswers.grooming);

    return { ...breed, score }; // Include score for sorting
  });

  // Sort breeds by score (lower is better)
  matches.sort((a, b) => a.score - b.score);

  // Display top 3 results
  displayResults(matches.slice(0, 3));
}

// Display Results
function displayResults(topBreeds) {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    // Format price in USD
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    // Grooming labels (reversed scale)
    const groomingLabels = {
      1: "Every other week",
      2: "Every week",
      3: "Every day",
    };
    
    // Invert the suitability scale so higher values reflect higher suitability
    function invertSuitability(suitability) {
      return 4 - suitability; // 1 -> 3, 2 -> 2, 3 -> 1
    }

    // Map the original suitability values to descriptive labels
    function getSuitabilityLabel(suitability) {
      switch (suitability) {
        case 1:
          return "High suitability";
        case 2:
          return "Medium suitability";
        case 3:
          return "Low suitability";
        default:
          return "Unknown";
      }
    }

    topBreeds.forEach((breed) => {
        const breedElement = document.createElement("div");
        breedElement.className = "breed-card";

        // Fetch image from The Dog API
        fetchDogApiImage(breed.Breed)
          .then((imageUrl) => {
            const breedImage = document.createElement("img");
            breedImage.src = imageUrl || "placeholder.jpg"; // Placeholder if no image found
            breedImage.alt = `${breed.Breed} image`;
            breedImage.className = "breed-image";
            breedElement.prepend(breedImage);
          })
          .catch(() => {
            const breedImage = document.createElement("img");
            breedImage.src = "placeholder.jpg"; // Placeholder for failed requests
            breedImage.alt = `${breed.Breed} image`;
            breedImage.className = "breed-image";
            breedElement.prepend(breedImage);
          });

        breedElement.innerHTML += `
          <h3>${breed.Breed}</h3>
          <div class="characteristic">
              <label>Training Difficulty:</label>
              <progress value="${breed.Obedience}" max="100"></progress>
              <span>${breed.Obedience}%</span>
          </div>
          <div class="characteristic">
              <label>Longevity:</label>
              <progress value="${(breed.Longevity / 20) * 100}" max="100"></progress>
              <span>${breed.Longevity.toFixed(1)} years</span>
          </div>
          <div class="characteristic">
              <label>Purchase Price:</label>
              <progress value="${(breed["Purchase Price"] / 2700) * 100}" max="100"></progress>
              <span>${formatter.format(breed["Purchase Price"])}</span>
          </div>
          <div class="characteristic">
              <label>Food Costs:</label>
              <progress value="${(breed["Food Costs"] / 2000) * 100}" max="100"></progress>
              <span>${formatter.format(breed["Food Costs"])}</span>
          </div>
          <div class="characteristic">
              <label>Grooming Needs:</label>
              <progress value="${((breed.Grooming - 1) / 2) * 100}" max="100"></progress>
              <span>${groomingLabels[breed.Grooming]}</span>
          </div>
          <div class="characteristic">
              <label>Suitability for Children:</label>
              <progress value="${invertSuitability(breed["Suitability for children"])}" max="3"></progress>
              <span>${getSuitabilityLabel(breed["Suitability for children"])}</span>
          </div>
          <div class="characteristic">
              <label>HDB Approved:</label>
              <span>${breed["HDB approved"]}</span>
          </div>
        `;

        resultsContainer.appendChild(breedElement);
    });
}

// Fetch image from The Dog API
function fetchDogApiImage(breedName) {
  const apiKey = "live_zQ0OhdfSKubTXAoEvSkUm2Ak2ekdEWg0nSZhUqCgPTa27c3hhWQXzU30wJJIXnXa"; // Replace with your Dog API key
  const apiUrl = `https://api.thedogapi.com/v1/breeds/search?q=${encodeURIComponent(
    breedName
  )}`;

  return fetch(apiUrl, {
    headers: {
      "x-api-key": apiKey,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        return data[0].image?.url || null;
      }
      return null;
    });
}

function nextQuestion(currentQuestionNumber) {
    // Hide the current question
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

  function restartQuiz() {
    // Hide the results container
    document.getElementById("resultContainer").style.display = "none";
  
    // Reset the quiz form
    const quizForm = document.getElementById("quizForm");
    quizForm.reset();
  
    // Reset user answers
    userAnswers = {
      trainability: 5,
      longevity: 10,
      initialCost: 1000,
      foodCost: 1000,
      grooming: 2,
      children: "yes",
      hdb: "Yes",
    };
  
    // Reset displayed slider values
    document.getElementById("trainabilityValue").textContent = "5";
    document.getElementById("longevityValue").textContent = "5";
    document.getElementById("initialCostValue").textContent = "$1,000.00";
    document.getElementById("foodCostValue").textContent = "$750.00";
    document.getElementById("groomingValue").textContent = "Every week";
  
    // Show the quiz container
    document.getElementById("quizContainer").style.display = "block";
  
    // Show the first question
    const firstQuestion = document.getElementById("question1");
    firstQuestion.style.display = "block";
  
    // Hide all other questions
    const questions = document.querySelectorAll(".quiz-question");
    questions.forEach((question, index) => {
      if (index !== 0) {
        question.style.display = "none";
      }
    });
  
    // Hide the submit button container
    document.getElementById("submitBtnContainer").style.display = "none";
  }