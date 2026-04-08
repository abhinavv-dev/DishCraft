
// This list will hold all the dishes we get from the API
let allMeals = [];

// This keeps track of which category is currently selected (starts at "All")
let activeCategory = "All";

// Get the main container where we will put the meal cards
const recipeContainer = document.querySelector(".straight_caraousel");

// STEP 1: FETCH ALL DISHES (A-Z)
// We need to call the API for every letter of the alphabet
const alphabetLetters = "abcdefghijklmnopqrstuvwxyz".split("");

// Create a list of promises (requests) for each letter
const fetchRequests = alphabetLetters.map(function (letter) {
    const url = "https://www.themealdb.com/api/json/v1/1/search.php?f=" + letter;
    return fetch(url).then(function (response) {
        return response.json();
    });
});

// Wait for all 26 requests to finish
Promise.all(fetchRequests)
    .then(function (results) {
        // results is a list of objects, one for each letter
        results.forEach(function (item) {
            // Check if this letter actually has meals
            if (item.meals !== null) {
                // Add each meal found into our global allMeals list
                item.meals.forEach(function (dish) {
                    allMeals.push(dish);
                });
            }
        });

        // Once loaded, show the dishes and build the filter chips
        showMeals(allMeals);
        buildFilterChips(allMeals);

        console.log("Total dishes loaded: " + allMeals.length);
    })
    .catch(function (error) {
        console.log("Error loading dishes: ", error);
    });


// STEP 2: DISPLAY DISHES ON SCREEN

function showMeals(mealsList) {
    // 1. Clear the old cards first
    recipeContainer.textContent = "";

    // 2. Update the count badge (number of dishes found)
    const countBadge = document.getElementById("meal-count");
    if (countBadge) {
        countBadge.textContent = mealsList.length + " dishes";
    }

    // 3. If the list is empty, show a "not found" message
    if (mealsList.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No dishes found. Try a different search!";
        message.style.gridColumn = "1 / -1";
        message.style.textAlign = "center";
        message.style.padding = "50px";
        message.style.color = "#999";
        recipeContainer.appendChild(message);
        return;
    }

    // 4. Create a card for each dish in the list
    mealsList.forEach(function (dish) {
        // Create the main card box
        const cardBox = document.createElement("div");
        cardBox.className = "recipe-card";

        // Create the image part
        const imgWrapper = document.createElement("div");
        imgWrapper.className = "recipe-image";
        const dishImage = document.createElement("img");
        dishImage.src = dish.strMealThumb;
        dishImage.alt = dish.strMeal;
        imgWrapper.appendChild(dishImage);

        // Create the text part
        const textBox = document.createElement("div");
        textBox.className = "recipe-content";

        const categoryTag = document.createElement("p");
        categoryTag.className = "cuisine";
        categoryTag.textContent = dish.strCategory;

        const dishTitle = document.createElement("h3");
        dishTitle.textContent = dish.strMeal;

        // View Button
        const btnRow = document.createElement("div");
        btnRow.className = "recipe-det";
        const viewBtn = document.createElement("button");
        viewBtn.className = "view-btn";
        viewBtn.textContent = "View →";
        viewBtn.dataset.id = dish.idMeal; // Store ID for the modal
        btnRow.appendChild(viewBtn);

        // Put everything together
        textBox.appendChild(categoryTag);
        textBox.appendChild(dishTitle);
        textBox.appendChild(btnRow);

        cardBox.appendChild(imgWrapper);
        cardBox.appendChild(textBox);

        // Add the finished card to the page
        recipeContainer.appendChild(cardBox);
    });
}


// STEP 3: SEARCH LOGIC

const searchInput = document.getElementById("search-bar_input");
const searchBtn = document.querySelector("#search_input button");

function handleSearch() {
    const userInput = searchInput.value.trim().toLowerCase();

    // Filter the global list based on the name of the dish
    const filteredResults = allMeals.filter(function (dish) {
        const dishName = dish.strMeal.toLowerCase();
        return dishName.includes(userInput);
    });

    // Show the results
    showMeals(filteredResults);
}

// Trigger search on click
searchBtn.addEventListener("click", handleSearch);

// Trigger search on Enter key
searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        handleSearch();
    }
});


// STEP 4: FILTER CHIPS LOGIC

function buildFilterChips(mealsArray) {
    const chipsBox = document.getElementById("filter-chips-container");

    // We want a list of unique category names
    const categoryList = [];

    mealsArray.forEach(function (dish) {
        if (dish.strCategory && !categoryList.includes(dish.strCategory)) {
            categoryList.push(dish.strCategory);
        }
    });

    // Sort the names alphabetically
    categoryList.sort();

    // Remove any previously added dynamic chips
    const oldChips = chipsBox.querySelectorAll(".filter-btn.dynamic");
    oldChips.forEach(function (btn) {
        btn.remove();
    });

    // Create a button for each category found
    categoryList.forEach(function (catName) {
        const chip = document.createElement("button");
        chip.className = "filter-btn dynamic";
        chip.textContent = catName;
        chip.dataset.category = catName;
        chipsBox.appendChild(chip);
    });
}

// Handling chip clicks using event delegation
const chipContainer = document.getElementById("filter-chips-container");

