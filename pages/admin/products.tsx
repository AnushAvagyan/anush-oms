import { Button, Snackbar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useRouter } from 'next/router';
import { NextPageContext } from 'next';
import { Product } from '@/lib/custom-types';
import { deleteProduct, getProducts } from '@/lib/api';
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
  const products = await getProducts();
  return {
    props: { products: products.items },
  };
}

export default function Products(props: any) {
  const router = useRouter();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError]: any = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    if (router.query?.success || router.query?.successMessage) {
      setToastOpen(true);
      setToastMessage((router.query.successMessage as string) || 'Success');
    }
    if (router.query?.error) {
      setToastOpen(true);
      setToastError(router.query?.error);
    }
  }, [router.query?.success, router.query?.error]);

  return (
    <div id="products-page">
      <div className="current-products-panel">
        <header>
          <h1 style={{ paddingRight: '900px' }}>Products</h1>
          <Button
            variant="contained"
            onClick={() => router.push('/admin/manage-product')}
          >
            <AddCircleRoundedIcon />
            Create New Product
          </Button>
        </header>
        <div className="products">
          <header>
            <div className="product-id"> ID</div>
            <div className="product-name">Product Name</div>
            <div className="description">Description</div>
            <div className="price">Price</div>
            <div className="inventory">Inventory</div>
            <div className="category">Category</div>
            <div className="created">Created Date</div>
            <div className="updated">Last Updated</div>
          </header>
          {!props.products.length ? (
            <div className="default-text">
              {' '}
              No products to display.{' '}
              <Button
                variant="contained"
                onClick={() => {
                  router.push('/admin/manage-product');
                }}
              >
                Create New
              </Button>
            </div>
          ) : (
            props.products.map((product: Product) => (
              <div className="product" key={product.id}>
                <div className="product-id">{product.id}</div>
                <div className="product-name">{product.name}</div>
                <div className="description">{product.description}</div>
                <div className="price">{Number(product.price).toFixed(2)}$</div>
                <div className="inventory">{product.inventory}</div>
                <div className="category">{product.category}</div>
                <div className="created">
                  {typeof product.created === 'string'
                    ? product.created?.split('T')[0]
                    : ''}
                </div>
                <div className="updated">
                  {typeof product.created === 'string'
                    ? product.updated?.split('T')[0]
                    : ''}
                </div>
                <div className="edit">
                  <Button
                    type="submit"
                    onClick={() => {
                      router.push({
                        pathname: `/admin/manage-product/${product.id}`,
                      });
                    }}
                  >
                    <EditRoundedIcon />
                  </Button>
                  <Button
                    variant="contained"
                    aria-label="delete"
                    onClick={() => {
                      setConfirmDialogOpen(true);
                      setSelectedProductId(product.id);
                    }}
                  >
                    <DeleteIcon />
                  </Button>
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
          router.replace({
            query: {},
          });
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
        title="Delete product?"
        open={confirmDialogOpen}
        setOpen={setConfirmDialogOpen}
        onConfirm={async () => {
          try {
            await deleteProduct(selectedProductId);
            setToastError(false);
            setToastOpen(true);
            setToastMessage('Product was successfully deleted');
            //refresh the page to fetch serversideprops after deleting the product
            router.replace(router.asPath);
          } catch (err) {
            setToastOpen(true);
            setToastError(`Failed to delete product. ${err}`);
          }
        }}
      >
        Are you sure you want to delete this product?
      </ConfirmDialog>
    </div>
  );
}
