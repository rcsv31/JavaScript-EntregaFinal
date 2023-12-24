const paises = [
    { "nombre": "espana", "impuesto": 0.21, "nombreMostrado": "España" },
    { "nombre": "francia", "impuesto": 0.20, "nombreMostrado": "Francia" },
    { "nombre": "portugal", "impuesto": 0.23, "nombreMostrado": "Portugal" },
    { "nombre": "italia", "impuesto": 0.22, "nombreMostrado": "Italia" }
];

const productos = [
    { "nombre": "cluedo", "precio": 29.99, "stock": 13 },
    { "nombre": "monopoly", "precio": 35.00, "stock": 20 },
    { "nombre": "risk", "precio": 38.95, "stock": 3 },
    { "nombre": "ajedrez", "precio": 9.99, "stock": 0 }
];

function formatoPrecio(precio, moneda) {
    return moneda === "usd" ? `$${precio.toFixed(2)}` : `${precio.toFixed(2).replace(".", ",")}€`;
}

async function actualizarTablaMoneda(moneda) {
    const listaProductos = document.getElementById("productList");
    listaProductos.innerHTML = '';

    for (let producto of productos) {
        const fila = document.createElement("tr");
        const celdaNombre = document.createElement("td");
        celdaNombre.textContent = producto.nombre;
        fila.appendChild(celdaNombre);

        let precio = producto.precio;
        if (moneda === "usd") {
            precio = precio * await obtenerTipoCambio("USD");
        }
        const celdaPrecio = document.createElement("td");
        celdaPrecio.textContent = formatoPrecio(precio, moneda);
        fila.appendChild(celdaPrecio);

        const celdaStock = document.createElement("td");
        celdaStock.textContent = producto.stock;
        fila.appendChild(celdaStock);

        listaProductos.appendChild(fila);
    }
}

