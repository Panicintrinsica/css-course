import './styles/index.css';

// Import Content

import headerContent from './components/header.html?raw';
import navContent from './components/nav.html?raw';
import footerContent from './components/footer.html?raw';

// Cache selectors
const headerElement = document.querySelector<HTMLDivElement>('#header');
const navElement = document.querySelector<HTMLDivElement>('#nav');
const bodyElement = document.querySelector<HTMLDivElement>('#body');
const footerElement = document.querySelector<HTMLDivElement>('#footer');

if (headerElement) {
    headerElement.innerHTML = headerContent;
} else {
    console.error('Header element (#header) not found.');
}

if (navElement) {
    navElement.innerHTML = navContent;

    // Add event listeners after injecting the nav
    setupNavLinks();
} else {
    console.error('Navigation element not found.');
}

// Load Footer
if (footerElement) {
    footerElement.innerHTML = footerContent;
} else if (!footerElement) {
    console.error('Footer element (#footer) not found.');
}

/**
 * Handles routing based on the current URL.
 */
function handleRouting(): void {
    if (!bodyElement) {
        console.error('Body element (#body) not found. Cannot handle routing.');
        return;
    }

    // Fix for the root path fallback to "home"
    const path = window.location.pathname === '/' ? 'home' : window.location.pathname.replace(/^\//, ''); // Remove leading slash
    const pageName = path.endsWith('/') ? path.slice(0, -1) : path; // Normalize trailing slashes

    setPage(pageName);
}


// --- Page Loading Function ---
/**
 * Fetches and loads the content of a page into the #body element.
 * @param pageName - The name of the page (e.g., 'home', 'news') corresponding to the HTML file.
 */
async function setPage(pageName: string): Promise<void> {
    if (!bodyElement) {
        console.error('Body element (#body) not found. Cannot set page.');
        return;
    }

    try {
        const response = await fetch(`./pages/${pageName}.html`);
        if (!response.ok) {
            throw new Error(`Failed to load page ${pageName}. Status: ${response.status}`);
        }

        const module = await import(`./pages/${pageName}.html?raw`);
        bodyElement.innerHTML = module.default;

        setActiveLink(pageName); // Update active link after loading
    } catch (error) {
        console.error('Error loading page:', error);
        bodyElement.innerHTML = `<p style="color: red;">Error loading page: ${pageName}.</p>`;
        setActiveLink(null);
    }
}

// --- Navigation Link Setup ---
/**
 * Adds click event listeners to navigation links.
 */
function setupNavLinks(): void {
    const navLinks = navElement?.querySelectorAll<HTMLButtonElement>('[data-route]');
    if (!navLinks) return;

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const page = link.getAttribute('data-route');
            if (page) {
                // Update the browser history and handle routing
                window.history.pushState({}, '', `/${page}`);
                handleRouting();
            } else {
                window.history.pushState({}, '', `/${page}`);
                handleRouting();
            }
        });
    });
}

/**
 * Updates the visual state of navigation links to show the active page.
 * @param activePage - The name of the currently active page, or null to clear.
 */
function setActiveLink(activePage: string | null): void {
    const navLinks = navElement?.querySelectorAll<HTMLButtonElement>('[data-route]');
    if (!navLinks) return;

    let foundMatch = false;

    navLinks.forEach(link => {
        const page = link.getAttribute('data-route');
        if (page === activePage) {
            link.classList.add('active'); // Add your active class style in CSS/SCSS
            link.setAttribute('aria-current', 'page'); // Accessibility improvement
            foundMatch = true;
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });

    // If no exact match is found, activate the links with an empty data-route
    if (!foundMatch) {
        navLinks.forEach(link => {
            const page = link.getAttribute('data-route');
            if (page === '') {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }
}


// --- Initialize Routing ---
/**
 * Ensures routing works with back/forward browser history actions.
 */
window.addEventListener('popstate', handleRouting);

// Load the initial page based on the URL
handleRouting();