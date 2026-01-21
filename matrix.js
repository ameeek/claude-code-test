/**
 * Matrix Rain Effect
 * Creates the iconic falling character animation from The Matrix
 */

(function() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    // Character sets for the rain
    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '@#$%^&*()_+-=[]{}|;:,.<>?';

    const characters = katakana + latin + numbers + symbols;

    // Configuration
    const fontSize = 16;
    let columns;
    let drops = [];

    // Initialize canvas size
    function initCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        columns = Math.floor(canvas.width / fontSize);

        // Initialize drops array
        drops = [];
        for (let i = 0; i < columns; i++) {
            // Start at random heights for more natural effect
            drops[i] = Math.random() * -100;
        }
    }

    // Get random character
    function getRandomChar() {
        return characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Draw the matrix rain
    function draw() {
        // Semi-transparent black to create fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Green text
        ctx.fillStyle = '#00bfff';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            // Random character
            const char = getRandomChar();

            // Calculate position
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // Draw the character with varying brightness
            const brightness = Math.random();
            if (brightness > 0.98) {
                // Occasional bright white character (lead character)
                ctx.fillStyle = '#ffffff';
            } else if (brightness > 0.9) {
                // Bright green
                ctx.fillStyle = '#00bfff';
            } else {
                // Dimmer green
                ctx.fillStyle = `rgba(0, 191, 255, ${0.3 + Math.random() * 0.5})`;
            }

            ctx.fillText(char, x, y);

            // Reset to green for next iteration
            ctx.fillStyle = '#00bfff';

            // Move drop down
            drops[i]++;

            // Reset drop to top with random delay
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
        }
    }

    // Handle window resize
    function handleResize() {
        initCanvas();
    }

    // Debounce resize events
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 100);
    });

    // Initialize and start animation
    initCanvas();

    // Animation loop
    function animate() {
        draw();
        requestAnimationFrame(animate);
    }

    // Start with slight delay for page load
    setTimeout(animate, 100);
})();
