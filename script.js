let operator = null;
let firstNum = "";
let secondNum = "";
let displayVal = "";
let waiting = false;

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

const div = document.querySelector(".display");
const numbers = document.querySelector(".numbers").children;
const operators = document.querySelector(".operators").children;
const equals = document.querySelector(".equals");
const allClearButton = document.querySelector(".all-clear");
const negativeButton = document.querySelector(".negative");
const percentButton = document.querySelector(".percent");
const clearButton = document.querySelector(".clear");

function display(value) {
  if (value === ".") {
    if (waiting) {
      // case when display includes decimal but want to input new 0.something
      if (!secondNum || secondNum === "0" || secondNum === 0) {
        secondNum = "0.";
        div.textContent = secondNum;
        console.log("Second Number =" + secondNum);
        return;
      } else {
        // case when secondNum already includes decimal
        if (div.textContent.includes(".")) return;
      }
    } else {
      // case when firstNum doesn't exist, or display shows 0 or Error (or any NaN) and want to append decimal to 0
      if (!firstNum || div.textContent === "0" || isNaN(div.textContent)) {
        firstNum = "0.";
        div.textContent = firstNum;
        console.log("First Number = " + firstNum);
        return;
      }
      // case when firstNum already includes decimal
      if (div.textContent.includes(".")) return;
    }
  }

  if (waiting) {
    // Prevent leading zeros
    if (value === "0") {
      if (secondNum === "0" || secondNum === 0) return;
    }
    if (secondNum === "0" || secondNum === 0) {
      secondNum = value;
      div.textContent = secondNum;
      return;
    } else if (secondNum === "-0") {
      secondNum = -value;
      div.textContent = secondNum;
      return;
    }

    secondNum += value;
    div.textContent = secondNum;
    console.log("Second Number =" + secondNum);
  } else {
    // Prevent leading zeros
    if (value === "0") {
      if (firstNum === "0" || firstNum === 0) return;
    }
    if (firstNum === "0" || firstNum === 0) {
      firstNum = value;
      div.textContent = firstNum;
      return;
    } else if (firstNum === "-0") {
      firstNum = -value;
      div.textContent = firstNum;
      return;
    }

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
      allClear();

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
    allClear();

    // If uncommented, this concatenates any new digits to result of last operation, which we don't want
    // firstNum = div.textContent;
  }
});

function allClear() {
  if (operator) operator.classList.remove("highlighted");
  operator = null;
  firstNum = "";
  secondNum = "";
  displayVal = "";
  waiting = false;
};

allClearButton.addEventListener("click", () => {
  allClear();
  div.textContent = "0";
});

negativeButton.addEventListener("click", () => {
  if (waiting) {
    // Not sure if both cases of zero are necessary, but both are left just in case
    if (secondNum === "" || secondNum === "0" || secondNum === 0) {
      secondNum = "-0";
      div.textContent = secondNum;
      console.log("Second Number = " + secondNum);
    } else {
      secondNum = -(+secondNum);
      div.textContent = secondNum;
      console.log("Second Number =" + secondNum);
    }
  } else {
    firstNum = div.textContent;
    console.log("First Number = " + firstNum);

    if (firstNum === "" || firstNum === "0" || firstNum === 0) {
      firstNum = "-0";
      div.textContent = firstNum;
      console.log("FirstNumber = " + firstNum);
    } else {
      firstNum = div.textContent;
      firstNum = -(+firstNum);
      div.textContent = firstNum;
      console.log("First Number = " + firstNum);
    }
  }
});

percentButton.addEventListener("click", () => {
  if (waiting) {
    // Grabs display value as secondNum when secondNum has not been inputted yet
    if (secondNum === "") {
      secondNum = div.textContent;
      secondNum = +secondNum / 100;
      div.textContent = secondNum;
      console.log("Second Number =" + secondNum);
    } else {
      secondNum = +secondNum / 100;
      div.textContent = secondNum;
      console.log("Second Number =" + secondNum);
    }
  } else {
    firstNum = div.textContent;
    firstNum = +firstNum / 100;
    div.textContent = firstNum;
    console.log("First Number = " + firstNum);
  }
});

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

clearButton.addEventListener("click", () => {
  if (waiting) {
    secondNum = "0";
    displayVal = secondNum;
    div.textContent = displayVal;
  } else {
    firstNum = "0";
    displayVal = firstNum;
    div.textContent = displayVal;
  }
});