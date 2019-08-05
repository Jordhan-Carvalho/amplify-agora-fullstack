import React, { useEffect, useState, useContext } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { Link } from "react-router-dom";
import { Loading, Tabs, Icon } from "element-react";
import {
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct
} from "../graphql/subscriptions";
import UserContext from "../utils/UserContext";
import NewProduct from "../components/NewProduct";
import Product from "../components/Product";
import { formatProductDate } from "../utils/index";

const getMarketCustom = `query GetMarket($id: ID!) {
  getMarket(id: $id) {
    id
    name
    products (sortDirection: DESC, limit: 9999) {
      items {
        id
        description
        market {
          id
          name
          tags
          owner
          createdAt
        }
        file {
          bucket
          region
          key
        }
        price
        shipped
        owner
        createdAt
      }
      nextToken
    }
    tags
    owner
    createdAt
  }
}
`;

const MarketPage = ({
  match: {
    params: { id }
  },
  history
}) => {
  const [market, setMarket] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarketOwner, setIsMarketOwner] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { user, userAttributes } = useContext(UserContext);

  useEffect(() => {
    handleGetMarket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sub to product changes
  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onCreateProduct)
    ).subscribe({
      next: async productData => {
        // Get old products and add the new one, then copy the market (with products inside) and pass the new updated products
        const newProduct = productData.value.data.onCreateProduct;
        const prevProducts = market.products.items.filter(
          p => p.id !== onCreateProduct.id
        );
        const updatedProducts = [...prevProducts, newProduct];
        const newMarket = { ...market };
        newMarket.products.items = updatedProducts;
        setMarket(newMarket);
      }
    });
    return () => subscription.unsubscribe();
  }, [market]);

  // UPDATES SUB
  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onUpdateProduct)
    ).subscribe({
      next: async productData => {
        const newProduct = productData.value.data.onUpdateProduct;
        const newProductIndex = market.products.items.findIndex(
          p => p.id === newProduct.id
        );
        const updatedProducts = [
          ...market.products.items.slice(0, newProductIndex),
          newProduct,
          ...market.products.items.slice(newProductIndex + 1)
        ];
        const newMarket = { ...market };
        newMarket.products.items = updatedProducts;
        setMarket(newMarket);
      }
    });
    return () => subscription.unsubscribe();
  }, [market]);

  // DELETE SUB
  useEffect(() => {
    const subscription = API.graphql(
      graphqlOperation(onDeleteProduct)
    ).subscribe({
      next: async productData => {
        const deletedProduct = productData.value.data.onDeleteProduct;
        const updatedProducts = market.products.items.filter(
          p => p.id !== deletedProduct.id
        );
        const newMarket = { ...market };
        newMarket.products.items = updatedProducts;
        setMarket(newMarket);
      }
    });
    return () => subscription.unsubscribe();
  }, [market]);

  const checkMarketOwner = marketInfo => {
    if (user) {
      setIsMarketOwner(user.attributes.email === marketInfo.owner);
    }
  };

  const checkEmailVerified = () => {
    if (userAttributes) {
      setIsEmailVerified(userAttributes.email_verified);
    }
  };

  const handleGetMarket = async () => {
    try {
      const res = await API.graphql(graphqlOperation(getMarketCustom, { id }));
      setMarket(res.data.getMarket);
      setIsLoading(false);
      checkMarketOwner(res.data.getMarket);
      checkEmailVerified();
    } catch (error) {
      console.log(error);
    }
  };

  return isLoading ? (
    <Loading fullscreen={true} />
  ) : (
    <>
      <Link className="link" to="/">
        Back to Markets List
      </Link>

      <span className="items-center pt-2">
        <h2 className="mb-mr">{market.name}</h2> - {market.owner}
      </span>
      <div className="items-center pt-2">
        <span style={{ color: "var(--lightSquidInk)", paddingBottom: "1em" }}>
          <Icon name="date" className="icon" />
          {formatProductDate(market.createdAt)}
        </span>
      </div>

      <Tabs type="border-card" value={isMarketOwner ? "1" : "2"}>
        {isMarketOwner && (
          <Tabs.Pane
            label={
              <>
                <Icon name="plus" className="icon" />
                Add Product
              </>
            }
            name="1"
          >
            {isEmailVerified ? (
              <NewProduct marketId={id} />
            ) : (
              <Link className="header" to="/profile">
                Verify Your Email Before Adding Products
              </Link>
            )}
          </Tabs.Pane>
        )}
        <Tabs.Pane
          label={
            <>
              <Icon name="menu" className="icon" />
              Products ({market.products && market.products.items.length})
            </>
          }
          name="2"
        >
          <div className="product-list">
            {market.products.items.map((product, i) => (
              <Product key={i} product={product} history={history} />
            ))}
          </div>
        </Tabs.Pane>
      </Tabs>
    </>
  );
};

export default MarketPage;
