// -------------------------------------------------------------
// CodiflyTech Main Application Interactive Script (ES6+)
// -------------------------------------------------------------

import { config } from "./config.js";
import { saveContactMessage } from "./firebase-db.js";

document.addEventListener("DOMContentLoaded", () => {
  initInteractiveBackground();
  initHeaderNavigation();
  initFormSubmissions();
  initScrollAnimations();
  initSuccessModal();
});

/* =============================================================
   1. Spring-Based Interactive Grid Background
   ============================================================= */
function initInteractiveBackground() {
  const maskDotGrid = document.querySelector(".interactive-dot-grid");
  const plasmaBlob = document.querySelector(".plasma-blob");

  if (!maskDotGrid || !plasmaBlob) return;

  // Spring physics variables
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;

  let vx = 0;
  let vy = 0;

  // Spring constants
  const stiffness = 0.08;
  const damping = 0.82;

  // Physics animation loop using requestAnimationFrame
  let animationFrameId = null;

  function animateBackground() {
    const ax = (targetX - currentX) * stiffness;
    const ay = (targetY - currentY) * stiffness;

    vx = (vx + ax) * damping;
    vy = (vy + ay) * damping;

    currentX += vx;
    currentY += vy;

    // Use fixed precision to avoid unnecessary DOM updates
    const cx = currentX.toFixed(1);
    const cy = currentY.toFixed(1);

    const maskString = `radial-gradient(350px circle at ${cx}px ${cy}px, black 0%, transparent 100%)`;
    maskDotGrid.style.webkitMaskImage = maskString;
    maskDotGrid.style.maskImage = maskString;

    const plasmaString = `radial-gradient(400px circle at ${cx}px ${cy}px, rgba(147, 197, 253, 0.35), transparent 80%)`;
    plasmaBlob.style.background = plasmaString;

    const distance = Math.sqrt((targetX - currentX) ** 2 + (targetY - currentY) ** 2);
    if (distance > 0.5 || Math.abs(vx) > 0.1 || Math.abs(vy) > 0.1) {
      animationFrameId = requestAnimationFrame(animateBackground);
    } else {
      animationFrameId = null;
    }
  }

  // Initial setup
  maskDotGrid.style.opacity = 1;
  plasmaBlob.style.opacity = 1;

  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(animateBackground);
    }
  }, { passive: true });

  window.addEventListener("resize", () => {
    targetX = window.innerWidth / 2;
    targetY = window.innerHeight / 2;
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(animateBackground);
    }
  }, { passive: true });

  // Initial fire
  animationFrameId = requestAnimationFrame(animateBackground);
}

/* =============================================================
   2. Header, Mobile Menu & Active Link Scrolling highlights
   ============================================================= */
function initHeaderNavigation() {
  const headerContainer = document.querySelector(".header-container");
  const mobileToggle = document.querySelector(".mobile-nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (!headerContainer) return;

  // 2a. Sticky Header Scrolled Padding adjustment
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      headerContainer.style.padding = "2px 0";
    } else {
      headerContainer.style.padding = "4px 0";
    }
  });

  // 2b. Mobile Menu Toggle Overlay
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", () => {
      const isExpanded = mobileToggle.getAttribute("aria-expanded") === "true";

      mobileToggle.setAttribute("aria-expanded", !isExpanded);
      headerContainer.classList.toggle("menu-open");
      mobileMenu.classList.toggle("show");

      // Toggle Hamburger to close icon
      if (!isExpanded) {
        mobileToggle.innerHTML = `
          <span class="sr-only">Close main menu</span>
          <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        `;
      } else {
        mobileToggle.innerHTML = `
          <span class="sr-only">Open main menu</span>
          <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        `;
      }
    });

    // Close mobile drawer on link click
    const mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach(link => {
      link.addEventListener("click", () => {
        mobileToggle.setAttribute("aria-expanded", "false");
        headerContainer.classList.remove("menu-open");
        mobileMenu.classList.remove("show");
        mobileToggle.innerHTML = `
          <span class="sr-only">Open main menu</span>
          <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        `;
      });
    });
  }

  // 2c. Navigation Active Link Highlights & Scrollspy
  const sections = ["home", "about", "contact"];
  const navLinks = document.querySelectorAll(".desktop-nav .nav-link");
  const isHomePage = window.location.pathname === "/" || window.location.pathname.endsWith("index.html") || window.location.pathname === "";

  // Cache section offsets to avoid layout thrashing on scroll
  let sectionOffsets = [];
  function cacheOffsets() {
    if (!isHomePage) return;
    sectionOffsets = sections.map(id => {
      const el = document.getElementById(id);
      return el ? { id, top: el.offsetTop, height: el.offsetHeight } : null;
    }).filter(Boolean);
  }

  function updateActiveNavigation() {
    let currentActive = "home";

    if (isHomePage) {
      const scrollPosition = window.scrollY + 200;

      for (const section of sectionOffsets) {
        if (scrollPosition >= section.top && scrollPosition < section.top + section.height) {
          currentActive = section.id;
        }
      }

      // Highlight corresponding link
      navLinks.forEach(link => {
        const href = link.getAttribute("href");
        const navPillBg = link.querySelector(".nav-pill-bg");

        const isMatch = (currentActive === "home" && (href === "/" || href === "./index.html" || href === "index.html")) ||
          (href.includes("#" + currentActive));

        if (isMatch) {
          link.classList.add("active");
          if (navPillBg) navPillBg.style.opacity = "1";
        } else {
          link.classList.remove("active");
          if (navPillBg) navPillBg.style.opacity = "0";
        }
      });
    } else {
      // Highlight based on current path for subpages
      navLinks.forEach(link => {
        const href = link.getAttribute("href");
        const navPillBg = link.querySelector(".nav-pill-bg");
        const path = window.location.pathname;

        if (href !== "/" && path.includes(href.replace(".html", ""))) {
          link.classList.add("active");
          if (navPillBg) navPillBg.style.opacity = "1";
        } else {
          link.classList.remove("active");
          if (navPillBg) navPillBg.style.opacity = "0";
        }
      });
    }
  }

  // Throttle scroll events for better performance
  let isScrolling = false;
  window.addEventListener("scroll", () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        updateActiveNavigation();
        isScrolling = false;
      });
      isScrolling = true;
    }
  });

  window.addEventListener("resize", cacheOffsets);
  cacheOffsets();
  updateActiveNavigation();
}

