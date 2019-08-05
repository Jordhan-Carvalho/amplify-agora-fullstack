import React from "react";
import { Menu as Nav, Icon, Button } from "element-react";
import { Link } from "react-router-dom";

const Navbar = ({ user, signOut }) => {
  return (
    <Nav mode="horizontal" theme="dark" defaultActive="1">
      <div className="nav-container">
        {/* App title /icon */}
        <Nav.Item index="1">
          <Link to="/" className="nav-link">
            <span className="app-title">
              <img
                src="https://icon.now.sh/account_balance/f90"
                alt="app Icon"
                className="app-icon"
              />
              AmplifyAgora
            </span>
          </Link>
        </Nav.Item>
        {/* Navbar Items */}
        <div className="nav-item">
          <Nav.Item index="2">
            <span className="app-user">Hello {user.attributes.email}</span>
          </Nav.Item>
          <Nav.Item index="3">
            <Link to="/profile" className="nav-link">
              <Icon name="setting" />
              Profile
            </Link>
          </Nav.Item>
          <Nav.Item index="4">
            <Button type="warning" onClick={signOut}>
              Sign Out
            </Button>
          </Nav.Item>
        </div>
      </div>
    </Nav>
  );
};

export default Navbar;
