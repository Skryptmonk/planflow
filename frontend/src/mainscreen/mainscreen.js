import "./mainscreen.css";
import MapView from "../mapview/mapview";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { connect } from "react-redux";
import InspectorListView from "../component/InspectionListView/inpectorListView";
import InspectionsListView from "../component/InspectionListView/inspectionsListView";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from '@mui/material/styles';
import {
  Button,
  Stack,
  TextField,
  InputLabel,
  Divider,
  Snackbar,
  Tooltip,
  tooltipClasses
} from "@mui/material";
import ExcelToJson from "../helpers/ExcelToJson";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../node_modules/bootstrap/dist/js/bootstrap.bundle.min";
import logo from "../icons/logo.png";
import duration from "../icons/svg/duration.svg";
import route from "../icons/svg/route.svg";
import totalins from "../icons/svg/totalins.svg";
import search from "../icons/svg/search.svg";
import average from "../icons/svg/average.svg";
import idle from "../icons/svg/idle.svg";
import warning from "../icons/svg/warning.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import check from "../icons/svg/check.svg";
import uncheck from "../icons/svg/uncheck.svg";
import home from "../icons/svg/home.svg";
import rightarrow from "../icons/svg/rightarrow.svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Calendar from "../icons/svg/calendar.svg";
import RoutePlanner from "../helpers/RoutePlanner";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { CiWarning } from "react-icons/ci";
import LottieControl from "../component/lottieView";
import { Banner } from "../component/banner";
import * as panelData from "../utils/plan.json";
import * as publishData from "../utils/publish.json";
import { convertToUrlParams, getParams } from "../helpers/untils";
import { IoCloudUpload } from "react-icons/io5";
import { FiSettings } from "react-icons/fi";
import { FaRoute } from "react-icons/fa";
import { MdOutlinePublishedWithChanges } from "react-icons/md";
import { VROOMAPI, CROSS_DOMAIN_URL } from "../config";
import Cookies from 'js-cookie'
import db from "../indexedDB";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid transparent",
  borderRadius: "15px",
  boxShadow: 24,
  pt: 2,
  px: 2,
  pb: 2,
};