/* =============================================================
   3. Web3Forms & Firebase Modular Form Submissions
   ============================================================= */
function initFormSubmissions() {
  const contactForm = document.getElementById("contact-form");
  const deletionForm = document.getElementById("deletion-form");

  // 3a. Contact Form Submission
  if (contactForm) {
    const statusText = document.getElementById("contact-status");

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);

      // Inject unified access key from configuration
      formData.set("access_key", config.web3Forms.accessKey);

      if (statusText) {
        statusText.innerText = "Sending message...";
        statusText.style.color = "var(--color-text-dark)";
      }

      const name = formData.get("name");
      const email = formData.get("email");
      const message = formData.get("message");

      try {
        // Parallelized asynchronous operations: Web3Forms submission & Firestore database write
        const [web3Response, firebaseResult] = await Promise.all([
          fetch(config.web3Forms.submitUrl, {
            method: "POST",
            body: formData
          }).then(res => res.json()),
          saveContactMessage(name, email, message)
        ]);

        if (web3Response.success && firebaseResult.success) {
          showSuccessModal(
            "Message Sent!",
            "Thank you for reaching out. Our team will get back to you shortly."
          );
          contactForm.reset();
          if (statusText) statusText.innerText = "";
        } else {
          throw new Error(web3Response.message || "Submission failed");
        }
      } catch (error) {
        console.error("Submission Error:", error);
        if (statusText) {
          statusText.innerText = "Error sending message. Please email support@codiflytech.com directly.";
          statusText.style.color = "var(--color-danger)";
        }
      }
    });
  }

  // 3b. Account Deletion Portal Submission
  if (deletionForm) {
    const statusText = document.getElementById("deletion-status");

    deletionForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(deletionForm);

      // Inject details and access key
      formData.set("access_key", config.web3Forms.accessKey);
      formData.append("subject", "Data Deletion Request - CodiflyTech");
      formData.append("form_type", "data_deletion_request");

      if (statusText) {
        statusText.innerText = "Submitting request...";
        statusText.style.color = "var(--color-text-dark)";
        statusText.style.display = "block";
      }

      const name = formData.get("name");
      const email = formData.get("email");
      const appName = formData.get("app_name");
      const reason = formData.get("reason") || "";
      const messageBody = `App Name: ${appName}\nReason: ${reason}`;

      try {
        // Submit concurrently to Web3Forms and Firebase Firestore
        const [web3Response, firebaseResult] = await Promise.all([
          fetch(config.web3Forms.submitUrl, {
            method: "POST",
            body: formData
          }).then(res => res.json()),
          saveContactMessage(name, email, `[DELETION REQUEST] ${messageBody}`)
        ]);

        if (web3Response.success && firebaseResult.success) {
          showSuccessModal(
            "Request Submitted",
            "Your deletion request has been received. We will process it within 30 days."
          );
          deletionForm.reset();
          if (statusText) statusText.style.display = "none";
        } else {
          throw new Error(web3Response.message || "Deletion request failed");
        }
      } catch (error) {
        console.error("Deletion Submission Error:", error);
        if (statusText) {
          statusText.innerText = "Something went wrong. Please email support@codiflytech.com directly.";
          statusText.style.color = "var(--color-danger)";
        }
      }
    });
  }
}

/* =============================================================
   4. Scroll-Triggered Fade-In Card Animations
   ============================================================= */
function initScrollAnimations() {
  const animatedCards = document.querySelectorAll(".card-about, .contact-wrapper, .deletion-container, .legal-card");

  if (animatedCards.length === 0) return;

  // Options for Intersection Observer (fade in when cards start entering)
  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -50px 0px", // Trigger slightly before it hits the bottom
    threshold: 0
  };

  // Define Intersection Observer callback
  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  animatedCards.forEach(card => {
    // Check if element is already in the viewport on load
    const rect = card.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

    if (isInViewport) {
      // If already visible, show immediately without hiding
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    } else {
      // Set initial styles for scroll-in behavior
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.transition = "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
      observer.observe(card);
    }
  });
}

/* =============================================================
   5. Success Modal Controller
   ============================================================= */
function initSuccessModal() {
  const modal = document.getElementById("success-modal");
  const closeBtn = document.getElementById("modal-close");

  if (!modal || !closeBtn) return;

  const closeModal = () => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // Re-enable scroll
  };

  closeBtn.addEventListener("click", closeModal);

  // Close on background click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) {
      closeModal();
    }
  });
}

function showSuccessModal(title, message) {
  const modal = document.getElementById("success-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");

  if (!modal || !modalTitle || !modalMessage) return;

  modalTitle.innerText = title;
  modalMessage.innerText = message;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // Disable scroll when modal is open
}
