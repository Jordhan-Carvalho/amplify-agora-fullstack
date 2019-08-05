import React, { useState } from "react";
import { Storage, Auth, API, graphqlOperation } from "aws-amplify";
import { PhotoPicker } from "aws-amplify-react";
import {
  Form,
  Button,
  Input,
  Notification,
  Radio,
  Progress
} from "element-react";
import { createProduct } from "../graphql/mutations";
import { convertDollarsToCents } from "../utils/index";
import config from "../aws-exports";

const initialState = {
  description: "",
  price: "",
  imagePreview: "",
  shipped: false,
  isUploading: false,
  percentUploaded: 0
};

const {
  aws_user_files_s3_bucket_region: region,
  aws_user_files_s3_bucket: bucket
} = config;

const NewProduct = ({ marketId }) => {
  const [formData, setFormData] = useState({ ...initialState });
  const [file, setFile] = useState();

  const {
    description,
    price,
    shipped,
    imagePreview,
    isUploading,
    percentUploaded
  } = formData;

  const handleAddProduct = async () => {
    setFormData({ ...formData, isUploading: true });
    const { name: fileName, type: mimeType } = file;
    const { identityId } = await Auth.currentCredentials();
    const key = `${identityId}/${Date.now()}-${fileName}`;
    const fileForUpload = {
      bucket,
      key,
      region
    };
    const input = {
      productMarketId: marketId,
      description,
      price: convertDollarsToCents(price),
      shipped,
      file: fileForUpload
    };
    try {
      await Storage.put(key, file.file, {
        contentType: mimeType,
        progressCallback(progress) {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
          const percentUploaded = Math.round(
            (progress.loaded / progress.total) * 100
          );
          setFormData({ ...formData, percentUploaded });
        }
      });
      const res = await API.graphql(graphqlOperation(createProduct, { input }));
      console.log(res);
      Notification({
        title: "Success",
        message: "Product successfully created",
        type: "success"
      });
    } catch (error) {
      console.log(error);
    }

    setFormData({ ...initialState });
    setFile("");
  };

  return (
    <div className="flex-center">
      <h2 className="header">Add New Product</h2>
      <div>
        <Form className="market-header">
          <Form.Item label="Add Product Description">
            <Input
              type="text"
              icon="information"
              placeholder="Description"
              value={description}
              onChange={description =>
                setFormData({ ...formData, description })
              }
            />
          </Form.Item>
          <Form.Item label="Set Product Price">
            <Input
              type="number"
              icon="plus"
              placeholder="Price ($USD)"
              value={price}
              onChange={price => setFormData({ ...formData, price })}
            />
          </Form.Item>
          <Form.Item label="Is the Product Shipped or Emailed to the Customer?">
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
          {imagePreview && (
            <img
              className="image-preview"
              src={imagePreview}
              alt="Product Preview"
            />
          )}
          {percentUploaded > 0 && (
            <Progress
              type="circle"
              className="progress"
              percentage={percentUploaded}
            />
          )}
          <PhotoPicker
            title="Product Image"
            preview="hidden"
            onLoad={url => setFormData({ ...formData, imagePreview: url })}
            onPick={file => setFile(file)}
            theme={{
              formContainer: {
                margin: 0,
                padding: "0.8em"
              },
              formSection: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              },
              sectionBody: {
                margin: 0,
                width: "250px"
              },
              sectionHeader: {
                padding: "0.2em",
                color: "var(--darkAmazonOrange)"
              },
              photoPickerButton: {
                display: "none"
              }
            }}
          />
          <Form.Item>
            <Button
              disabled={!file || !description || !price || isUploading}
              type="primary"
              onClick={handleAddProduct}
              loading={isUploading}
            >
              {isUploading ? "Uploading..." : "Add Product"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default NewProduct;
