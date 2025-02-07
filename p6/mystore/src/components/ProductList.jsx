import React from 'react';
import { useProducts } from '../api/products';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const { products, isLoading, error } = useProducts();

  if (isLoading) return <p>Cargando productos...</p>;
  if (error) return <p>Error al cargar productos.</p>;

  return (
  <div className="container mx-auto px-4 py-8 ml-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <div
          key={product.id}
          className="card shadow-lg rounded-xl overflow-hidden border bg-white"
        >
          <figure className="h-56 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.title}
              className="h-full object-contain p-4"
            />
          </figure>
          <div className="p-4 flex flex-col justify-between h-full">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              {product.title}
            </h2>
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-gray-700">
                ${product.price}
              </p>
              <Link
                to={`/product/${product.id}`}
                className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Buy Now
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);


};

export default ProductList;

