// Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links a');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a nav link
navLinksItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Login and Signup Button Click Handlers
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.querySelector('.btn-login');
    const signupButton = document.querySelector('.btn-signup');
    const signupbButton = document.querySelector('.signupb');
    const getStartedButton = document.querySelector('.getstarted');
    
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
    
    if (signupButton) {
        signupButton.addEventListener('click', () => {
            window.location.href = 'signup.html';
        });
    }

    if (signupbButton) {
        signupbButton.addEventListener('click', () => {
            window.location.href = 'signup.html';
        });
    }

    if (getStartedButton) {
        getStartedButton.addEventListener('click', () => {
            // Check if user is logged in
            if (isUserLoggedIn()) {
                // User is logged in, redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // User is not logged in, redirect to login page
                window.location.href = 'login.html';
            }
        });
    }
});
// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll Reveal Animation
const scrollRevealElements = document.querySelectorAll('.scroll-reveal');

const scrollReveal = () => {
    const triggerBottom = window.innerHeight * 0.8;

    scrollRevealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;

        if (elementTop < triggerBottom) {
            element.classList.add('active');
        }
    });
};

window.addEventListener('scroll', scrollReveal);
window.addEventListener('load', scrollReveal);

// Page Loading Animation
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.classList.add('hidden');
    }
});

// Improved Testimonials Carousel
// Improved Testimonials Carousel
class TestimonialSlider {
    constructor() {
        this.slides = document.querySelectorAll('.testimonial-slide');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.currentIndex = 0;
        this.autoplayInterval = null;
        this.autoplayDelay = 5000; // 5 seconds

        if (this.slides.length === 0) return; // Exit if no slides found
        
        this.init();
    }

    init() {
        // Set initial slide
        this.showSlide(this.currentIndex);
        
        // Add event listeners
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.prevSlide();
                this.resetAutoplay();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.nextSlide();
                this.resetAutoplay();
            });
        }
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.showSlide(index);
                this.resetAutoplay();
            });
        });
        
        // Start autoplay
        this.startAutoplay();
        
        // Pause autoplay on hover
        const container = document.querySelector('.testimonials-container');
        if (container) {
            container.addEventListener('mouseenter', () => this.stopAutoplay());
            container.addEventListener('mouseleave', () => this.startAutoplay());
        }
        
        // Add touch support
        this.addTouchSupport();
    }
    
    showSlide(index) {
        // Hide all slides
        this.slides.forEach(slide => {
            slide.classList.remove('active');
            slide.style.display = 'none';
        });
        
        // Update dots
        this.dots.forEach(dot => dot.classList.remove('active'));
        
        // Show current slide and activate dot
        if (this.slides[index]) {
            this.slides[index].classList.add('active');
            this.slides[index].style.display = 'block';
        }
        
        if (this.dots[index]) {
            this.dots[index].classList.add('active');
        }
        
        this.currentIndex = index;
    }
    
    nextSlide() {
        const newIndex = (this.currentIndex + 1) % this.slides.length;
        this.showSlide(newIndex);
    }
    
    prevSlide() {
        const newIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.showSlide(newIndex);
    }
    
    startAutoplay() {
        this.stopAutoplay(); // Clear any existing interval
        this.autoplayInterval = setInterval(() => this.nextSlide(), this.autoplayDelay);
    }
    
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
    }
    
    resetAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }
    
    addTouchSupport() {
        const slider = document.querySelector('.testimonial-slider');
        if (!slider) return;
        
        let startX, endX;
        const threshold = 50; // Minimum distance to detect swipe
        
        slider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });
        
        slider.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            
            const diff = startX - endX;
            
            if (Math.abs(diff) >= threshold) {
                if (diff > 0) {
                    // Swipe left, go to next
                    this.nextSlide();
                } else {
                    // Swipe right, go to previous
                    this.prevSlide();
                }
                this.resetAutoplay();
            }
        }, { passive: true });
    }
}

// Initialize testimonial slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TestimonialSlider();
});

// Form Validation
const forms = document.querySelectorAll('form');

forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your form validation and submission logic here
        console.log('Form submitted');
    });
});
// Navbar Scroll Effect with improved performance
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
}, { passive: true });

// Add active class to current section in navigation with improved performance
const observeSection = () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    const options = {
        threshold: 0.5,
        rootMargin: "-50% 0% -50% 0%"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, options);

    sections.forEach(section => observer.observe(section));
};

// Initialize section observer
document.addEventListener('DOMContentLoaded', observeSection);

// Initialize tooltips with improved positioning
class Tooltip {
    constructor(element) {
        this.element = element;
        this.tooltipElement = null;
        this.init();
    }

    init() {
        this.element.addEventListener('mouseenter', () => this.show());
        this.element.addEventListener('mouseleave', () => this.hide());
    }

    show() {
        const tooltipText = this.element.getAttribute('data-tooltip');
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.classList.add('tooltip');
        this.tooltipElement.textContent = tooltipText;
        document.body.appendChild(this.tooltipElement);

        this.position();
    }

    position() {
        const rect = this.element.getBoundingClientRect();
        const tooltipRect = this.tooltipElement.getBoundingClientRect();
        
        let top = rect.top - tooltipRect.height - 10;
        let left = rect.left + (rect.width - tooltipRect.width) / 2;

        // Adjust if tooltip would go off screen
        if (top < 0) top = rect.bottom + 10;
        if (left < 0) left = 10;
        if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        this.tooltipElement.style.top = `${top + window.scrollY}px`;
        this.tooltipElement.style.left = `${left}px`;
    }

    hide() {
        if (this.tooltipElement) {
            this.tooltipElement.remove();
            this.tooltipElement = null;
        }
    }
}

// Initialize tooltips
document.querySelectorAll('[data-tooltip]').forEach(element => {
    new Tooltip(element);
});

document.addEventListener('DOMContentLoaded', () => {
    // Lazy load images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) {
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const lazyLoadScript = document.createElement('script');
        lazyLoadScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(lazyLoadScript);
    }

    // Initialize testimonial slider
    const testimonialSlider = new TestimonialSlider();
    
    // Initialize section observer
    observeSection();
});