document.addEventListener("DOMContentLoaded", function () {
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const mobileMenu = document.getElementById("mobile-menu");
    const header = document.getElementById("header");
    const toTopButton = document.getElementById("to-top-button");

    // Toggle mobile menu
    mobileMenuButton.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
    });

    // Close mobile menu on link click
    mobileMenu.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
            mobileMenu.classList.add("hidden");
        }
    });

    // Add shadow to header on scroll
    window.addEventListener("scroll", () => {
        if (window.scrollY > 10) {
            header.classList.add("shadow-md");
        } else {
            header.classList.remove("shadow-md");
        }

        // Show/hide scroll-to-top button
        if (window.scrollY > 300) {
            toTopButton.classList.remove("hidden");
        } else {
            toTopButton.classList.add("hidden");
        }
    });

    // Scroll-to-top functionality
    toTopButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute("href")).scrollIntoView({
                behavior: "smooth",
            });
        });
    });

    // Intersection Observer for fade-in animations
    const sections = document.querySelectorAll(".fade-in-section");
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
    };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    sections.forEach((section) => {
        observer.observe(section);
    });

    // Active Nav Link Highlighting on Scroll
    const navLinks = document.querySelectorAll(".nav-link");
    const contentSections = document.querySelectorAll("main section");

    const activateNavLink = () => {
        let currentSection = "";
        contentSections.forEach((section) => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 150) {
                currentSection = section.getAttribute("id");
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove("nav-link-active");
            if (link.getAttribute("href") === `#${currentSection}`) {
                link.classList.add("nav-link-active");
            }
        });
    };

    window.addEventListener("scroll", activateNavLink);
});