function MainScreen(props) {
  const [isOpen, setIsOpen] = useState(false);
  const datePickerRef = useRef(null);
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  const inputFile = useRef(null);
  const maxInsRef = useRef(null);
  const timeRef = useRef(null);
  const avgInsTimeRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isPublish, setIsPublish] = useState(false);
  const [inputData, setInputData] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(false);
  const [infoData, setInfoData] = useState({ visible: false, data: {} });
  const [open, setOpen] = useState(false);
  const [insData, setInsData] = useState({
    max_inspection_count: 5,
    time: 8,
    avgInsTime: 30,
  });
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
  });
  const [hiddenIndex, setHiddenIndex] = useState([]);
  const [isRefresh, setIsRefresh] = useState(false);
  const [isPubBtn, setIsPubBtn] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [today] = useState(new Date());
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [individualData, setIndividualData] = useState(false);
  const [clientUrl, setClientUrl] = useState("");
  const [showUnoptimizedData, setShowUnoptimizedData] = useState(false);
  const dataIcon = [
    duration,
    totalins,
    route,
    totalins,
    search,
    average,
    idle,
    warning,
    average,
  ];
  const [filterValue, setFilterValue] = useState("");
  const [previousDate, setPreviousDate] = useState(false);
  const [stepperBtn, setStepperBtn] = useState(false);
  const [addressData, setAddressData] = useState("");
  const [contactNumberData, setContactNumberData] = useState("");
  const [displayRouteDetails, setRouteDetails] = useState({});
  const [isVisible, setVisibility] = useState(false);
  const [zoomLvl, setZoomLvl] = useState(false);
  const [loadopen, setLoadOpen] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [filled, setFilled] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [allocatedName, setAllocatedName] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dataSetLoading, setDataSetLoading] = useState(false);
  const [enableFilter, setEnableFilter] = useState(true);
  const [vehicleId, setVehicleId] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const selectRef = useRef(null);
  useEffect(() => { }, [props.mainscreen?.mainData?.routes]);
  // useEffect(() => {RoutePlanner.computeStatsAfterChange();}, [RoutePlanner.allocated])


  const getParamsFromUrl = () => {
    let params = getParams(window.location.search);
    let authentication = params.authentication;
    delete params.authentication;
    let clientUrl = params.url;
    params.url += "/GetRouteOptimizationInspectionList";
    let urlParamString = convertToUrlParams(params);
    geLatLongFromDB(clientUrl);
    window.urlParamString = clientUrl;
    return { urlParamString, authentication };
  }


   function showToastData(message,show){
    setToastMessage({message:message,show:show})
  }

  const geLatLongFromDB = async (clientUrl) => {

    let data = {
      "Url": `${clientUrl}/GetAllCoordinates`,
      "Method": "Get"
    }
    //When the page is loaded this api will fetch all the so far saved coordinates and add them to the local IndexedDB.
    //So that further api calls will be reduced.
    const response = await fetch(`${VROOMAPI}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin':'*'
      },
      body: JSON.stringify(data)
    });

    response.json().then((data) => {
      Promise.all(data.GetAllCoordinatesResult?.map((e) => {
        var address = e.Address
        var latLng = {
          lat: e.Latitude,
          lng: e.Longitude
        };
        //Adding to indexed db
        db.coordinates.add({ address: data, latLong: latLng });
      }))

    })

  }

  const { urlParamString, authentication } = useMemo(getParamsFromUrl, []);

  const datePickerIconFun = () => {
    let datepickerElement = datePickerRef.current
    datepickerElement.setFocus(true)
  }

  const openUnOptimized = (e) => {
    setVisibility(false);
    setSelectedIndex(false);
    setShowUnoptimizedData(true);
  };



  const BootstrapTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: theme.palette.common.black,
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.black,
    },

  }));
  const onFileChange = async (e) => {
    if (e.target.files.length === 0) return;
    setLoading(true);
    setStepperBtn(true);
    setSelectedIndex(false);
    setIndividualData(false);
    setShowUnoptimizedData(false);
    // CalculatePreviousDate();
    await ExcelToJson.Read(
      await e.target.files[0].arrayBuffer(),
      async (data) => {
        try {
          // let ins = {...data, ...RoutePlanner.unallocated.invalid};
          await RoutePlanner.LoadInputFromJson(new Date(), data);
          await RoutePlanner.Compute(insData,showToastData);
          setDialogOpen(false);
          setAllocatedName(
            RoutePlanner.allocated.map(
              (e) => JSON.parse(e.description).InspectorName
            )
          );
          setStepperBtn(true);
          setLoading(false);
          setIsPubBtn(true);
          console.timeEnd("ExcelToJson");
        } catch (e) {
          setDialogOpen(false);
          setLoading(false);
          setToastMessage({ show: true, message: "Error in web service. Please Load Again" });
        }
      }
    );
    return;
  };

  const handleSvgClick = () => {  
    // Trigger a click event on the select element
    if (selectRef.current) {
      selectRef.current.click();
    }
  };



  const CalculatePreviousDate = () => {
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const selectedDay = startDate.getDate();
    const selectedMonth = startDate.getMonth();
    const selectedYear = startDate.getFullYear();

    // Compare day, month, and year values
    if (selectedYear < currentYear) {
      setPreviousDate(true);
    } else if (selectedYear === currentYear && selectedMonth < currentMonth) {
      setPreviousDate(true);
    } else if (
      selectedYear === currentYear &&
      selectedMonth === currentMonth &&
      selectedDay < currentDay
    ) {
      setPreviousDate(true);
    } else {
      setPreviousDate(false);
      setIsRefresh(false)
      setIsPubBtn(false)
    }
  };

  const onApiLoad = async () => {
    setLoading(true);
    setSelectedIndex(false);
    setIndividualData(false);
    setShowUnoptimizedData(false);
    CalculatePreviousDate();
    try {

      // //BV
      // await RoutePlanner.LoadDataFromAPI(
      //   startDate,
      //   "http://139.84.133.16:4001/api?url=https://bv.gas-inspector.net/Migration/V4_Dev/V4-wcf/ProInspectorJsonV1.svc/GetRouteOptimizationInspectionList?clientId=5&languageId=1&verticalId=3&userId=284",
      //   "e8523250-9ab5-4c96-b5ba-96d45d82bdcd"
      // );

      //GasMed
      await RoutePlanner.LoadDataFromAPI(
        startDate,
        VROOMAPI + urlParamString,
        authentication
      );
      if (!RoutePlanner.hasOptimized) {
        await RoutePlanner.Compute(insData);
        setStepperBtn(true);
      }
      setAllocatedName(
        RoutePlanner.allocated.map(
          (e) => JSON.parse(e.description).InspectorName
        )
      );
      setLoading(false);
      setStepperBtn(true);
      dialogClose();
    } catch (err) {
      setToastMessage({ show: true, message: "Please Load Again" });
      setLoading(false);
      setStepperBtn(true);
      dialogClose();
    }
  };

  const refreshState = (e, i, insData) => {
    setInfoData({
      visible: true,
      index: i,
      insData: insData,
      data: {
        Address: e.description,
        Distance: e.distance,
        Duration: e.duration,
      },
    });
    setInputData(RoutePlanner.allocated);
  };

  const onUpdate = async (data) => {
    if (!data) {
      setToastMessage({ show: true, message: "Please Load file first." });
      return;
    }

    setLoading(true);
    try {
      await RoutePlanner.Compute(insData);
      setVisibility(false);
      setSelectedIndex(false);
      forceUpdate();
      setIsPubBtn(true);
      setLoading(false);
    } catch (e) {
      setToastMessage({ show: true, message: "Error in web service" });
      setLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    setFilterValue(event.target.value);
    forceUpdate();
  };

  const onItemClicked = (ind) => {
    setShowUnoptimizedData(false);
    setVisibility(false);
    setSelectedIndex(ind === selectedIndex ? false : ind);
    setInfoData({
      visible: false,
      data: {},
    });
    setIndividualData(true);
    setZoomLvl(false);
  };
  const handleOpen = (e) => {
    setOpen(true);
  };
  const handleClose = (e) => {
    setOpen(false);
    setIsPublish(false);
  };

  const dialogOpen = (e) => {
    setDialogOpen(true);
  };

  const dialogClose = (e) => {
    setDialogOpen(false);
  };

  const onVisibleChanged = (ind, isHidden) => {
    const index = hiddenIndex.indexOf(ind);
    if (index > -1) hiddenIndex.splice(index, 1);
    else hiddenIndex.push(ind);
    setHiddenIndex(hiddenIndex);
  };

  const onDateChanged = (date) => {
    setStartDate(date);
    CalculatePreviousDate();
    datePickerRef.current.setFocus(false)
    dialogOpen();
  };

  const isValidValue = (value, minValue, maxValue) => {
    return value >= minValue && value <= maxValue;
  };

  const onUpdateButtonClicked = (e) => {
    const newMaxInsCount = maxInsRef.current.lastChild.firstChild.valueAsNumber;
    const newTime = timeRef.current.lastChild.firstChild.valueAsNumber;
    const newAvgInsTime = avgInsTimeRef.current.lastChild.firstChild.valueAsNumber;

    const isValid =
      isValidValue(newMaxInsCount, maxInsRef.current.lastChild.firstChild.min, maxInsRef.current.lastChild.firstChild.max) &&
      isValidValue(newTime, timeRef.current.lastChild.firstChild.min, timeRef.current.lastChild.firstChild.max) &&
      isValidValue(newAvgInsTime, avgInsTimeRef.current.lastChild.firstChild.min, avgInsTimeRef.current.lastChild.firstChild.max);
    if (isValid) {
      setInsData({
        max_inspection_count: newMaxInsCount,
        time: newTime,
        avgInsTime: newAvgInsTime,
      });
      setToastMessage({
        show: true,
        message: "Settings is updated. Click on Optimize routes to view the changes.",
      });
      setFilled(0);
      setIsRefresh(true);
      handleClose();
    } else {
      setToastMessage({
        show: true,
        message: 'Values should be within the specified ranges',
      });
    }
  };

  const onDeleteInvoked = async (inspectorId, inspectionId) => {
    setVisibility(false);
    let cLen = RoutePlanner.allocated.length;
    await RoutePlanner.RemoveInspection(inspectorId, inspectionId, insData);
    if (cLen !== RoutePlanner.allocated.length) setSelectedIndex(false);
    forceUpdate();
    RoutePlanner.computeStatsAfterChange();
  };

  const descriptionData = (addressName, contactNumber, address, code) => {
    if (addressName != "undefined")
      setRouteDetails({
        Name: addressName,
        Contact: contactNumber,
        Address: address,
        Inspection_Code: code
      });
    setVisibility(true);
  };

  useEffect(() => {
    if (loading) {
      setLoadOpen(true);
      setIsRunning(true);
      setDataSetLoading(true);
    }
  }, [loading]);

  useEffect(() => {
    if (loading === false) {
      const timeoutId = setTimeout(() => {
        setShowRoutes(RoutePlanner.hasOptimized);
        handleLoadClose();
      }, 500);

      return () => clearTimeout(timeoutId); // Clear the timeout if the condition changes
    }
  }, [loading]);


  const handleLoadClose = () => {
    setLoadOpen(false);
    setIsPublish(false);
    setIsRunning(false);
    setFilled(0);
    setDataSetLoading(false);
  };

  useEffect(() => {
    if (filled < 100 && isRunning) {
      setTimeout(() => setFilled((prev) => (prev += 2)), 120);
    }
  }, [filled, isRunning]);

  useEffect(() => {
    let timer;
    if (dataSetLoading) {
      timer = setInterval(() => {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, 500);
    }
    return () => {
      clearInterval(timer);
    };
  }, [dataSetLoading]);

  useEffect(() => {
    if (currentIndex >= allocatedName.length) {
      setDataSetLoading(false);
    }
  }, [currentIndex, allocatedName.length]);

  const getInspectionsListView = () => {
    if (
      !showUnoptimizedData &&
      selectedIndex !== 0 &&
      (!selectedIndex || !RoutePlanner.hasOptimized)
    ) {
      return <></>; // Return nothing when the conditions are met.
    }
    setShowUnoptimizedData(
      RoutePlanner.unallocated.inspections.length + RoutePlanner.unallocated.invalid.length === 0
        ? false
        : showUnoptimizedData
    );

    return (
      <InspectionsListView
        deleteClicked={onDeleteInvoked}
        isSelectAll={isSelectAll}
        onVisibleChange={onVisibleChanged}
        isTab={false}
        selectedPointIndex={infoData}
        hiddenIndex={hiddenIndex}
        inspectionListing={true}
        descriptionData={descriptionData}
        avgInsTime={0}
        previousDate={previousDate}
        isUnoptimizedListing={showUnoptimizedData}
        onUpdate={refreshState}
        inspectorData={
          showUnoptimizedData
            ? RoutePlanner.unallocated?.inspections.concat(
              RoutePlanner.unallocated?.invalid
            )
            : RoutePlanner.allocated?.filter(
              (e, i) => e.vehicle === selectedIndex
            )[0]
        }

      ></InspectionsListView>
    );
  };

  const excludeInspectors = async (inspectorID, inspectorRouteData) => {
    RoutePlanner.ExcludeInspector(inspectorID);
    forceUpdate();
  };

  const addUnallocatedInspectors = async (inspectorId) => {
    RoutePlanner.AddFromExcludeInspectors(inspectorId);
    forceUpdate();
  };

  const getInspectorsListView = (evnt, isIdleInspector, isExcluded) => {
    if (!isIdleInspector) {
      if (filterValue === "delivery") {
        evnt = evnt.sort((a, b) => a[filterValue][0] - b[filterValue][0]);
      } else if (filterValue === "duration") {
        evnt = evnt.sort(
          (a, b) => a[filterValue] + a.service - (b[filterValue] + b.service)
        );
      }
      else {
        evnt = evnt.sort((a, b) => a[filterValue] - b[filterValue]);
      }

      var modifiedList = evnt.map(function (item) {
        if (item.color == "#F23333") {
          item.color = RoutePlanner.getRandomColor()
          return item;
        }
        return item;
      });
      evnt = modifiedList ?? [];
    }
    return evnt.map((e, i) => (
      <InspectorListView
        key={i}
        isIdleInspector={isIdleInspector}
        isSelectAll={isSelectAll}
        onVisibleChange={onVisibleChanged}
        isTab={true}
        selectedPointIndex={infoData}
        hiddenIndex={hiddenIndex}
        inspectionListing={false}
        isHidden={hiddenIndex.indexOf(i) !== -1}
        ind={i}
        avgInsTime={0}
        excludeInspector={excludeInspectors}
        addFromExcludedInspectors={addUnallocatedInspectors}
        isExcludedInspector={isExcluded || isIdleInspector}
        isSelected={selectedIndex === e.vehicle}
        onClick={(t) => onItemClicked(e.vehicle)}
        onUpdate={refreshState}
        inspectorData={e}
        onMouseEnter={() => {
          setVehicleId(e.vehicle);
        }}
      ></InspectorListView>
    ));
  };

  const onDragEnd = async (result) => {
    setVisibility(false);
    setEnableFilter(false);
    const { destination, source, draggableId } = result;
    let desId = parseInt(destination.droppableId);
    if (!isNaN(desId)) {
      desId = vehicleId ?? parseInt(destination.droppableId)
    }
    let insId = source.index;
    let srcId = parseInt(draggableId.split("_")[0]);
    if (isNaN(desId) || srcId === desId) return;
    if (srcId !== -1) {
      let res = await RoutePlanner.RemoveInspection(srcId, insId, insData);
      if (res) setSelectedIndex(false);
    }
    var isAdded = await RoutePlanner.AddInspection(desId, insId, insData);
    setToastMessage({ show: !isAdded, message: "This Inspection cannot be Assigned" })

    RoutePlanner.computeStatsAfterChange();
    forceUpdate();
  };

  const getStatsView = () => {
    return (
      <div className="statsContainer">
        <div className="statsContainerItems">
          {Object.keys(displayData).map((e, i) => {
            return (
              <div className="inspectionData" key={i}>
                <div
                  key={e}
                  className={`inspectionDataList`}
                  f
                  style={{
                    background: i % 2 === 0 ? "#1376BC" : "#074796",
                  }}
                >
                  <img
                    src={dataIcon[i]}
                    alt="load again"
                    height={45}
                    width={45}
                    className="dataIcon"
                  />
                  <div className="inspectionDataEl">
                    <p>
                      {displayData[e].includes("NaN") ||
                        displayData[e].includes("undefined")
                        ? "-"
                        : displayData[e]}
                    </p>
                    <p>{e}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getMapContainer = () => {
    return (
      <div className="map-container">
        <MapView
          hiddenIndex={hiddenIndex}
          routeData={RoutePlanner.allocated}
          inputData={inputData}
          selectedIndex={selectedIndex}
          selectedPointIndex={infoData.index}
          zoomLvl={zoomLvl}
        ></MapView>
      </div>
    );
  };

  const getHeader = () => {
    return (
      <div className="navbar">
        <img src={logo} className="routeLogo" alt="load again" />
        {getCalenderView()}
      </div>
    );
  };

  const buildRoutesContainer = () => {
    return (
      <div className="tabPanel">
        <Stack direction={"row"} style={{ justifyContent: "space-between", width: "100%" }}>
          <Stack style={{ justifyContent: "space-between", width: "100%" }}>
            <div className="optimizedRoutes">
              <Stack
                direction={"row"}
                style={{ justifyContent: "space-between", width: "100%" }}
              >
                <Stack
                  direction={"row"}
                  style={{
                    width: "100%",
                    marginLeft: "15px",
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "nowrap",
                    alignContent: "stretch",
                    alignItems: "stretch",
                    justifyContent: "flex-end",
                  }}
                >
                  <div class="check-class">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ position: 'relative', flex: '1' }}>
                        <select ref={selectRef}
                          id="filterValue"
                          value={filterValue}
                          onChange={handleFilterChange}
                          style={{
                            border: 'none',
                            textAlign: 'right',
                            cursor: 'pointer',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            margin: '0',
                            padding: '0px 7px 0px 10px',
                            paddingLeft: '10px',
                            width: '100%',
                          }}
                          className="custom-select"
                        >
                          <option value="">Sort By</option>
                          <option value="duration">Duration</option>
                          <option value="distance">Distance</option>
                          <option value="delivery">No. of Inspections</option>
                        </select>
                      </div>
                      <svg class="sortby"
                        stroke="currentColor"
                        fill="f000000"
                        strokeWidth="0"
                        viewBox="0 0 24 24"
                        height="1em"
                        width="1em"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          fontSize: '20px', transition: "background-color 0.25s",
                          height: "1.6em",
                          width: "1.5em",
                          padding: "0.25em",
                          borderRadius: "100%",
                          verticalAlign: "sub"
                        }}
                        onClick={handleSvgClick}>
                        <g id="Warning">
                          <g>
                            <path d="M22 7H2" stroke="black" stroke-width="1.5" stroke-linecap="round" />
                            <path opacity="0.5" d="M19 12H5" stroke="black" stroke-width="1.5" stroke-linecap="round" />
                            <path d="M16 17H8" stroke="black" stroke-width="1.5" stroke-linecap="round" />
                          </g>
                        </g>
                      </svg>&nbsp;&nbsp;&nbsp;&nbsp;
                    </div>
                  </div>
                  <div style={{ alignItems: "end", marginRight: "20px", paddingTop: "3px" }}>
                    <Stack
                      direction={"row"}
                      style={{
                        display:
                          RoutePlanner.unallocated.inspections.length === 0 &&
                            RoutePlanner.unallocated.invalid.length === 0
                            ? "none"
                            : "block",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{}}>
                        <CiWarning
                          style={{ fontSize: "20px", color: "#f85900", verticalAlign: "sub" }}
                        />
                        <span
                          style={{
                            paddingLeft: "5px",
                            paddingTop: "20px",
                            color: "#f85900",
                          }}
                          onClick={openUnOptimized}
                        >
                          Unassigned (
                          {RoutePlanner.unallocated.inspections.length +
                            RoutePlanner.unallocated.invalid.length}
                          )
                        </span>
                      </div>
                    </Stack>
                  </div>
                </Stack>
              </Stack>{" "}
              <div className="allocatedEl">
                {getInspectorsListView(
                  RoutePlanner.allocated?.filter((e) => e?.steps.length > 2),
                  false,
                  false
                )}
                <div
                  className="divider"
                  style={{
                    margin: "20px 25px 10px 25px",
                    borderTop: "1px dashed #0000033",
                    display: "none"
                  }}
                >
                </div>
                <div>

                  <div
                    style={{
                      backgroundColor: "red",
                      padding: "10px",
                      borderRadius: "3px",
                      width: "100%", // Set the width to 100%
                    }}
                  >
                    <span className="locationlabel">Idle Inspectors</span>
                  </div>

                  <div style={{ margin: "10px 0px 0px 0px" }}>
                    {RoutePlanner.unallocated.inspectors.length === 0 ? (
                      <p>No Inspector found</p>
                    ) : (
                      getInspectorsListView(RoutePlanner.unallocated.inspectors, true, false)
                    )}
                  </div>

                  {/* Excluded Inspectors Section */}

                  <div
                    style={{
                      backgroundColor: "red",
                      padding: "10px",
                      borderRadius: "3px",
                      width: "100%", // Set the width to 100%
                    }}
                  >
                    <span className="locationlabel">Excluded Inspectors</span>
                  </div>
                  <div style={{ margin: "10px 0px 0px 0px" }}>
                    {getInspectorsListView(RoutePlanner.excluded.inspectors, false, true)}
                  </div>
                </div>
              </div>
            </div>
          </Stack>
        </Stack>
      </div>
    );
  };

  const getIndividualContainers = () => {
    return (
      <Droppable droppableId="droppable1">
        {(evt) => (
          <Stack>
            <div
              className="inspectionListing"
              {...evt.droppableProps}
              ref={evt.innerRef}
            >
              <div style={{ padding: "10px" }} >
                <div>
                  {showUnoptimizedData ? (
                    <InputLabel
                      className="locationlabel"
                      style={{
                        paddingTop: "10px",
                        paddingLeft: "10px",
                        fontWeight: "700",
                        fontSize: "20px",
                        color: "black",
                        textAlign: "left",
                      }}
                    >
                      Unassigned Inspections
                    </InputLabel>
                  ) : (
                    <InputLabel
                      className="locationlabel"
                      style={{
                        paddingTop: "10px",
                        paddingLeft: "10px",
                        fontWeight: "700",
                        fontSize: "20px",
                        color: "black",
                        textAlign: "left",
                      }}
                    >
                      Planned Inspections
                    </InputLabel>
                  )}
                </div>
                <div class="unassigned-clse-div" aria-haspopup="true"
                  style={{
                    position: "absolute",
                    right: "3px",
                    top: "20px",
                    color: "#3388f2",
                    display: "inline-block",
                    transition: "background-color 0.25s",
                    height: "2em",
                    width: "2em",
                    padding: "0.25em",
                    borderRadius: "80%",
                  }}
                >
                  <CloseIcon
                    onClick={() => {
              
                      setIndividualData(false);
                      setShowUnoptimizedData(false);
                    }}
                  />
                </div>
              </div>
              <Divider />
              {getInspectionsListView()}
            </div>
          </Stack>
        )}
      </Droppable>
    );
  };

  const getUnassignedView = () => {
    return (
      <Droppable droppableId="droppable2">
        {(evt) => (
          <Stack>
            <div
              className="inspectionListing"
              {...evt.droppableProps}
              ref={evt.innerRef}
            >
              <div style={{ padding: "10px" }}>
                <div>
                  <InputLabel
                    className="locationlabel"
                    style={{
                      // position: "absolute",
                      // float: "left",
                      paddingTop: "10px",
                      fontWeight: "700",
                      fontSize: "22px",
                      color: "black",
                      textAlign: "left",
                    }}
                  >
                    UnOptimized Routes
                  </InputLabel>
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "20px",
                    color: "#3388f2",
                  }}
                >
                  <CloseIcon
                    onClick={() => {
                      
                      setShowUnoptimizedData(false);
                    }}
                  />
                </div>
              </div>
              <Divider />
              {getInspectionsListView()}
            </div>
          </Stack>
        )}
      </Droppable>
    );
  };

  const getBottomButtons = () => {
    return (
      <div className="bottomButtons" style={{}} >
        <Stack direction={"column"} style={{ height: "auto", justifyContent: "space-between" }}>
          {isPubBtn ? (<BootstrapTooltip
            placement="top-end"
            title={
              <span style={{ color: "#fff" }}>Publish Inspections</span>
            }
          >
            <button className="resetEl" onClick={() => {
              alert();
              setIsPublish(true);
            }}>
              <MdOutlinePublishedWithChanges size={25} />
            </button>
          </BootstrapTooltip>) : null}
          {isRefresh ? (<BootstrapTooltip
            placement="top-end"
            title={
              <span style={{ color: "#fff" }}>Optimize Routes</span>
            }
          >
            <button className="resetEl" onClick={() => {
              setFilterValue("");
              onUpdate(RoutePlanner.allocated);
            }}>
              <FaRoute size={25} />
            </button>
          </BootstrapTooltip>) : null}
          {RoutePlanner.allocated.length > 0 && !previousDate ?
            (<BootstrapTooltip
              title={<span style={{ color: "#fff" }}>Setting</span>}
              arrowOffsetLeft={-20}
            >
              <button className="resetEl" onClick={handleOpen}>
                <FiSettings size={25} />
              </button>
            </BootstrapTooltip >) : null}
          <BootstrapTooltip
            title={
              <span style={{ color: "#fff" }}>Reset Zoom</span>
            }
          >

            <button
              className="resetEl"
              onClick={() => {
                if (isZoomed) {
                  setZoomLvl(1);
                  setIsZoomed(false);
                } else {
                  onItemClicked(selectedIndex);
                  setIsZoomed(true);
                }
              }}
            >
              <img src={home} alt="load again" size={25} />
            </button>
          </BootstrapTooltip>
        </Stack>
      </div>
    );
  };



  const getSettings = () => {
    return (
      <button
        className="resetEl"
        onClick={() => {
          onItemClicked(selectedIndex);
          setZoomLvl(true);
        }}
      >
        <img src={home} alt="load again" style={{ marginBottom: "3px" }} />
      </button>
    );
  };

  const getViewOnly = () => {
    if (previousDate) {
      return (
        <div className="viewOnly">
          <span>View only</span>
        </div>
      );
    }
  };

  const getSteppers = () => {
    return (
      <div
        className="stepperButtonEl"
      // style={{ left: stepperBtn ? "36.5vw" : "2vw" }}
      >
        <button className="btnEl" onClick={dialogOpen}>
          Load Inspections
        </button>

      </div>
    );
  };

  const getCalenderView = () => {
    return (
      <div className="datePickerEl">
        <label className="datePickerLabel">
          <DatePicker
            onInputClick={() => setIsOpen(true)}
            onClickOutside={() => setIsOpen(false)}
            open={isOpen}
            selected={startDate}
            onChange={(date) => {
              onDateChanged(date);
            }}
            dateFormat="MMM dd,yyyy"
            className="dateEl"
            ref={datePickerRef}
          />
          <img src={Calendar} onClick={() => datePickerIconFun()} alt="load again" className="calenderIconEl" style={{
            display: "inline-block",
            transition: "background-color 0.25s",
            height: "2em",
            width: "2em",
            padding: "0.30em",
            borderRadius: "100%",
          }} />
        </label>
      </div>
    );
  };

  const getRouteDetailsPanel = () => {
    return (
      <>
        <div style={{ minWidth: "500px" }}>
          <div
            className="infowindow"
            style={{ display: isVisible ? "block" : "none" }}
          >
            <div style={{ padding: "10px" }}>
              <div>
                <InputLabel
                  className="locationlabel"
                  style={{
                    // position: "absolute",
                    // float: "left",
                    paddingTop: "5px",
                    fontWeight: "700",
                    fontSize: "20px",
                    color: "black",
                    textAlign: "left",
                  }}
                >
                  Location Details
                </InputLabel>
              </div>
              <div
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "15px",
                  color: "#3388f2",
                }}
              >
                <CloseIcon
                  onClick={() => {
                  
                    setVisibility(false);
                  }}
                />
              </div>
            </div>
            {Object.keys(displayRouteDetails).map((e) => {
              return [
                <div
                  key={e}
                  className="locationColumn"
                >
                  <span
                    className="locationLabelColumn"
                    style={{
                      color: "#00000066",
                      fontWeight: "400",
                      fontSize: "14px",
                    }}
                  >
                    {e.replace("_", " ") + " :"}
                  </span>
                  <span
                    className="locationDetailColumn"
                    style={{
                      color: "black",
                      fontWeight: "400",
                      fontSize: "14px",
                    }}
                  >
                    {displayRouteDetails[e]}
                  </span>
                  <br />
                  <div class="clearfix"></div>
                </div>,
              ];
            })}
            <div style={{ paddingBottom: "10px" }}></div>
            <Divider />
          </div>

          {/* {RoutePlanner.hasOptimized ? buildRoutesContainer() : <Banner />} */}
        </div>
      </>
    );
  };

  const getLeftPanel = () => {
    return (
      <>
        <div className="contentEl">
          {showRoutes ? buildRoutesContainer() : <Banner />}
        </div>
      </>
    );
  };

  const handleRange = (event) => {
    const newValue = parseInt(event.target.value, 10);
    const minValue = event.target.min;
    const maxValue = event.target.max;
    if (newValue >= minValue && newValue <= maxValue) {
      // Handle valid input
    } else if (!isNaN(newValue)) {
      setToastMessage({
        show: true,
        message: `Range should be ${minValue} to ${maxValue}`,
      });
    }
  };

  const getModels = () => {
    return (
      <>
        <Modal
          open={isDialogOpen}
          onClose={dialogClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{ ...style, boxSizing: "content-box", px: 3, py: 3 }}>
            <Stack direction="row" spacing={4}>
              <div className="dialog">
                <button
                  className="btnEl"
                  onClick={() => {
                    inputFile.current.click();
                  }}
                >
                  Load From File
                  <input
                    type="file"
                    id="file"
                    ref={inputFile}
                    style={{ display: "none" }}
                    onChange={onFileChange}
                  ></input>
                </button>
                <button className="btnEl" onClick={onApiLoad}>
                  Load From API
                </button>
              </div>
            </Stack>
          </Box>
        </Modal>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{ ...style, width: 400, px: 4, pb: 3 }}>
            <Stack direction="column" spacing={4}>
              <InputLabel>Settings</InputLabel>
              <TextField
                ref={maxInsRef}
                required
                id="outlined-required"
                label="Max Inspections Per Inspector Per Day"
                type="number"
                onChange={handleRange}
                defaultValue={insData.max_inspection_count}
                inputProps={{ max: 100, min: 1 }}
              />
              <TextField
                ref={timeRef}
                required
                id="outlined-required"
                label="Time (In Hours)"
                type="number"
                onChange={handleRange}
                defaultValue={insData.time}
                inputProps={{ max: 12, min: 1 }}
              />
              <TextField
                ref={avgInsTimeRef}
                required
                id="outlined-required"
                label="Duration Per Inspection (in Minutes)"
                type="number"
                onChange={handleRange}
                defaultValue={insData.avgInsTime}
                inputProps={{ max: 100, min: 15 }}
              />
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <Button onClick={onUpdateButtonClicked} variant="contained" style={{ backgroundColor: '#4287f5', color: '#FFF' }}>
                  Update
                </Button>
                <Button onClick={handleClose} variant="contained" style={{ backgroundColor: '#FFF', color: '#4287f5', border: '1px solid #4287f5' }}>
                  Cancel
                </Button>
              </div>
            </Stack>
          </Box>
        </Modal>
        <Modal
          open={isPublish}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{ ...style, width: "auto", px: 4, pb: 3 }}>
            <Stack direction="column" spacing={4}>
              <div>Do you want to Publish Optimized Route ?</div>
              <Stack
                direction={"row"}
                style={{ justifyContent: "space-evenly" }}
              >
                <Button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      let params = getParams(window.location.search);
                      params.url += "/SaveRouteOptimizationDetails";
                      let result = await RoutePlanner.Publish(
                        startDate,
                        VROOMAPI + "url=" +
                        params.url,
                        params
                      );
                      setIsPublish(false);
                      setLoading(false);
                    } catch (e) {
                      setLoading(false);
                      setIsPublish(false);
                      setToastMessage({
                        show: true,
                        message: "Error while Publish",
                      });
                    }
                  }}
                  variant="contained"
                >
                  Publish
                </Button>

                <Button
                  onClick={async () => {
                    setIsPublish(false);
                  }}
                  variant="contained"
                  style={{ backgroundColor: '#FFF', color: '#4287f5', border: '1px solid #4287f5' }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Modal>
        <Modal
          open={loadopen}
          onClose={loadopen}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{ ...style, display: "flex", flexDirection: "column" }}>
            <LottieControl
              animationData={isPubBtn ? publishData : panelData}
              height={300}
              width={300}
            />
            <div className="progressBar">
              {!isPubBtn && (
                <p>
                  Loading Inspections for Route Optimization: Preparing for
                  Efficient Routing...
                </p>
              )}

              <div
                style={{
                  height: "10px",
                  width: "100%",
                  backgroundColor: "#eee",
                  borderRadius: "20px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${filled}%`,
                    backgroundColor: "#3388f2",
                    transition: "width 1.5s",
                  }}
                ></div>
              </div>
              <p style={{ marginTop: "1em" }}>{allocatedName[currentIndex]}</p>
            </div>
          </Box>
        </Modal>
      </>
    );
  };

  const getSnackbar = () => {
    return (
      <Snackbar
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={toastMessage.show}
        onClose={() => setToastMessage({ show: false })}
        message={toastMessage.message}
        key={"toast"}
      />
    );
  };

  let totalInspectors =
    RoutePlanner.allocated.length +
    RoutePlanner.unallocated.inspectors.length +
    RoutePlanner.excluded.inspectors.length;
  var displayData = {};
  var occupied =
    (RoutePlanner.stats.totalTimeInvolved /
      (totalInspectors * insData.time * 60)) *
    100;
  displayData["Planned / Available"] =
    Math.floor(RoutePlanner.stats.totalTimeInvolved / 60) +
    " h " +
    RoutePlanner.stats.totalTimeInvolved % 60 +
    " m / " +
    Math.floor((totalInspectors * insData.time * 60) / 60) +
    " h ";
  displayData["Allocated"] = Math.round(occupied) + " %";
  displayData["Total Distance"] =
    Math.round(RoutePlanner.stats.totalDistance / 100) / 10 + " Km";
  displayData["Total Inspectors"] =
    RoutePlanner.allocated.length + " / " + totalInspectors + "";
  displayData["Total Inspection"] =
    RoutePlanner.stats.unallocatedInspections +
    RoutePlanner.stats.allocatedInspections +
    "";
  displayData["Avg. Inspection"] =
    Math.round(
      RoutePlanner.stats.allocatedInspections / RoutePlanner.allocated.length
    ) + "";
  displayData["Unassigned Inspection"] = RoutePlanner.unallocated.inspections.length + "";

  return (
    <DragDropContext key={1} onDragEnd={onDragEnd}>
      <div className="homescreen">
        <div className="two-columns">
          <div className="left">
            {getHeader()}
            {getLeftPanel()}
            {getRouteDetailsPanel()}
          </div>
          <div className="right" style={{ position: "relative" }}>
            {getViewOnly()}
            {getSteppers()}
            {/* {getResetButton()} */}
            {getBottomButtons()}
            {/* {getSettings()} */}
            {getStatsView()}
            {getMapContainer()}
            {(selectedIndex === 0 || selectedIndex) && individualData
              ? getIndividualContainers()
              : null}
            {showUnoptimizedData ? getIndividualContainers() : null}
            {getModels()}
          </div>
        </div>
      </div>

      {getSnackbar()}
    </DragDropContext>
  );
}
const routeData = (state) => {
  return { mainscreen: state.mainscreen };
};

export default connect(routeData)(MainScreen);
