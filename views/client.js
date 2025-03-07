const socket = io();

let fileURL;

//  Formularios
const formLogin = document.querySelector("#formLogin");
const formContentChat = document.querySelector(".body-chat");
const formShowUsers = document.querySelector("#formShowUsers");
const formChatGrupal = document.querySelector("#formChatGrupal");

//  Textbox's
const txtUserNickName = document.querySelector("#userNickName");
const txtUserMessage = document.querySelector("#userMessage");

//  File - Image
const userFile = document.querySelector("#userFile");

//  Button's
const btnrRegisterUser = document.querySelector("#registerUser");
const btnSendMessage = document.querySelector("#sendMessage");
const btnSendFile = document.querySelector("#sendFile");
const btnToggleOptions = document.querySelector("#toggleOptions");
const optionsContainer = document.querySelector("#optionsContainer");
const btnClearMessages = document.querySelector("#clearMessages");

//  Print
const printUsersActive = document.querySelector("#usersActive");
const printMessages = document.querySelector("#messages");

formContentChat.style.display = "none";
formShowUsers.style.display = "none";
formChatGrupal.style.display = "none";

socket.on("login", () => {
  alert(
    "¡Bienvenido " +
      txtUserNickName.value.trim() +
      "!\nRecuerda, respetar a los demás usuarios."
  );
  formLogin.style.display = "none";
  formContentChat.style.display = "flex";
  formShowUsers.style.display = "block";
  formChatGrupal.style.display = "block";
});

socket.on("userExists", () => {
  alert(
    "El nickname: " +
      txtUserNickName.value.trim() +
      " ya está en uso, intenta con otro."
  );
  txtUserNickName.value = "";
});

socket.on("activeSessions", (users) => {
  printUsersActive.innerHTML = "";
  for (const user in users) {
    printUsersActive.insertAdjacentHTML("beforeend", `<li>${user}</li>`);
  }
});

("sendMessage", ({ message, user, image }) => {
  printMessages.insertAdjacentHTML(
    "beforeend",
    `<div class="message frnd_message"><p>${message}<br /><span>${user}</span></p></div>`
  );
  if (image !== undefined) {
    const imagen = document.createElement("img");
    imagen.src = image;
    printMessages.appendChild(imagen);
  }socket.on
  printMessages.scrollTop = printMessages.scrollHeight;
});

txtUserNickName.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    btnrRegisterUser.click();
  }
});

btnrRegisterUser.addEventListener("click", () => {
  if (txtUserNickName.value.trim() != "") {
    let username = txtUserNickName.value.trim();
    socket.emit("register", username);
  }
});

btnSendMessage.addEventListener("click", () => {
    if (txtUserMessage.value.trim() === "") return; // No enviar mensajes vacíos

    let message = txtUserMessage.value.trim();
    let isPrivate = message.startsWith("-private:");
    let selectUser = null;

    if (isPrivate) {
        const parts = message.split(" ");
        selectUser = parts[1];
        message = message.substr(selectUser.length + 10); // Extrae el mensaje real
    }

    // Enviar el mensaje al servidor (público o privado)
    if (isPrivate) {
        socket.emit("sendMessagesPrivate", { message, image: fileURL, selectUser });
    } else {
        socket.emit("sendMessage", { message, image: fileURL });
    }

    // Limpiar input y resetear imagen adjunta
    txtUserMessage.value = "";
    fileURL = undefined;
});



txtUserMessage.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    if (fileURL != undefined) {
      if (txtUserMessage.value.startsWith("-private:")) {
        const selectUser = txtUserMessage.value.split(" ")[1];
        const message = txtUserMessage.value.substr(selectUser.length + 10);
        socket.emit("sendMessagesPrivate", {
          message,
          image: fileURL,
          selectUser,
        });
      } else {
        socket.emit("sendMessage", {
          message: txtUserMessage.value.trim(),
          image: fileURL,
        });
      }
    } else {
      if (txtUserMessage.value.trim() != "") {
        if (txtUserMessage.value.startsWith("-private:")) {
          const selectUser = txtUserMessage.value.split(" ")[1];
          const message = txtUserMessage.value.substr(selectUser.length + 10);
          socket.emit("sendMessagesPrivate", {
            message,
            image: fileURL,
            selectUser,
          });
        } else {
          socket.emit("sendMessage", {
            message: txtUserMessage.value.trim(),
            image: fileURL,
          });
        }
      }
    }
    txtUserMessage.value = "";
    fileURL = undefined;
  }

  printMessages.scrollTop = printMessages.scrollHeight;
});

btnSendFile.addEventListener("click", () => {
  userFile.click();
});

userFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onloadend = () => {
    fileURL = reader.result;
  };
  reader.readAsDataURL(file);
  fileURL
    ? alert("Error al adjuntar, seleccione nuevamente.")
    : alert("Foto adjunta, lista para enviar.");
});

socket.on("sendMessage", ({ message, user, image }) => {
    printMessages.insertAdjacentHTML(
        "beforeend",
        `<div class="message frnd_message"><p>${message}<br /><span>${user}</span></p></div>`
    );

    if (image) {
        const img = document.createElement("img");
        img.src = image;
        printMessages.appendChild(img);
    }

    printMessages.scrollTop = printMessages.scrollHeight;
});

socket.on("loadMessages", (messages) => {
    console.log("📥 Cargando mensajes guardados:", messages); // Depuración en consola

    messages.forEach(({ user, message, image }) => {
        printMessages.insertAdjacentHTML(
            "beforeend",
            `<div class="message frnd_message"><p>${message}<br /><span>${user}</span></p></div>`
        );

        if (image) {
            const img = document.createElement("img");
            img.src = image;
            printMessages.appendChild(img);
        }
    });

    printMessages.scrollTop = printMessages.scrollHeight; // Desplazar hacia abajo
});

// Alternar la visibilidad del menú de opciones (botón de borrar)
btnToggleOptions.addEventListener("click", () => {
  if (optionsContainer.style.display === "none") {
      optionsContainer.style.display = "block";
  } else {
      optionsContainer.style.display = "none";
  }
});

// Función para borrar los mensajes
btnClearMessages.addEventListener("click", () => {
  if (confirm("⚠️ ¿Seguro que quieres borrar todos los mensajes? Esta acción no se puede deshacer.")) {
      console.log("📤 Enviando evento 'clearMessages' al servidor...");
      socket.emit("clearMessages"); // Enviar evento al servidor
      optionsContainer.style.display = "none"; // Ocultar después de usarlo
  }
});

// Escuchar evento del servidor para limpiar el chat en todos los clientes
socket.on("messagesCleared", () => {
  console.log("✅ Mensajes eliminados. Recibido 'messagesCleared' del servidor.");
  printMessages.innerHTML = ""; // Vaciar mensajes en el cliente
  alert("🗑️ Todos los mensajes han sido eliminados.");
});