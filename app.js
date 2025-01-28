let modal = null; // elle me permettra de savoir quelle modal est ouverte ou fermée

const focusableSelector = "button, a, input, textarea"; // les éléments sur lesquels on peut focus

let focusables = []; // tableau qui contiendra les éléments sur lesquels on peut focus

// cette fonction permet d'ouvrir le modal en cliquant sur le bouton
const openModal = async function (e) {
  e.preventDefault();
  // peu importe le line que je clique, je veux que le modal s'ouvre donc je vais chercher le href de l'élément sur lequel j'ai cliqué
  const target = e.target.getAttribute("href");
  if (target.startsWith("#")) {
    modal = document.querySelector(target);
  } else {
    modal = await loadModal(target);
  }
  // tout les elements sur lesquels on peut focus
  focusables = Array.from(modal.querySelectorAll(focusableSelector));

  //!------------- Rend visible le modal -----------------------!//
  modal.style.display = null;
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
  //!------------------------------------!//
  modal.addEventListener("click", closeModal);
  modal.querySelector(".js-modal-close").addEventListener("click", closeModal);
  modal
    .querySelector(".js-modal-stop")
    .addEventListener("click", stopPropagation);
};

// fonction qui ferme le modal donc qui fait l'inverse de la fonction openModal
const closeModal = function (e) {
  // j'essaie de fermer un modal qui n'est pas ouvert ou inexistant
  if (modal === null) return;
  e.preventDefault();

  //!--------------- reinitialise les attribue ---------------------!//
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
  //!------------------------------------!//
  modal.removeEventListener("click", closeModal);
  modal
    .querySelector(".js-modal-close")
    .removeEventListener("click", closeModal);
  modal
    .querySelector(".js-modal-stop")
    .removeEventListener("click", stopPropagation);

  const hideModal = function () {
    modal.style.display = "none";
    modal.removeEventListener("animationend", hideModal);
    modal = null;
  };
  modal.addEventListener("animationend", hideModal);
};

// permet de stopper la propagation de l'événement si on clique sur le modal lui-même et non sur le bouton de fermeture ( parent )
const stopPropagation = function (e) {
  e.stopPropagation();
};

// fonction qui permet de focus sur les éléments du modal
const focusInmodal = function (e) {
  e.preventDefault();
  if (modal === null) return;
  // la variable contient la position de l'élément sur lequel on a focus dans le tableau focusables
  let index = focusables.findIndex((f) => f === modal.querySelector(":focus"));
  index++;
  if (index >= focusables.length) {
    index = 0;
  }
  focusables[index].focus();
};

// fonction qui permet de charger le modal qui prend en paramètre l'url de la page sur laquelle on se trouve et le # de l'url
const loadModal = async function (url) {
  // je recuperer le #de l'url
  const target = "#" + url.split("#")[1];
  // verifier si le modal existe déjà
  const existingModal = document.querySelector(target);
  // dans ce cas si elle existe je la retourne directement
  if (existingModal !== null) return existingModal;
  const html = await fetch(url).then((response) => response.text());
  console.log(html);

  const element = document
    .createRange()
    .createContextualFragment(html)
    .querySelector(target);
  if (element === null)
    throw `L'élément ${target} n'a pas été trouvé dans la page ${url}`;
  document.body.append(element);
  return element;
};

document.querySelectorAll(".js-modal").forEach((a) => {
  a.addEventListener("click", function (e) {
    openModal(e); // j'appelle la fonction openModal
  });
});

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Esc") {
    closeModal(e); // j'appelle la fonction closeModal
  }

  if (e.key === "Tab" && modal !== null) {
    focusInmodal(e); // j'appelle la fonction focusInmodal
  }
});
