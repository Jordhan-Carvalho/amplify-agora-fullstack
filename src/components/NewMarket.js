// prettier-ignore
import React,{useState, useContext} from "react";
import { graphqlOperation, API } from "aws-amplify";
import { createMarket } from "../graphql/mutations";
import { Form, Button, Dialog, Input, Notification } from "element-react";
import UserContext from "../utils/UserContext";

const NewMarket = ({
  handleSearchChange,
  handleClearSearch,
  handleSearch,
  isSearching,
  searchTerm
}) => {
  const [dialog, setDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    owner: "",
    tags: ["Arts", "Technology", "Crafts", "Entertainment"]
  });

  const { user } = useContext(UserContext);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Using hardcoded tags
  const addMarket = async () => {
    setDialog(false);
    try {
      const input = {
        ...formData,
        owner: user.attributes.email
      };
      await API.graphql(graphqlOperation(createMarket, { input }));

      setFormData({ name: "" });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="market-header">
        <h1 className="market-title">
          Create Your MarketPlace
          <Button
            onClick={() => setDialog(true)}
            type="text"
            icon="edit"
            className="market-title-button"
          />
        </h1>

        <Form inline={true} onSubmit={handleSearch}>
          <Form.Item>
            <Input
              placeholder="Search markets.."
              value={searchTerm}
              icon="circle-cross"
              onIconClick={handleClearSearch}
              onChange={handleSearchChange}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="info"
              loading={isSearching}
              icon="search"
              onClick={handleSearch}
            >
              Search
            </Button>
          </Form.Item>
        </Form>
      </div>

      <Dialog
        title="Create New Market"
        visible={dialog}
        onCancel={() => setDialog(false)}
        size="large"
        customClass="dialog"
      >
        <Dialog.Body>
          <Form labelPosition="top">
            <Form.Item label="Add Market Name">
              <input
                type="text"
                placeholder="Market Name"
                value={formData.name}
                name="name"
                onChange={e => onChange(e)}
              />
            </Form.Item>
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button type="primary" disable={!formData.name} onClick={addMarket}>
            Add
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
};

export default NewMarket;
