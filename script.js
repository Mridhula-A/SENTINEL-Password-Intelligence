
// =====================================
// SENTINEL - PASSWORD INTELLIGENCE
// =====================================

const passwordInput = document.getElementById("password");
const strengthText = document.getElementById("strength");
const progressBar = document.getElementById("progress-bar");
const suggestions = document.getElementById("suggestions");

const scoreValue = document.getElementById("score-value");
const scoreRing = document.getElementById("score-ring");
const scoreMessage = document.getElementById("score-message");

// PASSWORD ANALYSIS
passwordInput.addEventListener("input", checkPassword);

function checkPassword() {

    const password = passwordInput.value;
    let score = 0;
    let tips = [];

    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password)
    };

    const messages = {
        length: "Use at least 8 characters",
        uppercase: "Add an uppercase letter",
        lowercase: "Add a lowercase letter",
        number: "Include a number",
        special: "Include a special character"
    };

    // CHECK REQUIREMENTS
    for (let key in checks) {

        const element = document.getElementById(key);

        element.classList.toggle("valid", checks[key]);

        if (checks[key]) {
            score++;
        } else {
            tips.push(messages[key]);
        }
    }

    // CONVERT SCORE TO PERCENTAGE
    const percentage = score * 20;

    // STRENGTH LEVELS
    let strength;
    let color;
    let message;

    if (password.length === 0) {

        strength = "Awaiting Analysis";
        color = "#263b2e";
        message = "Enter a password to begin.";

    } else if (score <= 1) {

        strength = "Very Weak";
        color = "#e5484d";
        message = "Your password needs major improvement.";

    } else if (score === 2) {

        strength = "Weak";
        color = "#f08c32";
        message = "Your password needs stronger protection.";

    } else if (score === 3) {

        strength = "Medium";
        color = "#e9c443";
        message = "Getting better! Improve the missing criteria.";

    } else if (score === 4) {

        strength = "Strong";
        color = "#70bb49";
        message = "Good password! One improvement remains.";

    } else {

        strength = "Very Strong";
        color = "#35c66b";
        message = "Excellent! All five conditions are satisfied.";
    }

    // UPDATE CIRCULAR SCORE
    scoreValue.textContent = percentage;

    scoreRing.style.background =
        `conic-gradient(${color} ${percentage}%, #263b2e ${percentage}%)`;

    // UPDATE STRENGTH TEXT
    strengthText.textContent = strength;
    strengthText.style.color = color;

    // UPDATE LINEAR METER
    progressBar.style.width = percentage + "%";
    progressBar.style.background = color;

    // UPDATE ANALYSIS MESSAGE
    scoreMessage.textContent = message;

    // UPDATE SUGGESTIONS
    if (password.length === 0) {

        suggestions.textContent =
            "Enter a password to see security recommendations.";

    } else if (tips.length === 0) {

        suggestions.textContent =
            "Excellent! All password requirements are satisfied.";

    } else {

        suggestions.innerHTML =
            tips.map(tip => "• " + tip).join("<br>");
    }
}


// =====================================
// SHOW / HIDE PASSWORD
// =====================================

function togglePassword() {

    passwordInput.type =
        passwordInput.type === "password" ? "text" : "password";
}


// =====================================
// SECURE RANDOM NUMBER GENERATOR
// =====================================

function secureRandomInt(max) {

    const range = 0x100000000;
    const limit = range - (range % max);
    const array = new Uint32Array(1);

    let value;

    do {
        crypto.getRandomValues(array);
        value = array[0];
    } while (value >= limit);

    return value % max;
}


// =====================================
// PASSWORD GENERATOR
// =====================================

function generatePassword() {

    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}?";

    const allCharacters = upper + lower + numbers + symbols;

    let password = "";

    // Guarantee at least one character per category
    password += upper[secureRandomInt(upper.length)];
    password += lower[secureRandomInt(lower.length)];
    password += numbers[secureRandomInt(numbers.length)];
    password += symbols[secureRandomInt(symbols.length)];

    // Generate remaining characters
    for (let i = 4; i < 16; i++) {

        password +=
            allCharacters[secureRandomInt(allCharacters.length)];
    }

    // Securely shuffle the characters
    const characters = password.split("");

    for (let i = characters.length - 1; i > 0; i--) {

        const j = secureRandomInt(i + 1);

        [characters[i], characters[j]] =
            [characters[j], characters[i]];
    }

    password = characters.join("");

    document.getElementById("generatedPassword").value = password;

    // Analyze the generated password using the same live-analysis flow.
    passwordInput.value = password;
    passwordInput.dispatchEvent(new Event("input", { bubbles: true }));

    document.getElementById("generator-message").textContent =
        "✓ Secure random password generated!";
}


// =====================================
// COPY GENERATED PASSWORD
// =====================================

