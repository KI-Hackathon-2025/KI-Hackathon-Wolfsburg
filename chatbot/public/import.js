console.log('Hello, world!');
const upload = document.querySelector("#upload");
const nachname = document.querySelector("#Nachname");
const vorname = document.querySelector("#Vorname");
const addresse = document.querySelector("#AdresseStrasseHnr")
const plz = document.querySelector("#AdressePLZ");
const stadt = document.querySelector("#AdresseOrt");
const telefon = document.querySelector("#Telefonnummer");
const chip = document.querySelector("#chip");
const chipnummer = document.querySelector("#chip_nr");
const rasse = document.querySelector("#hunderasse");
const datwurf = document.querySelector("#dat_wurf");

upload.addEventListener("click", (e) => {
    nachname.value = "Mustermann";
    vorname.value = "Max";
    addresse.value = "Musterstraße 1";
    plz.value = "12345";
    stadt.value = "Musterstadt";
    telefon.value = "0123456789";
    chip.checked = true;
    chipnummer.value = "123456789012345";
    rasse.value = "Labrador";
    datwurf.value = "01.06.2020";
});