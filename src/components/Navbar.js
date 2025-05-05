import React from "react";
import { Link } from "react-router-dom";
import { ReactComponent as Backarrow } from "../assets/svg/back-arrow.svg";
import { ReactComponent as Right } from "../assets/svg/right.svg";
import { ReactComponent as StraightLine } from "../assets/svg/straight-line.svg";
import { ReactComponent as Profile } from "../assets/svg/user-profile.svg";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ breadcrumbs }) => {
    const navigate = useNavigate();
    const { name, fullName } = useUser();
    return (
        <div className="navbar">
            <div className="navigation">
                <button onClick={() => navigate(-1)} className="straight-line-btn">
                <Backarrow />
                </button>
                <StraightLine />
                {breadcrumbs.map((breadcrumb, index) => (
                    <React.Fragment key={index}>
                        {breadcrumb.state ? (
                            <Link to={breadcrumb.path} state={breadcrumb.state}>
                                <span className="cursor">{breadcrumb.label}</span>
                            </Link>
                        ) : breadcrumb.path ? (
                            <Link to={breadcrumb.path}>
                                <span className="cursor">{breadcrumb.label}</span>
                            </Link>
                        ) : (
                            <span className="breadcrumb-link-active">{breadcrumb.label}</span>
                        )}
                        {index < breadcrumbs.length - 1 && <Right />}
                    </React.Fragment>
                ))}
            </div>

            <div className="navbar-profile">
                <Profile />
                <div className="flex flex-col">
                    <span className="username">{fullName}</span>
                    <span className="useremail">{name}</span>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
