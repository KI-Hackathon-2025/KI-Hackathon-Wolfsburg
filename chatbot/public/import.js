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
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*,application/pdf';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

fileInput.addEventListener('change', (e) => {
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

upload.addEventListener("click", (e) => {
    fileInput.click();
});