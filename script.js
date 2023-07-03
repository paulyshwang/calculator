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
    // Only updates operator if secondNum hasn't been inputted
    if (operator && secondNum === "") {
      operator.classList.remove("active");
      operator = button;
      operator.classList.add("active");
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
    operator.classList.add("active");
    waiting = true;
};

function evaluate() {
  if (!waiting) {
    if (lastOperator && lastSecondNum) {
      firstNum = display.textContent;
      display.textContent = operate(lastOperator.textContent, +firstNum, +lastSecondNum);
      
      // Clear firstNum so that decimal and additional number don't add onto last firstNum
      firstNum = "";
    } else {
      // Clear firstNum so that decimal and additional number don't add onto last firstNum
      firstNum = "";
    }
  } else if (operator && secondNum === "") {
    // Only operates if both operator and a secondNum has been inputted
    secondNum = firstNum;
    display.textContent = operate(operator.textContent, +firstNum, +secondNum);
    allClear();
  } else if (waiting) {
    // Same code as above
    display.textContent = operate(operator.textContent, +firstNum, +secondNum);
    allClear();
  }
};

function toggleSign() {
  if (waiting) {
    if (secondNum === "") {
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
    if ((lastOperator || lastSecondNum) && firstNum === "") {
      if (display.textContent[0] === "-") {
        display.textContent = display.textContent.slice(1);
      } else {
        display.textContent = "-" + display.textContent;
      }
    } else {
      firstNum = display.textContent;
      
      if (firstNum[0] === "-") {
        firstNum = firstNum.slice(1);
        display.textContent = firstNum;
      } else {
        firstNum = "-" + firstNum;
        display.textContent = firstNum;
      }
    }
  }
};

function setPercent() {
  if (isNaN(display.textContent)) return;
  
  if (waiting) {
    // Grabs display value as secondNum when secondNum has not been inputted yet
    if (secondNum === "") secondNum = display.textContent;

    secondNum = (+secondNum / 100).toString();
    display.textContent = secondNum;
  } else {
    firstNum = display.textContent;
    firstNum = (+firstNum / 100).toString();
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