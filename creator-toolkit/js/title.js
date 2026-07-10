async function generateTitles() {
    // Mee HTML IDs tho correct ga elements ni catch chesthunnam
    const topicInput = document.getElementById('keyword');
    const resultBox = document.getElementById('output');
    const generateBtn = document.querySelector('.btn-primary-v2');

    // Validation Check
    if (!topicInput || !topicInput.value.trim()) {
        alert("Please enter a video topic!");
        return;
    }

    const topic = topicInput.value.trim();

    try {
        // UI feedback - Loading states
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.innerText = "⏳ Generating...";
        }
        if (resultBox) {
            resultBox.innerText = "Generating your titles, please wait...";
            resultBox.style.whiteSpace = "pre-line"; // Line breaks break avvakunda undadaniki
        }

        // Call Vercel/Next API Route
        const response = await fetch('/api/title', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic: topic })
        });

        const data = await response.json();

        if (response.ok && data.titles) {
            // Text values update
            if (resultBox) resultBox.innerText = data.titles;
        } else {
            if (resultBox) resultBox.innerText = `Error: ${data.error || 'Failed to generate titles'}`;
        }

    } catch (error) {
        console.error("Frontend Error:", error);
        if (resultBox) resultBox.innerText = "Something went wrong. Please check console.";
    } finally {
        // Reset button state
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerText = "✨ Generate Titles";
        }
    }
}

// Copy Titles Button Functionality Fix
async function copyTitles() {
    const resultBox = document.getElementById('output');
    const copyBtn = document.querySelector('.btn-secondary-v2');
    
    if (!resultBox || !resultBox.innerText || resultBox.innerText.startsWith("Your AI-generated") || resultBox.innerText.startsWith("Generating")) {
        alert("No titles available to copy!");
        return;
    }

    try {
        await navigator.clipboard.writeText(resultBox.innerText);
        if (copyBtn) {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = "✅ Copied!";
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        }
    } catch (err) {
        alert("Failed to copy text. Please select manually.");
    }
}

// Global scope initialization global window parameters target
window.generateTitles = generateTitles;
window.copyTitles = copyTitles;
