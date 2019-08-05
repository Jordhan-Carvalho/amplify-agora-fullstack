import React from "react";
import { Loading, Card, Icon, Tag } from "element-react";
import { graphqlOperation } from "aws-amplify";
import { Connect } from "aws-amplify-react";
import { Link } from "react-router-dom";
import { listMarkets } from "../graphql/queries";
import { onCreateMarket } from "../graphql/subscriptions";

const MarketList = ({ searchResults }) => {
  const onNewMarket = (prevQuery, newData) => {
    let updatedQuery = { ...prevQuery };
    console.log(prevQuery);
    console.log(newData);
    const updatedMarketList = [
      newData.onCreateMarket,
      ...prevQuery.listMarkets.items
    ];
    console.log(updatedMarketList);
    updatedQuery.listMarkets.items = updatedMarketList;
    return updatedQuery;
  };

  return (
    <Connect
      query={graphqlOperation(listMarkets)}
      subscription={graphqlOperation(onCreateMarket)}
      onSubscriptionMsg={onNewMarket}
    >
      {({ data, loading, error }) => {
        if (loading) return <div>Fetching</div>;
        if (error) return <div>Error, something wrong</div>;
        const markets =
          searchResults.length > 0 ? searchResults : data.listMarkets.items;

        return (
          <>
            {searchResults.length > 0 ? (
              <h2 className="text-green">
                <Icon type="success" name="check" className="icon" />
                {searchResults.length} Results
              </h2>
            ) : (
              <h2 className="header">
                <img
                  src="https://icon.now.sh/store_mall_directory/527FFF"
                  alt="Store header"
                  className="large-icon"
                />
                Markets
              </h2>
            )}
            {markets.map(market => (
              <div className="my-2" key={market.id}>
                <Card
                  bodyStyle={{
                    padding: "0.7em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <span className="flex">
                      <Link className="link" to={`/markets/${market.id}`}>
                        {market.name}
                      </Link>
                      <span style={{ color: "var(--darkAmazonOrange)" }}>
                        {market.products.items.length}
                      </span>
                      <img
                        src="https://icon.now.sh/shopping_cart/f60"
                        alt="Shopping cart"
                      />
                    </span>
                    <div style={{ color: "var(--lightSquidInk)" }}>
                      {market.owner}
                    </div>
                  </div>
                  <div>
                    {market.tags &&
                      market.tags.map(tag => (
                        <Tag key={tag} type="dager" className="mx-1">
                          {tag}
                        </Tag>
                      ))}
                  </div>
                </Card>
              </div>
            ))}
          </>
        );
      }}
    </Connect>
  );
};

export default MarketList;
