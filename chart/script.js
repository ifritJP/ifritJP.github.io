document.addEventListener('DOMContentLoaded', () => {
    const periodsContainer = document.getElementById('periods-container');
    const addPeriodBtn = document.getElementById('add-period-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const yieldButton = document.getElementById('enable-yield-sim');
    const periodTemplate = document.getElementById('period-template');
    const ctx = document.getElementById('financialChart').getContext('2d');

    // Pension Inputs
    const currentAgeInput = document.getElementById('current-age');
    const pensionStartAgeInput = document.getElementById('pension-start-age');
    const pensionBaseInput = document.getElementById('pension-base');
    const pensionAdjustedInput = document.getElementById('pension-adjusted');
    const macroSlideRateInput = document.getElementById('macro-slide-rate');

    // Extra Income Inputs
    const extraIncomeContainer = document.getElementById('extra-income-container');
    const addExtraIncomeBtn = document.getElementById('add-extra-income-btn');
    const extraIncomeTemplate = document.getElementById('extra-income-template');

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
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: '運用資産',
                        data: [],
                        borderColor: '#10b981', // Green
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        fill: false,
                        yAxisID: 'y'
                    },
                    {
                        label: '現金',
                        data: [],
                        borderColor: '#f59e0b', // Amber
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        fill: false,
                        yAxisID: 'y'
                    },
                    {
                        label: '年間利回り',
                        data: [],
                        type: 'bar',
                        backgroundColor: 'rgba(156, 163, 175, 0.3)',
                        borderColor: 'rgba(156, 163, 175, 1)',
                        borderWidth: 1,
                        yAxisID: 'y1',
                        order: 2
                    },
                    {
                        label: '平均利回り',
                        data: [],
                        type: 'line',
                        borderColor: '#8b5cf6', // Purple
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.4,
                        fill: false,
                        yAxisID: 'y1',
                        order: 1
                    },
                    {
                        label: '年間収入',
                        data: [],
                        type: 'line',
                        borderColor: '#ec4899', // Pink
                        borderWidth: 2,
                        borderDash: [2, 2],
                        pointRadius: 0,
                        tension: 0.4,
                        fill: false,
                        yAxisID: 'y',
                        order: 0
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
                                if (context.dataset.yAxisID === 'y1') {
                                    if (context.parsed.y !== null) {
                                        label += context.parsed.y.toFixed(2) + '%';
                                    }
                                } else if (context.parsed.y !== null) {
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
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                // Divide by 1000 and add 'K'
                                return (value / 1000).toLocaleString() + 'K';
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: '利回り (%)'
                        },
                        grid: {
                            drawOnChartArea: false
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

    // Generate Random Annual Yields
    function generateAnnualYields(targetYield, years, rangePercent) {
        if (years <= 0) return [];

        let yields = [];
        let currentSum = 0;

        for (let i = 0; i < years; i++) {
            // Random between -range and +range offset (absolute %)
            // rangePercent is e.g. 40 for ±40%
            const offset = (Math.random() - 0.5) * (rangePercent * 2);
            let val = targetYield + offset;
            yields.push(val);
            currentSum += val;
        }

        // Adjust to match average
        const currentAvg = currentSum / years;
        const diff = targetYield - currentAvg;

        return yields.map(y => y + diff);
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
        params.set('dividend', document.getElementById('dividend-rate').value);
        params.set('inflation', document.getElementById('inflation-rate').value);
        params.set('tax', document.getElementById('tax-rate').value);
        params.set('age', currentAgeInput.value);
        params.set('pstart', pensionStartAgeInput.value);
        params.set('pbase', pensionBaseInput.value);
        params.set('macroSlide', macroSlideRateInput.value);
        params.set('baseup', document.getElementById('income-base-up-rate').value);

        const periods = periodsContainer.querySelectorAll('.period-item');
        periods.forEach(period => {
            const income = period.querySelector('.p-income').value;
            const expenses = period.querySelector('.p-expenses').value;
            const investment = period.querySelector('.p-investment').value;
            const duration = period.querySelector('.p-duration').value;
            const linked = period.querySelector('.p-expenses-link').checked ? 1 : 0;
            const incomeLinked = period.querySelector('.p-income-link').checked ? 1 : 0;
            // Format: income:expenses:investment:duration:linked:incomeLinked
            params.append('p', `${income}:${expenses}:${investment}:${duration}:${linked}:${incomeLinked}`);
        });

        const extras = extraIncomeContainer.querySelectorAll('.extra-income-item');
        extras.forEach(extra => {
            const age = extra.querySelector('.ex-age').value;
            const amount = extra.querySelector('.ex-amount').value;
            params.append('ex', `${age}:${amount}`);
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
        if (params.has('dividend')) document.getElementById('dividend-rate').value = params.get('dividend');
        if (params.has('inflation')) document.getElementById('inflation-rate').value = params.get('inflation');
        if (params.has('tax')) document.getElementById('tax-rate').value = params.get('tax');
        if (params.has('age')) currentAgeInput.value = params.get('age');
        if (params.has('pstart')) pensionStartAgeInput.value = params.get('pstart');
        if (params.has('pbase')) pensionBaseInput.value = params.get('pbase');
        if (params.has('macroSlide')) macroSlideRateInput.value = params.get('macroSlide');
        if (params.has('baseup')) document.getElementById('income-base-up-rate').value = params.get('baseup');

        calculatePension(); // Update adjusted value

        const periodParams = params.getAll('p');
        if (periodParams.length > 0) {
            // Clear existing periods
            periodsContainer.innerHTML = '';
            periodCount = 0;

            periodParams.forEach(p => {
                const parts = p.split(':');
                const income = parts[0];
                const expenses = parts[1];
                const investment = parts[2];
                const duration = parts[3];
                const linked = parts.length > 4 ? (parts[4] === '1') : false;
                const incomeLinked = parts.length > 5 ? (parts[5] === '1') : false;
                addPeriod(income, expenses, investment, duration, linked, incomeLinked);
            });
        } else {
            if (periodsContainer.children.length === 0) {
                addPeriod();
            }
        }

        const extraParams = params.getAll('ex');
        if (extraParams.length > 0) {
            extraIncomeContainer.innerHTML = '';
            extraParams.forEach(ex => {
                const parts = ex.split(':');
                if (parts.length === 2) {
                    addExtraIncome(parts[0], parts[1]);
                }
            });
        }
    }

    // Add Extra Income Item
    function addExtraIncome(age = 40, amount = 100) {
        const clone = extraIncomeTemplate.content.cloneNode(true);
        const item = clone.querySelector('.extra-income-item');

        item.querySelector('.ex-age').value = age;
        item.querySelector('.ex-amount').value = amount;

        item.querySelector('.remove-extra-income-btn').addEventListener('click', () => {
            item.remove();
            updateUrlFromInputs();
        });

        // Add change listeners
        item.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                updateUrlFromInputs();
            });
        });

        extraIncomeContainer.appendChild(item);
    }

    // Add Period
    function addPeriod(income = 0, expenses = 0, investment = 0, duration = 5, linked = true, incomeLinked = true) {
        periodCount++;
        const clone = periodTemplate.content.cloneNode(true);
        const periodItem = clone.querySelector('.period-item');

        periodItem.querySelector('.p-income').value = income;
        periodItem.querySelector('.p-expenses').value = expenses;
        periodItem.querySelector('.p-investment').value = investment;
        periodItem.querySelector('.p-duration').value = duration;

        // Toggle Logic
        const toggleIcon = periodItem.querySelector('.period-toggle-icon');
        const periodInputs = periodItem.querySelector('.period-inputs');

        const toggleAction = (e) => {
            // Don't toggle if clicking the remove button or inputs inside header (if any)
            if (e.target.closest('.remove-period-btn') || e.target.closest('input')) return;

            toggleIcon.classList.toggle('collapsed');
            periodInputs.classList.toggle('collapsed');
        };

        toggleIcon.addEventListener('click', toggleAction);
        // Optional: Make the title clickable too
        periodItem.querySelector('.period-title').addEventListener('click', toggleAction);

        const linkCheckbox = periodItem.querySelector('.p-expenses-link');
        if (linkCheckbox) {
            linkCheckbox.checked = linked;
            // Unique ID for label
            const id = `link-expenses-${periodCount}`;
            linkCheckbox.id = id;
            periodItem.querySelector('label[for="link-expenses"]').setAttribute('for', id);

            linkCheckbox.addEventListener('change', () => updatePeriodChain());
        }

        const incomeLinkCheckbox = periodItem.querySelector('.p-income-link');
        if (incomeLinkCheckbox) {
            incomeLinkCheckbox.checked = incomeLinked;
            const id = `link-income-${periodCount}`;
            incomeLinkCheckbox.id = id;
            periodItem.querySelector('label[for="link-income"]').setAttribute('for', id);

            incomeLinkCheckbox.addEventListener('change', () => updatePeriodChain());
        }

        // Real-time update listeners
        const expensesInput = periodItem.querySelector('.p-expenses');
        const incomeInput = periodItem.querySelector('.p-income');
        const durationInput = periodItem.querySelector('.p-duration');

        expensesInput.addEventListener('input', () => updatePeriodChain());
        incomeInput.addEventListener('input', () => updatePeriodChain());
        durationInput.addEventListener('input', () => {
            updatePeriodChain();
            updatePeriodNumbers();
        });

        // Remove button logic
        const removeBtn = periodItem.querySelector('.remove-period-btn');
        removeBtn.addEventListener('click', () => {
            periodItem.remove();
            updatePeriodNumbers();
            updatePeriodChain(); // Re-calculate chain after removal
        });

        // Move buttons logic
        const moveUpBtn = periodItem.querySelector('.move-up');
        const moveDownBtn = periodItem.querySelector('.move-down');

        moveUpBtn.addEventListener('click', () => movePeriodUp(periodItem));
        moveDownBtn.addEventListener('click', () => movePeriodDown(periodItem));

        periodsContainer.appendChild(periodItem);
        updatePeriodNumbers();
        updatePeriodChain(); // Update chain when added
    }

    // Move Period Up
    function movePeriodUp(periodItem) {
        const previousSibling = periodItem.previousElementSibling;
        if (previousSibling) {
            periodsContainer.insertBefore(periodItem, previousSibling);
            updatePeriodNumbers();
            updatePeriodChain();
        }
    }

    // Move Period Down
    function movePeriodDown(periodItem) {
        const nextSibling = periodItem.nextElementSibling;
        if (nextSibling) {
            periodsContainer.insertBefore(nextSibling, periodItem);
            updatePeriodNumbers();
            updatePeriodChain();
        }
    }

    // Update Period Numbers after removal
    // Update Period Titles (Age Range)
    function updatePeriodNumbers() {
        const periods = periodsContainer.querySelectorAll('.period-item');
        let currentAge = parseInt(currentAgeInput.value) || 0;

        periods.forEach(period => {
            const duration = parseInt(period.querySelector('.p-duration').value) || 0;
            const startAge = currentAge;
            const endAge = currentAge + duration;

            period.querySelector('.period-title').textContent = `期間 ${startAge} - ${endAge}歳`;

            currentAge = endAge;
        });
    }

    // Calculate Pension Adjusted Amount
    function calculatePension() {
        const startAge = parseInt(pensionStartAgeInput.value) || 65;
        const baseAmount = parseFloat(pensionBaseInput.value) || 0;

        const diff = startAge - 65;
        let rate = 1.0;

        if (diff < 0) {
            // Early start: -4.8% per year
            rate += diff * 0.048;
        } else if (diff > 0) {
            // Late start: +8.4% per year
            rate += diff * 0.084;
        }

        // Ensure rate doesn't go below 0 (unlikely but safe)
        rate = Math.max(0, rate);

        const adjusted = baseAmount * rate;
        pensionAdjustedInput.value = adjusted.toFixed(1);
        return adjusted;
    }

    // Calculate and Update Chart
    function calculate() {
        calculatePension(); // Ensure up to date
        const initialCapital = (parseFloat(document.getElementById('initial-capital').value) || 0) * 10000;
        const initialCash = (parseFloat(document.getElementById('initial-cash').value) || 0) * 10000;
        const targetYieldRate = (parseFloat(document.getElementById('global-yield').value) || 0);
        const dividendRate = (parseFloat(document.getElementById('dividend-rate').value) || 0);
        const inflationRate = (parseFloat(document.getElementById('inflation-rate').value) || 0);

        let currentCapital = initialCapital;
        let currentCash = initialCash;
        // Use current calendar year as start
        let currentYear = new Date().getFullYear();
        let currentAge = parseInt(currentAgeInput.value) || 30;
        const pensionStartAge = parseInt(pensionStartAgeInput.value) || 65;
        const basePensionAmount = parseFloat(pensionAdjustedInput.value) || 0;
        const macroSlideRate = (parseFloat(macroSlideRateInput.value) || 0) / 100;
        let currentPensionAmount = basePensionAmount;

        const labels = [String(currentYear)];
        const dataTotal = [currentCapital + currentCash];
        const dataCapital = [currentCapital];
        const dataCash = [currentCash];
        const dataIncome = [null]; // No income for the start year
        const dataYields = [null]; // No yield for the start year
        const dataAverageYields = [null]; // No average yield for the start year

        const periods = periodsContainer.querySelectorAll('.period-item');
        const periodBoundaries = [];

        // Calculate total duration first
        let totalDuration = 0;
        periods.forEach(period => {
            totalDuration += parseInt(period.querySelector('.p-duration').value) || 0;
        });

        // Extra Income Items
        const extraIncomeItems = Array.from(extraIncomeContainer.querySelectorAll('.extra-income-item')).map(item => ({
            age: parseInt(item.querySelector('.ex-age').value) || 0,
            amount: (parseFloat(item.querySelector('.ex-amount').value) || 0) * 10000
        }));

        // Generate annual yields
        const enableYieldSim = yieldButton.checked;
        const yieldRangeSlider = document.getElementById('yield-range-slider');
        const rangePercent = parseInt(yieldRangeSlider.value, 10);
        let annualYields = [];

        if (enableYieldSim) {
            annualYields = generateAnnualYields(targetYieldRate, totalDuration, rangePercent);
        } else {
            // Fill with constant target yield
            annualYields = new Array(totalDuration).fill(targetYieldRate);
        }

        let yieldIndex = 0;
        let cumulativeGrowth = 1.0;
        let yearsPassed = 0;

        periods.forEach((period, index) => {
            let expenses = (parseFloat(period.querySelector('.p-expenses').value) || 0) * 10000;
            let income = (parseFloat(period.querySelector('.p-income').value) || 0) * 10000;
            const plannedInvestment = (parseFloat(period.querySelector('.p-investment').value) || 0) * 10000;
            const duration = parseInt(period.querySelector('.p-duration').value) || 0;
            const taxRate = (parseFloat(document.getElementById('tax-rate').value) || 0) / 100;
            const baseUpRate = (parseFloat(document.getElementById('income-base-up-rate').value) || 0);

            let incomeForFinal = income;

            const startYear = currentYear; // Start of this period

            for (let i = 1; i <= duration; i++) {
                currentYear++;
                currentAge++;
                yearsPassed++;

                // Apply inflation to expenses (starting from 2nd year of the period)
                if (i > 1) {
                    expenses = expenses * (1 + inflationRate / 100);
                    income = income * (1 + baseUpRate / 100);
                    incomeForFinal = income;
                }

                // Get yield for this year
                const currentAnnualYield = annualYields[yieldIndex];
                yieldIndex++;

                // Calculate cumulative average yield (CAGR)
                cumulativeGrowth *= (1 + currentAnnualYield / 100);
                const currentAverageYield = (Math.pow(cumulativeGrowth, 1 / yearsPassed) - 1) * 100;

                if (enableYieldSim) {
                    dataYields.push(currentAnnualYield);
                    dataAverageYields.push(currentAverageYield);
                } else {
                    dataYields.push(null); // Hide bars if disabled
                    dataAverageYields.push(currentAverageYield);
                }

                // Capital growth (Investment grows by yield)
                currentCapital = currentCapital * (1 + currentAnnualYield / 100);

                // Cash flow before investment
                // Income comes in, expenses go out
                let annualIncome = income;

                // Add Pension if eligible
                if (currentAge >= pensionStartAge) {
                    annualIncome += currentPensionAmount * 10000; // Convert to yen units (assuming base is in Man-yen)
                    // Apply macro-economic slide adjustment for next year
                    // Increase pension by (inflation rate × adjustment rate)
                    currentPensionAmount = currentPensionAmount * (1 + (inflationRate / 100) * macroSlideRate);
                } else if (currentAge === pensionStartAge - 1) {
                    // Reset pension amount to base when starting pension next year
                    currentPensionAmount = basePensionAmount;
                }

                // Add Dividend Income (after tax)
                const grossDividend = currentCapital * (dividendRate / 100);
                const netDividend = grossDividend * (1 - taxRate);
                annualIncome += netDividend;

                // Add Extra Income/Expenses for this age
                extraIncomeItems.forEach(item => {
                    if (item.age === currentAge) {
                        annualIncome += item.amount;
                    }
                });

                dataIncome.push(annualIncome);

                let availableCash = currentCash + annualIncome - expenses;

                // Investment Logic: Invest only if cash is available
                // We can invest up to the available cash amount
                let actualInvestment = 0;
                if (plannedInvestment > 0) {
                    actualInvestment = Math.max(0, Math.min(plannedInvestment, availableCash));
                }

                // Update Cash and Capital with Investment
                currentCash = availableCash - actualInvestment;
                currentCapital += actualInvestment;

                // Insufficient Cash Logic (Withdrawal from Capital)
                if (currentCash < 0) {
                    const deficit = -currentCash;
                    // We need to sell assets to cover the deficit + tax
                    // cash_needed = assets_sold * (1 - taxRate)
                    // assets_sold = cash_needed / (1 - taxRate)
                    const assetsToSell = deficit / (1 - taxRate);

                    if (currentCapital > 0 && assetsToSell > currentCapital) {
                        // Sell all capital
                        const cashGained = currentCapital * (1 - taxRate);
                        currentCash = -(deficit - cashGained);
                        currentCapital = 0;
                    } else if (currentCapital > 0) {
                        currentCapital -= assetsToSell;
                        currentCash = 0;
                    } else {
                        // No capital to sell, deficit remains (plus we can't pay tax if we don't sell?)
                        // Actually if capital is 0, we can't sell anything.
                        // So currentCash stays negative (deficit).
                        // But we need to be careful not to reset it to 0.
                        // The original code set currentCash = 0.
                        // If we don't sell, currentCash is ALREADY negative.
                        // So we just leave it.
                    }
                }

                labels.push(String(currentYear));
                dataTotal.push(currentCapital + currentCash);
                dataCapital.push(currentCapital);
                dataCash.push(currentCash);
            }

            // Update Final Year Amounts in UI
            const finalExpenseInput = period.querySelector('.p-expenses-final');
            if (finalExpenseInput) {
                finalExpenseInput.value = (expenses / 10000).toFixed(1);
            }
            const finalIncomeInput = period.querySelector('.p-income-final');
            if (finalIncomeInput) {
                finalIncomeInput.value = (incomeForFinal / 10000).toFixed(1);
            }

            // Record boundary
            periodBoundaries.push({
                startYear: startYear,
                endYear: String(currentYear),
                label: `期間 ${index + 1}`
            });
        });

        updateChart(labels, dataTotal, dataCapital, dataCash, dataYields, dataAverageYields, dataIncome, periodBoundaries);
        updateUrlFromInputs();
    }

    function updateChart(labels, total, capital, cash, yields, averageYields, income, boundaries) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = total;
        chart.data.datasets[1].data = capital;
        chart.data.datasets[2].data = cash;
        chart.data.datasets[3].data = yields;
        chart.data.datasets[4].data = averageYields;
        chart.data.datasets[5].data = income;

        // Update plugin options
        chart.options.plugins.periodBoundary.boundaries = boundaries;

        // Toggle Yield Axis Visibility
        chart.options.scales.y1.display = true;

        chart.update();
    }

    // Calculate Final Amount for a Period
    function calculateFinalAmount(periodItem, type = 'expenses') {
        const inputClass = type === 'expenses' ? '.p-expenses' : '.p-income';
        const finalClass = type === 'expenses' ? '.p-expenses-final' : '.p-income-final';
        const rateId = type === 'expenses' ? 'inflation-rate' : 'income-base-up-rate';

        const amountInput = periodItem.querySelector(inputClass);
        const durationInput = periodItem.querySelector('.p-duration');
        const finalAmountInput = periodItem.querySelector(finalClass);
        const rateInput = document.getElementById(rateId);

        const amount = parseFloat(amountInput.value) || 0;
        const duration = parseInt(durationInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;

        if (duration <= 1) {
            finalAmountInput.value = amount.toFixed(1);
        } else {
            // amount * (1 + rate)^ (duration - 1)
            const finalAmount = amount * Math.pow(1 + rate / 100, duration - 1);
            finalAmountInput.value = finalAmount.toFixed(1);
        }
    }

    // Update Period Chain (Link Logic)
    function updatePeriodChain() {
        const periods = periodsContainer.querySelectorAll('.period-item');
        let previousFinalExpense = null;
        let previousFinalIncome = null;

        periods.forEach((period, index) => {
            const expLinkCheckbox = period.querySelector('.p-expenses-link');
            const expInput = period.querySelector('.p-expenses');
            const incLinkCheckbox = period.querySelector('.p-income-link');
            const incInput = period.querySelector('.p-income');

            const inflationRate = parseFloat(document.getElementById('inflation-rate').value) || 0;
            const baseUpRate = parseFloat(document.getElementById('income-base-up-rate').value) || 0;

            // First period cannot link
            if (index === 0) {
                [expLinkCheckbox, incLinkCheckbox].forEach(cb => {
                    if (cb) {
                        cb.checked = false;
                        cb.disabled = true;
                        cb.parentElement.style.display = 'none';
                    }
                });
                expInput.disabled = false;
                incInput.disabled = false;
            } else {
                // Expense Linking
                if (expLinkCheckbox) {
                    expLinkCheckbox.disabled = false;
                    expLinkCheckbox.parentElement.style.display = 'flex';
                    if (expLinkCheckbox.checked && previousFinalExpense !== null) {
                        expInput.disabled = true;
                        const nextYearExpense = previousFinalExpense * (1 + inflationRate / 100);
                        expInput.value = nextYearExpense.toFixed(1);
                    } else {
                        expInput.disabled = false;
                    }
                }

                // Income Linking
                if (incLinkCheckbox) {
                    incLinkCheckbox.disabled = false;
                    incLinkCheckbox.parentElement.style.display = 'flex';
                    if (incLinkCheckbox.checked && previousFinalIncome !== null) {
                        incInput.disabled = true;
                        const nextYearIncome = previousFinalIncome * (1 + baseUpRate / 100);
                        incInput.value = nextYearIncome.toFixed(1);
                    } else {
                        incInput.disabled = false;
                    }
                }
            }

            // Calculate final amounts for this period
            calculateFinalAmount(period, 'expenses');
            calculateFinalAmount(period, 'income');

            // Store for next iteration
            previousFinalExpense = parseFloat(period.querySelector('.p-expenses-final').value) || 0;
            previousFinalIncome = parseFloat(period.querySelector('.p-income-final').value) || 0;
        });
    }

    // Event Listeners
    addPeriodBtn.addEventListener('click', () => addPeriod());
    addExtraIncomeBtn.addEventListener('click', () => addExtraIncome());
    calculateBtn.addEventListener('click', calculate);
    yieldButton.addEventListener('change', calculate);

    // Inflation & Baseup Rate Listener
    const inflationRateInput = document.getElementById('inflation-rate');
    if (inflationRateInput) {
        inflationRateInput.addEventListener('input', () => {
            updatePeriodChain();
        });
    }
    const baseUpRateInput = document.getElementById('income-base-up-rate');
    if (baseUpRateInput) {
        baseUpRateInput.addEventListener('input', () => {
            updatePeriodChain();
        });
    }

    // Pension inputs listeners
    [currentAgeInput, pensionStartAgeInput, pensionBaseInput].forEach(input => {
        input.addEventListener('input', () => {
            calculatePension();
            if (input === currentAgeInput) {
                updatePeriodNumbers();
            }
        });
    });

    // Macro-economic slide rate listener
    if (macroSlideRateInput) {
        macroSlideRateInput.addEventListener('input', calculate);
    }

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

    // Yield Range Slider Logic
    const yieldRangeSlider = document.getElementById('yield-range-slider');
    const yieldRangeLabel = document.getElementById('yield-range-label');

    yieldRangeSlider.addEventListener('input', () => {
        yieldRangeLabel.textContent = `利回り変動幅: ±${yieldRangeSlider.value}%`;
    });

    // Initialize
    initChart();
    loadInputsFromUrl();
    calculate();
    // Trigger initial calculation of final expenses after loading inputs
    updatePeriodChain();

    // Collapsible Logic
    document.querySelectorAll('.collapsible-card .card-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.toggle-icon');

            content.classList.toggle('collapsed');
            icon.classList.toggle('collapsed');
        });
    });

    // Spec Display Logic
    const toggleSpecBtn = document.getElementById('toggle-spec-btn');
    const specContainer = document.getElementById('spec-container');

    toggleSpecBtn.addEventListener('click', () => {
        if (typeof marked === 'undefined') {
            alert('marked library is not loaded!');
            return;
        }
        if (specContainer.style.display === 'none') {
            // Show
            if (!specContainer.innerHTML.trim()) {
                // Fetch if empty
                fetch('spec.md')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.text();
                    })
                    .then(text => {
                        specContainer.innerHTML = marked.parse(text);
                    })
                    .catch(error => {
                        specContainer.innerHTML = '<p style="color: red;">仕様書の読み込みに失敗しました。</p>';
                        console.error('Error fetching spec:', error);
                        alert('仕様書の読み込みに失敗しました。\n' + error);
                    });
            }
            specContainer.style.display = 'block';
            toggleSpecBtn.textContent = '仕様詳細を隠す';
        } else {
            // Hide
            specContainer.style.display = 'none';
            toggleSpecBtn.textContent = '仕様詳細を表示';
        }
    });
});
