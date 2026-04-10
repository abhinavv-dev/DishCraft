// GLOBAL VARIABLES


// This list will hold all the dishes we get from the API
// We start with an empty list [] which means "nothing yet"
let allMeals = [];

// This keeps track of which category is currently selected
// We start with "All" so the user sees everything at first
let activeCategory = "All";

// This is the container in our HTML where the meal cards will be placed
const recipeContainer = document.querySelector(".straight_caraousel");



// STEP 1: FETCH DATA FROM THE API

// We want to fetch recipes for every letter (a to z)
// We split this string into an array: ["a", "b", "c", ...]
const alphabetLetters = "abcdefghijklmnopqrstuvwxyz".split("");

// We create a list of "Fetch Requests" for each letter
const fetchRequests = alphabetLetters.map(function (letter) {
    // This is the website address for the specific letter
    const apiUrl = "https://www.themealdb.com/api/json/v1/1/search.php?f=" + letter;

    // We start the fetch and say: "When you get a response, turn it into JSON"
    return fetch(apiUrl).then(function (response) {
        return response.json();
    });
});

// We wait for ALL 26 requests to finish using Promise.all
Promise.all(fetchRequests)
    .then(function (results) {
        // 'results' is a list of 26 objects (one for each letter)
        // We use .forEach to look at each letter's data
        results.forEach(function (data) {
            // Check if this letter actually has any meals in it
            if (data.meals !== null) {
                // If there are meals, add each one to our global 'allMeals' list
                data.meals.forEach(function (singleMeal) {
                    allMeals.push(singleMeal);
                });
            }
        });

        // Once calculation is done, we display the meals on the screen
        showMeals(allMeals);

        // We also build the filter buttons (category chips)
        buildFilterChips(allMeals);

        console.log("Success! Total dishes loaded: " + allMeals.length);
    })
    .catch(function (error) {
        // If something goes wrong, we log it here
        console.log("Error loading dishes: ", error);
    });



// STEP 2: DISPLAY MEALS ON THE SCREEN


function showMeals(mealsToDisplay) {
    // 1. Clear the old content inside the recipe container
    recipeContainer.textContent = "";

    // 2. Update the "Meal Count" badge to show how many items we found
    const countBadge = document.getElementById("meal-count");
    if (countBadge) {
        countBadge.textContent = mealsToDisplay.length + " dishes";
    }

    // 3. If there are no meals to show, display a friendly message
    if (mealsToDisplay.length === 0) {
        const errorMessage = document.createElement("p");
        errorMessage.textContent = "No dishes found. Try a different search!";

        // Add some styling for the error message
        errorMessage.style.gridColumn = "1 / -1";
        errorMessage.style.textAlign = "center";
        errorMessage.style.padding = "50px";
        errorMessage.style.color = "#999";

        recipeContainer.appendChild(errorMessage);
        return; // Stop the function here
    }

    // 4. If we have meals, create a card for each one
    mealsToDisplay.forEach(function (dish) {
        // Create the main card div
        const cardChild = document.createElement("div");
        cardChild.className = "recipe-card";

        // Create the image section
        const imagePart = document.createElement("div");
        imagePart.className = "recipe-image";

        const cardImg = document.createElement("img");
        cardImg.src = dish.strMealThumb;
        cardImg.alt = dish.strMeal;
        imagePart.appendChild(cardImg);

        // Create the content section (Category, Title, Button)
        const contentPart = document.createElement("div");
        contentPart.className = "recipe-content";

        // Category Tag
        const categoryLabel = document.createElement("p");
        categoryLabel.className = "cuisine";
        categoryLabel.textContent = dish.strCategory;

        // Dish Name
        const nameHeading = document.createElement("h3");
        nameHeading.textContent = dish.strMeal;

        // View Button Row
        const actionRow = document.createElement("div");
        actionRow.className = "recipe-det";

        const openBtn = document.createElement("button");
        openBtn.className = "view-btn";
        openBtn.textContent = "View →";
        openBtn.dataset.id = dish.idMeal; // Keep ID here so we know which meal was clicked

        actionRow.appendChild(openBtn);

        // Assemble the content section
        contentPart.appendChild(categoryLabel);
        contentPart.appendChild(nameHeading);
        contentPart.appendChild(actionRow);

        // Assemble the full card
        cardChild.appendChild(imagePart);
        cardChild.appendChild(contentPart);

        // Finally, add the card to the container on the website
        recipeContainer.appendChild(cardChild);
    });
}



