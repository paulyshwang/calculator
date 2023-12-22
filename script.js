// Constants
const display = document.querySelector(".display");
const numberButtons = document.querySelectorAll(".number");
const operatorButtons = document.querySelectorAll(".operator");
const equalsButton = document.querySelector(".equals");
const negativeButton = document.querySelector(".negative");
const percentButton = document.querySelector(".percent");
const clearButton = document.querySelector(".clear");
const allClearButton = document.querySelector(".all-clear");

// Variables
let lastOperator = null;
let lastSecondNum = "";
let operator = null;
let firstNum = "";
let secondNum = "";
let waiting = false;
let result = NaN;

// Event Listeners
for (let button of numberButtons) {
  button.addEventListener("click", () => {
    if (button.textContent === ".") {
      setDecimal();
    } else {
      setDigit(button.textContent)
    }
  });
};

for (let button of operatorButtons) {
  button.addEventListener("click", () => setOperator(button));
};

equalsButton.addEventListener("click", evaluate);
negativeButton.addEventListener("click", toggleSign);
percentButton.addEventListener("click", setPercent);
clearButton.addEventListener("click", clear);
allClearButton.addEventListener("click", () => {
  allClear();
  display.textContent = "0";
  result = NaN;
});

// Functions
function setDigit(value) {
  if (waiting) {
    // Prevent leading zeros
    if (value === "0" && secondNum === "0") return;

    if (secondNum === "0") {
      secondNum = value;
    } else if (secondNum === "-0") {
      secondNum = "-" + value;
    } else if (countDigits(secondNum) < 9) {
      secondNum += value;
    }
    display.textContent = secondNum;
  } else {
    // Reset result if appending to a new firstNum
    if (!firstNum) result = NaN;

    // Prevent leading zeros
    if (value === "0" && firstNum === "0") return;

    if (firstNum === "0") {
      firstNum = value;
    } else if (firstNum === "-0") {
      firstNum = "-" + value;
    } else if (countDigits(firstNum) < 9) {
      firstNum += value;
    }
    display.textContent = firstNum;
  }
};

function setDecimal() {
  if (waiting) {
    // If secondNum is not set, set to 0
    if (!secondNum) {
      secondNum = "0";
    } else if (display.textContent.includes(".")) {
      // If secondNum already includes decimal, return
      // Comes after initial if statement in case current display value includes decimal AND secondNum is not set
      return;
    } else if (countDigits(secondNum) >= 9) {
      return;
    }

    secondNum += ".";
    display.textContent = secondNum;
  } else {
    // If firstNum is not set, or display value is Error (or any NaN), set  to 0 
    if (!firstNum || isNaN(display.textContent)) {
      firstNum = "0";
    } else if (display.textContent.includes(".")) {
      // If firstNum already includes decimal, return
      // Comes after initial if statement in case current display value includes decimal AND firstNum is not set
      return;
    } else if (countDigits(firstNum) >= 9) {
      return;
    }

    firstNum += ".";
    display.textContent = firstNum;
  }
};

function setOperator(button) {
    if (waiting) {
      // If secondNum has not been set, update operator only
      if (!secondNum) {
        operator.classList.remove("active");
        operator = button;
        operator.classList.add("active");
        return;
      }

      // Same code as below
      result = operate(operator.value, +firstNum, +secondNum);
      display.textContent = roundNumber(result);
      allClear();

      // Makes sure you use result of last operation as first number..? 2*3/4/
      firstNum = result.toString();
    } else {
      if (!firstNum) {
        if (result) {
          firstNum = result.toString();
        } else {
          firstNum = display.textContent;
        }
      }
    }

    operator = button;
    operator.classList.add("active");
    waiting = true;
};

function evaluate() {
  if (waiting) {
    if (!secondNum) {
      if (result) {
        secondNum = result.toString();
      } else {
        secondNum = display.textContent;
      }
    }

    // Same code as above
    result = operate(operator.value, +firstNum, +secondNum);
    display.textContent = roundNumber(result);
    allClear();
  } else {
    if (lastOperator && lastSecondNum) {
      if (!firstNum) {
        if (result) {
          firstNum = result.toString();
        } else {
          firstNum = display.textContent;
        }
      }

      result = operate(lastOperator.value, +firstNum, +lastSecondNum);
      display.textContent = roundNumber(result);
      
      // Clear firstNum so that decimal and additional number don't add onto last firstNum
      firstNum = "";
    } else {
      // Clear firstNum so that decimal and additional number don't add onto last firstNum
      firstNum = "";
    }
  }
};