chipContainer.addEventListener("click", function (event) {
    const clickedElement = event.target.closest(".filter-btn");
    if (!clickedElement) return;

    // Toggle active style
    const allChips = chipContainer.querySelectorAll(".filter-btn");
    allChips.forEach(function (btn) {
        btn.classList.remove("active");
    });
    clickedElement.classList.add("active");

    // Update the active category
    activeCategory = clickedElement.dataset.category;

    // Filter and show
    runFilterAndSort();
});



// STEP 5: SORTING LOGIC

const sortSelect = document.getElementById("sort-select");

function runFilterAndSort() {
    // 1. First, filter by the current active category
    let listToDisplay;

    if (activeCategory === "All") {
        listToDisplay = [...allMeals]; // copy of all meals
    } else {
        listToDisplay = allMeals.filter(function (dish) {
            return dish.strCategory === activeCategory;
        });
    }

    // 2. Second, apply sorting
    const sortValue = sortSelect.value;

    if (sortValue === "az") {
        // Sort A to Z
        listToDisplay.sort(function (a, b) {
            return a.strMeal.localeCompare(b.strMeal);
        });
    } else if (sortValue === "za") {
        // Sort Z to A
        listToDisplay.sort(function (a, b) {
            return b.strMeal.localeCompare(a.strMeal);
        });
    } else if (sortValue === "category") {
        // Sort by Category Name
        listToDisplay.sort(function (a, b) {
            return a.strCategory.localeCompare(b.strCategory);
        });
    }

    // 3. Show the final processed list
    showMeals(listToDisplay);
}

// Run sorting when dropdown changes
sortSelect.addEventListener("change", runFilterAndSort);


// STEP 6: DARK MODE LOGIC

const modeToggle = document.getElementById("darkModeToggle");

modeToggle.addEventListener("change", function () {
    if (modeToggle.checked === true) {
        document.body.classList.add("dark");
        localStorage.setItem("myTheme", "dark");
    } else {
        document.body.classList.remove("dark");
        localStorage.setItem("myTheme", "light");
    }
});

// Apply saved theme on reload
const lastTheme = localStorage.getItem("myTheme");
if (lastTheme === "dark") {
    document.body.classList.add("dark");
    modeToggle.checked = true;
}


// STEP 7: MODAL POPUP LOGIC
// We build the Modal HTML structure using JavaScript
const modalOuterHtml = `
<div id="recipe-popup" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; 
     background:rgba(0,0,0,0.7); z-index:9999; justify-content:center; align-items:center;">
    <div style="background:#fff; border-radius:12px; padding:25px; max-width:600px; width:90%; 
                max-height:85vh; overflow-y:auto; position:relative;">
        <button id="close-popup" style="position:absolute; top:10px; right:15px; background:none; 
                border:none; font-size:30px; cursor:pointer;">&times;</button>
        <img id="modal-img" src="" style="width:100%; border-radius:8px; margin-bottom:15px;">
        <h2 id="modal-name" style="margin-bottom:10px;"></h2>
        <h4 style="color:#e63946;">Ingredients</h4>
        <ul id="modal-ingredients" style="margin-bottom:20px; line-height:1.6;"></ul>
        <h4 style="color:#e63946;">Instructions</h4>
        <p id="modal-text" style="font-size:14px; line-height:1.6; color:#555;"></p>
        <a id="modal-video" href="#" target="_blank" 
           style="display:inline-block; margin-top:20px; padding:10px 20px; background:#e63946; 
                  color:#fff; border-radius:5px; text-decoration:none;">Watch on YouTube</a>
    </div>
</div>
`;
document.body.insertAdjacentHTML("beforeend", modalOuterHtml);

const theModal = document.getElementById("recipe-popup");

// Function to fetch more details about one meal
async function loadDishDetails(dishId) {
    const url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + dishId;
    const response = await fetch(url);
    const data = await response.json();
    return data.meals[0];
}

// Function to open the modal and fill it with data
async function openModal(id) {
    const meal = await loadDishDetails(id);

    document.getElementById("modal-name").textContent = meal.strMeal;
    document.getElementById("modal-img").src = meal.strMealThumb;
    document.getElementById("modal-text").textContent = meal.strInstructions;

    // Setup YouTube button
    const ytBtn = document.getElementById("modal-video");
    if (meal.strYoutube) {
        ytBtn.href = meal.strYoutube;
        ytBtn.style.display = "inline-block";
    } else {
        ytBtn.style.display = "none";
    }

    // Populate Ingredients
    const list = document.getElementById("modal-ingredients");
    list.textContent = ""; // clear old ones

    // Loop through properties using a list of keys
    const propertyKeys = Object.keys(meal);
    propertyKeys.forEach(function (key) {
        // Check if property is an ingredient and has a value
        if (key.includes("strIngredient") && meal[key]) {
            const ingredientName = meal[key].trim();
            if (ingredientName !== "") {
                const num = key.replace("strIngredient", "");
                const measure = meal["strMeasure" + num];

                const listItem = document.createElement("li");
                listItem.textContent = ingredientName + " - " + measure;
                list.appendChild(listItem);
            }
        }
    });

    theModal.style.display = "flex";
}

// Listen for clicks on the card buttons
document.addEventListener("click", function (event) {
    const clickedBtn = event.target.closest(".view-btn");
    if (clickedBtn) {
        const mealId = clickedBtn.dataset.id;
        openModal(mealId);
    }
});

// Close modal logic
document.getElementById("close-popup").addEventListener("click", function () {
    theModal.style.display = "none";
});

window.addEventListener("click", function (event) {
    if (event.target === theModal) {
        theModal.style.display = "none";
    }
});
