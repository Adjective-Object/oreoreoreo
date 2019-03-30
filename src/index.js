const cookieGrammar = require("./oreo.ohm");
const cookieSemantics = cookieGrammar.createSemantics().addOperation("eval", {
  CookieStack: function(e) {
    return e.eval();
  },
  spaces: function(token) {
    console.log("spaces", token);
    return {
      type: "spaces",
      size: token.sourceString.length
    };
  },
  Cookie: function(left, right) {
    return {
      type: "cookie",
      size: left.sourceString.length + right.sourceString.length
    };
  },
  Cream: function(left, right) {
    return {
      type: "cream",
      size: left.sourceString.length + right.sourceString.length - 1
    };
  }
});

const legalChars = new Set(Array.from("ore "));
const filterInput = inputString =>
  Array.from(inputString)
    .filter(c => legalChars.has(c))
    .join("");

const segments = size => {
  // + 2 for segments
  return new Array(size + 1)
    .fill(0)
    .map(_ => `<section class="segment"></section>`)
    .join("\n");
};

const renderBlock = (block, index) => {
  switch (block.type) {
    case "cookie":
      return `<section style="z-index: ${1000 -
        index}" class="biscuit cookie">${segments(block.size)}</section>`;
    case "cream":
      return `<section style="z-index: ${1000 -
        index}" class="biscuit filling">${segments(block.size)}</section>`;
    case "spaces":
      return `<section class="spaces" data-size="${block.size}">`;
  }
};

const renderCompilationError = (destination, match) => {
  if (!match.succeeded()) {
    destination.innerHTML = `<section class="compilation-error">${
      match.message
    }</section>`;
  } else {
    destination.innerHTML = "";
  }
};

const renderOreos = (destination, errorDestination, oreoString) => {
  const match = cookieGrammar.match(oreoString);
  renderCompilationError(errorDestination, match);
  if (match.succeeded()) {
    cookies = cookieSemantics(match).eval();
    const entries = cookies.map(renderBlock).join("");
    destination.innerHTML = entries;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const mainTextInput = document.querySelector("#oreoreo-text");
  const oreoHost = document.querySelector("#oreoreo-host");
  const oreoErrorHost = document.querySelector("#oreoreo-errors");

  const parseInput = inputTarget => {
    inputTarget.value = filterInput(inputTarget.value.toLocaleLowerCase());
    renderOreos(oreoHost, oreoErrorHost, inputTarget.value);
  };

  parseInput(mainTextInput);
  mainTextInput.addEventListener("input", e => parseInput(e.target));
});