async function calcularPrecio() {
    let nombreProductoSeleccionado = document.getElementById("searchBar").value;
    let productoSeleccionado = productos.find(producto => producto.nombre === nombreProductoSeleccionado);
    let pais = paises.find(p => p.nombre === document.getElementById("pais").value);
    let moneda = document.getElementById("moneda").value;
    let unidades = parseInt(document.getElementById("unidades").value, 10);
    let tasaDescuento = 1;

    if (productoSeleccionado.stock === 0) {
        document.getElementById("mensajeProductoAgotado").style.display = "block";
        return;
    } else {
        document.getElementById("mensajeProductoAgotado").style.display = "none";
    }

    if (unidades <= 0 || isNaN(unidades)) {
        document.getElementById("mensajeError").innerText = "Por favor, introduzca un número entero mayor o igual a 1";
        return;
    } else {
        document.getElementById("mensajeError").innerText = "";
    }

    let precio = productoSeleccionado.precio * unidades;
    let precioFinal;

    if (moneda === "usd") {
        precio = precio * await obtenerTipoCambio("USD");
        precioFinal = `$${precio.toFixed(2)}`;
    } else {
        precio = precio * await obtenerTipoCambio("EUR");
        precioFinal = `${precio.toFixed(2).replace(".", ",")}€`;
    }

    let impuesto = precio * pais.impuesto;
    let precioTotal = precio + impuesto;

    let codigoDescuento = document.getElementById("codigoDescuento").value;

    if (codigoDescuento === "Bienvenid@23") {
        tasaDescuento = 0.9;
        Swal.fire({
            title: '¡Descuento aplicado!',
            text: 'Consigue un 10% de descuento en tu compra usando el código Bienvenid@23',
            icon: 'success',
            confirmButtonText: 'Entendido'
        });
    } else if (codigoDescuento) {
        Swal.fire({
            title: '¡Código no válido!',
            text: 'El código introducido no es válido.',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    precioTotal *= tasaDescuento;

    if (moneda === "usd") {
        document.getElementById("resultado").innerText = `Precio: ${precioFinal} - Precio con IVA: $${precioTotal.toFixed(2)}`;
    } else {
        document.getElementById("resultado").innerText = `Precio: ${precioFinal} - Precio con IVA: ${precioTotal.toFixed(2).replace(".", ",")}€`;
    }
}

async function obtenerTipoCambio(monedaObjetivo) {
    try {
        const respuesta = await fetch(`https://v6.exchangerate-api.com/v6/8bb017627a2a8180152ca5fb/latest/${monedaObjetivo}`);
        const datos = await respuesta.json();
        return datos.conversion_rates.EUR;
    } catch (error) {
        console.error("Error al obtener el tipo de cambio:", error);
        return 1;
    }
}

function mostrarProductos() {
    const listaProductos = document.getElementById("productList");
    const filtro = document.getElementById("searchBar").value.toLowerCase();

    productos.forEach(producto => {
        let fila = document.getElementById(`fila-${producto.nombre}`);

        if (!fila) {
            fila = document.createElement("tr");
            fila.id = `fila-${producto.nombre}`;
            listaProductos.appendChild(fila);
        }

        if (producto.nombre.toLowerCase().includes(filtro) || !filtro) {
            fila.innerHTML = `
                <td>${producto.nombre}</td>
                <td>${producto.precio.toFixed(2).replace(".", ",")}€</td>
                <td>${producto.stock}</td>
            `;
        } else {
            fila.innerHTML = '';
        }
    });
}

document.getElementById("guardarProductoBtn").addEventListener("click", agregarProductoATabla);

function agregarProductoATabla() {
    const nombre = document.getElementById("nombreProductoNuevo").value;
    const precio = document.getElementById("precioProductoNuevo").value;
    const stock = document.getElementById("stockProductoNuevo").value;

    const fila = document.createElement("tr");
    const celdaNombre = document.createElement("td");
    celdaNombre.textContent = nombre;

    const celdaPrecio = document.createElement("td");
    celdaPrecio.textContent = formatoPrecio(parseFloat(precio), 'eur');

    const celdaStock = document.createElement("td");
    celdaStock.textContent = stock;

    fila.appendChild(celdaNombre);
    fila.appendChild(celdaPrecio);
    fila.appendChild(celdaStock);

    document.getElementById("productList").appendChild(fila);
    productos.push({
        "nombre": nombre,
        "precio": parseFloat(precio),
        "stock": parseInt(stock, 10)
    });

    actualizarListaAwesomplete();

    document.getElementById("nombreProductoNuevo").value = "";
    document.getElementById("precioProductoNuevo").value = "";
    document.getElementById("stockProductoNuevo").value = "";

    Swal.fire({
        title: 'Producto añadido',
        text: 'El producto se ha añadido correctamente.',
        icon: 'success',
        confirmButtonText: 'Entendido'
    });
}

actualizarListaAwesomplete();

function actualizarListaAwesomplete() {
    const listaProductos = productos.map(producto => producto.nombre).join(",");
    const searchBar = document.getElementById("searchBar");
    searchBar.setAttribute("data-list", listaProductos);
    new Awesomplete(searchBar);
}

function mostrarFormularioProducto() {
    document.getElementById("formularioProducto").style.display = "block";
}

function ocultarFormularioProducto() {
    document.getElementById("formularioProducto").style.display = "none";
}

document.getElementById('agregarProductoBtn').addEventListener('click', function() {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('formContainer').style.display = 'block';
});

document.getElementById('overlay').addEventListener('click', function() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('formContainer').style.display = 'none';
});

window.onload = async function() {
    await actualizarTablaMoneda("eur");
    document.getElementById("calcularPrecioBtn").addEventListener("click", calcularPrecio);
    document.getElementById("agregarProductoBtn").addEventListener("click", function() {
        const formularioProducto = document.getElementById("formularioProducto");
        formularioProducto.style.display = formularioProducto.style.display === "none" ? "block" : "none";
    });
};
