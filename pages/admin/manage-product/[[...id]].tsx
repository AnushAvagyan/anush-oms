import {
  Button,
  TextField,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPageContext } from 'next';
import { getCategories, getProductById } from '@/lib/api';
import { CreateProduct } from '@/lib/custom-types';

function getDisabled(val: boolean) {
  if (val) return { disabled: true };
  return {};
}

const validateTextInput = (desc: string) => {
  const regex = /^(.|\s)*[a-zA-Z]+(.|\s)*$/;
  if (!regex.test(desc)) {
    return false;
  } else {
    return true;
  }
};

export async function getServerSideProps(ctx: NextPageContext) {
  const { id } = ctx.query;
  const categories = (await getCategories()) || null;
  if (id) {
    const product = await getProductById(typeof id === 'string' ? id : id[0]);

    return {
      props: {
        product,
        categories: categories.items,
        isUpdate: true,
      },
    };
  }
  return {
    props: {
      categories: categories.items,
      isUpdate: false,
    },
  };
}

export default function AddProduct(props: any) {
  const router = useRouter();
  const [productName, setProductName] = useState('');
  const [productNameError, setProductNameError] = useState('');
  const [description, setDescription] = useState('');
  const [inventory, setInventory] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<any>();
  const [isComplete, setIsComplete] = useState(false);
  const [isUpdatePage, setIsUpdatePage] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  async function handleSubmit() {
    if (isComplete) {
      let url;
      if (isUpdatePage) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/products/${
          router.query?.id?.length ? router.query.id[0] : ''
        }`;
      } else {
        url = process.env.NEXT_PUBLIC_API_URL + '/products';
      }
      const product: CreateProduct = {
        name: productName,
        description: description,
        price: price || 0,
        inventory: inventory || 0,
        categoryId,
      };
      let options = {
        method: isUpdatePage ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      };
      try {
        const response = await fetch(url, options);
        await response.json().then((data) => {
          if (!data.error) {
            router.push(
              {
                pathname: '/admin/products',
                query: isUpdatePage
                  ? {
                      success: true,
                      successMessage: 'Product was successfully updated',
                    }
                  : {
                      success: true,
                      successMessage: 'Product was successfully created',
                    },
              },
              '/admin/products'
            );
          } else {
            throw data.error;
          }
        });
      } catch (err) {
        console.log(err);
        router.push(
          {
            pathname: '/admin/products',
            query: { error: JSON.stringify(err) },
          },
          '/admin/products'
        );
      }
    } else {
      console.log('Incomplete Form');
    }
  }

  useEffect(() => {
    if (router.query?.id?.length && props.isUpdate) {
      setIsUpdatePage(true);
      setProductName(props.product.name);
      setDescription(props.product.description);
      setCategoryId(props.product.categoryId);
      setInventory(props.product.inventory);
      setPrice(props.product.price);
    }
  }, []);

  useEffect(() => {
    if (isDirty) {
      if (validateTextInput(productName)) {
        setProductNameError('');
      } else {
        setProductNameError('Please enter a valid name.');
      }
    }
  }, [productName, isDirty]);

  useEffect(() => {
    if (productName && !productNameError.length && price && inventory) {
      setIsComplete(true);
    } else {
      setIsComplete(false);
    }
  }, [productNameError, productName, price, inventory]);

  const categories =
    props.categories &&
    props.categories.length &&
    props.categories.map((category: { name: any; id: any }) => (
      <MenuItem key={category.name} value={category.id}>
        {category.name}
      </MenuItem>
    ));

  if (!props.isUpdate || productName) {
    return (
      <div className="add-product-panel">
        <header>
          <h2>{isUpdatePage ? 'Update Product' : 'Create New Product'}</h2>
        </header>
        <div className="product-properties">
          <TextField
            id="product-name"
            required
            label="Product Name"
            value={productName}
            variant="outlined"
            onChange={(e) => setProductName(e.target.value)}
            onBlur={(e) => {
              setIsDirty(true);
            }}
            error={!!productNameError.length}
            helperText={productNameError}
          />
          <TextField
            id="product-desc"
            label="Product Description"
            value={description}
            variant="outlined"
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            id="product-inventory"
            label="Product Stock"
            value={inventory}
            variant="outlined"
            onChange={(e) => {
              if (Number(e.target.value)) {
                setInventory(Number(e.target.value));
              } else {
                setInventory(null);
              }
            }}
            onBlur={(e) => {
              setIsDirty(true);
            }}
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
          />
          <TextField
            id="product-price"
            label="Product Price"
            value={price}
            variant="outlined"
            onChange={(e) => {
              if (Number(e.target.value)) {
                setPrice(Number(e.target.value));
              } else {
                setPrice(null);
              }
            }}
            onBlur={(e) => {
              setIsDirty(true);
            }}
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
          />
          <FormControl fullWidth>
            <InputLabel id="category-id">Category</InputLabel>
            <Select
              labelId="category-id"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value || undefined)}
              id="category-id"
              label="Category"
              variant="outlined"
            >
              {categories}
            </Select>
          </FormControl>
          <Button
            {...getDisabled(!isComplete)}
            type="submit"
            onClick={handleSubmit}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }
}
