import { Box, Button, Link, Modal, Snackbar, Typography } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/router';
import { getOrders, deleteOrder, getCategories } from '@/lib/api';
import { NextPageContext } from 'next';
import { Order, Product } from '@/lib/custom-types';
import { useEffect, useState } from 'react';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import React from 'react';
import ConfirmDialog from './utils/ComfirmDialog';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export async function getServerSideProps(ctx: NextPageContext) {
  const orders = await getOrders();
  const categories = await getCategories();
  console.log('orders', orders, categories);

  return {
    props: { orders: orders.items, categories },
  };
}

export default function Orders(props: any) {
  const router = useRouter();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError]: any = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderProducts, setOrderProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const handleOpen = (products: Product[]) => {
    setOrderProducts(products);
    setOpen(true);
  };
  const handleClose = () => {
    setOrderProducts([]);
    setOpen(false);
  };

  useEffect(() => {
    if (router.query?.success) {
      setToastOpen(true);
      setToastMessage(
        router.query.successMessage
          ? (router.query.successMessage as string)
          : 'Success'
      );
    }
    if (router.query?.error) {
      setToastOpen(true);
      setToastError(router.query?.error);
    }
  }, [router.query?.success, router.query?.error]);

  function editOrder(id: string) {
    router.push({
      pathname: `/admin/manage-order/${id}`,
    });
  }

  function getOrderTotal(products: Product[]) {
    let amount = 0;
    products.forEach((product) => {
      amount += Number(product.price) * Number(product.quantity);
    });
    return amount;
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
    overflow: 'scroll',
  };

  return (
    <div id="products-page">
      <div className="current-products-panel">
        <header>
          <h1 style={{ paddingRight: '900px' }}>Order List</h1>

          <Button
            variant="contained"
            onClick={() => {
              router.push('/admin/manage-order');
            }}
          >
            <AddCircleRoundedIcon /> Create new
          </Button>
        </header>
        <div className="products">
          <header>
            <div className="order">Order ID</div>
            <div className="description">Status</div>
            <div className="products">Products</div>
            <div className="total">Order Amount</div>
            <div className="tracking-company">Tracking Company</div>
            <div className="tracking-number">Tracking Number</div>
            <div className="created">Order Date</div>
            <div className="updated">Last Updated</div>
          </header>
          {!props.orders.length ? (
            <div className="default-text">
              {' '}
              No orders to display.
              <Button
                variant="contained"
                onClick={() => {
                  router.push('/admin/manage-order');
                }}
              >
                <AddCircleRoundedIcon /> Create new order
              </Button>
            </div>
          ) : (
            props.orders.map((order: Order) => (
              <div className="product" key={order.id}>
                <div className="order">{order.id}</div>
                <div className="status">{order.status}</div>
                <div className="products">
                  <Link
                    onClick={() => {
                      handleOpen(order.products);
                    }}
                    component="button"
                    variant="body2"
                  >
                    View products
                  </Link>
                </div>
                <div className="total">
                  {getOrderTotal(order.products).toFixed(2)}$
                </div>
                <div className="tracking-company">{order.trackingCompany}</div>
                <div className="tracking-number">{order.trackingNumber}</div>
                <div className="created">
                  {typeof order.created === 'string'
                    ? order.created?.split('T')[0]
                    : ''}
                </div>
                <div className="updated">
                  {typeof order.created === 'string'
                    ? order.updated?.split('T')[0]
                    : ''}
                </div>

                <div className="edit">
                  <Button
                    variant="contained"
                    onClick={() => editOrder(order.id || '')}
                  >
                    <EditRoundedIcon />
                  </Button>
                  <div>
                    <Button
                      aria-label="delete"
                      variant="contained"
                      onClick={() => {
                        setConfirmDialogOpen(true);
                        setOrderId(order.id as string);
                      }}
                    >
                      <DeleteIcon />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={3000}
        onClose={() => {
          if (!router.query?.apiSecret) {
            router.replace({
              query: {},
            });
          }
          setToastError(false);
          setToastOpen(false);
        }}
        open={toastOpen}
      >
        {!toastError ? (
          <Alert
            onClose={() => setToastOpen(false)}
            severity="success"
            sx={{ width: '100%' }}
          >
            {toastMessage}
          </Alert>
        ) : (
          <Alert
            onClose={() => {
              setToastError(false);
              setToastOpen(false);
            }}
            severity="error"
            sx={{ width: '100%' }}
          >
            An error has occurred: {toastError}
          </Alert>
        )}
      </Snackbar>
      <ConfirmDialog
        title="Delete order?"
        open={confirmDialogOpen}
        setOpen={setConfirmDialogOpen}
        onConfirm={async () => {
          try {
            await deleteOrder(orderId);
            setToastError(false);
            setToastOpen(true);
            setToastMessage('Order has been deleted');
            router.replace(router.asPath);
          } catch (err) {
            setToastOpen(true);
            setToastError(`Failed to delete order. ${err}`);
          }
        }}
      >
        Are you sure you want to delete this order?
      </ConfirmDialog>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Product list
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <div className="order-products-panel">
              <div className="products">
                <header>
                  <div className="product-name">Product Name</div>
                  <div className="description">Description</div>
                  <div className="price">Price</div>
                  <div className="category">Category</div>
                  <div className="quantity">Quantity</div>
                  <div className="total">Total</div>
                </header>
                {orderProducts.map((product: Product) => (
                  <div className="product" key={product.id}>
                    <div className="product-name">{product.name}</div>
                    <div className="description">{product.description}</div>
                    <div className="price">
                      {Number(product.price).toFixed(2)}$
                    </div>
                    <div className="category">{product.category}</div>
                    <div className="quantity">{product.quantity}</div>
                    <div className="total">
                      {getOrderTotal([product]).toFixed(2)}$
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
