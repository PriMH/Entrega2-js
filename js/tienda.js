class Juego {
    constructor(id, nombre, precio, descripcion = '') {
        this.id = id;
        this.nombre = nombre;
        this.precio = parseFloat(precio);
        this.descripcion = descripcion;
    }
}


class ItemCarrito {
    constructor(juego, cantidad = 1) {
        this.juego = juego;
        this.cantidad = cantidad;
    }

    get subtotal() {
        return this.juego.precio * this.cantidad;
    }
}


class TiendaVideojuegos {
    constructor() {
        this.juegos = [];
        this.carrito = [];
        this.nextId = 1;
        this.init();
    }

    init() {
        this.cargarDatosIniciales();
        this.cargarDatosLocalStorage();
        this.setupEventListeners();
        this.renderJuegos();
        this.renderCarrito();
        this.actualizarEstadisticas();
    }

    cargarDatosIniciales() {
        
        const juegosPredeterminados = [
            new Juego(1, "FIFA 25", 70, "El simulador de fútbol más realista del año"),
            new Juego(2, "Minecraft", 30, "Construye y explora mundos infinitos"),
            new Juego(3, "Elden Ring", 60, "Una épica aventura de fantasía oscura"),
            new Juego(4, "GTA VI", 100, "La próxima evolución del crimen organizado")
        ];

        
        const juegosSaved = localStorage.getItem('tienda_juegos');
        if (!juegosSaved) {
            this.juegos = juegosPredeterminados;
            this.nextId = 5;
            this.guardarEnLocalStorage();
        }
    }