// STEP 3: SEARCH LOGIC


const searchBar = document.getElementById("search-bar_input");
const searchButton = document.querySelector("#search_input button");

function handleSearch() {
    // Get the text the user typed and make it lowercase
    const textTyped = searchBar.value.trim().toLowerCase();

    // Use .filter to find meals that have the typed text in their name
    const matchesFound = allMeals.filter(function (dish) {
        const dishName = dish.strMeal.toLowerCase();

        // If the name contains what we typed, keep it!
        return dishName.includes(textTyped);
    });

    // Show only the matches on the screen
    showMeals(matchesFound);
}

// When the user clicks the search button, run the search
searchButton.addEventListener("click", handleSearch);

// When the user presses "Enter" while typing, also run the search
searchBar.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        handleSearch();
    }
});



// STEP 4: FILTER BUTTONS (CATEGORY CHIPS)


function buildFilterChips(allData) {
    const parentBox = document.getElementById("filter-chips-container");

    // We need a list of unique categories (no duplicates)
    const categoryNames = [];

    // Look at every meal in our data
    allData.forEach(function (meal) {
        const cat = meal.strCategory;

        // If we haven't added this category to our list yet, add it
        if (cat && !categoryNames.includes(cat)) {
            categoryNames.push(cat);
        }
    });

    // Sort the category names from A to Z
    categoryNames.sort();

    // Remove any old buttons that we created before
    const currentBtns = parentBox.querySelectorAll(".filter-btn.dynamic");
    currentBtns.forEach(function (btn) {
        btn.remove();
    });

    // Create a new button for every category in our list
    categoryNames.forEach(function (name) {
        const newChip = document.createElement("button");
        newChip.className = "filter-btn dynamic";
        newChip.textContent = name;
        newChip.dataset.category = name; // Store the category name here

        parentBox.appendChild(newChip);
    });
}

// Listen for clicks on the filter buttons
const chipParent = document.getElementById("filter-chips-container");

chipParent.addEventListener("click", function (event) {
    // Check if what was clicked is actually a filter button
    const targetBtn = event.target.closest(".filter-btn");

    // If they didn't click a button, do nothing
    if (targetBtn === null) {
        return;
    }

    // Remove the "active" highlight from ALL buttons
    const everyChip = chipParent.querySelectorAll(".filter-btn");
    everyChip.forEach(function (btn) {
        btn.classList.remove("active");
    });

    // Add the "active" highlight to the one that was clicked
    targetBtn.classList.add("active");

    // Update our 'activeCategory' variable so we know what to show
    activeCategory = targetBtn.dataset.category;

    // Run the filter and sort logic to update the screen
    runFilterAndSort();
});



// STEP 5: SORTING AND SELECTING


const sortDropdown = document.getElementById("sort-select");

function runFilterAndSort() {
    let filteredList;

    // 1. Filter by Category
    if (activeCategory === "All") {
        // If "All" is selected, show every meal
        filteredList = allMeals.slice(); // .slice() makes a copy of the list
    } else {
        // Otherwise, only keep meals that match the picked category
        filteredList = allMeals.filter(function (meal) {
            return meal.strCategory === activeCategory;
        });
    }

    // 2. Pick the sort order from the dropdown menu
    const choice = sortDropdown.value;

    if (choice === "az") {
        // Sort Names: A to Z
        filteredList.sort(function (mealA, mealB) {
            return mealA.strMeal.localeCompare(mealB.strMeal);
        });
    } else if (choice === "za") {
        // Sort Names: Z to A
        filteredList.sort(function (mealA, mealB) {
            return mealB.strMeal.localeCompare(mealA.strMeal);
        });
    } else if (choice === "category") {
        // Sort Categories: A to Z
        filteredList.sort(function (mealA, mealB) {
            const catA = mealA.strCategory;
            const catB = mealB.strCategory;
            return catA.localeCompare(catB);
        });
    }

    // 3. Finally, show the processed list on the screen
    showMeals(filteredList);
}

// Every time the dropdown selection changes, update the screen
sortDropdown.addEventListener("change", runFilterAndSort);



// STEP 6: DARK MODE TOGGLE

const themeToggle = document.getElementById("darkModeToggle");

// When the toggle switch changes, update the theme
themeToggle.addEventListener("change", function () {
    // If it is checked, add the "dark" look
    if (themeToggle.checked === true) {
        document.body.classList.add("dark");
        // Save the setting so it stays when we refresh
        localStorage.setItem("userTheme", "dark");
    } else {
        // If not checked, remove the "dark" look (go back to light)
        document.body.classList.remove("dark");
        localStorage.setItem("userTheme", "light");
    }
});

