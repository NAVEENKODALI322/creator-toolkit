async function generateTitles() {
    // 1. Inputs and buttons pick cheyadam
    const topicInput = document.querySelector('input[placeholder="Video topic"]') || document.getElementById('topicInput');
    const resultBox = document.querySelector('textarea[placeholder*="AI-generated titles"]') || document.getElementById('resultBox');
    
    // HTML button structured text check
    const generateBtn = document.querySelector('button'); 

    if (!topicInput || !topicInput.value.trim()) {
        alert("Please enter a video topic!");
        return;
    }

    const topic = topicInput.value.trim();

    try {
        // Loading state triggers
        if (generateBtn) generateBtn.disabled = true;
        if (resultBox) resultBox.value = "Generating your titles, please wait...";

        // 2. Step 1 lo setup chesina Backend API endpoint ki link cheyadam
        const response = await fetch('/api/title-generator', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic: topic })
        });

        const data = await response.json();

        if (response.ok && data.titles) {
            // UI text data dashboard look dump chesthundi
            if (resultBox) resultBox.value = data.titles;
        } else {
            if (resultBox) resultBox.value = `Error: ${data.error || 'Failed to generate titles'}`;
        }

    } catch (error) {
        console.error("Frontend Error:", error);
        if (resultBox) resultBox.value = "Something went wrong. Please check console.";
    } finally {
        if (generateBtn) generateBtn.disabled = false;
    }
}

// Global scope initialization button click trigger detect cheyadanki
window.generateTitles = generateTitles;
