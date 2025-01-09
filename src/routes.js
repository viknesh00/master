import React from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Notification from "./pages/Notification";
import Ciistock from "./pages/ciistock/Ciistock";
import Management from "./pages/Management";
import Layout from "./components/Layout";
import ProtectedRoute from "./services/ProtectedRoute";
import MaterialDetail from "./pages/ciistock/MaterialDetail";
import MaterialDescription from "./pages/ciistock/MaterialDescription";
import Nonciistock from "./pages/non-ciistock/Nonciistock";
import NonciiMaterialDetail from "./pages/non-ciistock/NonciiMaterialDetail";
import ListManagement from "./pages/listManagement/ListManagement";
import CompanyManagement from "./pages/userManagement/CompanyManagement";
import WarehouseManagement from "./pages/userManagement/WarehouseManagement";
import UserManagement from "./pages/userManagement/UserManagement";
const routes = [
    // Public Route
    { path: "/", element: <Login /> },
    { path: "/login", element: <Login /> },
    // Protected Routes
    {
        path: "/*", // Wildcard path for nested layout routes
        element: (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        ),
        children: [
            { path: "dashboard", element: <Dashboard /> },
            { path: "notifications", element: <Notification /> },
            { path: "cii-stock", element: <Ciistock /> },
            { path: "cii-stock/:materialNumber", element: <MaterialDetail /> }, // Define route for Material Detail
            { path: "cii-stock/:materialNumber/:serialNumbar", element: <MaterialDescription /> },
            { path: "non-cii-stock", element: <Nonciistock /> },
            { path: "non-cii-stock/:materialNumber", element: <NonciiMaterialDetail /> },
            { path: "management", element: <Management /> },
            { path: "list-management", element: <ListManagement/>},
            { path: "company-management", element: <CompanyManagement/>},
            { path: "company-management/:companyId", element: <WarehouseManagement /> },
            { path: "company-management/:companyId/:warehouseId", element: <UserManagement /> },
        ],
    },
];

export default routes;
