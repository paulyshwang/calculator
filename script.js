// Constants
const display = document.querySelector(".display");
const numberButtons = document.querySelector(".numbers").children;
const operatorButtons = document.querySelector(".operators").children;
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
});

// Functions
function setDigit(value) {
  if (waiting) {
    // Prevent leading zeros
    if (value === "0" && (secondNum === "0" || secondNum === 0)) return;

    if (secondNum === "0" || secondNum === 0) {
      secondNum = value;
    } else if (secondNum === "-0") {
      secondNum = -value;
    } else {
      secondNum += value;
    }
    display.textContent = secondNum;
  } else {
    // Prevent leading zeros
    if (value === "0" && (firstNum === "0" || firstNum === 0)) return;

    if (firstNum === "0" || firstNum === 0) {
      firstNum = value;
    } else if (firstNum === "-0") {
      firstNum = -value;
    } else {
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
    }

    firstNum += ".";
    display.textContent = firstNum;
  }
};

function setOperator(button) {
    // Only updates operator if secondNum hasn't been inputted
    if (operator && secondNum === "") {
      operator.classList.remove("highlighted");
      operator = button;
      operator.classList.add("highlighted");
      return;
    }

    if (waiting) {
      // Same code as below
      display.textContent = operate(operator.textContent, +firstNum, +secondNum);
      allClear();

      // Makes sure you use result of last operation as first number..? 2*3/4/
      firstNum = display.textContent;
    } else {
      firstNum = display.textContent;
    }
    
    operator = button;
    operator.classList.add("highlighted");
    waiting = true;
};

function evaluate() {
  if (!waiting && lastOperator && lastSecondNum) {
    firstNum = display.textContent;
    display.textContent = operate(lastOperator.textContent, +firstNum, +lastSecondNum);
    
    // clear firstNum so that decimal and additional number don't add onto last firstNum
    firstNum = "";

    // If uncommented, this block fires only once because lastOperator and lastSecondNum get reset
    // allClear();
  } else if (operator && secondNum === "") {
    // Only operates if both operator and a secondNum has been inputted
    secondNum = firstNum;
    display.textContent = operate(operator.textContent, +firstNum, +secondNum);
    allClear();
  } else if (waiting) {
    // Same code as above
    display.textContent = operate(operator.textContent, +firstNum, +secondNum);
    allClear();

    // If uncommented, this concatenates any new digits to result of last operation, which we don't want
    // firstNum = display.textContent;
  }
};

function toggleSign() {
  if (waiting) {
    // Not sure if both cases of zero are necessary, but both are left just in case
    if (secondNum === "" || secondNum === "0" || secondNum === 0) {
      secondNum = "-0";
      display.textContent = secondNum;
    } else {
      secondNum = -(+secondNum);
      display.textContent = secondNum;
    }
  } else {
    firstNum = display.textContent;

    if (firstNum === "" || firstNum === "0" || firstNum === 0) {
      firstNum = "-0";
      display.textContent = firstNum;
    } else {
      firstNum = display.textContent;
      firstNum = -(+firstNum);
      display.textContent = firstNum;
    }
  }
};

function setPercent() {
  if (waiting) {
    // Grabs display value as secondNum when secondNum has not been inputted yet
    if (secondNum === "") secondNum = display.textContent;

    secondNum = +secondNum / 100;
    display.textContent = secondNum;
  } else {
    firstNum = display.textContent;
    firstNum = +firstNum / 100;
    display.textContent = firstNum;
  }
};

function roundNumber(value) {
  const maxLength = 9;
  let places = 0;

  // If number of digits (regardless of sign) is greater than 9 use scientific notation
  if (value !== 0 && (Math.abs(value) >= 1e+9 || Math.abs(value) < 1e-8)) {
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

function clear() {
  if (waiting) {
    secondNum = "0";
    display.textContent = secondNum;
  } else {
    firstNum = "0";
    display.textContent = firstNum;
  }
};

function allClear() {
  lastOperator = operator;
  lastSecondNum = secondNum;
  if (operator) operator.classList.remove("highlighted");
  operator = null;
  firstNum = "";
  secondNum = "";
  waiting = false;
};

function add(a, b) {
  return roundNumber(a + b, 5);
};

function subtract(a, b) {
  return roundNumber(a - b, 5);
};

function multiply(a, b) {
  return roundNumber(a * b, 5);
};

function divide(a, b) {
  return roundNumber(a / b, 5);
};

function operate(operator, firstNum, secondNum) {
  if (isNaN(firstNum) || isNaN(secondNum)) return "Error";

  if (operator === "+") return add(firstNum, secondNum);
  if (operator === "-") return subtract(firstNum, secondNum);
  if (operator === "*") return multiply(firstNum, secondNum);
  if (operator === "/") {
    if (secondNum === 0) {
      return "Error";
    } else {
      return divide(firstNum, secondNum);
    }
  };
};