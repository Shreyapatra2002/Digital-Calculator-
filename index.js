// DOM elements
const display = document.getElementById("display");
const historyDisplay = document.getElementById("history");
const memoryIndicator = document.getElementById("memory-indicator");

// Calculator state
let memory = 0;
let lastCalculation = "";
let memoryActive = false;

// Initialize display
display.value = "0";
memoryIndicator.style.visibility = "hidden";

// Button press animation
function animateButton(button) {
    if (button) {
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 200);
    }
}

// Calculator functions
function appendToDisplay(input) {
    const button = event.target;
    animateButton(button);
    
    if (display.value === "Error") {
        display.value = "0";
    }
    
    if (display.value === "0" && input !== ".") {
        display.value = input;
    } else {
        // Prevent multiple decimal points in a number
        if (input === '.' && display.value.split(/[\+\-\*\/]/).pop().includes('.')) {
            return;
        }
        display.value += input;
    }
}

function clearDisplay() {
    const button = event.target;
    animateButton(button);
    display.value = "0";
    historyDisplay.textContent = "";
}

function backspace() {
    const button = event.target;
    animateButton(button);
    if (display.value === "Error") {
        display.value = "0";
        return;
    }
    
    if (display.value.length === 1 || (display.value.length === 2 && display.value.startsWith('-'))) {
        display.value = "0";
    } else {
        display.value = display.value.slice(0, -1);
    }
}

function toggleSign() {
    const button = event.target;
    animateButton(button);
    if (display.value === "Error") {
        display.value = "0";
        return;
    }
    
    if (display.value !== "0") {
        if (display.value.startsWith('-')) {
            display.value = display.value.substring(1);
        } else {
            display.value = '-' + display.value;
        }
    }
}

function calculate() {
    const button = event.target;
    animateButton(button);
    
    if (display.value === "Error") {
        display.value = "0";
        return;
    }
    
    try {
        // Save the calculation to history
        lastCalculation = display.value;
        
        // Replace visual operators with JavaScript operators
        let expression = display.value
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
        
        // Handle percentage calculations
        expression = expression.replace(/(\d+\.?\d*)%/, function(match, number) {
            return number / 100;
        });
        
        // Handle percentage at the end of expression
        if (expression.endsWith('%')) {
            expression = expression.slice(0, -1) + '/100';
        }
        
        const result = eval(expression);
        
        // Check if the result is too large or too small
        if (!isFinite(result)) {
            display.value = "Error";
            historyDisplay.textContent = lastCalculation + " =";
            return;
        }
        
        display.value = formatResult(result);
        historyDisplay.textContent = lastCalculation + " =";
    } catch (error) {
        display.value = "Error";
        historyDisplay.textContent = "";
    }
}

function formatResult(num) {
    // Format number to avoid extremely long decimal places
    if (typeof num !== 'number') return num;
    
    // Convert to string and check if it needs formatting
    let numStr = num.toString();
    
    // If the number is in scientific notation, try to format it
    if (numStr.includes('e')) {
        // For very large or very small numbers, keep scientific notation
        return num.toExponential(5);
    }
    
    // If the number has more than 10 decimal places, round it
    if (numStr.includes('.')) {
        const parts = numStr.split('.');
        if (parts[1].length > 10) {
            return num.toFixed(10);
        }
    }
    
    // If the number is too long, use exponential notation
    if (numStr.length > 12) {
        return num.toExponential(5);
    }
    
    return numStr;
}

function handleMemory(action) {
    const button = event.target;
    animateButton(button);
    
    if (display.value === "Error") {
        display.value = "0";
    }
    
    const currentValue = parseFloat(display.value);
    
    if (isNaN(currentValue) && action !== 'mc') return;
    
    switch(action) {
        case 'mc': // Memory Clear
            memory = 0;
            memoryActive = false;
            memoryIndicator.style.visibility = "hidden";
            break;
        case 'mr': // Memory Recall
            display.value = formatResult(memory);
            break;
        case 'm+': // Memory Add
            memory += currentValue;
            memoryActive = true;
            memoryIndicator.style.visibility = "visible";
            break;
        case 'm-': // Memory Subtract
            memory -= currentValue;
            memoryActive = true;
            memoryIndicator.style.visibility = "visible";
            break;
    }
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    if (/[0-9]/.test(key)) {
        appendToDisplayWithKey(key);
        const button = document.querySelector(`.btn:not(.memory-btn):not(.clear-btn):not(.function-btn):not(.operator-btn):not(.equals-btn)[onclick*="${key}"]`);
        animateButton(button);
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        appendToDisplayWithKey(key);
        const button = document.querySelector(`.operator-btn[onclick*="${key === '*' ? '×' : key}"]`);
        animateButton(button);
    } else if (key === '.') {
        appendToDisplayWithKey(key);
        const button = document.querySelector(`.function-btn[onclick*="."]`);
        animateButton(button);
    } else if (key === 'Enter' || key === '=') {
        calculate();
        const button = document.querySelector('.equals-btn');
        animateButton(button);
    } else if (key === 'Escape') {
        clearDisplay();
        const button = document.querySelector('.clear-btn');
        animateButton(button);
    } else if (key === 'Backspace') {
        backspace();
        const button = document.querySelector('.function-btn i.fa-backspace').parentElement;
        animateButton(button);
    } else if (key === '%') {
        appendToDisplayWithKey(key);
        const button = document.querySelector('.function-btn[onclick*="%"]');
        animateButton(button);
    }
});

function appendToDisplayWithKey(input) {
    if (display.value === "Error") {
        display.value = "0";
    }
    
    if (display.value === "0" && input !== ".") {
        display.value = input;
    } else {
        // Prevent multiple decimal points in a number
        if (input === '.' && display.value.split(/[\+\-\*\/]/).pop().includes('.')) {
            return;
        }
        display.value += input;
    }
}

// Touch device support
document.addEventListener('touchstart', function() {
    // Add touch support
}, false);