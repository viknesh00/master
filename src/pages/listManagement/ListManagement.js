import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import { ReactComponent as Plus } from "../../assets/svg/plus.svg";
import Search from "../../utils/Search";
import { ReactComponent as Edit } from "../../assets/svg/edit.svg";
import list_management_data from "../../data/list_management.json";
import Pagination from "@mui/material/Pagination";
import AddList from "../../dialog/listmanagement-dialog/AddList";
import EditList from "../../dialog/listmanagement-dialog/Editlist";

const ListManagement = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddList, setShowAddList] = useState(false);
    const [showEditList, setShowEditList] = useState(false);
    const breadcrumbData = [
        { label: "List Management", path: "" },
    ];

    const filteredData = list_management_data.filter((item) =>
        item["listName"].toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handleInputChange = (value) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleOpenAddList = () => {
        setShowAddList(prevState => !prevState);
    };

    const handleOpenEditList = () => {
        setShowEditList(prevState => !prevState);
    };

    return (
        <div>
            {showAddList && <AddList value={showAddList} handleOpenAddList={handleOpenAddList} />}
            {showEditList && <EditList value={showEditList} handleOpenEditList={handleOpenEditList} />}
            <Navbar breadcrumbs={breadcrumbData} />
            <div className="outersection-container">
                <span className="main-title">List Management</span>

                <div className="outer-firstsection">
                    <div className="outer-firstsection-header">
                    </div>
                    <div className="outer-firstsection-actions">
                        <button className="outer-firstsection-add" onClick={handleOpenAddList}>
                            <Plus /> Add List
                        </button>
                    </div>
                </div>

                <div className="outer-secondsection">
                    <div>

                    </div>
                    <Search placeholder="Search" onChange={handleInputChange} />
                </div>
                {paginatedData.map((item, index) => (
                    <div className="outer-lastsection">
                        <div className="product-details-header">
                            <span className="product-details-title">{item.listName}</span>
                            <Edit className="cursor" onClick={handleOpenEditList}/>
                        </div>

                        <div className="text-left item-container">
                            {item.items.map((item, idx) => (
                                <span className="status-list">{item.label}</span>
                            ))}
                        </div>

                    </div>
                ))}


                <div className="table-footer">
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        variant="outlined"
                        shape="rounded"
                    />
                </div>
            </div>
        </div>
    );
};

export default ListManagement;
