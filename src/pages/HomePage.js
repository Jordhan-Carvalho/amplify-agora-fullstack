import React, { useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { searchMarkets } from "../graphql/queries";
import NewMarket from "../components/NewMarket";
import MarketList from "../components/MarketList";

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchChange = searchTerm => setSearchTerm(searchTerm);

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleSearch = async e => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const res = await API.graphql(
        graphqlOperation(searchMarkets, {
          filter: {
            or: [
              { name: { match: searchTerm } },
              { owner: { match: searchTerm } },
              { tags: { match: searchTerm } }
            ]
          },
          sort: {
            field: "createdAt",
            direction: "desc"
          }
        })
      );
      console.log(res);
      setSearchResults(res.data.searchMarkets.items);
      setIsSearching(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <NewMarket
        searchTerm={searchTerm}
        isSearching={isSearching}
        handleSearchChange={handleSearchChange}
        handleClearSearch={handleClearSearch}
        handleSearch={handleSearch}
      />
      <MarketList searchResults={searchResults} />
    </div>
  );
};

export default HomePage;
