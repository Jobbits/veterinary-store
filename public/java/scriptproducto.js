document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    const products = document.querySelectorAll('.product');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterProducts);
    });

    function filterProducts() {
        const activeFilters = {
            category: [],
            price: [],
            brand: [],
            offer: [],
            petType: [],
            petAge: [],
            petSize: [],
            foodType: []
        };

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const filterType = checkbox.closest('.filter-group').querySelector('h3').textContent.trim();
                const filterValue = checkbox.value;

                switch (filterType) {
                    case 'Categoria de Productos':
                        activeFilters.category.push(filterValue);
                        break;
                    case 'Marcas':
                        activeFilters.brand.push(filterValue);
                        break;
                    case 'Ofertas y Descuentos':
                        activeFilters.offer.push(filterValue);
                        break;
                    case 'Tipo de Mascota':
                        activeFilters.petType.push(filterValue);
                        break;
                    case 'Edad de la Mascotas':
                        activeFilters.petAge.push(filterValue);
                        break;
                    case 'Tamaño de Mascota':
                        activeFilters.petSize.push(filterValue);
                        break;
                    case 'Tipo de Alimento':
                        activeFilters.foodType.push(filterValue);
                        break;
                    case 'Precio':
                        activeFilters.price.push(filterValue);
                        break;
                    default:
                        break;
                }
            }
        });

        products.forEach(product => {
            const category = product.dataset.category;
            const price = product.dataset.price;
            const brand = product.dataset.brand;
            const offer = product.dataset.offer;
            const petType = product.dataset.petType;
            const petAge = product.dataset.petAge;
            const petSize = product.dataset.petSize;
            const foodType = product.dataset.foodType;

            const matchesCategory = activeFilters.category.length === 0 || activeFilters.category.includes(category);
            const matchesPrice = activeFilters.price.length === 0 || activeFilters.price.includes(price);
            const matchesBrand = activeFilters.brand.length === 0 || activeFilters.brand.includes(brand);
            const matchesOffer = activeFilters.offer.length === 0 || activeFilters.offer.includes(offer);
            const matchesPetType = activeFilters.petType.length === 0 || activeFilters.petType.includes(petType);
            const matchesPetAge = activeFilters.petAge.length === 0 || activeFilters.petAge.includes(petAge);
            const matchesPetSize = activeFilters.petSize.length === 0 || activeFilters.petSize.includes(petSize);
            const matchesFoodType = activeFilters.foodType.length === 0 || activeFilters.foodType.includes(foodType);

            if (matchesCategory && matchesPrice && matchesBrand && matchesOffer && matchesPetType && matchesPetAge && matchesPetSize && matchesFoodType) {
                product.style.display = '';
            } else {
                product.style.display = 'none';
            }
        });
    }
});
