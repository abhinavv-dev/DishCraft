
let recipe_list = document.querySelector(".straight_caraousel")

// fetch("https://www.themealdb.com/api/json/v1/1/categories.php")
// .then((res)=>res.json())
// .then((data)=>{
//     // console.log(data)
//     for(let i=0;i<data.categories.length;i++){
//         recipe_list.innerHTML+=`
//         <div class="recipe-card">

//             <div class="ingredient-tag">12 ingredients</div>

//             <div class="recipe-image">
//                 <img src="https://www.themealdb.com/images/media/meals/lgmnff1763789847.jpg" alt="Chicken Ramen">
//             </div>

//             <div class="recipe-content">
//                 <p class="cuisine">JAPANESE · NOODLES</p>

//                 <h3>Chicken Ramen with Soft Egg</h3>

//                 <div class="recipe-det">
//                     <span>⏱ 45 min</span>
//                     <span>Medium</span>
//                     <a href="#">View →</a>
//                 </div>
//             </div>

//         </div>
//         `
//     }
// })
let promise
fetch("https://www.themealdb.com/api/json/v1/1/categories.php")
.then((res)=>res.json())
.then((data)=>{

    console.log(data)

    for(let i=0;i<data.categories.length;i++){

        let category = data.categories[i]

        recipe_list.innerHTML += `
        <div class="recipe-card">

            <div class="recipe-image">
                <img src="${category.strCategoryThumb}" alt="${category.strCategory}">
            </div>

            <div class="recipe-content">
                <p class="cuisine">${category.strCategory}</p>

                <h3>${category.strCategory}</h3>

                <div class="recipe-det">
                    <a href="#">View →</a>
                </div>
            </div>

        </div>
        `
    }

})