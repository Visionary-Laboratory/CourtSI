window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality (disabled)
/*
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});
*/

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

function initComparisonSliders() {
    document.querySelectorAll('[data-compare]').forEach(wrapper => {
        const slider = wrapper.querySelector('.comparison-slider');
        const overlay = wrapper.querySelector('.comparison-overlay');
        if (!slider || !overlay) return;

        const update = (value) => {
            const v = Math.max(0, Math.min(100, value));
            slider.value = v;
            overlay.style.width = `${v}%`;
        };

        const updateFromEvent = (e) => {
            const rect = wrapper.getBoundingClientRect();
            const percent = ((e.clientX - rect.left) / rect.width) * 100;
            update(percent);
        };

        slider.addEventListener('input', () => update(slider.value));

        let dragging = false;
        wrapper.addEventListener('pointerdown', (e) => {
            dragging = true;
            wrapper.setPointerCapture(e.pointerId);
            updateFromEvent(e);
        });

        wrapper.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            updateFromEvent(e);
        });

        wrapper.addEventListener('pointerup', () => {
            dragging = false;
        });

        wrapper.addEventListener('pointerleave', () => {
            dragging = false;
        });

        update(slider.value);
    });
}

function initBulmaWidgets() {
    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
    };

	// Initialize all div with carousel class
    if (window.bulmaCarousel) {
        bulmaCarousel.attach('.carousel', options);
    }

    if (window.bulmaSlider) {
        bulmaSlider.attach();
    }
    
    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();
}

document.addEventListener('DOMContentLoaded', initBulmaWidgets);

