const CORRECT_PIN = "1234";
const PIN_LENGTH = CORRECT_PIN.length;

const buttons =
  document.querySelectorAll(".pin-btn");

const dots =
  document.querySelectorAll(".dot");

const lockScreen =
  document.getElementById("lockScreen");

const pinDots =
  document.getElementById("pinDots");

const floralTransition =
  document.getElementById("floralTransition");

const app =
  document.getElementById("app");


let enteredPin = "";
let inputLocked = false;
let transitionStarted = false;

let mainPageLoaded = false;


/* =========================================================
   LOAD MAIN SITE
   ========================================================= */

async function loadMainPage() {
  try {

    const response =
      await fetch("pages/main.html");


    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }


    const html =
      await response.text();


    app.innerHTML = html;

    mainPageLoaded = true;


    /*
      Если основной сайт имеет свой JS,
      импортируем его после создания DOM.
    */

    await import("./main.js");


  } catch (error) {

    console.error(
      "Не удалось загрузить основной сайт:",
      error
    );


    app.innerHTML = `
      <section class="load-error">
        Не удалось загрузить страницу
      </section>
    `;

  }
}


/*
  Загружаем основной сайт сразу.

  Пока пользователь вводит PIN,
  браузер уже строит нижний слой.
*/

loadMainPage();


/* =========================================================
   PIN INPUT
   ========================================================= */

function enterDigit(digit) {

  if (inputLocked) {
    return;
  }


  if (
    enteredPin.length >= PIN_LENGTH
  ) {
    return;
  }


  enteredPin += digit;

  updateDots();


  if (
    enteredPin.length === PIN_LENGTH
  ) {
    checkPin();
  }

}


function removeLastDigit() {

  if (inputLocked) {
    return;
  }


  enteredPin =
    enteredPin.slice(0, -1);


  updateDots();

}


function resetPin() {

  enteredPin = "";

  updateDots();

}


function updateDots() {

  dots.forEach(
    (dot, index) => {

      dot.classList.toggle(
        "filled",
        index < enteredPin.length
      );

    }
  );

}


/* =========================================================
   CHECK PIN
   ========================================================= */

function checkPin() {

  inputLocked = true;


  if (
    enteredPin === CORRECT_PIN
  ) {

    unlock();

    return;
  }


  showWrongPin();

}


/* =========================================================
   WRONG PIN
   ========================================================= */

function showWrongPin() {

  lockScreen.classList.add(
    "wrong-pin"
  );


  const handleEnd =
    (event) => {

      if (
        event.animationName !==
        "pin-shake"
      ) {
        return;
      }


      pinDots.removeEventListener(
        "animationend",
        handleEnd
      );


      resetPin();


      lockScreen.classList.remove(
        "wrong-pin"
      );


      inputLocked = false;

    };


  pinDots.addEventListener(
    "animationend",
    handleEnd
  );

}


/* =========================================================
   UNLOCK
   ========================================================= */

function unlock() {

  if (transitionStarted) {
    return;
  }


  transitionStarted = true;


  /*
    Последний цветочек PIN
    успевает раскрыться.
  */

  setTimeout(
    () => {

      floralTransition
        .classList
        .add("grow");

    },
    220
  );

}


/* =========================================================
   TRANSITION
   ========================================================= */

floralTransition.addEventListener(
  "transitionend",
  (event) => {

    /*
      Игнорируем transitionend,
      пришедшие от внутренних SVG.
    */

    if (
      event.target !== floralTransition
    ) {
      return;
    }


    /*
      Цветы полностью закрыли экран.
    */

    if (
      event.propertyName === "clip-path" &&
      floralTransition.classList.contains("grow") &&
      !floralTransition.classList.contains("fade-away")
    ) {

      revealMainPage();

      return;
    }


    /*
      Цветочный слой исчез.
    */

    if (
      event.propertyName === "opacity" &&
      floralTransition.classList.contains("fade-away")
    ) {

      floralTransition.remove();

    }

  }
);


/* =========================================================
   REVEAL
   ========================================================= */

function revealMainPage() {

  lockScreen.remove();


  document.body.classList.remove(
    "locked"
  );


  floralTransition
    .classList
    .add("fade-away");

}


/* =========================================================
   BUTTONS
   ========================================================= */

buttons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        enterDigit(
          button.dataset.value
        );

      }
    );

  }
);


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (inputLocked) {
      return;
    }


    if (/^\d$/.test(event.key)) {

      enterDigit(
        event.key
      );

      return;
    }


    if (
      event.key === "Backspace"
    ) {

      event.preventDefault();

      removeLastDigit();

      return;
    }


    if (
      event.key === "Escape"
    ) {

      resetPin();

    }

  }
);