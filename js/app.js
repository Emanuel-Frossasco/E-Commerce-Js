document.addEventListener("DOMContentLoaded", (e) => {
    fetchData();
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito()
    }
});
const listaProductos = document.querySelector("#lista-productos");
const footerCarrito = document.querySelector("#footer-carrito");
const itemsCarrito = document.querySelector("#items");
let carrito = [];

const fetchData = async () => {
    try {
        const res = await fetch("productos.json");
        const data = await res.json();
        pintarCarrito(data);
        eventoBotones(data);
    }catch (error){
        console.log(error);
    }
};

const pintarCarrito = (data) => {
    const template = document.querySelector("#template-producto").content;
    const fragment = new DocumentFragment();
    data.forEach((producto) => {
        template.querySelector("img").setAttribute("src", producto.thumbnailUrl);
        template.querySelector("h5").textContent = producto.title;
        template.querySelector(".card-text span").textContent = producto.precio;
        template.querySelector("button").setAttribute("data-id", producto.id);
        const clone = template.cloneNode(true);
        fragment.appendChild(clone);
    });
    listaProductos.appendChild(fragment);
    pintarEnCarrito();
    localStorage.setItem('carrito', JSON.stringify(carrito))
};

const eventoBotones = (data) => {
    const btnAgregar = document.querySelectorAll(".btn-dark");
    btnAgregar.forEach((btn) => {
        btn.addEventListener("click", () => {
        //Busco el producto en la data
            const [producto] = data.filter(
            (item) => item.id === parseInt(btn.dataset.id)
            );
        //creo un producto para el carrito
        const productoCarrito = {
            id: producto.id,
            title: producto.title,
            cantidad: 1,
            precioTotal: producto.precio
        }
        const exiteEnCarrito = carrito.some(item => item.id === productoCarrito.id)
        if (exiteEnCarrito) {
            const productos = carrito.map(item => {
                if (item.id === productoCarrito.id) {
                    item.cantidad++
                    item.precioTotal = item.precioTotal + productoCarrito.precioTotal
                    return item;
                }else{
                return item;
                }
            })
        carrito = [...productos]
        }else{
        carrito.push(productoCarrito);
        }
        pintarEnCarrito();
        });
    });
};

const totalFooter = () => {
    if(carrito.length === 0) {
        footerCarrito.innerHTML = `<th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>`
        return
    }
    const nProductos = carrito.reduce((a, b) => ({ cantidad: a.cantidad + b.cantidad }))
    const nPrecio = carrito.reduce((a, b) => ({ precioTotal: a.precioTotal + b.precioTotal }))
    //Limpio el elemento ya que necesito reemplazar su contenido
    footerCarrito.innerHTML = ''
    const template = document.querySelector("#template-footer").content;
    const fragment = document.createDocumentFragment();

    template.querySelectorAll('td')[0].textContent = nProductos.cantidad
    template.querySelector('.font-weight-bold span').textContent = nPrecio.precioTotal

    const clone = template.cloneNode(true)
    fragment.appendChild(clone)
    footerCarrito.appendChild(fragment)

    const vaciarCarrito = document.querySelector('#vaciar-carrito')
    vaciarCarrito.addEventListener('click', () => {
        carrito = []
        pintarEnCarrito()
    })
    const comprarCarrito = document.querySelector('#compar-carrito')
    comprarCarrito.addEventListener('click', () => {
        carrito = [];
        pintarEnCarrito();
    })
}

const pintarEnCarrito = () => {
    //Limpio el elemento
    itemsCarrito.innerHTML = ''
    const template = document.querySelector("#template-carrito").content;
    const fragment = document.createDocumentFragment();
    carrito.forEach(item => {
        template.querySelector("th").textContent = item.id;
        template.querySelectorAll("td")[0].textContent = item.title;
        template.querySelectorAll("td")[1].textContent = item.cantidad;
        template.querySelector('.btn-danger').setAttribute('data-id', item.id)
        template.querySelector('.btn-info').setAttribute('data-id', item.id)
        template.querySelectorAll("td")[3].textContent = item.precioTotal;
        const clone = template.cloneNode(true);
        fragment.appendChild(clone);
    })
    itemsCarrito.appendChild(fragment);
    borrarItemCarrito();
    totalFooter();
};

const borrarItemCarrito = () => {
    const btnAgregar = document.querySelectorAll('#items .btn-info')
    const btnEliminar = document.querySelectorAll('#items .btn-danger')
    btnAgregar.forEach(btn => {
        btn.addEventListener('click', () => {
            const arrayFiltrado = carrito.map(item => {
                if (item.id === parseInt(btn.dataset.id)) {
                    item.precioTotal = item.precioTotal + item.precioTotal/item.cantidad
                    item.cantidad++
                    return item;
                }else{
                return item;
                }
            })
        carrito = [...arrayFiltrado]
        pintarEnCarrito()
        totalFooter()
        })
    })
    btnEliminar.forEach(btn => {
        btn.addEventListener('click', () => {
            const arrayFiltrado = carrito.filter(item => {
                if(item.id === parseInt(btn.dataset.id)){
                    item.precioTotal = item.precioTotal - item.precioTotal/item.cantidad
                    item.cantidad--
                    if(item.cantidad === 0){
                        return
                    }
                    return item;
                }else{
                return item;
                }
            })
        carrito = [...arrayFiltrado]
        pintarEnCarrito()
        totalFooter()
        })
    })
}