// Check if the user had "dark" mode saved from their last visit
const savedTheme = localStorage.getItem("userTheme");
if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.checked = true;
}



// STEP 7: RECIPE POPUP (MODAL)


// We describe how the pop-up should look in HTML
// (This creates the box that shows up when you click "View")
const popupHtmlCode = `
<div id="recipe-popup" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; 
     background:rgba(0,0,0,0.7); z-index:9999; justify-content:center; align-items:center;">
    <div style="background:#fff; border-radius:12px; padding:25px; max-width:600px; width:90%; 
                max-height:85vh; overflow-y:auto; position:relative;">
        
        <!-- Close Button (The 'X') -->
        <button id="close-popup" style="position:absolute; top:10px; right:15px; background:none; 
                border:none; font-size:30px; cursor:pointer;">&times;</button>
        
        <!-- Meal Details -->
        <img id="modal-img" src="" style="width:100%; border-radius:8px; margin-bottom:15px;">
        <h2 id="modal-name" style="margin-bottom:10px;"></h2>
        
        <h4 style="color:#e63946;">Ingredients</h4>
        <ul id="modal-ingredients" style="margin-bottom:20px; line-height:1.6;"></ul>
        
        <h4 style="color:#e63946;">Instructions</h4>
        <p id="modal-text" style="font-size:14px; line-height:1.6; color:#555;"></p>
        
        <!-- Video Link -->
        <a id="modal-video" href="#" target="_blank" 
           style="display:inline-block; margin-top:20px; padding:10px 20px; background:#e63946; 
                  color:#fff; border-radius:5px; text-decoration:none;">Watch on YouTube</a>
    </div>
</div>
`;

// Add this HTML to the bottom of our web page
document.body.insertAdjacentHTML("beforeend", popupHtmlCode);

const recipeModal = document.getElementById("recipe-popup");

// 1. Function to open the modal and fill it with detail's
function openRecipeModal(mealId) {
    // website address for meal details
    const detailUrl = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + mealId;

    // Fetch the data for just this one meal
    fetch(detailUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            const mealData = data.meals[0];

            // Set the Title, Image, and Instructions
            document.getElementById("modal-name").textContent = mealData.strMeal;
            document.getElementById("modal-img").src = mealData.strMealThumb;
            document.getElementById("modal-text").textContent = mealData.strInstructions;

            // Setup the YouTube button
            const videoButton = document.getElementById("modal-video");
            if (mealData.strYoutube) {
                videoButton.href = mealData.strYoutube;
                videoButton.style.display = "inline-block";
            } else {
                videoButton.style.display = "none";
            }

            // Populate the Ingredients list
            const ingredientList = document.getElementById("modal-ingredients");
            ingredientList.textContent = ""; // Clear any old ingredients

            // We loop through the object keys to find ingredients
            const allKeys = Object.keys(mealData);

            allKeys.forEach(function (keyName) {
                // If the key starts with 'strIngredient' and has a value
                if (keyName.includes("strIngredient") && mealData[keyName]) {
                    const itemName = mealData[keyName].trim();

                    // If the ingredient name is not empty
                    if (itemName !== "") {
                        // Find the corresponding measurement number (e.g., strMeasure1)
                        const number = keyName.replace("strIngredient", "");
                        const measurement = mealData["strMeasure" + number];

                        // Create a list item <li> for the ingredient
                        const listItem = document.createElement("li");
                        listItem.textContent = itemName + " - " + measurement;
                        ingredientList.appendChild(listItem);
                    }
                }
            });

            // Show the modal by changing display to "flex"
            recipeModal.style.display = "flex";
        });
}

// 2. Listen for clicks on the entire page
document.addEventListener("click", function (event) {
    // Check if the clicked item is a "View" button
    const viewButton = event.target.closest(".view-btn");

    if (viewButton !== null) {
        // Get the ID we stored earlier
        const mealId = viewButton.dataset.id;
        // Open the modal for this ID
        openRecipeModal(mealId);
    }
});

// 3. Logic to close the Modal
const closeButton = document.getElementById("close-popup");

// Close when 'X' is clicked
closeButton.addEventListener("click", function () {
    recipeModal.style.display = "none";
});

// Close when clicking outside the white box
window.addEventListener("click", function (event) {
    if (event.target === recipeModal) {
        recipeModal.style.display = "none";
    }
});