async function copyPassword() {

    const generatedPassword =
        document.getElementById("generatedPassword");

    const message =
        document.getElementById("generator-message");

    if (!generatedPassword.value) {

        message.textContent = "Generate a password first.";
        return;
    }

    try {

        await navigator.clipboard.writeText(generatedPassword.value);

        message.textContent = "✓ Password copied successfully!";

    } catch (error) {

        message.textContent =
            "Copy unavailable. Select and copy the password manually.";
    }
}

// ==========================================
// SENTINEL - ADVANCED SECURITY ANALYSIS
// Powered by zxcvbn (runs locally in the browser)
// ==========================================

function formatCrackTime(seconds) {
    if (!Number.isFinite(seconds)) return "centuries+";
    if (seconds < 1) return "Less than a second";

    const units = [
        ["century", 3155760000],
        ["year", 31557600],
        ["month", 2629800],
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60],
        ["second", 1]
    ];

    for (const [unit, size] of units) {
        if (seconds >= size) {
            const amount = Math.floor(seconds / size);
            return `${amount.toLocaleString()} ${unit}${amount === 1 ? "" : "s"}`;
        }
    }

    return "Less than a second";
}

function setAdvancedDefaults() {
    const ids = [
        "entropy-value",
        "crack-online-throttled",
        "crack-online-unthrottled",
        "crack-offline-slow",
        "crack-offline-fast"
    ];

    ids.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = "--";
    });

    document.getElementById("common-status").textContent =
        "Waiting for password analysis...";
    document.getElementById("pattern-status").textContent =
        "No analysis performed yet.";

    const feedbackElement = document.getElementById("advanced-feedback");
    feedbackElement.replaceChildren();

    const item = document.createElement("li");
    item.textContent = "Enter a password to start analysis.";
    feedbackElement.appendChild(item);
}

function runAdvancedAnalysis() {
    const password = passwordInput.value;

    const entropyElement = document.getElementById("entropy-value");
    const commonElement = document.getElementById("common-status");
    const patternElement = document.getElementById("pattern-status");
    const feedbackElement = document.getElementById("advanced-feedback");

    if (!password) {
        setAdvancedDefaults();
        return;
    }

    if (typeof zxcvbn !== "function") {
        setAdvancedDefaults();
        commonElement.textContent =
            "Analysis engine unavailable. Check your internet connection and reload SENTINEL.";
        return;
    }

    // zxcvbn estimates guesses using dictionaries and recognizable patterns.
    // Passwords are evaluated locally; they are not sent to a server.
    const result = zxcvbn(password);
    const entropy = Math.log2(Math.max(1, result.guesses));

    entropyElement.textContent = `${entropy.toFixed(1)}`;

    // Show the four standard zxcvbn attack scenarios.
    const crackTimes = result.crack_times_seconds || {};
    const crackTimeTargets = {
        "crack-online-throttled": "online_throttling_100_per_hour",
        "crack-online-unthrottled": "online_no_throttling_10_per_second",
        "crack-offline-slow": "offline_slow_hashing_1e4_per_second",
        "crack-offline-fast": "offline_fast_hashing_1e10_per_second"
    };

    Object.entries(crackTimeTargets).forEach(([elementId, resultKey]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = formatCrackTime(crackTimes[resultKey]);
        }
    });

    // Common-password / dictionary detection.
    const matches = Array.isArray(result.sequence) ? result.sequence : [];
    const dictionaryMatches = matches.filter(match =>
        match.pattern === "dictionary"
    );

    if (dictionaryMatches.length > 0 || result.score <= 1) {
        commonElement.textContent =
            "⚠ Weak or predictable password choices were detected. Avoid common words, names, and familiar combinations.";
    } else {
        commonElement.textContent =
            "✓ No obvious common-password or dictionary pattern was identified. This is an estimate, not a guarantee.";
    }

    // Identify predictable patterns found by zxcvbn.
    const patternNames = {
        dictionary: "Dictionary words",
        sequence: "Sequential characters",
        repeat: "Repeated characters",
        spatial: "Keyboard patterns",
        date: "Date patterns",
        regex: "Predictable numeric patterns",
        year: "Year patterns"
    };

    const detectedPatterns = [
        ...new Set(
            matches
                .map(match => patternNames[match.pattern])
                .filter(Boolean)
        )
    ];

    if (detectedPatterns.length > 0) {
        patternElement.textContent =
            "⚠ Detected: " + detectedPatterns.join(", ");
    } else {
        patternElement.textContent =
            "✓ No obvious predictable patterns detected by the estimator.";
    }

    // Display zxcvbn's feedback safely as text.
    feedbackElement.replaceChildren();
    const recommendations = [];

    if (result.feedback && result.feedback.warning) {
        recommendations.push(result.feedback.warning);
    }

    if (result.feedback && Array.isArray(result.feedback.suggestions)) {
        recommendations.push(...result.feedback.suggestions);
    }

    if (recommendations.length === 0) {
        recommendations.push(
            "No additional recommendations from the estimator. Use a unique password for every account."
        );
    }

    recommendations.forEach(tip => {
        const item = document.createElement("li");
        item.textContent = tip;
        feedbackElement.appendChild(item);
    });
}

