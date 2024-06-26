document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    let slideIndex = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.style.display = 'block';
            } else {
                slide.style.display = 'none';
            }
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
            const producto = boton.closest('.product-card');
            const precio = producto.querySelector('.product-price-new').textContent;
            const nombre = producto.querySelector('.product-name').textContent;
            alert(`Agregaste ${nombre} al carrito por ${precio}`);
        });
    });

    const usernameSpan = document.getElementById('username');
    const authLinks = document.getElementById('auth-links');
    const logoutBtn = document.getElementById('logout-btn');

    function updateUI(isLoggedIn, username) {
        if (isLoggedIn) {
            usernameSpan.textContent = `${username}`;
            authLinks.style.display = 'none';
            logoutBtn.style.display = 'block';
        } else {
            usernameSpan.textContent = 'Invitado';
            authLinks.style.display = 'block';
            logoutBtn.style.display = 'none';
        }
    }

    function validateLogin() {
        fetch('/estado-sesion')
            .then(response => response.json())
            .then(data => {
                const isLoggedIn = data.isLoggedIn;
                const username = data.username || 'Invitado'; // Si no hay nombre de usuario, usar 'Invitado'
                updateUI(isLoggedIn, username);
                localStorage.setItem('isLoggedIn', isLoggedIn.toString());
                localStorage.setItem('username', username);
            })
            .catch(error => console.error('Error al verificar el estado de la sesión:', error));
    }

    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('isLoggedIn');
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