function initDataViewer() {
    if (window.__dataViewerInit) return;
    const viewer = document.getElementById('data-viewer');
    if (!viewer) return;

    const imgEl = document.getElementById('data-viewer-img');
    const categoryEl = document.getElementById('data-viewer-category');
    const categoryDotEl = document.getElementById('data-viewer-category-dot');
    const questionEl = document.getElementById('data-viewer-question');
    const answerEl = document.getElementById('data-viewer-answer');
    const indexEl = document.getElementById('data-viewer-index');
    const prevBtn = document.getElementById('data-viewer-prev');
    const nextBtn = document.getElementById('data-viewer-next');

    let items = [];
    let currentIndex = 0;

    const questionSplitToken = 'Players are identified by bounding boxes labeled with serial numbers.';
    const questionSplitRegex = /Players\s+are\s+identified\s+by\s+bounding\s+boxes\s+labeled\s+with\s+serial\s+numbers\./;
    const questionAltSplitToken = 'and the Z-axis is vertical.';
    const questionAltSplitRegex = /and\s+the\s+Z-axis\s+is\s+vertical\./i;
    const questionSurfaceSplitToken = '(0 is table surface).';
    const questionSurfaceSplitRegex = /\(0\s+is\s+table\s+surface\)\./i;

    function hexToRgb(hex) {
        const clean = hex.replace('#', '');
        const bigint = parseInt(clean, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }

    function mix(c1, c2, t) {
        return {
            r: Math.round(c1.r + (c2.r - c1.r) * t),
            g: Math.round(c1.g + (c2.g - c1.g) * t),
            b: Math.round(c1.b + (c2.b - c1.b) * t)
        };
    }

    function rgbToHex({ r, g, b }) {
        const toHex = (v) => v.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    }

    function generateShades(baseHex, count) {
        if (count === 1) return [baseHex.toUpperCase()];
        const base = hexToRgb(baseHex);
        const lighten = mix(base, { r: 255, g: 255, b: 255 }, 0.35);
        const darken = mix(base, { r: 0, g: 0, b: 0 }, 0.2);
        const shades = [];
        for (let i = 0; i < count; i++) {
            const t = i / (count - 1);
            const color = mix(darken, lighten, t);
            shades.push(rgbToHex(color));
        }
        return shades;
    }

    const distanceShades = generateShades('#9875A8', 4);
    const relationalShades = generateShades('#4889BE', 6);
    const countingBase = '#F9DA81';
    const countingLight = rgbToHex(mix(hexToRgb(countingBase), { r: 255, g: 255, b: 255 }, 0.35));

    const categoryColorMap = {
        distance_measurement_camera_object: distanceShades[0],
        distance_measurement_height: distanceShades[1],
        distance_measurement_object_line: distanceShades[2],
        distance_measurement_object_object: distanceShades[3],
        spatial_counting_ball: countingLight,
        spatial_counting_player: countingBase,
        localization: '#B1D5C4',
        localization_object: '#B1D5C4',
        relational_reasoning_ball_zone: relationalShades[0],
        relational_reasoning_ball_player: relationalShades[1],
        relational_reasoning_camera_player: relationalShades[2],
        relational_reasoning_player_zone: relationalShades[3],
        relational_reasoning_player_player: relationalShades[4],
        relational_reasoning_player_line: relationalShades[5]
    };

    const categoryLabelMap = {
        distance_measurement_camera_object: 'Distance Measurement: Camera-Object',
        distance_measurement_height: 'Distance Measurement: Height',
        distance_measurement_object_line: 'Distance Measurement: Object-Line',
        distance_measurement_object_object: 'Distance Measurement: Object-Object',
        spatial_counting_ball: 'Spatial Counting: Ball',
        spatial_counting_player: 'Spatial Counting: Player',
        localization: 'Localization',
        localization_object: 'Localization: Object',
        relational_reasoning_ball_zone: 'Relational Reasoning: Ball-Zone',
        relational_reasoning_ball_player: 'Relational Reasoning: Ball-Player',
        relational_reasoning_camera_player: 'Relational Reasoning: Camera-Player',
        relational_reasoning_player_zone: 'Relational Reasoning: Player-Zone',
        relational_reasoning_player_player: 'Relational Reasoning: Player-Player',
        relational_reasoning_player_line: 'Relational Reasoning: Player-Line'
    };

    function normalizeCategoryKey(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '_');
    }

    function getCategoryColor(value) {
        const key = normalizeCategoryKey(value);
        return categoryColorMap[key] || '#CBD5E1';
    }

    function getCategoryLabel(value) {
        const key = normalizeCategoryKey(value);
        return categoryLabelMap[key] || value || '-';
    }

    function formatCategoryLabel(value) {
        const label = getCategoryLabel(value);
        const parts = label.split(':');
        if (parts.length > 1) {
            const main = parts[0].trim();
            const sub = parts.slice(1).join(':').trim();
            if (sub) {
                return `<strong>${escapeHtml(main)}</strong> <em>${escapeHtml(sub)}</em>`;
            }
            return `<strong>${escapeHtml(main)}</strong>`;
        }
        return `<strong>${escapeHtml(label)}</strong>`;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function render() {
        if (!items.length) {
            if (imgEl) imgEl.removeAttribute('src');
            if (categoryEl) categoryEl.textContent = '-';
            if (questionEl) questionEl.textContent = 'No data available.';
            if (answerEl) answerEl.textContent = '-';
            if (indexEl) indexEl.textContent = '0 / 0';
            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
            return;
        }

        const item = items[currentIndex];
        if (imgEl) imgEl.src = item.image_path || '';
        if (categoryEl) {
            const categoryTextEl = categoryEl.querySelector('.data-viewer-category-text');
            const labelHtml = formatCategoryLabel(item.category);
            if (categoryTextEl) {
                categoryTextEl.innerHTML = labelHtml;
            } else {
                categoryEl.innerHTML = labelHtml;
            }
        }
        if (categoryDotEl) {
            const color = getCategoryColor(item.category);
            categoryDotEl.style.backgroundColor = color;
        }
        if (questionEl) {
            const questionText = item.question || '-';
            const match = questionText.match(questionSplitRegex);
            const altMatch = questionText.match(questionAltSplitRegex);
            const surfaceMatch = questionText.match(questionSurfaceSplitRegex);

            const splitSuffixByKeyword = (text) => {
                const match = text.match(/\bAnswer\b|Output only/i);
                if (!match || typeof match.index !== 'number') {
                    return [text];
                }
                const idx = match.index;
                const first = text.slice(0, idx).trim();
                const second = text.slice(idx).trim();
                return second ? [first, second] : [text];
            };

            const applySplit = (splitIndex, tokenLength) => {
                const prefix = questionText.slice(0, splitIndex + tokenLength).trim();
                const suffix = questionText.slice(splitIndex + tokenLength).trim();
                if (!suffix) {
                    questionEl.textContent = questionText;
                    return;
                }

                const suffixParts = splitSuffixByKeyword(suffix);
                const suffixHtml = suffixParts
                    .map(part => part ? `
                        <div class="data-viewer-question-part data-viewer-question-suffix">${escapeHtml(part)}</div>
                    ` : '')
                    .filter(Boolean)
                    .join('\n                        <div class="data-viewer-question-divider"></div>\n');

                questionEl.innerHTML = `
                    <div class="data-viewer-question-part data-viewer-question-prefix">${escapeHtml(prefix)}</div>
                    <div class="data-viewer-question-divider"></div>
                    ${suffixHtml}
                `;
            };

            if (surfaceMatch && typeof surfaceMatch.index === 'number') {
                applySplit(surfaceMatch.index, surfaceMatch[0].length);
            } else if (questionText.includes(questionSurfaceSplitToken)) {
                applySplit(questionText.indexOf(questionSurfaceSplitToken), questionSurfaceSplitToken.length);
            } else if (altMatch && typeof altMatch.index === 'number') {
                applySplit(altMatch.index, altMatch[0].length);
            } else if (questionText.includes(questionAltSplitToken)) {
                applySplit(questionText.indexOf(questionAltSplitToken), questionAltSplitToken.length);
            } else if (match && typeof match.index === 'number') {
                applySplit(match.index, match[0].length);
            } else if (questionText.includes(questionSplitToken)) {
                applySplit(questionText.indexOf(questionSplitToken), questionSplitToken.length);
            } else {
                questionEl.textContent = questionText;
            }
        }
        if (answerEl) answerEl.textContent = item.answer || '-';
        if (indexEl) indexEl.textContent = `${currentIndex + 1} / ${items.length}`;
        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex === items.length - 1;
    }

    function attachEvents() {
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex -= 1;
                    render();
                }
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (currentIndex < items.length - 1) {
                    currentIndex += 1;
                    render();
                }
            });
        }
    }

    function loadData(url) {
        return fetch(url, { cache: 'no-store' })
            .then(r => {
                if (!r.ok) throw new Error(`Failed to load ${url}`);
                return r.json();
            });
    }

    attachEvents();

    const dataUrl = new URL('static/data_viewer.json', window.location.href).toString();
    const demoUrl = new URL('static/data_viewer_demo.json', window.location.href).toString();

    loadData(dataUrl)
        .catch(() => loadData(demoUrl))
        .then(data => {
            if (Array.isArray(data)) {
                items = data;
            }
            render();
        })
        .catch(() => {
            items = [];
            render();
        });

    window.__dataViewerInit = true;
}

