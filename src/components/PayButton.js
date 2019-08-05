import React from "react";
import StripeCheckout from "react-stripe-checkout";
import { API, graphqlOperation } from "aws-amplify";
import { getUser } from "../graphql/queries";
import { createOrder } from "../graphql/mutations";
import { Notification, Message } from "element-react";

const stripeConfig = {
  currency: "USD",
  publishableAPIKey: "pk_test_flSXGF8xUAFSXKdjW91qF4AU0029JP1gp9"
};

const PayButton = ({ userAttributes, product, history }) => {
  const getOwnerEmail = async ownerId => {
    const { data } = await API.graphql(
      graphqlOperation(getUser, { id: ownerId })
    );
    return data.getUser.email;
  };

  const createShippingAddress = source => ({
    city: source.address_city,
    country: source.address_country,
    address_line1: source.address_line1,
    address_state: source.address_state,
    address_zip: source.address_zip
  });

  const handleCharge = async token => {
    try {
      const ownerEmail = await getOwnerEmail(product.owner);
      const res = await API.post("orderlambda", "/charge", {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description
          },
          email: {
            customerEmail: userAttributes.email,
            ownerEmail
          }
        }
      });
      if (res.charge.status === "succeeded") {
        let shippingAddress = null;
        if (product.shipped) {
          shippingAddress = createShippingAddress(res.charge.source);
        }
        const input = {
          shippingAddress,
          orderProductId: product.id,
          orderUserId: userAttributes.sub
        };
        await API.graphql(
          graphqlOperation(createOrder, {
            input
          })
        );
        Notification({
          title: "Success",
          message: `${res.message}`,
          type: "success",
          duration: 3000,
          onClose: () => {
            history.push("/");
            Message({
              type: "info",
              message: "Check your email for details.",
              duration: 5000,
              showClose: true
            });
          }
        });
      }
    } catch (error) {
      console.error(error);
      Notification.error({
        title: "Error",
        message: `${error.message || "Error processing order"}`
      });
    }
  };

  return (
    <StripeCheckout
      token={handleCharge}
      email={userAttributes.email}
      name={product.description}
      amount={product.price}
      shippingAddress={product.shipped}
      billingAddress={product.shipped}
      locale="auto"
      allowRememberMe={false}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
    />
  );
};

export default PayButton;
