/**
 * Tchiav's Excellence - Main JavaScript File
 *
 * This file handles the entire site's interactivity, including:
 * - SPA-style routing (no page reloads)
 * - Component loading (header, footer)
 * - Active link highlighting
 * - Page-specific script initialization (animations, forms, carousels)
 */

const App = {
    // Initialize the application
    init() {
        // Load persistent components first
        this.loadComponents().then(() => {
            // Once components are loaded, setup the router and initial page state
            this.setupRouter();
            this.handlePageLoad(window.location.pathname + window.location.search);
            this.setupCommonEventListeners();
        });
    },

    // Load header and footer components into the DOM
    async loadComponents() {
        const load = async (url, elementId) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Failed to load ${url}`);
                const data = await response.text();
                const element = document.getElementById(elementId);
                if (element) element.innerHTML = data;
            } catch (error) {
                console.error("Error loading component:", error);
            }
        };
        // Use absolute paths from the root
        await Promise.all([
            load('/components/navbar.html', 'header-placeholder'),
            load('/components/footer.html', 'footer-placeholder')
        ]);
    },

    // Setup the client-side router
    setupRouter() {
        // Intercept clicks on local links
        document.body.addEventListener('click', e => {
            const link = e.target.closest('a');
            if (!link) return;

            const {
                protocol,
                host,
                pathname,
                hash
            } = link;
            const isExternal = link.target === '_blank' || protocol !== window.location.protocol || host !== window.location.host;
            const isAnchor = hash && pathname === window.location.pathname;

            if (isExternal || isAnchor) {
                return; // Let the browser handle external links and on-page anchors
            }

            e.preventDefault();
            const newPath = pathname + link.search;
            if (newPath !== (window.location.pathname + window.location.search)) {
                history.pushState({
                    path: newPath
                }, '', newPath);
                this.handlePageLoad(newPath);
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', e => {
            if (e.state && e.state.path) {
                this.handlePageLoad(e.state.path);
            }
        });
    },

    // Main function to load and display page content
    async handlePageLoad(path) {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error("Main content container #main-content not found!");
            return;
        }

        // Add a class for transition effect
        mainContent.classList.add('page-fade-out');

        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Page not found: ${path}`);
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Update title and main content
            document.title = doc.title;
            mainContent.innerHTML = doc.querySelector('#main-content').innerHTML;

            // Re-run scripts for the new content
            this.runPageSpecificScripts();
            this.updateActiveLink();

            // Scroll to top and fade in new content
            window.scrollTo(0, 0);
            mainContent.classList.remove('page-fade-out');

        } catch (error) {
            console.error("Failed to load page:", error);
            mainContent.innerHTML = `<div class="text-center py-20">
                <h1 class="text-4xl font-bold">Erreur 404</h1>
                <p class="mt-4">La page que vous cherchez n'a pas pu être trouvée.</p>
                <a href="/" class="mt-6 inline-block text-emerald-500 hover:underline">Retour à l'accueil</a>
            </div>`;
            mainContent.classList.remove('page-fade-out');
        }
    },

    // Highlight the active navigation link
    updateActiveLink() {
        const currentPath = window.location.pathname;
        document.querySelectorAll('header nav a, footer a').forEach(link => {
            // Normalize paths for comparison
            const linkPath = new URL(link.href).pathname;
            if (linkPath === currentPath) {
                link.classList.add('nav-link-active');
            } else {
                link.classList.remove('nav-link-active');
            }
        });
    },

    // Setup event listeners that should persist across page loads
    setupCommonEventListeners() {
        const header = document.getElementById('header-placeholder');
        const toTopButton = document.getElementById('to-top-button');

        // Mobile menu toggle (delegated to header)
        header.addEventListener('click', e => {
            const mobileMenuButton = e.target.closest('#mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenuButton && mobileMenu) {
                mobileMenu.classList.toggle('hidden');
            }
            // Close mobile menu on link click
            if (e.target.tagName === 'A' && mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });

        // Header shadow & scroll-to-top button visibility
        if (toTopButton) {
            window.addEventListener("scroll", () => {
                if (window.scrollY > 10) {
                    header.firstElementChild?.classList.add("shadow-md");
                } else {
                    header.firstElementChild?.classList.remove("shadow-md");
                }
                if (window.scrollY > 300) {
                    toTopButton.classList.remove("hidden");
                } else {
                    toTopButton.classList.add("hidden");
                }
            });

            toTopButton.addEventListener("click", () => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            });
        }
    },

    // Run scripts that are specific to the content of a page
    runPageSpecificScripts() {
        this.initFadeInObserver();
        this.initTestimonialCarousel();
        this.initFormHandlers();
        this.initFaqAccordion();
        this.initStatsCounter(); // <-- Add this call
    },

    // Observer for fade-in animations on scroll
    initFadeInObserver() {
        const sections = document.querySelectorAll(".fade-in-section");
        if (sections.length === 0) return;

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });
        sections.forEach(section => observer.observe(section));
    },

    // Animate a number from 0 to a target value
    animateCountUp(el) {
        const target = +el.dataset.countTo;
        const duration = 2000; // 2 seconds
        let startTime = null;

        const step = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            el.innerText = Math.floor(progress * target);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    },

    // Observer for the stats counter animation
    initStatsCounter() {
        const statsSection = document.getElementById('stats-section');
        if (!statsSection) return;

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll('[data-count-to]');
                    counters.forEach(counter => this.animateCountUp(counter));
                    observer.unobserve(entry.target); // Animate only once
                }
            });
        }, {
            threshold: 0.5
        });

        observer.observe(statsSection);
    },

    // Testimonial carousel logic
    initTestimonialCarousel() {
        const carouselContainer = document.getElementById('testimonial-carousel');
        if (!carouselContainer) return;

        const testimonials = [{
                quote: "L'accompagnement d'Impact'Oral a été un tournant. J'étais paralysé par le stress, mais j'ai appris à canaliser cette énergie pour livrer une présentation puissante. Mon jury a été bluffé. J'ai eu 18/20 !",
                name: "Ama",
                title: "Étudiante en Master Marketing",
                avatar: "https://placehold.co/100x100/e2e8f0/334155?text=A"
            },
            {
                quote: "Au-delà de la soutenance, ce coaching m'a servi pour mes entretiens d'embauche. J'ai gagné une confiance en moi incroyable. C'est un investissement pour la vie.",
                name: "Koffi",
                title: "Ingénieur Informatique Diplômé",
                avatar: "https://placehold.co/100x100/e2e8f0/334155?text=K"
            },
            {
                quote: "Le coaching m'a aidée à structurer ma pensée et à présenter mes recherches complexes de manière claire et accessible. Une compétence essentielle pour ma carrière de chercheuse.",
                name: "Sarah",
                title: "Doctorante en Biologie",
                avatar: "https://placehold.co/100x100/e2e8f0/334155?text=S"
            },
            {
                quote: "J'ai vaincu ma peur de parler en public. Les simulations m'ont donné la confiance nécessaire pour être à l'aise et même prendre du plaisir pendant ma soutenance.",
                name: "David",
                title: "Licence en Économie",
                avatar: "https://placehold.co/100x100/e2e8f0/334155?text=D"
            }
        ];

        const dotsContainer = document.getElementById('testimonial-dots');
        carouselContainer.innerHTML = ''; // Clear previous content
        if (dotsContainer) dotsContainer.innerHTML = '';

        testimonials.forEach((testimonial) => {
            const card = document.createElement('div');
            card.className = 'testimonial-card';
            card.innerHTML = `
                <p class="text-gray-600 italic mb-4">"${testimonial.quote}"</p>
                <div class="flex items-center justify-center">
                    <img class="w-12 h-12 rounded-full mr-4" src="${testimonial.avatar}" alt="Avatar de ${testimonial.name}">
                    <div>
                        <p class="font-bold text-gray-800">${testimonial.name}</p>
                        <p class="text-sm text-gray-500">${testimonial.title}</p>
                    </div>
                </div>`;
            carouselContainer.appendChild(card);

            if (dotsContainer) {
                const dot = document.createElement('button');
                dot.className = 'dot';
                dotsContainer.appendChild(dot);
            }
        });

        const cards = carouselContainer.querySelectorAll('.testimonial-card');
        const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];
        let currentIndex = 0;
        let autoScrollInterval;

        const showTestimonial = (index) => {
            cards.forEach((card, i) => {
                card.classList.remove('active', 'prev', 'next', 'hidden-prev', 'hidden-next');
                let diff = index - i;
                if (i === index) card.classList.add('active');
                else if (i === (index - 1 + cards.length) % cards.length) card.classList.add('prev');
                else if (i === (index + 1) % cards.length) card.classList.add('next');
                else {
                    if (Math.abs(diff) > cards.length / 2) diff = diff > 0 ? diff - cards.length : diff + cards.length;
                    card.classList.add(diff > 0 ? 'hidden-prev' : 'hidden-next');
                }
            });
            dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        };

        const next = () => {
            currentIndex = (currentIndex + 1) % cards.length;
            showTestimonial(currentIndex);
        };
        const prev = () => {
            currentIndex = (currentIndex - 1 + cards.length) % cards.length;
            showTestimonial(currentIndex);
        };

        const startInterval = () => autoScrollInterval = setInterval(next, 5000);
        const resetInterval = () => {
            clearInterval(autoScrollInterval);
            startInterval();
        };

        dots.forEach((dot, i) => dot.addEventListener('click', () => {
            currentIndex = i;
            showTestimonial(currentIndex);
            resetInterval();
        }));
        document.getElementById('next-testimonial')?.addEventListener('click', () => {
            next();
            resetInterval();
        });
        document.getElementById('prev-testimonial')?.addEventListener('click', () => {
            prev();
            resetInterval();
        });

        carouselContainer.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
        carouselContainer.addEventListener('mouseleave', startInterval);

        showTestimonial(0);
        startInterval();
    },

    // Handlers for various forms across the site
    initFormHandlers() {
        // Reservation Form
        const reservationForm = document.getElementById('reservation-form');
        if (reservationForm) {
            reservationForm.addEventListener('submit', e => {
                e.preventDefault();
                const formContainer = document.getElementById('form-container');
                const confirmationMessage = document.getElementById('confirmation-message');
                if (formContainer && confirmationMessage) {
                    formContainer.classList.add('hidden');
                    confirmationMessage.classList.remove('hidden');
                    confirmationMessage.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            });
        }

        // Contact Form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', e => {
                e.preventDefault();
                const formContainer = document.getElementById('contact-form-container');
                const confirmationMessage = document.getElementById('contact-confirmation');
                if (formContainer && confirmationMessage) {
                    formContainer.classList.add('hidden');
                    confirmationMessage.classList.remove('hidden');
                }
            });
        }

        // Inscription Modal Form
        const modal = document.getElementById('inscription-modal');
        const openBtn = document.getElementById('open-modal-btn');
        if (modal && openBtn) {
            const closeBtn = document.getElementById('close-modal-btn');
            const modalPanel = modal.querySelector('.modal-panel');
            const openModal = () => {
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                setTimeout(() => {
                    modal.classList.remove('opacity-0');
                    modalPanel.classList.remove('scale-95');
                }, 10);
            };
            const closeModal = () => {
                modal.classList.add('opacity-0');
                modalPanel.classList.add('scale-95');
                setTimeout(() => {
                    modal.classList.add('hidden');
                    document.body.style.overflow = 'auto';
                }, 300);
            };
            openBtn.addEventListener('click', openModal);
            closeBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
            document.getElementById('inscription-form')?.addEventListener('submit', e => {
                e.preventDefault();
                alert('Merci pour votre inscription ! Nous vous contacterons bientôt.');
                closeModal();
            });
        }
    },

    // FAQ Accordion
    initFaqAccordion() {
        const faqAccordion = document.getElementById('faq-accordion');
        if (faqAccordion) {
            faqAccordion.addEventListener('click', e => {
                const question = e.target.closest('.faq-question');
                if (question) {
                    const answer = question.nextElementSibling;
                    const icon = question.querySelector('svg');
                    const isOpening = !answer.style.maxHeight;

                    // Close all others
                    faqAccordion.querySelectorAll('.faq-answer').forEach(ans => {
                        ans.style.maxHeight = null;
                        ans.previousElementSibling.querySelector('svg')?.classList.remove('rotate-180');
                    });

                    // Open the clicked one if it was closed
                    if (isOpening) {
                        answer.style.maxHeight = answer.scrollHeight + "px";
                        icon?.classList.add('rotate-180');
                    }
                }
            });
        }
    }
};

// Start the app once the DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());