document.addEventListener('DOMContentLoaded', initDataViewer);
window.addEventListener('load', initDataViewer);

function initDataCharts() {
    if (window.__dataChartsInit) return;
    const chartEl1 = document.getElementById('data-chart-courtsi');
    const chartEl2 = document.getElementById('data-chart-bench');
    if (!chartEl1 || !chartEl2) return;

    if (typeof echarts === 'undefined') {
        window.setTimeout(initDataCharts, 500);
        return;
    }

    const labels = [
        'Distance Measurement: Camera-Object',
        'Distance Measuremen: Height',
        'Distance Measurement: Object-Line',
        'Distance Measurement: Object-Object',
        'Spatial Counting: Ball',
        'Spatial Counting: Player',
        'Localization',
        'Relational Reasoning: Ball-Zone',
        'Relational Reasoning: Ball-Player',
        'Relational Reasoning: Camera-Player',
        'Relational Reasoning: Player-Zone',
        'Relational Reasoning: Player-Player',
        'Relational Reasoning: Player-Line'
    ];

    const dataCourtSI = [75783, 51154, 102054, 178878, 23015, 22897, 101698, 61997, 72232, 58280, 28769, 104961, 127223];
    const dataBench = [277, 229, 317, 663, 28, 34, 368, 255, 297, 248, 82, 393, 495];

    function hexToRgb(hex) {
        const clean = hex.replace('#', '');
        const bigint = parseInt(clean, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }

    function rgbToHex({ r, g, b }) {
        const toHex = (v) => v.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    }

    function mix(c1, c2, t) {
        return {
            r: Math.round(c1.r + (c2.r - c1.r) * t),
            g: Math.round(c1.g + (c2.g - c1.g) * t),
            b: Math.round(c1.b + (c2.b - c1.b) * t)
        };
    }

    function generateShades(baseHex, count) {
        if (count === 1) return [baseHex.toUpperCase()];
        const base = hexToRgb(baseHex);
        const lighten = mix(base, { r: 255, g: 255, b: 255 }, 0.35);
        const darken = mix(base, { r: 0, g: 0, b: 0 }, 0.2);
        const shades = [];
        for (let i = 0; i < count; i++) {
            const t = i / (count - 1);
            const color = mix(darken, lighten, t);
            shades.push(rgbToHex(color));
        }
        return shades;
    }

    const countingBase = '#F9DA81';
    const countingLight = rgbToHex(mix(hexToRgb(countingBase), { r: 255, g: 255, b: 255 }, 0.35));

    const colors = [
        ...generateShades('#9875A8', 4),
        countingLight,
        countingBase,
        ...generateShades('#B1D5C4', 1),
        ...generateShades('#4889BE', 6)
    ];

    const groupDefs = [
        { name: 'Distance Measurement', start: 0, end: 3, color: '#9875A8' },
            { name: 'Spatial Counting', start: 4, end: 5, color: '#F9DA81' },
            { name: 'Localization', start: 6, end: 6, color: '#B1D5C4' },
        { name: 'Relational Reasoning', start: 7, end: 12, color: '#4889BE' }
    ];

    function makeSeries(values) {
        return labels.map((name, i) => ({ name, value: values[i] }));
    }

    function makeInnerSeries(values) {
        return groupDefs.map(g => {
            const total = values.slice(g.start, g.end + 1).reduce((a, b) => a + b, 0);
            return { name: g.name, value: total, itemStyle: { color: g.color } };
        });
    }

    function makeOption(title, totalText, values) {
        return {
            color: colors,
            tooltip: {
                trigger: 'item',
                formatter: (p) => {
                    const v = p.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    const t = totalText.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    return `${p.name}<br/>Count: <b>${v}</b><br/>Share: <b>${p.percent}%</b><br/>Total: ${t}`;
                }
            },
            legend: { show: false },
            series: [
                {
                    name: `${title} (Group)`,
                    type: 'pie',
                    radius: ['18%', '42%'],
                    center: ['50%', '48%'],
                    startAngle: 90,
                    avoidLabelOverlap: true,
                    itemStyle: { borderColor: '#fff', borderWidth: 2 },
                    label: { show: false },
                    labelLine: { show: false },
                    data: makeInnerSeries(values)
                },
                {
                    name: `${title} (Detail)`,
                    type: 'pie',
                    radius: ['44%', '82%'],
                    center: ['50%', '48%'],
                    startAngle: 90,
                    avoidLabelOverlap: true,
                    itemStyle: { borderColor: '#fff', borderWidth: 2 },
                    label: { show: false },
                    labelLine: { show: false },
                    data: makeSeries(values)
                }
            ]
        };
    }

    const totalCourtSI = dataCourtSI.reduce((a, b) => a + b, 0);
    const totalBench = dataBench.reduce((a, b) => a + b, 0);

    const chart1 = echarts.init(chartEl1);
    const chart2 = echarts.init(chartEl2);

    chart1.setOption(makeOption('CourtSI', totalCourtSI, dataCourtSI));
    chart2.setOption(makeOption('CourtSI-Bench', totalBench, dataBench));

    window.addEventListener('resize', () => {
        chart1.resize();
        chart2.resize();
    });

    window.__dataChartsInit = true;
}

document.addEventListener('DOMContentLoaded', initDataCharts);
window.addEventListener('load', initDataCharts);
