let dropZone = document.querySelector('#drop-zone');
let preview = document.querySelector('#prewiew');

dropZone.textContent = 'Drop file here';

// Dragenter: quando entro nella dropzone trascinando un elemento
dropZone.addEventListener('dragenter', (e) => {
  e.target.style.border = '5px dotted red'
})

// Mi muovo nella dropzone
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
})

// Esco dalla dropzone
dropZone.addEventListener('dragleave', (e) => {
  e.target.style.border = '5px solid black'
})

// Rilascio l'elemento nella dropzone
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  console.log(e);
  // Utilizzo FileReader per accedere all'immagine
  let reader = new FileReader;
  reader.readAsDataURL(e.dataTransfer.files[0])
  // Quando ho recuperato i dati dell'immagine, creo un tag img e aggiorno il DOM
  reader.onloadend = () => {
    let img = document.createElement('img');
    img.src = reader.result;
    dropZone.innerHTML = '';
    dropZone.append(img);
  }
})