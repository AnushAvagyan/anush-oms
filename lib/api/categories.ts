async function getCategories() {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/categories', {
      method: 'GET',
    });
    const categories = res.status < 300 ? await res.json() : null;
    return categories;
  } catch (err) {
    console.log('Failed to get categories. Error: ', err);
    return [];
  }
}

export { getCategories };
