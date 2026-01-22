/**
 * Phonics Passage Generator
 * Sends form data to API and displays generated reading passage
 * Level-based parameters from Sparks curriculum
 */

(function() {
    // ============================================
    // API ENDPOINT - Uses serverless proxy
    // ============================================
    const API_ENDPOINT = '/api/chat';
    // ============================================

    // Level Configuration based on Sparks curriculum
    const LEVEL_CONFIG = {
        1: {
            name: 'First Words',
            narrative: 'Single Sentence',
            narrativeInstructions: 'Write a single, descriptive statement about a noun. Do not attempt a plot or action sequence.',
            wordStructure: 'CVC only. Strictly 3-sound words. NO adjacent consonants.',
            wordCountRange: [3, 8],
            sentenceCount: 1,
            maxSentenceLength: 5,
            syntax: 'Atomic Sentences. Use strictly simple sentences (Subject-Verb or Subject-Verb-Adjective). NO compound sentences. NO commas.',
            saturation: 'Extreme (40%+). Force the sound.',
            saturationPercent: 40
        },
        2: {
            name: 'Connected Text',
            narrative: 'Connected Sentences',
            narrativeInstructions: 'Describe a static scene or snapshot. Focus on object locations using "is" and prepositions. No time should pass.',
            wordStructure: 'Prioritize final blends (CVCC) over initial blends (CCVC).',
            wordCountRange: [10, 25],
            sentenceCount: [2, 3],
            maxSentenceLength: 8,
            syntax: 'Locational Links. Extend sentences using prepositional phrases at the end to show location, like "in", "on", "at".',
            saturation: 'Maximized (30%+). Force the sound.',
            saturationPercent: 30
        },
        3: {
            name: 'Action Stories',
            narrative: 'Micro-Story (First to Then)',
            narrativeInstructions: 'Write a simple chronological sequence (Action A > Action B). Focus on physical movements.',
            wordStructure: 'CVCC and CCVC allowed.',
            wordCountRange: [20, 40],
            sentenceCount: [3, 5],
            maxSentenceLength: 8,
            syntax: 'Compound Predicates. Allow one subject to perform two actions joined by "and". Keep the subject the same.',
            saturation: 'High (25%+). Practice the sound.',
            saturationPercent: 25
        },
        4: {
            name: 'Simple Plots',
            narrative: 'Narrative (Problem to Solution)',
            narrativeInstructions: 'Create a short scene with a clear character goal or minor problem. Include at least one line of dialogue or interaction.',
            wordStructure: 'All word structures allowed.',
            wordCountRange: [50, 80],
            sentenceCount: [5, 10],
            maxSentenceLength: 10,
            syntax: 'Descriptive Expansion. Use adjectives and adverbs to lengthen sentences. You may join two simple ideas with "and".',
            saturation: 'High (25%). Natural flow priority.',
            saturationPercent: 25
        },
        5: {
            name: 'Rich Narratives',
            narrative: 'Rich Narrative (Setting/Emotion)',
            narrativeInstructions: 'Establish a setting and character feelings before the action starts. Use descriptive language. May include dialogue.',
            wordStructure: 'Prioritize words with 2+ syllables.',
            wordCountRange: [70, 100],
            sentenceCount: [8, 12],
            maxSentenceLength: 12,
            syntax: 'Varied Openers. Do not start every sentence with the subject. Use introductory phrases to set the scene.',
            saturation: 'High (20-25%). Natural flow priority.',
            saturationPercent: 20
        }
    };

    // DOM Elements
    const form = document.getElementById('passage-form');
    const phonemeInput = document.getElementById('phoneme-input');
    const generateButton = document.getElementById('generate-button');
    const outputSection = document.getElementById('output-section');

    // State
    let isGenerating = false;

    /**
     * Get selected level from radio buttons
     */
    function getSelectedLevel() {
        const selected = document.querySelector('input[name="level"]:checked');
        return selected ? parseInt(selected.value, 10) : 3;
    }

    /**
     * Build the prompt based on level configuration
     */
    function buildPrompt(phoneme, level) {
        const config = LEVEL_CONFIG[level];
        const wordCount = config.wordCountRange[1]; // Use max of range
        const sentenceCount = Array.isArray(config.sentenceCount)
            ? config.sentenceCount[1]
            : config.sentenceCount;

        return `You are a phonics reading passage generator for young children (ages 4-6). Generate a reading passage following these STRICT rules:

TARGET PHONEME: "${phoneme}"
LEVEL: ${level} (${config.name})

=== UNIVERSAL RULES (MUST FOLLOW) ===
1. All vocabulary must be familiar to a 4-year-old child in daily conversation.
2. Do NOT use archaic or literary words (no "lad", "fig", "bog" unless common context).
3. If a word's meaning is too advanced for a 4-year-old, do NOT use it.
4. All words must be real, dictionary-defined English words. NO nonsense/pseudo-words.
5. The text must make logical, physical sense. Verify scenarios are possible.
6. Insert a forward slash / at natural phrase boundaries for readability.

=== LEVEL-SPECIFIC PARAMETERS ===
NARRATIVE STRUCTURE: ${config.narrative}
${config.narrativeInstructions}

WORD STRUCTURE: ${config.wordStructure}

WORD COUNT: ${config.wordCountRange[0]}-${config.wordCountRange[1]} words total
SENTENCE COUNT: ${typeof config.sentenceCount === 'number' ? config.sentenceCount : config.sentenceCount[0] + '-' + config.sentenceCount[1]} sentences
MAX WORDS PER SENTENCE: ${config.maxSentenceLength}

SYNTAX RULES: ${config.syntax}

TARGET SOUND SATURATION: ${config.saturation}
Maximize words containing the "${phoneme}" sound. Choose words with the target sound over simpler synonyms.

=== OUTPUT FORMAT ===
Return ONLY the reading passage text with / marks for phrase breaks. Do not include any explanations, headers, or meta-commentary.

Example format: "The fat cat / sat on the mat. / It had a nap."`;
    }

    /**
     * Show loading state
     */
    function showLoadingState() {
        outputSection.innerHTML = `
            <div class="loading-card">
                <div class="loading-spinner" role="status" aria-label="Loading"></div>
                <p class="loading-text">Generating your passage...</p>
            </div>
        `;
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Show result card with generated passage
     */
    function showResultCard(phoneme, level, passage) {
        const config = LEVEL_CONFIG[level];
        const wordCount = passage.replace(/\//g, '').split(/\s+/).filter(w => w.length > 0).length;

        outputSection.innerHTML = `
            <article class="result-card">
                <header class="result-header">
                    <h2 class="result-title">Your Reading Passage</h2>
                    <div class="result-meta">
                        <span class="meta-tag phoneme">Phoneme: ${phoneme}</span>
                        <span class="meta-tag level">Level ${level}: ${config.name}</span>
                        <span class="meta-tag words">~${wordCount} words</span>
                    </div>
                </header>

                <div class="result-content">
                    <p class="passage-text">${formatPassage(passage)}</p>
                </div>

                <div class="result-actions">
                    <button type="button" class="action-button primary" id="copy-button" aria-label="Copy passage to clipboard">
                        <span>Copy Passage</span>
                        <span aria-hidden="true">📋</span>
                    </button>
                    <button type="button" class="action-button secondary" id="new-passage-button" aria-label="Generate new passage">
                        <span>Generate Another</span>
                        <span aria-hidden="true">🔄</span>
                    </button>
                </div>
            </article>
        `;

        // Add event listeners to new buttons
        document.getElementById('copy-button').addEventListener('click', () => copyToClipboard(passage));
        document.getElementById('new-passage-button').addEventListener('click', scrollToForm);

        outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Format passage for display (convert / to line breaks)
     */
    function formatPassage(passage) {
        return passage
            .replace(/\s*\/\s*/g, '<br>')
            .replace(/\n/g, '<br>');
    }

    /**
     * Show error state
     */
    function showErrorState(message) {
        outputSection.innerHTML = `
            <div class="error-card">
                <h2 class="error-title">
                    <span aria-hidden="true">⚠️</span>
                    <span>Oops! Something went wrong</span>
                </h2>
                <p class="error-message">${message}</p>
            </div>
        `;
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Copy passage to clipboard (without formatting marks)
     */
    async function copyToClipboard(text) {
        try {
            // Remove / marks for clean copy
            const cleanText = text.replace(/\s*\/\s*/g, ' ').replace(/\s+/g, ' ').trim();
            await navigator.clipboard.writeText(cleanText);

            // Visual feedback
            const copyButton = document.getElementById('copy-button');
            const originalHTML = copyButton.innerHTML;
            copyButton.classList.add('copied');
            copyButton.innerHTML = `
                <span>Copied!</span>
                <span aria-hidden="true">✓</span>
            `;

            // Announce to screen readers
            const announcement = document.createElement('div');
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.className = 'sr-only';
            announcement.textContent = 'Passage copied to clipboard';
            document.body.appendChild(announcement);

            setTimeout(() => {
                copyButton.classList.remove('copied');
                copyButton.innerHTML = originalHTML;
                document.body.removeChild(announcement);
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            showErrorState('Failed to copy to clipboard. Please try selecting and copying the text manually.');
        }
    }

    /**
     * Scroll back to form
     */
    function scrollToForm() {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        phonemeInput.focus();
    }

    /**
     * Generate passage by calling API
     */
    async function generatePassage(phoneme, level) {
        if (isGenerating) return;

        isGenerating = true;
        generateButton.disabled = true;
        showLoadingState();

        try {
            // Build the detailed prompt based on level
            const prompt = buildPrompt(phoneme, level);

            const url = `${API_ENDPOINT}?message=${encodeURIComponent(prompt)}`;

            const response = await fetch(url, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Extract the passage from various possible response formats
            const passage = data.response || data.output || data.message || data.text || JSON.stringify(data);

            // Display the result
            showResultCard(phoneme, level, passage);

        } catch (error) {
            console.error('Error generating passage:', error);
            showErrorState(
                'We couldn\'t generate your passage right now. Please check your connection and try again.'
            );
        } finally {
            isGenerating = false;
            generateButton.disabled = false;
        }
    }

    /**
     * Handle form submission
     */
    function handleSubmit(event) {
        event.preventDefault();

        // Get form values
        const phoneme = phonemeInput.value.trim();
        const level = getSelectedLevel();

        // Validate
        if (!phoneme) {
            phonemeInput.focus();
            return;
        }

        // Generate passage
        generatePassage(phoneme, level);
    }

    /**
     * Initialize event listeners
     */
    function init() {
        // Form submission
        form.addEventListener('submit', handleSubmit);

        // Auto-focus first input for better UX
        phonemeInput.focus();

        console.log('Phonics Passage Generator initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
