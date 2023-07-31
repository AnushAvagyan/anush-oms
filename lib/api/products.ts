async function getProducts() {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/products', {
      method: 'GET',
    });

    const products = await res.json();
    return products;
  } catch (err) {
    throw err;
  }
}

async function getProductById(id?: string | number) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
      {
        method: 'GET',
      }
    );

    const product = await res.json();
    return product;
  } catch (err) {
    throw err;
  }
}

async function deleteProduct(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
      {
        method: 'DELETE',
      }
    );
    return res;
  } catch (err) {
    console.log('Failed to delete product. Error: ', err);
    throw err;
  }
}

export { getProducts, getProductById, deleteProduct };
