document.addEventListener('DOMContentLoaded', () => {
    const periodsContainer = document.getElementById('periods-container');
    const addPeriodBtn = document.getElementById('add-period-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const periodTemplate = document.getElementById('period-template');
    const ctx = document.getElementById('financialChart').getContext('2d');

    let chart;
    let periodCount = 0;

    // Custom Plugin for Period Boundaries
    const periodBoundaryPlugin = {
        id: 'periodBoundary',
        afterDraw(chart, args, options) {
            const { ctx, chartArea: { top, bottom }, scales: { x } } = chart;
            const boundaries = options.boundaries || [];

            if (!boundaries.length) return;

            ctx.save();

            boundaries.forEach((boundary) => {
                // Find the x-coordinate for the end year
                const xPos = x.getPixelForValue(boundary.endYear);

                if (xPos !== undefined && !isNaN(xPos)) {
                    // Draw vertical line
                    ctx.beginPath();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'rgba(107, 114, 128, 0.5)'; // Gray color
                    ctx.setLineDash([5, 5]);
                    ctx.moveTo(xPos, top);
                    ctx.lineTo(xPos, bottom);
                    ctx.stroke();

                    // Draw label
                    ctx.fillStyle = '#1f2937'; // Darker color
                    ctx.font = 'bold 12px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillText(boundary.label, xPos, top + 10);
                }
            });

            ctx.restore();
        }
    };

    // Initialize Chart
    function initChart() {
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: '総資産',
                        data: [],
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: '運用資産',
                        data: [],
                        borderColor: '#10b981', // Green
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: '現金',
                        data: [],
                        borderColor: '#f59e0b', // Amber
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    periodBoundary: {
                        boundaries: []
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    // Divide by 1000 and add 'K'
                                    const value = context.parsed.y / 1000;
                                    label += new Intl.NumberFormat('ja-JP', { style: 'decimal', maximumFractionDigits: 1 }).format(value) + 'K';
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                // Divide by 1000 and add 'K'
                                return (value / 1000).toLocaleString() + 'K';
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '西暦'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            },
            plugins: [periodBoundaryPlugin]
        });
    }

    // Update URL from Inputs
    function updateUrlFromInputs() {
        const initialCapital = document.getElementById('initial-capital').value;
        const initialCash = document.getElementById('initial-cash').value;
        const yieldRate = document.getElementById('global-yield').value;

        const params = new URLSearchParams();
        params.set('cap', initialCapital);
        params.set('cash', initialCash);
        params.set('yield', yieldRate);

        const periods = periodsContainer.querySelectorAll('.period-item');
        periods.forEach(period => {
            const income = period.querySelector('.p-income').value;
            const expenses = period.querySelector('.p-expenses').value;
            const contribution = period.querySelector('.p-contribution').value;
            const duration = period.querySelector('.p-duration').value;
            // Format: income:expenses:contribution:duration
            params.append('p', `${income}:${expenses}:${contribution}:${duration}`);
        });

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
    }

    // Load Inputs from URL
    function loadInputsFromUrl() {
        const params = new URLSearchParams(window.location.search);

        if (params.has('cap')) document.getElementById('initial-capital').value = params.get('cap');
        if (params.has('cash')) document.getElementById('initial-cash').value = params.get('cash');
        if (params.has('yield')) document.getElementById('global-yield').value = params.get('yield');

        const periodParams = params.getAll('p');
        if (periodParams.length > 0) {
            // Clear existing periods
            periodsContainer.innerHTML = '';
            periodCount = 0;

            periodParams.forEach(p => {
                const [income, expenses, contribution, duration] = p.split(':');
                addPeriod(income, expenses, contribution, duration);
            });
        } else {
            // Default if no params
            if (periodsContainer.children.length === 0) {
                addPeriod();
            }
        }
    }

    // Add Period
    function addPeriod(income = 0, expenses = 0, contribution = 0, duration = 5) {
        periodCount++;
        const clone = periodTemplate.content.cloneNode(true);
        const periodItem = clone.querySelector('.period-item');

        periodItem.querySelector('.period-title').textContent = `期間 #${periodCount}`;

        periodItem.querySelector('.p-income').value = income;
        periodItem.querySelector('.p-expenses').value = expenses;
        periodItem.querySelector('.p-contribution').value = contribution;
        periodItem.querySelector('.p-duration').value = duration;

        // Remove button logic
        const removeBtn = periodItem.querySelector('.remove-period-btn');
        removeBtn.addEventListener('click', () => {
            periodItem.remove();
            updatePeriodNumbers();
        });

        periodsContainer.appendChild(periodItem);
    }

    // Update Period Numbers after removal
    function updatePeriodNumbers() {
        const periods = periodsContainer.querySelectorAll('.period-item');
        periodCount = 0;
        periods.forEach(period => {
            periodCount++;
            period.querySelector('.period-title').textContent = `期間 #${periodCount}`;
        });
    }

    // Calculate and Update Chart
    function calculate() {
        const initialCapital = (parseFloat(document.getElementById('initial-capital').value) || 0) * 10000;
        const initialCash = (parseFloat(document.getElementById('initial-cash').value) || 0) * 10000;
        const yieldRate = (parseFloat(document.getElementById('global-yield').value) || 0) / 100;

        let currentCapital = initialCapital;
        let currentCash = initialCash;
        // Use current calendar year as start
        let currentYear = new Date().getFullYear();

        const labels = [String(currentYear)];
        const dataTotal = [currentCapital + currentCash];
        const dataCapital = [currentCapital];
        const dataCash = [currentCash];

        const periods = periodsContainer.querySelectorAll('.period-item');
        const periodBoundaries = [];

        periods.forEach((period, index) => {
            const expenses = (parseFloat(period.querySelector('.p-expenses').value) || 0) * 10000;
            const income = (parseFloat(period.querySelector('.p-income').value) || 0) * 10000;
            const contribution = (parseFloat(period.querySelector('.p-contribution').value) || 0) * 10000;
            const duration = parseInt(period.querySelector('.p-duration').value) || 0;

            const startYear = currentYear; // Start of this period

            for (let i = 1; i <= duration; i++) {
                currentYear++;

                // Capital growth (Investment grows by yield)
                currentCapital = currentCapital * (1 + yieldRate);

                // Cash flow (Income - Expenses - Contribution)
                currentCash = currentCash + income - expenses - contribution;

                // Add Contribution to Capital
                currentCapital += contribution;

                // Insufficient Cash Logic
                if (currentCash < 0) {
                    currentCapital += currentCash;
                    currentCash = 0;
                }

                labels.push(String(currentYear));
                dataTotal.push(currentCapital + currentCash);
                dataCapital.push(currentCapital);
                dataCash.push(currentCash);
            }

            // Record boundary
            periodBoundaries.push({
                startYear: startYear,
                endYear: String(currentYear),
                label: `期間 ${index + 1}`
            });
        });

        updateChart(labels, dataTotal, dataCapital, dataCash, periodBoundaries);
        updateUrlFromInputs();
    }

    function updateChart(labels, total, capital, cash, boundaries) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = total;
        chart.data.datasets[1].data = capital;
        chart.data.datasets[2].data = cash;

        // Update plugin options
        chart.options.plugins.periodBoundary.boundaries = boundaries;

        chart.update();
    }

    // Event Listeners
    addPeriodBtn.addEventListener('click', () => addPeriod());
    calculateBtn.addEventListener('click', calculate);

    // Resize Logic
    const chartCard = document.getElementById('chart-card');
    const resizeHandle = document.getElementById('resize-handle');
    let isResizing = false;
    let startY;
    let startHeight;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startY = e.clientY;
        startHeight = parseInt(window.getComputedStyle(chartCard).height, 10);
        document.body.style.cursor = 'ns-resize';
        e.preventDefault(); // Prevent text selection
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const dy = e.clientY - startY;
        const newHeight = startHeight + dy;
        chartCard.style.height = `${newHeight}px`;
        heightSlider.value = newHeight; // Sync slider
        // Chart.js handles resize automatically due to responsive: true
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = 'default';
        }
    });

    // Slider Logic
    const heightSlider = document.getElementById('height-slider');

    function updateSliderRange() {
        const clientHeight = document.documentElement.clientHeight;
        heightSlider.min = clientHeight / 3;
        heightSlider.max = clientHeight;
    }

    function updateSliderValue() {
        heightSlider.value = parseInt(window.getComputedStyle(chartCard).height, 10);
    }

    // Initial setup
    updateSliderRange();

    // Set initial height to 1/2 of client height
    const initialHeight = document.documentElement.clientHeight / 2;
    chartCard.style.height = `${initialHeight}px`;
    heightSlider.value = initialHeight;

    heightSlider.addEventListener('input', () => {
        chartCard.style.height = `${heightSlider.value}px`;
    });

    window.addEventListener('resize', () => {
        updateSliderRange();
    });

    // Initialize
    initChart();
    loadInputsFromUrl();
    calculate();
});