// Run the advanced engine whenever the user edits the password.
passwordInput.addEventListener("input", runAdvancedAnalysis);

// Initialise the dashboard on page load.
setAdvancedDefaults();


// ==========================================
// STAGE 4 - PRIVACY-PRESERVING BREACH CHECK
// Have I Been Pwned Pwned Passwords API
// ==========================================

const breachButton = document.getElementById("check-breach-btn");
const breachResult = document.getElementById("breach-result");

function showBreachResult(title, message, state) {
    breachResult.replaceChildren();

    const heading = document.createElement("strong");
    heading.textContent = title;

    const description = document.createElement("p");
    description.textContent = message;

    breachResult.append(heading, description);
    breachResult.className = `breach-result ${state || ""}`.trim();
}

async function sha1Hex(value) {
    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-1", data);

    return Array.from(new Uint8Array(digest))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
}

async function checkPasswordBreach() {
    const password = passwordInput.value;

    if (!password) {
        showBreachResult(
            "Password required",
            "Enter a password before running the breach check.",
            "warning"
        );
        passwordInput.focus();
        return;
    }

    if (!window.crypto || !crypto.subtle) {
        showBreachResult(
            "Secure browser context required",
            "The Web Crypto API is unavailable. Open SENTINEL through HTTPS or localhost and try again.",
            "warning"
        );
        return;
    }

    breachButton.disabled = true;
    breachButton.textContent = "Checking securely...";
    showBreachResult(
        "Checking breach dataset",
        "The password hash is being calculated locally. Please wait.",
        "checking"
    );

    try {
        // Hash the password locally; never transmit the password or full hash.
        const fullHash = await sha1Hex(password);
        const prefix = fullHash.slice(0, 5);
        const suffix = fullHash.slice(5);

        const response = await fetch(
            `https://api.pwnedpasswords.com/range/${prefix}`,
            {
                method: "GET",
                headers: { "Add-Padding": "true" },
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(`Breach service returned HTTP ${response.status}`);
        }

        const responseText = await response.text();

        // Compare the full suffix locally; ignore padding entries with count zero.
        const matchingLine = responseText
            .split(/\r?\n/)
            .map(line => line.trim().split(":"))
            .find(parts =>
                parts.length === 2 &&
                parts[0].toUpperCase() === suffix &&
                Number(parts[1]) > 0
            );

        if (matchingLine) {
            const exposureCount = Number(matchingLine[1]).toLocaleString();
            showBreachResult(
                "⚠ Password found in breach data",
                `This password hash appeared ${exposureCount} times in the Pwned Passwords dataset. Do not use this password. Choose a new, unique password.`,
                "danger"
            );
        } else {
            showBreachResult(
                "✓ No match found",
                "This password was not found in the current Pwned Passwords dataset. This does not guarantee that the password is secret or safe; continue using a unique password.",
                "safe"
            );
        }
    } catch (error) {
        console.error("SENTINEL breach check error:", error);
        showBreachResult(
            "Breach check unavailable",
            "SENTINEL could not reach the breach-checking service. Check your internet connection and try again. No safety conclusion can be made.",
            "warning"
        );
    } finally {
        breachButton.disabled = false;
        breachButton.textContent = "Check Password Breach Status";
    }
}

breachButton.addEventListener("click", checkPasswordBreach);

// Invalidate the previous result whenever the password changes.
passwordInput.addEventListener("input", () => {
    showBreachResult(
        "Password changed",
        "Run the breach check again to analyse the current password.",
        ""
    );
});

// ======================================================
// STAGE 5: OVERALL SECURITY REPORT + PDF DOWNLOAD
// ======================================================

const generateReportBtn = document.getElementById("generate-report-btn");
const downloadReportBtn = document.getElementById("download-report-btn");

const securityReport = document.getElementById("security-report");

let latestSecurityReport = null;

// Read existing analysis values from the interface
function getReportText(id, fallback = "Not available") {
    const element = document.getElementById(id);

    if (!element) {
        return fallback;
    }

    return element.textContent.trim() || fallback;
}

// Build the report using existing Stage 3 and Stage 4 results
function buildSecurityReport() {

    const passwordInput = document.getElementById("password");

    if (!passwordInput || !passwordInput.value) {
        alert("Please enter a password before generating the report.");
        return null;
    }

    const score = getReportText("score-value", "-");
    const strength = getReportText("strength", "Not analyzed");

    const entropy = getReportText("entropy-value", "-");

    const breach = getReportText(
        "breach-result",
        "Not checked"
    );

    const common = getReportText(
        "common-status",
        "Not analyzed"
    );

    const pattern = getReportText(
        "pattern-status",
        "Not analyzed"
    );

    const feedbackElement = document.getElementById("advanced-feedback");

    const recommendations = feedbackElement
        ? feedbackElement.innerText.trim()
        : "No recommendations available.";

    return {
        date: new Date().toLocaleString(),

        // Never include the actual password in the report.
        strength: strength,
        score: score,
        entropy: entropy,
        breach: breach,

        crackTimes: {
            onlineThrottled: getReportText("crack-online-throttled"),
            onlineUnthrottled: getReportText("crack-online-unthrottled"),
            offlineSlow: getReportText("crack-offline-slow"),
            offlineFast: getReportText("crack-offline-fast")
        },

        common: common,
        pattern: pattern,
        recommendations: recommendations
    };
}

// Display the report on the webpage
function displaySecurityReport(report) {

    document.getElementById("report-status").textContent =
        "Report generated successfully on " + report.date;

    document.getElementById("report-strength").textContent =
        report.strength;

    document.getElementById("report-score").textContent =
        report.score;

    document.getElementById("report-entropy").textContent =
        report.entropy;

    document.getElementById("report-breach").textContent =
        report.breach;

    document.getElementById("report-online-throttled").textContent =
        report.crackTimes.onlineThrottled;

    document.getElementById("report-online-unthrottled").textContent =
        report.crackTimes.onlineUnthrottled;

    document.getElementById("report-offline-slow").textContent =
        report.crackTimes.offlineSlow;

    document.getElementById("report-offline-fast").textContent =
        report.crackTimes.offlineFast;

    document.getElementById("report-common").textContent =
        "Common password: " + report.common;

    document.getElementById("report-pattern").textContent =
        "Password patterns: " + report.pattern;

    document.getElementById("report-recommendations").textContent =
        report.recommendations;

    securityReport.classList.add("report-generated");
}

// Generate report button
if (generateReportBtn) {

    generateReportBtn.addEventListener("click", function () {

        const report = buildSecurityReport();

        if (!report) {
            return;
        }

        latestSecurityReport = report;

        displaySecurityReport(report);

        alert("Your security report has been generated!");
    });
}

// Download report as PDF
if (downloadReportBtn) {

    downloadReportBtn.addEventListener("click", function () {

        if (!latestSecurityReport) {
            alert("Please generate the security report first.");
            return;
        }

        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert("PDF library could not be loaded. Check your internet connection.");
            return;
        }

        const { jsPDF } = window.jspdf;

        const doc = new jsPDF();

        const report = latestSecurityReport;

        let y = 20;

        function addLine(text, spacing = 8) {

            const lines = doc.splitTextToSize(
                String(text),
                175
            );

            if (y + lines.length * 7 > 275) {
                doc.addPage();
                y = 20;
            }

            doc.text(lines, 15, y);

            y += lines.length * 7 + spacing;
        }

        doc.setFontSize(20);
        doc.text("SENTINEL", 15, y);

        y += 10;

        doc.setFontSize(14);
        doc.text("Password Security Analysis Report", 15, y);

        y += 12;

        doc.setFontSize(10);

        addLine("Generated: " + report.date);

        addLine("PASSWORD SECURITY SUMMARY", 5);

        addLine("Strength: " + report.strength);
        addLine("Security Score: " + report.score);
        addLine("Estimated Entropy: " + report.entropy);
        addLine("Breach Status: " + report.breach);

        addLine("CRACK TIME ESTIMATES", 5);

        addLine("Online throttled: " + report.crackTimes.onlineThrottled);
        addLine("Online unthrottled: " + report.crackTimes.onlineUnthrottled);
        addLine("Offline slow hash: " + report.crackTimes.offlineSlow);
        addLine("Offline fast hash: " + report.crackTimes.offlineFast);

        addLine("DETECTED SECURITY ISSUES", 5);

        addLine("Common password: " + report.common);
        addLine("Password patterns: " + report.pattern);

        addLine("SECURITY RECOMMENDATIONS", 5);

        addLine(report.recommendations);

        addLine(
            "Privacy Notice: The actual password is not included in this report."
        );

        addLine(
            "Breach results depend on the availability of the breach-check service."
        );

        doc.save("SENTINEL_Security_Report.pdf");
    });
}

// Invalidate the previous report when the password changes
const reportPasswordInput = document.getElementById("password");

if (reportPasswordInput) {

    reportPasswordInput.addEventListener("input", function () {

        latestSecurityReport = null;

        if (securityReport) {
            securityReport.classList.remove("report-generated");
        }

        document.getElementById("report-status").textContent =
            "Password changed. Generate a new report.";
    });
}

// ======================================================
// END OF STAGE 5
// ======================================================