    setupEventListeners() {
        
        document.addEventListener('click', (e) => {
            const action = e.target.dataset.action;

            switch(action) {
                case 'agregar-carrito':
                    const juegoId = parseInt(e.target.dataset.juegoId);
                    this.agregarAlCarrito(juegoId);
                    break;

                case 'eliminar-juego':
                    const juegoEliminarId = parseInt(e.target.dataset.juegoId);
                    this.eliminarJuego(juegoEliminarId);
                    break;

                case 'remover-carrito':
                    const removerJuegoId = parseInt(e.target.dataset.juegoId);
                    this.removerDelCarrito(removerJuegoId);
                    break;

                case 'disminuir-cantidad':
                    const disminuirId = parseInt(e.target.dataset.juegoId);
                    const item1 = this.carrito.find(item => item.juego.id === disminuirId);
                    if (item1) this.cambiarCantidad(disminuirId, item1.cantidad - 1);
                    break;

                case 'aumentar-cantidad':
                    const aumentarId = parseInt(e.target.dataset.juegoId);
                    const item2 = this.carrito.find(item => item.juego.id === aumentarId);
                    if (item2) this.cambiarCantidad(aumentarId, item2.cantidad + 1);
                    break;

                case 'limpiar-catalogo':
                    this.limpiarCatalogo();
                    break;

                case 'restaurar-catalogo':
                    this.restaurarCatalogo();
                    break;

                case 'finalizar-compra':
                    this.finalizarCompra();
                    break;

                case 'vaciar-carrito':
                    this.vaciarCarrito();
                    break;

                case 'guardar-carrito':
                    this.guardarCarrito();
                    break;
            }
        });

        
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('cantidad-input')) {
                const juegoId = parseInt(e.target.dataset.juegoId);
                const nuevaCantidad = parseInt(e.target.value);
                this.cambiarCantidad(juegoId, nuevaCantidad);
            }
        });

        
        const formAgregar = document.getElementById('form-agregar-juego');
        if (formAgregar) {
            formAgregar.addEventListener('submit', (e) => {
                e.preventDefault();
                this.agregarNuevoJuego();
            });
        }

        
        const nombreInput = document.getElementById('nuevo-nombre');
        const precioInput = document.getElementById('nuevo-precio');

        if (nombreInput) {
            nombreInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.agregarNuevoJuego();
                }
            });
        }

        if (precioInput) {
            precioInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.agregarNuevoJuego();
                }
            });
        }
    }

    agregarNuevoJuego() {
        const nombre = document.getElementById('nuevo-nombre').value.trim();
        const precio = document.getElementById('nuevo-precio').value;
        const descripcion = document.getElementById('nueva-descripcion').value.trim();

        if (!nombre || !precio) {
            this.mostrarNotificacion('Por favor completa nombre y precio', 'error');
            return;
        }

        if (precio <= 0) {
            this.mostrarNotificacion('El precio debe ser mayor a 0', 'error');
            return;
        }

        const nuevoJuego = new Juego(this.nextId++, nombre, precio, descripcion);
        this.juegos.push(nuevoJuego);

        this.guardarEnLocalStorage();
        this.renderJuegos();
        this.actualizarEstadisticas();
        this.limpiarFormulario();
        this.mostrarNotificacion(`"${nombre}" agregado al catálogo`, 'success');
    }

    limpiarFormulario() {
        document.getElementById('nuevo-nombre').value = '';
        document.getElementById('nuevo-precio').value = '';
        document.getElementById('nueva-descripcion').value = '';
    }

    limpiarCatalogo() {
        if (this.juegos.length === 0) {
            this.mostrarNotificacion('El catálogo ya está vacío', 'info');
            return;
        }

        this.juegos = [];
        this.carrito = [];
        this.nextId = 1;
        this.guardarEnLocalStorage();
        this.renderJuegos();
        this.renderCarrito();
        this.actualizarEstadisticas();
        this.mostrarNotificacion('Catálogo limpiado', 'success');
    }

    restaurarCatalogo() {
        this.cargarDatosIniciales();
        this.guardarEnLocalStorage();
        this.renderJuegos();
        this.actualizarEstadisticas();
        this.mostrarNotificacion('Catálogo restaurado', 'success');
    }

    agregarAlCarrito(juegoId) {
        const juego = this.juegos.find(j => j.id === juegoId);
        if (!juego) return;

        const itemExistente = this.carrito.find(item => item.juego.id === juegoId);

        if (itemExistente) {
            itemExistente.cantidad++;
            this.mostrarNotificacion(`Cantidad de "${juego.nombre}" aumentada`, 'info');
        } else {
            this.carrito.push(new ItemCarrito(juego));
            this.mostrarNotificacion(`"${juego.nombre}" agregado al carrito`, 'success');
        }

        this.guardarEnLocalStorage();
        this.renderCarrito();
        this.actualizarEstadisticas();
    }

    removerDelCarrito(juegoId) {
        const index = this.carrito.findIndex(item => item.juego.id === juegoId);
        if (index !== -1) {
            const nombreJuego = this.carrito[index].juego.nombre;
            this.carrito.splice(index, 1);
            this.guardarEnLocalStorage();
            this.renderCarrito();
            this.actualizarEstadisticas();
            this.mostrarNotificacion(`"${nombreJuego}" eliminado del carrito`, 'info');
        }
    }

    cambiarCantidad(juegoId, nuevaCantidad) {
        const item = this.carrito.find(item => item.juego.id === juegoId);
        if (item && nuevaCantidad > 0) {
            item.cantidad = parseInt(nuevaCantidad);
            this.guardarEnLocalStorage();
            this.renderCarrito();
            this.actualizarEstadisticas();
        } else if (nuevaCantidad <= 0) {
            this.removerDelCarrito(juegoId);
        }
    }

    eliminarJuego(juegoId) {
        const index = this.juegos.findIndex(j => j.id === juegoId);
        if (index !== -1) {
            const nombreJuego = this.juegos[index].nombre;

            
            this.juegos.splice(index, 1);

            
            this.carrito = this.carrito.filter(item => item.juego.id !== juegoId);

            this.guardarEnLocalStorage();
            this.renderJuegos();
            this.renderCarrito();
            this.actualizarEstadisticas();
            this.mostrarNotificacion(`"${nombreJuego}" eliminado del catálogo`, 'info');
        }
    }

    vaciarCarrito() {
        if (this.carrito.length === 0) {
            this.mostrarNotificacion('El carrito ya está vacío', 'info');
            return;
        }

        this.carrito = [];
        this.guardarEnLocalStorage();
        this.renderCarrito();
        this.actualizarEstadisticas();
        this.mostrarNotificacion('Carrito vaciado', 'success');
    }

    finalizarCompra() {
        if (this.carrito.length === 0) {
            this.mostrarNotificacion('El carrito está vacío', 'error');
            return;
        }

        const total = this.calcularTotal();
        const cantidadItems = this.carrito.reduce((sum, item) => sum + item.cantidad, 0);

        
        this.mostrarNotificacion(`¡Compra finalizada! Total: $${total.toFixed(2)} (${cantidadItems} items)`, 'success');

        
        this.guardarHistorialCompra();


        this.vaciarCarrito();
    }

    guardarCarrito() {
        if (this.carrito.length === 0) {
            this.mostrarNotificacion('No hay nada que guardar', 'info');
            return;
        }

        this.mostrarNotificacion('Carrito guardado para después', 'success');
        // El carrito ya se guarda automáticamente en localStorage
    }

    guardarHistorialCompra() {
        const compra = {
            fecha: new Date().toLocaleString(),
            items: this.carrito.map(item => ({
                nombre: item.juego.nombre,
                precio: item.juego.precio,
                cantidad: item.cantidad,
                subtotal: item.subtotal
            })),
            total: this.calcularTotal()
        };

        let historial = JSON.parse(localStorage.getItem('tienda_historial') || '[]');
        historial.push(compra);
        localStorage.setItem('tienda_historial', JSON.stringify(historial));
    }

    calcularTotal() {
        return this.carrito.reduce((total, item) => total + item.subtotal, 0);
    }

    renderJuegos() {
        const container = document.getElementById('juegos-container');

        if (this.juegos.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <h3>No hay juegos disponibles</h3>
                    <p>Agrega algunos juegos al catálogo</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.juegos.map(juego => `
            <div class="juego-card">
                <div class="juego-nombre">${juego.nombre}</div>
                <div class="juego-precio">$${juego.precio.toFixed(2)}</div>
                <div class="juego-descripcion">${juego.descripcion || 'Sin descripción disponible'}</div>
                <button class="btn" data-action="agregar-carrito" data-juego-id="${juego.id}">
                    🛒 Agregar al Carrito
                </button>
                <button class="btn btn-danger btn-small" data-action="eliminar-juego" data-juego-id="${juego.id}">
                    🗑️ Eliminar
                </button>
            </div>
        `).join('');
    }

    renderCarrito() {
        const container = document.getElementById('carrito-items');
        const totalElement = document.getElementById('total-carrito');

        if (this.carrito.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Carrito vacío</h3>
                    <p>¡Agrega algunos juegos increíbles!</p>
                </div>
            `;
            totalElement.textContent = '0.00';
            return;
        }

        container.innerHTML = this.carrito.map(item => `
            <div class="carrito-item">
                <div class="carrito-item-header">
                    <div class="carrito-item-nombre">${item.juego.nombre}</div>
                    <div class="carrito-item-precio">$${item.juego.precio.toFixed(2)}</div>
                </div>

                <div class="cantidad-controls">
                    <button class="btn btn-small" data-action="disminuir-cantidad" data-juego-id="${item.juego.id}">-</button>
                    <input type="number" value="${item.cantidad}" min="1" class="cantidad-input" data-juego-id="${item.juego.id}">
                    <button class="btn btn-small" data-action="aumentar-cantidad" data-juego-id="${item.juego.id}">+</button>
                    <button class="btn btn-danger btn-small" data-action="remover-carrito" data-juego-id="${item.juego.id}">
                        🗑️ Quitar
                    </button>
                </div>

                <div class="subtotal">
                    Subtotal: ${item.subtotal.toFixed(2)}
                </div>
            </div>
        `).join('');

        totalElement.textContent = this.calcularTotal().toFixed(2);
    }

    actualizarEstadisticas() {
        document.getElementById('total-juegos').textContent = this.juegos.length;
        document.getElementById('items-carrito').textContent =
            this.carrito.reduce((sum, item) => sum + item.cantidad, 0);

        const valorInventario = this.juegos.reduce((sum, juego) => sum + juego.precio, 0);
        document.getElementById('valor-inventario').textContent = valorInventario.toFixed(0);
    }

    guardarEnLocalStorage() {
        try {
            localStorage.setItem('tienda_juegos', JSON.stringify(this.juegos));
            localStorage.setItem('tienda_carrito', JSON.stringify(this.carrito));
            localStorage.setItem('tienda_nextId', this.nextId.toString());
        } catch (error) {
            console.log('LocalStorage no disponible en este entorno');
        }
    }

    cargarDatosLocalStorage() {
        try {
            const juegosSaved = localStorage.getItem('tienda_juegos');
            const carritoSaved = localStorage.getItem('tienda_carrito');
            const nextIdSaved = localStorage.getItem('tienda_nextId');

            if (juegosSaved) {
                const juegosParsed = JSON.parse(juegosSaved);
                this.juegos = juegosParsed.map(j => new Juego(j.id, j.nombre, j.precio, j.descripcion));
            }

            if (carritoSaved) {
                const carritoData = JSON.parse(carritoSaved);
                this.carrito = carritoData.map(item => {
                    const juego = new Juego(item.juego.id, item.juego.nombre, item.juego.precio, item.juego.descripcion);
                    return new ItemCarrito(juego, item.cantidad);
                });
            }

            if (nextIdSaved) {
                this.nextId = parseInt(nextIdSaved);
            }
        } catch (error) {
            console.log('Error cargando datos de localStorage:', error);
        }
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${tipo}`;
        notification.textContent = mensaje;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}


let tienda;
document.addEventListener('DOMContentLoaded', () => {
    tienda = new TiendaVideojuegos();
});