async function generateTitles() {
    // Direct selector using ID
    const topicInput = document.getElementById('topicInput');
    const resultBox = document.querySelector('textarea[placeholder*="AI-generated titles"]') || document.querySelector('textarea');
    const generateBtn = document.querySelector('button'); 

    // Ee condition strict ga dynamic context check chesthundi
    if (!topicInput || !topicInput.value.trim()) {
        alert("Please enter a video topic!");
        return;
    }

    const topic = topicInput.value.trim();

    try {
        if (generateBtn) generateBtn.disabled = true;
        if (resultBox) resultBox.value = "Generating your titles, please wait...";

        const response = await fetch('/api/title-generator', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic: topic })
        });

        const data = await response.json();

        if (response.ok && data.titles) {
            if (resultBox) resultBox.value = data.titles;
        } else {
            if (resultBox) resultBox.value = `Error: ${data.error || 'Failed to generate titles'}`;
        }

    } catch (error) {
        console.error("Frontend Error:", error);
        if (resultBox) resultBox.value = "Something went wrong. Please check console.";
    } finally {
        if (generateBtn) {
            generateBtn.disabled = false;
        }
    }
}

// Global hook activation
window.generateTitles = generateTitles;
