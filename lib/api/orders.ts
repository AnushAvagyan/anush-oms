async function getOrders() {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/orders', {
      method: 'GET',
    });

    const orders = await res.json();
    return orders;
  } catch (err) {
    console.log('Failed to get orders. Error: ', err);
    throw err;
  }
}

async function getOrder(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`, {
      method: 'GET',
    });

    const order = await res.json();
    return order;
  } catch (err) {
    console.log('Failed to get order. Error: ', err);
    throw err;
  }
}

async function deleteOrder(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`, {
      method: 'DELETE',
    });
    return res;
  } catch (err) {
    console.log('Failed to delete order. Error: ', err);
    throw err;
  }
}

export { getOrders, getOrder, deleteOrder };