function toggleSign() {
  if (waiting) {
    if (!secondNum) {
      secondNum = "-0";
      display.textContent = secondNum;
    } else if (secondNum[0] === "-") {
      secondNum = secondNum.slice(1);
      display.textContent = secondNum;
    } else {
      secondNum = "-" + secondNum;
      display.textContent = secondNum;
    }
  } else {
    // If lastOperator or lastSecondNum exists (i.e. a result is in the display) AND firstNum 
    // is not yet assigned, toggleSign() only on display value without assigning to firstNum
    if ((lastOperator || lastSecondNum) && !firstNum) {
      result = -result;
      display.textContent = roundNumber(result);
    } else {
      firstNum = display.textContent;

      if (firstNum[0] === "-") {
        firstNum = firstNum.slice(1);
        display.textContent = firstNum;
      } else {
        firstNum = "-" + firstNum;
        display.textContent = firstNum;
      }
      
      result = -result; 
    }
  }
};

function setPercent() {
  if (isNaN(display.textContent)) return;
  
  if (waiting) {
    if (!secondNum && result) {
      result = divide(result, 100);
      display.textContent = roundNumber(result);
    } else {
      result = divide(+display.textContent, 100);
      display.textContent = roundNumber(result);
      secondNum = result;
    }
  } else {
    if (!firstNum && result) {
      result = divide(result, 100);
      display.textContent = roundNumber(result);
    } else {
      result = divide(+display.textContent, 100);
      display.textContent = roundNumber(result);
      firstNum = "";
    }
  }
};

function roundNumber(value) {
  if (!isFinite(value)) return "Error";

  const maxLength = 9;
  let places = 0;

  // If number of digits (regardless of sign) is greater than 9 use scientific notation
  if (value.toString().includes("e") || (value !== 0 && (Math.abs(value) >= 1e+9 || Math.abs(value) < 1e-8))) {
    let scientificParts = value.toExponential().split("e");
    // Subtract 2 to account for "e" in resulting string and number before decimal point
    // (+/- is already included in scientificParts[1])
    places = maxLength - scientificParts[1].length - 2;
    // parseFloat gets rid of any trailing zeros
    let scientific = parseFloat(Number(scientificParts[0]).toFixed(places)) + "e" + scientificParts[1];
    return scientific;
  }
  
  let roundedParts = value.toString().split(".");

  if (roundedParts[0].startsWith("-")) {
    places = maxLength - roundedParts[0].length + 1;
  } else {
    places = maxLength - roundedParts[0].length;
  }

  let rounded = parseFloat(value.toFixed(places));
  return rounded;
};

function countDigits(str) {
  const digitRegex = /\d/g;
  const digits = str.match(digitRegex);
  return digits ? digits.length : 0;
};

function clear() {
  if (waiting) {
    secondNum = "0";
    display.textContent = secondNum;
  } else {
    firstNum = "0";
    display.textContent = firstNum;
    result = NaN;
  }
};

function allClear() {
  lastOperator = operator;
  lastSecondNum = secondNum;
  if (operator) operator.classList.remove("active");
  operator = null;
  firstNum = "";
  secondNum = "";
  waiting = false;
};

function add(a, b) {
  return a + b;
};

function subtract(a, b) {
  return a - b;
};

function multiply(a, b) {
  return a * b;
};

function divide(a, b) {
  return a / b;
};

function operate(operator, firstNum, secondNum) {
  if (isNaN(firstNum) || isNaN(secondNum)) return "Error";

  switch(operator) {
    case "+":
      return add(firstNum, secondNum);
    case "-":
      return subtract(firstNum, secondNum);
    case "*":
      return multiply(firstNum, secondNum);
    case "/":
      return (secondNum === 0) ? "Error" : divide(firstNum, secondNum);
  }
};