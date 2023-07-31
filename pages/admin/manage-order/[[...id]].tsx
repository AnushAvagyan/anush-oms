import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CreateUpdateOrder, Order, Product } from '@/lib/custom-types';
import { getCategories, getOrder, getProducts } from '@/lib/api';
import { NextPageContext } from 'next';
import DeleteIcon from '@mui/icons-material/Delete';

export async function getServerSideProps(ctx: NextPageContext) {
  const { id } = ctx.query;
  const categories = (await getCategories()) || null;
  const products = await getProducts();
  if (id) {
    const order = await getOrder(typeof id === 'string' ? id : id[0]);

    return {
      props: {
        order,
        categories: categories.items,
        allProducts: products.items,
        isUpdate: true,
      },
    };
  }
  return {
    props: {
      categories: categories.items,
      allProducts: products.items,
      isUpdate: false,
    },
  };
}

function getDisabled(val: boolean) {
  if (val) return { disabled: true };
  return {};
}

export default function AddOrder(props: any) {
  const router = useRouter();

  const [isFormComplete, setIsFormComplete] = useState(false);
  const [isUpdatePage, setIsUpdatePage] = useState(false);
  const [status, setStatus] = useState('');
  const [trackingCompany, setTrackingCompany] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderProducts, setOrderProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const validateProducts = (products: Product[]) => {
    return products.every((product) => product.id && product.quantity);
  };

  useEffect(() => {
    if (router.query?.id?.length) {
      setIsUpdatePage(true);
      const getOrderById = async (id: string) => {
        const order = await getOrder(id);
        setStatus(order.status);
        setOrderProducts(order.products);
        setTrackingCompany(order.trackingCompany);
        setTrackingNumber(order.trackingNumber);
      };
      getOrderById(router.query.id[0]).catch((err) => console.log(err));
    } else {
      setAllProducts(props.allProducts);
    }
  }, []);

  useEffect(() => {
    if (
      orderProducts &&
      orderProducts.length &&
      validateProducts(orderProducts)
    ) {
      setIsFormComplete(true);
    } else {
      setIsFormComplete(false);
    }
  }, [orderProducts]);

  useEffect(() => {
    console.log('Set order products', orderProducts);
  }, [orderProducts]);

  async function handleSubmit() {
    if (isFormComplete) {
      let url;
      if (isUpdatePage) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/orders/${
          router.query?.id?.length ? router.query.id[0] : ''
        }`;
      } else {
        url = process.env.NEXT_PUBLIC_API_URL + '/orders';
      }

      const order: CreateUpdateOrder = {
        status: status || 'processing',
        shipping: { trackingCompany, trackingNumber },
      };
      let options = {
        method: isUpdatePage ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          isUpdatePage ? order : { ...order, products: orderProducts }
        ),
      };
      try {
        const response = await fetch(url, options);

        await response.json().then((data) => {
          if (!data.error) {
            router.push(
              {
                pathname: '/admin/orders',
                query: isUpdatePage
                  ? {
                      success: true,
                      successMessage: 'Order was successfully updated',
                    }
                  : {
                      success: true,
                      successMessage: 'Order was successfully created',
                    },
              },
              '/admin/orders'
            );
          } else {
            throw data.error;
          }
        });
      } catch (err) {
        console.log(err);
        router.push(
          {
            pathname: '/admin/orders',
            query: { error: JSON.stringify(err) },
          },
          '/admin/orders'
        );
      }
    } else {
      console.log('Incomplete Form');
    }
  }

  function getOrderTotal(products: Product[]) {
    let amount = 0;
    products.forEach((product) => {
      if (product.price && product.quantity) {
        amount += Number(product.price) * Number(product.quantity);
      }
    });
    return amount;
  }

  function handleOrderProductsChange(
    product: Product,
    action?: string,
    quantity?: number
  ) {
    if (orderProducts.length) {
      let index =
        orderProducts && orderProducts.length
          ? orderProducts.findIndex((p: Product) => p.id === product.id)
          : -1;

      if (index >= 0) {
        if (action === 'remove') {
          setOrderProducts(
            orderProducts.filter((value: any, i: any) => i !== index)
          );
        } else {
          // console.log('here', quantity);
          const updatedProduct = {
            ...orderProducts[index as number],
            quantity: quantity,
          };
          const updated = JSON.parse(JSON.stringify(orderProducts));
          updated.splice(index, 1, updatedProduct);

          setOrderProducts(updated);
        }
      } else {
        setOrderProducts([
          ...orderProducts,
          {
            ...product,
            quantity,
          },
        ]);
      }
    } else {
      setOrderProducts([
        {
          ...product,
          quantity,
        },
      ]);
    }
  }

  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1000,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  return (
    <div className="add-product-panel">
      <header>
        <h1>{isUpdatePage ? 'Update Order' : 'Create Order'}</h1>
      </header>
      <div className="product-properties">
        <TextField
          id="trackingCompany"
          label="Tracking Company"
          value={trackingCompany}
          variant="outlined"
          onChange={(e) => {
            setTrackingCompany(e.target.value);
          }}
        />
        <TextField
          id="trackingNumber"
          label="Tracking Number"
          value={trackingNumber}
          variant="outlined"
          onChange={(e) => {
            setTrackingNumber(e.target.value);
          }}
        />
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            id="active"
            label="Status"
            value={status || 'processing'}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
          </Select>
        </FormControl>
        {!isUpdatePage ? (
          <>
            <h2> Add Products </h2>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              options={props.allProducts.map((p: Product) => {
                return {
                  label: p.name,
                };
              })}
              sx={{ width: 300 }}
              renderInput={(params) => (
                <TextField {...params} label="Search products" />
              )}
              onChange={(event: any, newValue: any) => {
                const newProduct = allProducts.find(
                  (p: Product) => p.name === newValue?.label
                );
                if (newProduct) {
                  handleOrderProductsChange(newProduct);
                }
              }}
            />
            {!!orderProducts.length && (
              <div className="order-products-panel">
                <div className="products">
                  <header>
                    <div className="product-id">Product ID</div>
                    <div className="product-name">Product Name</div>
                    <div className="price">Price</div>
                    <div className="inventory">Inventory</div>
                    <div className="quantity">Quantity</div>
                  </header>{' '}
                </div>
              </div>
            )}
            {orderProducts?.map((product: Product) => (
              <div className="order-products-panel">
                <div className="products">
                  <div className="product" key={product.id}>
                    <div className="product-id">{product.id}</div>
                    <div className="product-name">{product.name}</div>
                    <div className="price">
                      {Number(product.price).toFixed(2)}$
                    </div>
                    <div className="inventory">{product.inventory}</div>
                    <div className="quantity">
                      {
                        <TextField
                          id="product-quantity"
                          label=""
                          value={product.quantity}
                          variant="outlined"
                          onChange={(e) => {
                            handleOrderProductsChange(
                              product,
                              'add',
                              Number(e.target.value)
                            );
                          }}
                          type="number"
                          InputProps={{
                            inputProps: { min: 0, max: product.inventory },
                          }}
                        />
                      }
                    </div>

                    <div className="edit">
                      <Button
                        variant="contained"
                        aria-label="delete"
                        onClick={() => {
                          handleOrderProductsChange(product, 'remove');
                        }}
                      >
                        <DeleteIcon />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <h2> Order items </h2>
            {orderProducts.map((product: Product) => (
              <div className="order-products-panel">
                <div className="products">
                  <header>
                    <div className="product-name">Product Name</div>
                    <div className="description">Description</div>
                    <div className="price">Price</div>
                    {/* <div className="inventory">Inventory</div> */}
                    <div className="category">Category</div>
                    <div className="quantity">Quantity</div>
                    <div className="total">Total</div>
                  </header>
                  <div className="product" key={product.id}>
                    <div className="product-name">{product.name}</div>
                    <div className="description">{product.description}</div>
                    <div className="price">
                      {Number(product.price).toFixed(2)}$
                    </div>
                    {/* <div className="inventory">{product.inventory}</div> */}
                    <div className="category">{product.category}</div>
                    <div className="quantity">{product.quantity}</div>
                    <div className="total">
                      {getOrderTotal([product]).toFixed(2)}$
                    </div>
                  </div>
                </div>
              </div>
            ))}{' '}
          </>
        )}
        <div>
          <h2 className="total">
            Order Total:{' '}
            {!!(orderProducts && orderProducts.length)
              ? getOrderTotal(orderProducts).toFixed(2)
              : 0}
            $
          </h2>{' '}
        </div>

        <Button
          type="submit"
          onClick={handleSubmit}
          {...getDisabled(!isFormComplete)}
        >
          {isUpdatePage ? 'Update Order' : 'Create order'}
        </Button>
      </div>
    </div>
  );
}
