document.addEventListener('DOMContentLoaded', () => {
    // Current page URL filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Highlight active link and expand its parent
    const links = document.querySelectorAll('.nav-item > a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');

            // Expand the submenu if exists
            const parent = link.parentElement;
            const toggle = parent.querySelector('.toggle-btn');
            const submenu = parent.querySelector('.submenu');
            if (toggle && submenu) {
                toggle.classList.add('expanded');
                submenu.classList.add('open');
            }
        }
    });

    // Toggle logic
    const toggles = document.querySelectorAll('.toggle-btn');
    toggles.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const submenu = btn.parentElement.querySelector('.submenu');
            if (submenu) {
                btn.classList.toggle('expanded');
                submenu.classList.toggle('open');
            }
        });
    });
});
