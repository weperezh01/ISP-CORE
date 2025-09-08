export default function calcularSubtotal(facturaData) {
    if (!facturaData || !facturaData.articulos) {
        return 0;
    }
    return facturaData.articulos.reduce((acc, item) => acc + (item.cantidad_articulo * item.precio_unitario), 0);
}
