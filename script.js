let operator = null;
let firstNum = "";
let secondNum = "";
let displayVal = "";
let waiting = false;

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

const div = document.querySelector(".display");
const numbers = document.querySelector(".numbers").children;
const operators = document.querySelector(".operators").children;
const equals = document.querySelector(".equals");
const clearButton = document.querySelector(".clear");

function display(value) {
  if (value === ".") {
    if (waiting) {
      // case when display includes decimal but want to input new 0.something
      if (!secondNum) {
        secondNum += "0.";
        div.textContent = secondNum;
        console.log("Second Number =" + secondNum);
        return;
      } else {
        // case when secondNum already includes decimal
        if (div.textContent.includes(".")) return;
      }
    } else {
      // case when firstNum already includes decimal
      if (div.textContent.includes(".")) return;
      // case when display shows 0 or Error (or any NaN) and want to append decimal to 0
      if (div.textContent === "0" || isNaN(div.textContent)) {
        firstNum += "0.";
        div.textContent = firstNum;
        console.log("First Number = " + firstNum);
        return;
      }
    }
  }

  if (waiting) {
    secondNum += value;
    div.textContent = secondNum;
    console.log("Second Number =" + secondNum);
  } else {
    firstNum += value;
    div.textContent = firstNum;
    console.log("First Number = " + firstNum);
  }
};

for (let number of numbers) {
  number.addEventListener("click", () => display(number.textContent));
};

for (let symbol of operators) {
  symbol.addEventListener("click", () => {
    // Only updates operator if secondNum hasn't been inputted
    if (operator && secondNum === "") {
      operator.classList.remove("highlighted");
      operator = symbol;
      operator.classList.add("highlighted");
      return;
    }

    if (waiting) {
      // Same code as below
      displayVal = operate(operator.textContent, +firstNum, +secondNum);
      div.textContent = displayVal;
      clear();

      // Makes sure you use result of last operation as first number..? 2*3/4/
      firstNum = div.textContent;

    } else {
      firstNum = div.textContent;
      console.log("First Number = " + firstNum);
    }
    
    operator = symbol;
    operator.classList.add("highlighted");
    waiting = true;

  });
};

equals.addEventListener("click", () => {
  // Only operates if both operator and a secondNum has been inputted
  if (operator && secondNum === "") {
    return;
  }

  if (waiting) {
    // Same code as above
    displayVal = operate(operator.textContent, +firstNum, +secondNum);
    div.textContent = displayVal;
    clear();

    // If uncommented, this concatenates any new digits to result of last operation, which we don't want
    // firstNum = div.textContent;
  }
});

function clear() {
  if (operator) operator.classList.remove("highlighted");
  operator = null;
  firstNum = "";
  secondNum = "";
  displayVal = "";
  waiting = false;
};

clearButton.addEventListener("click", () => {
  clear();
  div.textContent = "0";
});