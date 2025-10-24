function abrirModal(id) {
  const modal = document.getElementById(`modal${id}`);
  if (modal) {
    modal.style.display = "flex";
    setTimeout(() => modal.style.opacity = "1", 50);
  }
}

function cerrarModal(id) {
  const modal = document.getElementById(`modal${id}`);
  if (modal) {
    modal.style.opacity = "0";
    setTimeout(() => modal.style.display = "none", 500);
  }
}
window.addEventListener("click", (e) => {
  for (let i = 1; i <= 8; i++) {
    const modal = document.getElementById(`modal${i}`);
    if (modal && e.target === modal) cerrarModal(i);
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    for (let i = 1; i <= 8; i++) {
      const modal = document.getElementById(`modal${i}`);
      if (modal) cerrarModal(i);
    }
  }
});

const menuToggle = document.querySelector('.menu-toggle');
const navUl = document.querySelector('header nav ul');

menuToggle.addEventListener('click', () => {
  navUl.classList.toggle('show');
});


function nombreValido(nombre) {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/.test(nombre.trim());
}

function emailValido(email) {
  
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/.test(email.trim());
}

function mensajeValido(mensaje) {
  return mensaje.trim().length >= 10;
}

const form = document.getElementById("contactForm");
const msg = document.getElementById("form-msg");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = form.nombre.value;
    const email = form.correo.value;
    const mensaje = form.mensaje.value;

    if (!nombreValido(nombre)) {
      msg.textContent = "Por favor ingresa un nombre válido.";
      msg.style.color = "red";
      return;
    }

    if (!emailValido(email)) {
      msg.textContent = "Por favor ingresa un correo válido.";
      msg.style.color = "red";
      return;
    }

    if (!mensajeValido(mensaje)) {
      msg.textContent = "Por favor escribe un mensaje más largo (mínimo 10 caracteres).";
      msg.style.color = "red";
      return;
    }

    msg.textContent = "Enviando...";
    msg.style.color = "black";

    setTimeout(() => {
      msg.textContent = "Mensaje enviado correctamente ✅";
      msg.style.color = "green";
      form.reset();
    }, 1200);
  });
}


