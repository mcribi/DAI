// ratings.js
// se ejecuta cuando la página está completamente cargada
document.addEventListener('DOMContentLoaded', () => {
  console.log('Iniciando fetch ...');
  const ele_stars = document.getElementsByClassName('stars'); // todos los elementos de la clase 'stars' que haya en la página


  for (const ele of ele_stars) {
    const ide = ele.dataset._id; // _id está en los atributos del dataset
    
    fetch(`/api/ratings/${ide}`)
      .then(response => response.json())
      .then(data => {
        const rating = Math.round(data.rating.rate || 0);
        let htmlnew = ''; //pagina html que vamos a modificar
        const maxStarts=5;

        //vamos por las 5 estrellas y las añadimos
        for (let i = 1; i <= maxStarts; i++) {
          if (i <= rating) {
            htmlnew += '<span class="fa fa-star checked" data-star="' + i + '" data-_id="' + ide + '"></span>'; 
          } else {
            htmlnew += '<span class="fa fa-star" data-star="' + i + '" data-_id="' + ide + '"></span>'; // Estrella vacía
          }
        }
        
        // hacer el fecth, y con lo que devuelva formar el html y ponerlo:
        ele.innerHTML = htmlnew;
        addEventListenersToStars(ele);
      })
      .catch(error => {
        console.error(`ERROR al obtener el rating`, error);
        ele.innerHTML = 'ERROR';
      });
  }
});

// Renderiza estrellas
function renderStars(ele, rating, count) {
  const maxStarts=5;
  rating = Math.round(rating || 0); 
  let htmlnew = '';

  for (let i = 1; i <= maxStarts; i++) {
    if (i <= rating) {
      htmlnew += `<span class="fa fa-star checked" data-star="${i}" data-_id="${ele.dataset._id}"></span>`;
    } else {
      htmlnew += `<span class="fa fa-star" data-star="${i}" data-_id="${ele.dataset._id}"></span>`;
    }
  }

  htmlnew += `<span> (${count || 0} votos)</span>`;
  ele.innerHTML = htmlnew;

  // Añadir manejadores de eventos a las estrellas nuevamente
  addEventListenersToStars(ele);
}

//agregar clics de las estrellas 
function addEventListenersToStars(ele) {  
  for (const ele_hijo of ele.children) {
    if (ele_hijo.tagName === 'SPAN' && ele_hijo.classList.contains('fa-star')) {
      //cada vez que hacemos clic a una estrella llamamos a la funcion para que actualice
      ele_hijo.addEventListener('click', Vota);
    }
  }
}

//maneja clics estrella
function Vota(evt) {// evt es el objeto con información del evento
   // evt.target es el nodo que ha disparado el evento,
  const ide = evt.target.dataset._id;  // producto (en atributos del dataset)
  //pasamos a entero para que no haya erroress
  const pun = parseInt(evt.target.dataset.star);  // estrella no (en atributos del dataset)

    //  para cambiar la BD y renovar le elemento de votación con lo que devuelva
    fetch(`/api/ratings/${ide}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: pun })
    })
      .then(response => response.json())
      .then(data => {
        //actualizo estrellas
        const ele = evt.target.parentElement;
        renderStars(ele, data.rating.rate, data.rating.count);
      })
      .catch(error => {
        console.error(`ERROR al mandar el rating`, error);
      });
  
}


//Eventos adicionales
function agregarEventosEstrellas(elemento) {
  for (const hijo of elemento.children) {
    if (hijo.tagName === 'SPAN' && hijo.classList.contains('fa-star')) {
      hijo.addEventListener('click', manejarClickEstrella);
      hijo.addEventListener('mouseover', manejarMouseOverEstrella);
      hijo.addEventListener('mouseout', manejarMouseOutEstrella);
    }
  }
}

function manejarMouseOverEstrella(event) {
  const valorEstrella = parseInt(event.target.dataset.star, 10);
  const contenedor = event.target.parentElement;
  for (const estrella of contenedor.children) {
    const estrellaValor = parseInt(estrella.dataset.star, 10);
    if (estrellaValor <= valorEstrella) {
      estrella.classList.add('highlighted');
    } else {
      estrella.classList.remove('highlighted');
    }
  }
}

function manejarMouseOutEstrella(event) {
  const contenedor = event.target.parentElement;
  for (const estrella of contenedor.children) {
    estrella.classList.remove('highlighted');
  }
}
