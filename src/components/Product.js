import React, { useState, useContext } from "react";
// prettier-ignore
import { S3Image } from 'aws-amplify-react';
import { API, graphqlOperation } from "aws-amplify";
import {
  Notification,
  Popover,
  Button,
  Dialog,
  Card,
  Form,
  Input,
  Radio
} from "element-react";
import { convertCentsToDollars, convertDollarsToCents } from "../utils";
import { Link } from "react-router-dom";
import UserContext from "../utils/UserContext";
import PayButton from "./PayButton";
import { updateProduct, deleteProduct } from "../graphql/mutations";

const Product = ({ product, history }) => {
  const [formData, setFormData] = useState({
    description: "",
    price: "",
    shipped: false,
    updateProductDialog: false,
    deleteProductDialog: false
  });
  const { user, userAttributes } = useContext(UserContext);

  const {
    description,
    price,
    shipped,
    updateProductDialog,
    deleteProductDialog
  } = formData;
  // The owner fild was created by the @auth directive on schema (using indentityField)
  const isProductOwner = user && user.attributes.sub === product.owner;
  const isEmailVerified = userAttributes && userAttributes.email_verified;

  const handleUpdateProduct = async productId => {
    setFormData({ ...formData, updateProductDialog: false });
    const input = {
      id: productId,
      description,
      shipped,
      price: convertDollarsToCents(price)
    };

    try {
      const res = await API.graphql(graphqlOperation(updateProduct, { input }));
      console.log({ res });
      Notification({
        title: "Success",
        message: "Product updated!",
        type: "success"
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteProduct = async productId => {
    setFormData({ ...formData, deleteProductDialog: false });
    const input = {
      id: productId
    };
    try {
      await API.graphql(graphqlOperation(deleteProduct, { input }));
      Notification({
        title: "Success",
        message: "Product deleted!",
        type: "success"
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="card-container">
      <Card bodyStyle={{ padding: 0, minWidth: "200px" }}>
        <S3Image
          imgKey={product.file.key}
          theme={{
            photoImg: { maxWidth: "100%", maxHeight: "100%" }
          }}
        />
        <div className="card-body">
          <h3 className="m-0">{product.description}</h3>
          <div className="items-center">
            <img
              src={`https://icon.now.sh/${
                product.shipped ? "markunread_mailbox" : "mail"
              }`}
              alt="Shipping Icon"
              className="icon"
            />
            {product.shipped ? "Shipped" : "Emailed"}
          </div>
          <div className="text-right">
            <span className="mx-1">
              ${convertCentsToDollars(product.price)}
            </span>
            {isEmailVerified ? (
              !isProductOwner && (
                <PayButton
                  product={product}
                  userAttributes={userAttributes}
                  history={history}
                />
              )
            ) : (
              <Link to="/profile" className="link">
                Verify Email
              </Link>
            )}
          </div>
        </div>
      </Card>
      {/* Update / Delete Product Buttons */}
      <div className="text-center">
        {isProductOwner && (
          <>
            <Button
              type="warning"
              icon="edit"
              className="m-1"
              onClick={() =>
                setFormData({
                  ...formData,
                  updateProductDialog: true,
                  description: product.description,
                  shipped: product.shipped,
                  price: convertCentsToDollars(product.price)
                })
              }
            />
            <Popover
              placement="top"
              width="160"
              trigger="click"
              visible={deleteProductDialog}
              content={
                <>
                  <p>Do you want to delete this?</p>
                  <div className="text-right">
                    <Button
                      size="mini"
                      type="text"
                      className="m-1"
                      onClick={() =>
                        setFormData({ ...formData, deleteProductDialog: false })
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      size="mini"
                      className="m-1"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Confirm
                    </Button>
                  </div>
                </>
              }
            >
              <Button
                onClick={() =>
                  setFormData({ ...formData, deleteProductDialog: true })
                }
                type="danger"
                icon="delete"
              />
            </Popover>
          </>
        )}
      </div>
      {/* Update Product Dialog */}
      <Dialog
        title="Update Product"
        size="large"
        customClass="dialog"
        visible={updateProductDialog}
        onCancel={() =>
          setFormData({ ...formData, updateProductDialog: false })
        }
      >
        <Dialog.Body>
          <Form labelPosition="top">
            <Form.Item label="Update Description">
              <Input
                icon="information"
                placeholder="Product Description"
                value={description}
                trim={true}
                onChange={description =>
                  setFormData({ ...formData, description })
                }
              />
            </Form.Item>
            <Form.Item label="Update Price">
              <Input
                type="number"
                icon="plus"
                placeholder="Price ($USD)"
                value={price}
                onChange={price => setFormData({ ...formData, price })}
              />
            </Form.Item>
            <Form.Item label="Update Shipping">
              <div className="text-center">
                <Radio
                  value="true"
                  checked={shipped === true}
                  onChange={() => setFormData({ ...formData, shipped: true })}
                >
                  Shipped
                </Radio>
                <Radio
                  value="false"
                  checked={shipped === false}
                  onChange={() => setFormData({ ...formData, shipped: false })}
                >
                  Emailed
                </Radio>
              </div>
            </Form.Item>
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button
            onClick={() =>
              setFormData({ ...formData, updateProductDialog: false })
            }
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => handleUpdateProduct(product.id)}
          >
            Update
          </Button>
        </Dialog.Footer>
      </Dialog>
    </div>
  );
};

export default Product;
