(function() {
    'use strict';

    const APP = {
        initialized: false,
        modules: {},
        config: {
            headerSelector: '.l-header',
            burgerSelector: '.navbar-toggler',
            navSelector: '.navbar-collapse',
            navLinksSelector: '.nav-link',
            formSelector: '.needs-validation',
            animatedElements: '.card, .c-card, .btn, .c-button, img',
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        }
    };

    const ValidationPatterns = {
        name: /^[a-zA-ZÀ-ÿ\s-']{2,50}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[\d\s+\-()]{10,20}$/,
        message: /^.{10,}$/
    };

    const ErrorMessages = {
        name: 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen, nur Buchstaben).',
        firstName: 'Bitte geben Sie einen gültigen Vornamen ein (2-50 Zeichen).',
        lastName: 'Bitte geben Sie einen gültigen Nachnamen ein (2-50 Zeichen).',
        email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
        phone: 'Bitte geben Sie eine gültige Telefonnummer ein.',
        message: 'Die Nachricht muss mindestens 10 Zeichen lang sein.',
        required: 'Dieses Feld ist erforderlich.',
        privacy: 'Bitte akzeptieren Sie die Datenschutzbestimmungen.',
        destination: 'Bitte wählen Sie ein Reiseziel aus.',
        service: 'Bitte wählen Sie eine Dienstleistung aus.',
        travelDate: 'Bitte wählen Sie ein Reisedatum aus.',
        travelers: 'Bitte wählen Sie die Anzahl der Reisenden aus.'
    };

    class BurgerMenu {
        constructor() {
            this.burger = document.querySelector(APP.config.burgerSelector);
            this.nav = document.querySelector(APP.config.navSelector);
            this.navLinks = document.querySelectorAll(APP.config.navLinksSelector);
            this.isOpen = false;
            
            if (this.burger && this.nav) {
                this.init();
            }
        }

        init() {
            this.burger.addEventListener('click', () => this.toggle());
            
            this.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (this.isOpen && window.innerWidth < 768) {
                        this.close();
                    }
                });
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });

            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.nav.contains(e.target) && !this.burger.contains(e.target)) {
                    this.close();
                }
            });

            window.addEventListener('resize', () => {
                if (window.innerWidth >= 768 && this.isOpen) {
                    this.close();
                }
            });
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }

        open() {
            this.isOpen = true;
            this.nav.classList.add('show');
            this.nav.style.height = `calc(100vh - var(--header-h))`;
            this.burger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        close() {
            this.isOpen = false;
            this.nav.classList.remove('show');
            this.nav.style.height = '';
            this.burger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }

    class FormValidator {
        constructor(form) {
            this.form = form;
            this.submitButton = form.querySelector('button[type="submit"]');
            this.init();
        }

        init() {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            const inputs = this.form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => {
                    if (input.classList.contains('is-invalid')) {
                        this.validateField(input);
                    }
                });
            });
        }

        validateField(field) {
            const value = field.value.trim();
            const fieldName = field.name || field.id;
            let isValid = true;
            let errorMessage = '';

            this.clearError(field);

            if (field.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = ErrorMessages.required;
            } else if (value) {
                switch(fieldName) {
                    case 'name':
                    case 'firstName':
                    case 'lastName':
                        if (!ValidationPatterns.name.test(value)) {
                            isValid = false;
                            errorMessage = ErrorMessages[fieldName] || ErrorMessages.name;
                        }
                        break;
                    case 'email':
                        if (!ValidationPatterns.email.test(value)) {
                            isValid = false;
                            errorMessage = ErrorMessages.email;
                        }
                        break;
                    case 'phone':
                        if (field.hasAttribute('required') && !ValidationPatterns.phone.test(value)) {
                            isValid = false;
                            errorMessage = ErrorMessages.phone;
                        }
                        break;
                    case 'message':
                        if (!ValidationPatterns.message.test(value)) {
                            isValid = false;
                            errorMessage = ErrorMessages.message;
                        }
                        break;
                    case 'destination':
                    case 'service':
                        if (value === '' || value === 'default') {
                            isValid = false;
                            errorMessage = ErrorMessages[fieldName];
                        }
                        break;
                    case 'travelDate':
                        const selectedDate = new Date(value);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (selectedDate < today) {
                            isValid = false;
                            errorMessage = 'Das Datum darf nicht in der Vergangenheit liegen.';
                        }
                        break;
                }
            }

            if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
                isValid = false;
                errorMessage = ErrorMessages.privacy;
            }

            if (!isValid) {
                this.showError(field, errorMessage);
            }

            return isValid;
        }

        showError(field, message) {
            field.classList.add('is-invalid');
            
            let errorElement = field.parentElement.querySelector('.invalid-feedback');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'invalid-feedback';
                field.parentElement.appendChild(errorElement);
            }
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }

        clearError(field) {
            field.classList.remove('is-invalid');
            const errorElement = field.parentElement.querySelector('.invalid-feedback');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }

        validateForm() {
            const inputs = this.form.querySelectorAll('input, select, textarea');
            let isValid = true;

            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });

            return isValid;
        }

        handleSubmit(e) {
            e.preventDefault();
            e.stopPropagation();

            if (!this.validateForm()) {
                NotificationManager.show('Bitte überprüfen Sie Ihre Eingaben.', 'danger');
                return;
            }

            this.disableSubmit();

            const formData = new FormData(this.form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = this.sanitizeInput(value);
            });

            fetch('process.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    NotificationManager.show('Nachricht erfolgreich gesendet!', 'success');
                    setTimeout(() => {
                        window.location.href = 'thank_you.html';
                    }, 1500);
                } else {
                    NotificationManager.show(result.message || 'Fehler beim Senden.', 'danger');
                    this.enableSubmit();
                }
            })
            .catch(() => {
                NotificationManager.show('Netzwerkfehler. Bitte versuchen Sie es später erneut.', 'danger');
                this.enableSubmit();
            });
        }

        sanitizeInput(value) {
            if (typeof value !== 'string') return value;
            return value
                .replace(/[<>]/g, '')
                .replace(/javascript:/gi, '')
                .trim();
        }

        disableSubmit() {
            if (this.submitButton) {
                this.submitButton.disabled = true;
                this.submitButton.dataset.originalText = this.submitButton.textContent;
                this.submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Wird gesendet...';
            }
        }

        enableSubmit() {
            if (this.submitButton) {
                this.submitButton.disabled = false;
                this.submitButton.textContent = this.submitButton.dataset.originalText || 'Senden';
            }
        }
    }

    const NotificationManager = {
        container: null,

        init() {
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'notification-container';
                this.container.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;max-width:350px;';
                document.body.appendChild(this.container);
            }
        },

        show(message, type = 'info') {
            this.init();

            const alert = document.createElement('div');
            alert.className = `alert alert-${type} alert-dismissible fade show`;
            alert.style.cssText = 'box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideInRight 0.3s ease;';
            alert.innerHTML = `
                ${message}
                <button type="button" class="btn-close" aria-label="Schließen"></button>
            `;

            const closeBtn = alert.querySelector('.btn-close');
            closeBtn.addEventListener('click', () => this.remove(alert));

            this.container.appendChild(alert);

            setTimeout(() => this.remove(alert), 5000);
        },

        remove(alert) {
            if (alert && alert.parentNode) {
                alert.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (alert.parentNode) {
                        alert.parentNode.removeChild(alert);
                    }
                }, 300);
            }
        }
    };

    class ScrollAnimations {
        constructor() {
            this.observer = null;
            this.init();
        }

        init() {
            if (APP.config.reducedMotion) return;

            const options = {
                root: null,
                rootMargin: '0px 0px -100px 0px',
                threshold: 0.1
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, options);

            const elements = document.querySelectorAll('.card, .c-card, .btn:not(.navbar-toggler)');
            elements.forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                this.observer.observe(el);
            });
        }
    }

    class ImageAnimations {
        constructor() {
            this.init();
        }

        init() {
            const images = document.querySelectorAll('img');
            
            images.forEach(img => {
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }

                if (!APP.config.reducedMotion) {
                    img.style.opacity = '0';
                    img.style.transform = 'scale(0.95)';
                    img.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';

                    if (img.complete) {
                        this.animateImage(img);
                    } else {
                        img.addEventListener('load', () => this.animateImage(img));
                    }
                }

                img.addEventListener('error', this.handleImageError);
            });
        }

        animateImage(img) {
            setTimeout(() => {
                img.style.opacity = '1';
                img.style.transform = 'scale(1)';
            }, 100);
        }

        handleImageError(e) {
            const img = e.target;
            img.src = 'data:image/svg+xml;base64,' + btoa(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">' +
                '<rect width="200" height="150" fill="#e9ecef"/>' +
                '<text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="#6c757d">Bild nicht verfügbar</text>' +
                '</svg>'
            );
        }
    }

    class ButtonAnimations {
        constructor() {
            this.init();
        }

        init() {
            if (APP.config.reducedMotion) return;

            const buttons = document.querySelectorAll('.btn, .c-button, a[class*="btn"]');
            
            buttons.forEach(button => {
                button.addEventListener('mouseenter', (e) => this.animateHover(e.target, true));
                button.addEventListener('mouseleave', (e) => this.animateHover(e.target, false));
                button.addEventListener('click', (e) => this.createRipple(e));
            });
        }

        animateHover(element, isEnter) {
            if (isEnter) {
                element.style.transform = 'translateY(-2px) scale(1.02)';
                element.style.boxShadow = '0 8px 20px rgba(0, 102, 204, 0.25)';
            } else {
                element.style.transform = '';
                element.style.boxShadow = '';
            }
        }

        createRipple(e) {
            const button = e.currentTarget;
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
            `;

            if (!button.style.position || button.style.position === 'static') {
                button.style.position = 'relative';
            }
            button.style.overflow = 'hidden';

            button.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        }
    }

    class SmoothScroll {
        constructor() {
            this.init();
        }

        init() {
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href^="#"]');
                if (!link) return;

                const href = link.getAttribute('href');
                if (href === '#' || href === '#!') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                
                const header = document.querySelector(APP.config.headerSelector);
                const offset = header ? header.offsetHeight : 72;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

                window.scrollTo({
                    top: top,
                    behavior: 'smooth'
                });
            });
        }
    }

    class ActiveMenu {
        constructor() {
            this.init();
        }

        init() {
            const navLinks = document.querySelectorAll(APP.config.navLinksSelector);
            const currentPath = window.location.pathname;

            navLinks.forEach(link => {
                const linkPath = link.getAttribute('href');
                
                link.removeAttribute('aria-current');
                link.classList.remove('active');

                let isMatch = false;

                if (linkPath === '/' || linkPath === '/index.html') {
                    isMatch = currentPath === '/' || currentPath.endsWith('/index.html');
                } else if (linkPath && !linkPath.startsWith('#')) {
                    isMatch = currentPath === linkPath || currentPath.endsWith(linkPath);
                }

                if (isMatch) {
                    link.setAttribute('aria-current', 'page');
                    link.classList.add('active');
                }
            });
        }
    }

    class ScrollSpy {
        constructor() {
            this.sections = [];
            this.init();
        }

        init() {
            const navLinks = document.querySelectorAll('a[href^="#"]');
            
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href !== '#' && href !== '#!') {
                    const section = document.querySelector(href);
                    if (section) {
                        this.sections.push({ link, section });
                    }
                }
            });

            if (this.sections.length > 0) {
                window.addEventListener('scroll', () => this.updateActiveSection(), { passive: true });
                this.updateActiveSection();
            }
        }

        updateActiveSection() {
            const scrollPosition = window.scrollY + 100;

            this.sections.forEach(({ link, section }) => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    }

    class CountUp {
        constructor() {
            this.init();
        }

        init() {
            if (APP.config.reducedMotion) return;

            const numbers = document.querySelectorAll('[data-count]');
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.dataset.counted) {
                        this.animate(entry.target);
                        entry.target.dataset.counted = 'true';
                    }
                });
            }, { threshold: 0.5 });

            numbers.forEach(el => observer.observe(el));
        }

        animate(element) {
            const target = parseInt(element.dataset.count);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    element.textContent = target;
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current);
                }
            }, 16);
        }
    }

    function addStylesheet() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            @keyframes ripple {
                to { transform: scale(4); opacity: 0; }
            }
            .btn, .c-button, a[class*="btn"] {
                position: relative;
                overflow: hidden;
                transition: all 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    function init() {
        if (APP.initialized) return;
        APP.initialized = true;

        addStylesheet();

        APP.modules.burgerMenu = new BurgerMenu();
        APP.modules.scrollAnimations = new ScrollAnimations();
        APP.modules.imageAnimations = new ImageAnimations();
        APP.modules.buttonAnimations = new ButtonAnimations();
        APP.modules.smoothScroll = new SmoothScroll();
        APP.modules.activeMenu = new ActiveMenu();
        APP.modules.scrollSpy = new ScrollSpy();
        APP.modules.countUp = new CountUp();

        const forms = document.querySelectorAll(APP.config.formSelector);
        forms.forEach(form => {
            new FormValidator(form);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.APP = APP;

})();