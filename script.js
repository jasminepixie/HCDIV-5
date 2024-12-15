document.getElementById("quizForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent form submission and page reload

    // Get user input values
    const intelligence = parseInt(document.getElementById("intelligence").value);
    const longevity = parseInt(document.getElementById("longevity").value);
    const purchasePrice = parseInt(document.getElementById("purchasePrice").value);
    const foodCost = parseInt(document.getElementById("foodCost").value);
    const groomingCost = parseInt(document.getElementById("groomingCost").value);
    const children = parseInt(document.getElementById("children").value);
    const hdbApproved = document.getElementById("hdbApproved").value;

    // Fetch the breed data (for now, I'll use placeholder breed data)
    // You'll need to replace this with the actual data from your uploaded file.
    let breeds = [
        {
            name: 'Labrador',
            intelligence: 8,
            longevity: 12,
            purchasePrice: 1200,
            foodCost: 1000,
            groomingCost: 300,
            childrenSuitability: 10,
            hdbApproved: 'yes'
        },
        {
            name: 'Beagle',
            intelligence: 7,
            longevity: 15,
            purchasePrice: 800,
            foodCost: 900,
            groomingCost: 200,
            childrenSuitability: 9,
            hdbApproved: 'yes'
        },
        {
            name: 'Bulldog',
            intelligence: 5,
            longevity: 8,
            purchasePrice: 1500,
            foodCost: 1200,
            groomingCost: 500,
            childrenSuitability: 7,
            hdbApproved: 'no'
        }
    ];

    // Filter and sort breeds based on user preferences
    let filteredBreeds = breeds.filter(breed => breed.hdbApproved === hdbApproved);

    // Sort breeds based on a weighted score of user preferences
    filteredBreeds.sort((a, b) => {
        const scoreA = Math.abs(a.intelligence - intelligence) +
                        Math.abs(a.longevity - longevity) +
                        Math.abs(a.purchasePrice - purchasePrice) +
                        Math.abs(a.foodCost - foodCost) +
                        Math.abs(a.groomingCost - groomingCost) +
                        Math.abs(a.childrenSuitability - children);
        
        const scoreB = Math.abs(b.intelligence - intelligence) +
                        Math.abs(b.longevity - longevity) +
                        Math.abs(b.purchasePrice - purchasePrice) +
                        Math.abs(b.foodCost - foodCost) +
                        Math.abs(b.groomingCost - groomingCost) +
                        Math.abs(b.childrenSuitability - children);
        
        return scoreA - scoreB;
    });

    // Display top 3 recommendations
    const topBreeds = filteredBreeds.slice(0, 3);
    const breedList = document.getElementById("breedList");
    breedList.innerHTML = '';
    topBreeds.forEach(breed => {
        const listItem = document.createElement('li');
        listItem.textContent = `${breed.name} - Suitable for Children: ${breed.childrenSuitability}`;
        breedList.appendChild(listItem);
    });
});