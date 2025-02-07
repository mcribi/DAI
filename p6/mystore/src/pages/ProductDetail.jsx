import React from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

const ProductDetail = () => {
  const { id } = useParams();
  const { data: product, error, isLoading } = useSWR(`https://fakestoreapi.com/products/${id}`, fetcher);

  if (isLoading) return <p>Cargando detalles del producto...</p>;
  if (error) return <p>Error al cargar los detalles del producto.</p>;

  return (
  <div className="container mx-auto px-4 py-8 ml-4">
    <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">{product.title}</h1>
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
      <img
        src={product.image}
        alt={product.title}
        className="w-full md:w-1/2 lg:w-1/3 object-contain"
      />
      <div className="flex-1">
        <p className="text-gray-600 mb-4">{product.description}</p>
        <p className="text-2xl font-bold text-gray-700 mb-6">
          Price: ${product.price}
        </p>
        <button className="btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
          Add to Cart
        </button>
      </div>
    </div>
  </div>
);


};

export default ProductDetail;

