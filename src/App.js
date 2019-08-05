import React, { useState, useEffect } from "react";
import { Switch, Route } from "react-router-dom";
import { getUser } from "./graphql/queries";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import NavBar from "./components/Navbar";
import UserContext from "./utils/UserContext";
import { registerUser } from "./graphql/mutations";
import "./App.css";

// Amplify
import { API, graphqlOperation, Auth, Hub, Logger } from "aws-amplify";
import { Authenticator, AmplifyTheme } from "aws-amplify-react";

const App = () => {
  const [user, setUser] = useState(null);
  const [userAttributes, setUserAttributes] = useState(null);

  useEffect(() => {
    console.log(AmplifyTheme);
    getUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen to Auth events https://aws-amplify.github.io/docs/js/hub
  const logger = new Logger("My-Logger");

  const listener = data => {
    switch (data.payload.event) {
      case "signIn":
        console.log("signed in");
        getUserData();
        registerNewUser(data.payload.data);
        break;
      case "signUp":
        console.log("signed up");
        break;
      case "signOut":
        console.log("signed out");
        setUser(null);
        break;
      case "signIn_failure":
        logger.error("user sign in failed");
        break;
      case "configured":
        logger.error("the Auth module is configured");
        break;
      default:
        return;
    }
  };

  Hub.listen("auth", listener);

  // Auth.currentAuthenticatedUser needs to sign ou/sign after change attribute
  // Better approach if email is the username
  const getUserData = async () => {
    const userData = await Auth.currentAuthenticatedUser();
    userData ? setUser(userData) : setUser(null);
    getUserAttributes(userData);
  };

  // Solution userAttributes
  const getUserAttributes = async authUserData => {
    const attributesArr = await Auth.userAttributes(authUserData);
    const attributesObj = Auth.attributesToObject(attributesArr);
    setUserAttributes(attributesObj);
  };

  const registerNewUser = async signInData => {
    const id = signInData.username;
    const { data } = await API.graphql(graphqlOperation(getUser, { id }));
    // if we cant get a user (user not registered before, register user)
    if (!data.getUser) {
      try {
        const registerUserInput = {
          id,
          username: signInData.attributes.email,
          email: signInData.attributes.email,
          registered: true
        };
        const newUser = await API.graphql(
          graphqlOperation(registerUser, { input: registerUserInput })
        );
        console.log(newUser);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log(error);
    }
  };

  return !user ? (
    <Authenticator theme={theme} />
  ) : (
    <UserContext.Provider value={{ user, userAttributes }}>
      <NavBar user={user} signOut={signOut} />
      <div className="app-container">
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route
            exact
            path="/profile"
            component={() => (
              <ProfilePage user={user} userAttributes={userAttributes} />
            )}
          />
          <Route exact path="/markets/:id" component={MarketPage} />
        </Switch>
      </div>
    </UserContext.Provider>
  );
};

//CSS custonomization of the auth comp
const theme = {
  ...AmplifyTheme,
  navBar: {
    ...AmplifyTheme.navBar,
    backgroundcolor: "#ffc0cb"
  },
  button: {
    backgroundcolor: "var(--amazonOrange)"
  },
  sectionBody: {
    ...AmplifyTheme.sectionBody,
    padding: "5px"
  },
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundcolor: "var(--squidInk)"
  }
};

export default App;
// export default withAuthenticator(App, { includeGreetings: true, theme });
