import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import { Button, Col, Form, Modal, Row, Tooltip } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { commonCrudSuccess } from "../../../Common/CommonComponents/CustomizedSuccessToastMessages";
import DetailLoader from "../../../Common/CommonComponents/Loaders/DetailLoader";
import PageHeader from "../../../Common/CommonComponents/PageHeader";
import { ToastError, ToastSuccess } from "../../../Common/CommonComponents/ToastCustomized";
import {
    AddIcon,
    AnxDocument,
    DeleteIcon,
    EditIcon
} from "../../../Common/CommonIcons/CommonIcons";
import {
    deleteById,
    getAllById
} from "../../../Common/Services/CommonService";
import { getTemplteList } from "../../../Common/Services/OtherServices";
import Table from "../../../Common/Table/Table";
import { cancelButtonName } from "../../../Common/Utilities/Constants";
import Annexure from "../Reports/Annexure";

const SalaryTempletList = () => {
    // Accessing user details from the Redux store
    const userDetails = useSelector((state) => state.user.userDetails);

    // Navigating to different pages using React Router
    const navigate = useNavigate();

    // State to store minimum and maximum salary values, template ID, and currency code
    const [minValue, setMinVal] = useState(null);
    const [maxValue, setMaxVal] = useState(null);
    const [templateId, setTemplateId] = useState(null);
    const [salaryTemplateList, setSalaryTemplateList] = useState([]); // State to store the list of salary templates
    const [currencyCode, setCurrencyCode] = useState(null);

    // Reference to generate PDF for the annexure
    const pdfRef = useRef();

    // Function to navigate to the page to add a new salary template
    const handleAddTemplate = () => {
        navigate("/salaryTemplate", { state: { id: null } });
    };

    // Function to navigate to the page to edit a specific salary template
    const handleEditTemplate = (id, data, count) => {
        navigate("/salaryTemplate", { state: { id, data, count } });
    };

    
  

    // Function to get all locations by organization ID
    const getAllLocationById = () => {
        getAllById({ entity: "locations", organizationId: userDetails.organizationId })
            .then((res) => {
                if (res.statusCode === 200) {
                    const filtered = userDetails.accessible === "Global"
                        ? res.data
                        : res.data.filter(item1 => userDetails.allowedLocations.some(item2 => item1.id === item2));
                    const options = filtered.map(option => ({
                        value: option.id,
                        label: option.name,
                    }));
                    setLocationOptions(options);

                    if (options.length > 0) {
                        const found = options.find(opt => opt.value === userDetails.locationId);
                        const defaultLoc = found ? found.value : options[0].value;
                        setLocationId(defaultLoc);
                    } else {
                        setLocationId(null);
                        setSalaryTemplateList([]);
                    }
                } else {
                    setLocationOptions([]);
                    setLocationId(null);
                    setSalaryTemplateList([]);
                }
            })
            .catch((error) => {
                setLocationOptions([]);
                setLocationId(null);
                setSalaryTemplateList([]);
                console.error("Error fetching locations:", error);
            });
    };

    // State to store the selected location ID
    const [locationOptions, setLocationOptions] = useState([]);
    const [locationId, setLocationId] = useState(null); // Set default to user's location


    useEffect(() => {
        getAllLocationById();
    }, []);
    // Function to handle location change and fetch corresponding templates
    const handleLocationChange = (selectedOption) => {
        setLocationId(selectedOption ? selectedOption.value : null);
    };

    // Function to get all salary templates by location ID
    const getAllTemplateList = (locationId) => {
        getTemplteList({ organizationId: userDetails.organizationId, locationId: locationId ? locationId : userDetails.locationId })
            .then((res) => {
                if (res.statusCode === 200) {
                    setSalaryTemplateList(res.data ? res.data : []);
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.error("Error fetching templates:", error);
                setLoading(false);
            });
    };

    // State for controlling delete confirmation modal visibility and storing selected ID
    const [deleteShow, setDeleteShow] = useState(false);
    const [selectId, setSelectId] = useState("");

    // Function to show delete confirmation modal
    const onDeleteHandler = (row) => {
        setDeleteShow(true);
        setSelectId(row.id);
    };

    // Function to close delete confirmation modal
    const onDeleteCloseHandler = () => {
        setDeleteShow(false);
    };

    // Function to delete the selected salary template
    const onProceedDeleteHandler = () => {
        deleteById({
            entity: "salarytemplates",
            organizationId: userDetails.organizationId,
            id: selectId,
            toastSuccessMessage: commonCrudSuccess({ screen: "Salary template", operationType: "delete" }),
            screenName: "Salary template"
        }).then((res) => {
            if (res.statusCode == 200) {
                setLoading(false)
                ToastSuccess(res.message);
                onDeleteCloseHandler();
                getAllTemplateList(locationId); // Refresh only for current location
            }
        })
            .catch((err) => {
                setLoading(false)
                ToastError(err.message)
            })
    };

    // State for controlling the generation modal visibility
    const [generate, setGenerate] = useState(false);

    // Function to show the generate preview modal and set the required data
    const onGenerateHandler = (id, data) => {
        setMinVal(data.fromRange);
        setMaxVal(data.toRange);
        setTemplateId(id);
        setCurrencyCode(data.currencyCode);
        setGenerate(true);
    };

    // Function to close the generate preview modal
    const onGenerateCloseHandler = () => {
        setGenerate(false);
    };

    // useEffect hook to fetch data when the locationId changes
    useEffect(() => {

        getAllTemplateList(locationId);
    }, [locationId]);

    // State for loading indicator
    const [loading, setLoading] = useState(true);

   

    // State for showing employee count modal and storing employees' data
    const [countShow, setCountShow] = useState(false);
    const [employeesData, setEmployeesData] = useState([]);

    // Columns for displaying employee count in a table
    const EmployeeCountColumns = [
        {
            Header: () => <div className="text-right header">Employee Code</div>,
            accessor: "employeeCode",
            Cell: ({ row }) => (
                <div className="text-center" style={{ marginRight: "-55px" }}>{row.original.employeeCode}</div>
            )
        },
        {
            Header: () => <div className="text-right header" style={{ marginRight: "50px" }}>Employee Name</div>,
            accessor: "employeeName",
            Cell: ({ row }) => (
                <div className="text-center" style={{ marginRight: "-55px" }}>{row.original.employeeName}</div>
            )
        }
    ];

    // Function to show employee count modal with employee data
    const onEmployeeCountShow = (data) => {
        setCountShow(true);
        setEmployeesData(data.employees);
    };

    // Function to close employee count modal
    const onCountCloseHandler = () => {
        setCountShow(false);
    };

    // columns for table
    const COLUMNS = [

        // {
        //   Header: "Location",
        //   accessor: "locationName",
        //   // Cell: ({ row }) => (
        //   //   <div style={{ width: "250px" }}>{row.original.name}</div>
        //   // ),
        // },
        {
            Header: "Plan Name",
            accessor: "name",
            // Cell: ({ row }) => (
            //   <div style={{ width: "250px" }}>{row.original.name}</div>
            // ),
        },

        {
            Header: "Basic Component",
            accessor: "componentName",
            Cell: ({ row }) => (
                <div >{row.original.componentName}</div>
            ),
        },
        {
            Header: <div className="numericColHeading">Salary Range</div>,
            accessor: "salaryRange",
            Cell: ({ row }) => (
                <div className="numericData" >
                    {row.original.fromRange.toLocaleString()} -{" "}
                    {row.original.toRange.toLocaleString()}
                </div>
            ),
        },
        {
            Header: "Currency",
            accessor: "currencyCode",
            Cell: ({ row }) => (
                <div className="text-left" >{row.original.currencyCode}</div>
            ),
        },
        {
            Header: <div className="text-right header">Usage Count</div>,
            accessor: "count",
            Cell: ({ row }) => {

                if (row.original.count != 0) {
                    return <div className="text-right" onClick={() => onEmployeeCountShow(row.original.templateUserCount)}><a className=''><u>{row.original.count}</u></a></div>
                }
                else {
                    return row.original.count == 0 && ""
                }
            }
        },
        {
            Header: () => (
                <div className="text-right header" style={{ marginRight: "2.5rem" }}>Actions</div>
            ),
            accessor: "actions",
            disableSortBy: true,
            Cell: ({ row }) => (
                <>
                    <div
                        className="text-wrap text-right"
                    >
                        <Button
                            variant=""
                            className="iconWidth"
                            onClick={() => onGenerateHandler(row.original.id, row.original)}
                        >
                            <Tooltip title={"Preview"} open>
                                <AnxDocument />
                            </Tooltip>
                            <div className="">
                                <AnxDocument />
                            </div>
                            {/* <AnxDocument /> */}
                        </Button>
                        |
                        <Button
                            variant=""
                            className="iconWidth"
                            onClick={() => handleEditTemplate(row.original.id, row.original, row.original.count)}
                        >
                            <EditIcon />
                        </Button>
                        |
                        <Button
                            variant=""
                            className="iconWidth"
                            onClick={() => onDeleteHandler(row.original)}
                            disabled={row.original.deleted}
                        >
                            <DeleteIcon />
                        </Button>
                    </div>
                </>
            ),
        },
    ];

    // Function to export the content as a PDF
    const exportAnnexure = () => {
        // Reference to the DOM element to be captured (via useRef hook)
        const input = pdfRef.current;

        // Using html2canvas to capture the DOM element (input) as a canvas
        html2canvas(input, { scale: 2 }).then((canvas) => {
            // Converting the canvas to a data URL in PNG format
            const imgData = canvas.toDataURL("image/png");

            // Creating a new instance of jsPDF to generate the PDF
            const pdf = new jsPDF();

            // Getting the image properties of the generated PNG image
            const imgProps = pdf.getImageProperties(imgData);

            // Getting the width of the PDF page
            const pdfWidth = pdf.internal.pageSize.getWidth();

            // Calculating the height of the image to maintain the aspect ratio
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // Adding the image (captured DOM element) to the PDF with the calculated width and height
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

            // Saving the generated PDF as "Annexure.pdf"
            pdf.save("Annexure.pdf");
        });
    };


    return (
        <div>

            <>
                {/* // Section element wrapping the entire content of the page */}
                <section className="section">
                    {/* Conditionally render the DetailLoader component when loading is true */}
                    {loading ? <DetailLoader /> : ""}

                    {/* Container to hold the entire content */}
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-12">
                                <div>
                                    {/* PageHeader component displaying the page title */}
                                    <PageHeader pageTitle=" Salary Templates" />
                                    <div>
                                        {/* Row containing the Location selection Form and Add Template Button */}
                                        <div className="row" style={{ alignItems: "center" }}>
                                            {/* Column for the Location selection dropdown */}
                                            <div className="col-7" style={{ marginLeft: "1%" }}>
                                                {/* Form Group for the Location selection */}
                                                <Form.Group
                                                    as={Row}
                                                    className="mb-3"
                                                    controlId="formGroupToDate"
                                                >
                                                    {/* Form Label for the Location dropdown */}
                                                    <Form.Label column sm={2}>
                                                        Location
                                                    </Form.Label>
                                                    {/* Select input for choosing location, with value and onChange handlers */}
                                                    <Col sm={6}>
                                                        <Select
                                                            value={
                                                                locationId
                                                                    ? locationOptions.filter((e) => e.value === locationId)
                                                                    : null
                                                            }
                                                            onChange={handleLocationChange}
                                                            options={locationOptions}
                                                            isClearable
                                                            placeholder="Select Location"
                                                        />
                                                    </Col>
                                                </Form.Group>
                                            </div>
                                            {/* Column for the Add Template button */}
                                            <div className="col-3" style={{ marginLeft: "15%" }}>
                                                {/* Button to navigate to the page for adding a new salary template */}
                                                <Button
                                                    className="addButton"
                                                    variant="addbtn"
                                                    onClick={() => handleAddTemplate()}
                                                >
                                                    <AddIcon />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Table component displaying salary template data */}
                                        <Table
                                        key={salaryTemplateList.length}
                                            columns={COLUMNS} // Columns definition for the table
                                            serialNumber={true} // Enables serial number for each row in the table
                                            data={salaryTemplateList} // Data to be displayed in the table
                                            pageSize="10" // Number of rows per page
                                        // removePagination={false} // (Commented out) Pagination can be controlled here if needed
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </>

            {/*modal for anexure Generator */}
            <Modal show={generate} onHide={onGenerateCloseHandler} size="lg" centered>
                <Modal.Header closeButton={onGenerateCloseHandler}>
                    <Modal.Title>Annexure</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    <Annexure
                        currencyCode={currencyCode}
                        ref={pdfRef}
                        minValue={minValue}
                        maxValue={maxValue}
                        templateId={templateId}
                    />
                </Modal.Body>
                <div className="ModalButton1">
                    <Button className="Button" variant="addbtn" onClick={exportAnnexure}>
                        Download
                    </Button>
                    <Button
                        className="Button"
                        variant="secondary"
                        onClick={onGenerateCloseHandler}
                    >
                        {cancelButtonName}
                    </Button>
                </div>
            </Modal>

            {/* modal for delete */}
            <Modal show={deleteShow} onHide={onDeleteCloseHandler} size="">
                <Modal.Header closeButton={onDeleteCloseHandler}>
                    <Modal.Title>Delete ?</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    Are you sure you want to delete this item ?
                </Modal.Body>
                <div className="delbtn">
                    <Button
                        className="Button"
                        variant="addbtn"
                        onClick={onProceedDeleteHandler}
                    >
                        Yes
                    </Button>
                    <Button
                        className="Button"
                        variant="secondary"
                        onClick={onDeleteCloseHandler}
                    >
                        No
                    </Button>
                </div>
            </Modal>
            {/* modal for employee count */}
            <Modal show={countShow} onHide={onCountCloseHandler} size="m">
                <Modal.Header closeButton={onCountCloseHandler}>
                    <Modal.Title>Employees Count</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modalBody">
                    <Table key={employeesData.length} data={employeesData} columns={EmployeeCountColumns} serialNumber={true} />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default SalaryTempletList;
