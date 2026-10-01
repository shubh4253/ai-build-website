const scenes = [...document.querySelectorAll(".scene")];
const chapterDots = [...document.querySelectorAll(".chapter-dot")];
const chapterNumber = document.querySelector("#chapter-number");
const chapterName = document.querySelector("#chapter-name");
const progressFill = document.querySelector("#progress-fill");

const updateActiveScene = (activeScene) => {
    const index = scenes.indexOf(activeScene);
    scenes.forEach((scene) => scene.classList.toggle("is-active", scene === activeScene));
    chapterDots.forEach((dot, dotIndex) => {
        const isCurrent = dotIndex === index;
        dot.classList.toggle("is-current", isCurrent);
        if (isCurrent) {
            dot.setAttribute("aria-current", "location");
        } else {
            dot.removeAttribute("aria-current");
        }
    });

    chapterNumber.textContent = String(index + 1).padStart(2, "0");
    chapterName.textContent = activeScene.dataset.chapter;
    progressFill.style.width = `${((index + 1) / scenes.length) * 100}%`;
};

const sceneObserver = new IntersectionObserver((entries) => {
    const visibleScene = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

    if (visibleScene) {
        updateActiveScene(visibleScene.target);
    }
}, { threshold: [0.35, 0.55, 0.75] });

scenes.forEach((scene) => sceneObserver.observe(scene));

const destinationRoutes = [
    { keywords: ["river", "water", "gate", "bridge", "falls"], id: "courtyard" },
    { keywords: ["palace", "temple", "sanctuary", "mountain", "high"], id: "stay" },
    { keywords: ["garden", "sky", "trail", "view", "valley"], id: "gardens" },
    { keywords: ["visit", "plan", "trip", "journey"], id: "visit" },
    { keywords: ["home", "start", "arrival"], id: "home" }
];

const destinationToggle = document.querySelector("#destination-toggle");
const tripSearch = document.querySelector("#trip-search");

destinationToggle.addEventListener("click", () => {
    const isExpanded = destinationToggle.getAttribute("aria-expanded") === "true";
    destinationToggle.setAttribute("aria-expanded", String(!isExpanded));
    tripSearch.hidden = isExpanded;
    destinationToggle.querySelector("span").textContent = isExpanded ? "+" : "−";
    if (!isExpanded) {
        tripSearch.elements.destination.focus();
    }
});

document.querySelector("#trip-search").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const destination = form.elements.destination.value.trim().toLowerCase();
    const dateValue = form.elements.date.value;
    const feedback = document.querySelector("#search-feedback");

    if (!destination) {
        feedback.textContent = "Enter a place in the story, like the river, palace, or gardens.";
        form.elements.destination.focus();
        return;
    }

    const route = destinationRoutes.find((item) => item.keywords.some((keyword) => destination.includes(keyword)));
    if (!route) {
        feedback.textContent = "Try the river, palace, sanctuary, gardens, or valley.";
        return;
    }

    const dateLabel = dateValue
        ? ` for ${new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(`${dateValue}T12:00:00`))}`
        : "";
    feedback.textContent = `Opening your ${destination} chapter${dateLabel}. This is a story journey, not a booking.`;
    document.querySelector(`#${route.id}`).scrollIntoView({ behavior: "smooth", block: "start" });
});

const helpLauncher = document.querySelector("#help-launcher");
const helpDesk = document.querySelector("#help-desk");
const chatMessages = document.querySelector("#chat-messages");
const chatInput = document.querySelector("#chat-input");

const setHelpDeskOpen = (isOpen) => {
    helpDesk.hidden = !isOpen;
    helpLauncher.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
        chatInput.focus();
    } else {
        helpLauncher.focus();
    }
};

helpLauncher.addEventListener("click", () => setHelpDeskOpen(helpDesk.hidden));
document.querySelector("#help-close").addEventListener("click", () => setHelpDeskOpen(false));

const guideReply = (question) => {
    const text = question.toLowerCase();
    if (/when|season|weather|best time|visit/.test(text)) {
        return "For a real mountain trip, check the local season and official weather advisories before you go. This palace is an imagined destination, so its travel dates aren't bookable here.";
    }
    if (/get around|transport|travel|reach|road|walk|route/.test(text)) {
        return "In this story, the journey continues on foot from the river gates to the high sanctuary. For a real destination, check local transport and access information with official visitor services.";
    }
    if (/near|see|do|place|attraction|garden|lake|river|palace|temple/.test(text)) {
        return "Follow the chapters: cross the river gates, climb to the high sanctuary, then wander through the sky gardens. Choose a chapter from the dots or search for a place.";
    }
    if (/book|reservation|price|cost|stay|hotel/.test(text)) {
        return "This is an interactive concept journey, not a live travel agency, so it can't quote prices or take bookings. I can still help you explore the palace chapters.";
    }
    return "I can help with the river gates, mountain sanctuary, sky gardens, and what this demo can do. Ask about one of those, or use the chapter dots to explore.";
};

const addMessage = (message, className) => {
    const bubble = document.createElement("p");
    bubble.className = `chat-bubble ${className}`;
    bubble.textContent = message;
    chatMessages.append(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

const askGuide = (question) => {
    addMessage(question, "user-message");
    addMessage(guideReply(question), "guide-message");
};

document.querySelector("#chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const question = chatInput.value.trim();
    if (!question) {
        return;
    }
    askGuide(question);
    chatInput.value = "";
    chatInput.focus();
});

document.querySelectorAll(".quick-questions button").forEach((button) => {
    button.addEventListener("click", () => askGuide(button.dataset.question));
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !helpDesk.hidden) {
        setHelpDeskOpen(false);
    }
});

const dateInput = document.querySelector('input[name="date"]');
dateInput.min = new Date().toISOString().split("T")[0];