document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    const products = document.querySelectorAll('.product');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterProducts);
    });

    function filterProducts() {
        const activeFilters = {
            category: [],
            price: []
        };

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const filterType = checkbox.closest('.filter-group').querySelector('h3').textContent.toLowerCase();
                if (filterType.includes('tipo de mascota')) {
                    activeFilters.category.push(checkbox.value);
                } else if (filterType.includes('precio')) {
                    activeFilters.price.push(checkbox.value);
                }
            }
        });

        products.forEach(product => {
            const category = product.dataset.category;
            const price = product.dataset.price;
            const matchesCategory = activeFilters.category.length === 0 || activeFilters.category.includes(category);
            const matchesPrice = activeFilters.price.length === 0 || activeFilters.price.includes(price);

            if (matchesCategory && matchesPrice) {
                product.style.display = '';
            } else {
                product.style.display = 'none';
            }
        });
    }
});
