document.addEventListener("DOMContentLoaded", () => {
    const btnCart = document.querySelector('.container-icon');
    const containerCartProducts = document.querySelector('.container-cart-products');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    let slideIndex = 1;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
        });
    }

    function nextSlide() {
        slideIndex = (slideIndex + 1) % slides.length;
        showSlide(slideIndex);
    }

    function prevSlide() {
        slideIndex = (slideIndex - 1 + slides.length) % slides.length;
        showSlide(slideIndex);
    }

    prevButton.addEventListener('click', prevSlide);
    nextButton.addEventListener('click', nextSlide);

    showSlide(slideIndex); // Muestra el primer slide al cargar la página
    setInterval(nextSlide, 2500); // Cambia el slide cada 2 segundos

    const whatsappButton = document.querySelector('.whatsapp-button');
    whatsappButton.addEventListener('click', () => {
        window.open("https://wa.link/nzuhbc", '_blank');
    });

    const botonesAgregar = document.querySelectorAll('.agregar-carrito');
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', () => {
            const producto = boton.closest('.producto');
            const precio = producto.querySelector('.precio').textContent;
            const nombre = producto.querySelector('h3').textContent;
            alert(`Agregaste ${nombre} al carrito por ${precio}`);
        });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const usernameSpan = document.getElementById('username');
    const authLinks = document.getElementById('auth-links');
    const logoutBtn = document.getElementById('logout-btn');

    function updateUI(isLoggedIn, username) {
        if (isLoggedIn) {
            usernameSpan.textContent = username;
            authLinks.style.display = 'none';
            logoutBtn.style.display = 'block';
        } else {
            usernameSpan.textContent = 'Invitado';
            authLinks.style.display = 'block';
            logoutBtn.style.display = 'none';
        }
    }

    function validateLogin() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const username = localStorage.getItem('username') || 'Invitado';

        updateUI(isLoggedIn, username);
    }

    logoutBtn.addEventListener('click', function() {
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.removeItem('username');
        updateUI(false, 'Invitado');
    });

    window.addEventListener('storage', function(event) {
        if (event.key === 'isLoggedIn') {
            validateLogin();
        }
    });

    validateLogin();
});
