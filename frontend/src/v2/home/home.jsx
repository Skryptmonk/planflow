// import Css from "./home.css";
import "./home.css";
import MapView from '../../mapview/mapview';
import { useRef, useState } from "react";
import { useDispatch, connect } from "react-redux";
import { getRoutePath } from "../../mainscreen/reducer/mainscreenAction";
import AccordianControl from "../../component/InspectionListView/inspectionsListView";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import UploadIcon from '@mui/icons-material/FileUpload';
import FilterIcon from '@mui/icons-material/FilterList';
import UpdateIcon from '@mui/icons-material/Update';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Stack, InputLabel, CircularProgress, Divider, Snackbar, Grid } from "@mui/material";
import XLSXLocationReader from "../../helpers/XLSXLocationReader";
import Inspectors from "../inpectors/inspectors";
import Inspections from "../inspections/inspectors";
import InspectionList from "../inspectionList/inspectionList";
import inputData from '../../smapleData/dummyData.json';
import sampleResult from '../../smapleData/dummyResult.json';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid transparent',
    borderRadius: "15px",
    boxShadow: 24,
    pt: 2,
    px: 2,
    pb: 4,
};

function Home(props1) {
    const inputFile = useRef(null);
    const maxInsRef = useRef(null);
    const timeRef = useRef(null);
    const avgInsTimeRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [inputData1, setInputData] = useState(null);
    const [isEditMode, setEditMode] = useState(false);
    const [value, setValue] = useState({});
    const [selectedIndex, setSelectedIndex] = useState(false);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [insData, setInsData] = useState({ maxInspection: 5, time: 8, avgInsTime: 30 })
    const [toastMessage, setToastMessage] = useState({ show: false, message: "" })
    const [hiddenIndex, setHiddenIndex] = useState([]);
    const [modalTitle, setModalTitle] = useState({});

    const onFileChange = async (e) => {
        if (e.target.files.length === 0) return;
        setLoading(true);
        await XLSXLocationReader.Read(await e.target.files[0].arrayBuffer(), (data) => {
            setInputData(data);
            onUpdate(data);
            setLoading(false);
            console.timeEnd('XLSXLocationReader')
        });
        return;
    }

    const onUpdate = (data) => {
        if (!data) {
            setToastMessage({ show: true, message: "Please Load file first." })
            return;
        }
        data.vehicles.map(e => e.capacity = [insData.maxInspection]);
        data.vehicles.map(e => e.time_window = [0, insData.time * 60 * 60]);
        data.jobs.map(e => e.service = insData.avgInsTime * 60);
        dispatch(getRoutePath(data));
        setSelectedIndex(false);
    }

    const onItemClicked = (ind) => {
        setSelectedIndex(ind === selectedIndex ? false : ind);
    }
    const handleOpen = (e) => {
        setModalTitle("Inspectors Availability");
        setOpen(true);
    };
    const handleClose = (e) => {
        setOpen(false);
    };

    const onEditClick = () => {
        if (!inputData) {
            setToastMessage({ show: true, message: "Please Load file first." })
            return;
        }
        setEditMode(true);
    };

    const onVisibleChanged = (ind, isHidden) => {
        const index = hiddenIndex.indexOf(ind);
        if (index > -1) hiddenIndex.splice(index, 1);
        else hiddenIndex.push(ind);
        setHiddenIndex(hiddenIndex);
    }

    const OnSettingsClicked = () => {
        inputFile.current.click();
    }

    const onUpdateButtonClicked = (e) => {
        setInsData({
            maxInspection: maxInsRef.current.lastChild.firstChild.valueAsNumber,
            time: timeRef.current.lastChild.firstChild.valueAsNumber,
            avgInsTime: avgInsTimeRef.current.lastChild.firstChild.valueAsNumber
        });
        setToastMessage({ show: true, message: "Updated. Refresh to view changes." })
        handleClose();
    }
    const onModalNextClicked = (e) => {
        if (modalTitle === "Inspectors Availability") {
            setModalTitle("Inspections");
            return;
        }
        setModalTitle("Inspectors Availability");
        setOpen(false);
        // setLoading(true);
    }

    const onModalBackClicked = (e) => {
        if (modalTitle === "Inspectors Availability") {
            setOpen(false);
            return;
        }
        setModalTitle("Inspectors Availability");
    }
    var props = { mainscreen: { mainData: sampleResult } };
    var summary = props?.mainscreen?.mainData?.summary;
    var displayData = {};
    var totalDuration = Math.round((summary?.duration + summary?.service + summary?.setup) / 60) + "";
    displayData["Total Duration"] = Math.round(totalDuration / 60) + " Hrs " + Math.round(totalDuration % 60) + " Min";
    displayData["Total Distance"] = (Math.round(summary?.distance / 100) / 10) + " Km";
    displayData["Total Inspectors"] = (summary?.routes + inputData?.vehicles?.length - summary?.routes) + "";
    displayData["Total Inspection"] = summary?.delivery[0] + "";
    displayData["Avg. Inspection"] = Math.round(displayData["Total Inspection"] / displayData["Total Inspectors"]) + "";
    displayData["Idle Inspectors"] = (inputData?.vehicles?.length - summary?.routes) + "";
    displayData["Unassigned Inspections"] = summary?.unassigned + "";
    return (
        <div className="home">
            <div className="header">
                <Grid container>
                    <Grid item>
                        <span>Home</span>
                    </Grid>
                    {/* <LocalizationProvider dateAdapter={AdapterDayjs} style={{ float: "right" }}>
                            <DatePicker
                                label="Date"
                                value={value}
                                onChange={(newValue) => {
                                    setValue(newValue);
                                }}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </LocalizationProvider> */}
                </Grid>
            </div>
            <Divider />
            <div className="detailsBar">
                <div className="statsLbl">
                    <div>
                        <span>Stats</span>
                    </div>
                </div>
                <Divider orientation='vertical' />
                {Object.keys(displayData).map((e) => {
                    return [
                        (<div key={e} className="statsData">
                            <span>{displayData[e].includes("NaN") || displayData[e].includes("undefined") ? "-" : displayData[e]}</span><br />
                            <span>{e}</span>
                        </div>),
                        <Divider key={e + "_Div"} orientation='vertical' />
                    ]
                })}
            </div>
            <Divider />
            <div className='map-page'>
                <div className='menu-container'>
                    <InputLabel>Optimized Route</InputLabel>
                    <Divider />
                    <div className="listContainer">
                        {props.mainscreen?.mainData?.routes?.map((e, i) => <AccordianControl key={i} onVisibleChange={onVisibleChanged} hiddenIndex={hiddenIndex} isHidden={hiddenIndex.indexOf(i) !== -1} ind={i} avgInsTime={0} isSelected={selectedIndex === i} onClick={(e) => onItemClicked(i)} inspectorData={e}></AccordianControl>)}
                    </div>
                </div>
                <div className='map-container'>
                    <div style={{ width: "calc(100%)" }}>
                        <MapView hiddenIndex={hiddenIndex} routeData={props.mainscreen?.mainData?.routes} inputData={inputData} selectedIndex={selectedIndex}></MapView>
                    </div>
                    {/* <div style={{ width: "400px",background: "white" }}>
                        <InspectionList style={{ width: "calc(500px);background:white" }} />
                    </div> */}
                </div>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="child-modal-title"
                    aria-describedby="child-modal-description"
                >
                    <Box className="modal" sx={{ ...style, width: 900, height: 525 }}>
                        <div className="modalHeader">{modalTitle}</div>
                        {modalTitle === "Inspectors Availability" ? <Inspectors /> : <Inspections />}
                        <div className="footerButton" style={{ marginTop: "5px" }}>
                            <Stack direction="row" spacing={1}>
                                <Button onClick={onModalBackClicked} variant="contained" disableFocusRipple={true}>
                                    {modalTitle === "Inspectors Availability" ? "Cancel" : "Back"}
                                </Button>
                                <Grid container justifyContent="flex-end">
                                    <Button onClick={onModalNextClicked} variant="contained">
                                        {modalTitle === "Inspectors Availability" ? "Next" : "Create Route Plan"}
                                    </Button>
                                </Grid>
                            </Stack>
                        </div>
                        {/* <Stack direction="column" spacing={4}>
                            <InputLabel>Filter</InputLabel>
                            <TextField
                                ref={maxInsRef}
                                required
                                id="outlined-required"
                                label="Max Inspections"
                                type="number"
                                defaultValue={insData.maxInspection}
                                inputProps={{ max: 100, min: 1 }}
                            />
                            <TextField
                                ref={timeRef}
                                required
                                id="outlined-required"
                                label="Time  (In Hours)"
                                type="number"
                                defaultValue={insData.time}
                                inputProps={{ max: 100, min: 1 }}
                            />
                            <TextField
                                ref={avgInsTimeRef}
                                required
                                id="outlined-required"
                                label="Avg Inspections Time (In Minutes)"
                                type="number"
                                defaultValue={insData.avgInsTime}
                                inputProps={{ max: 100, min: 1 }}
                            />
                            <Button onClick={onUpdateButtonClicked} variant="contained">Update</Button>
                        </Stack> */}
                    </Box>
                </Modal>
                <Modal
                    open={isEditMode}
                    onClose={handleClose}
                    aria-labelledby="child-modal-title"
                    aria-describedby="child-modal-description"
                >
                    <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>

                        {/* <ReactGrid
                            rows={[["a", "2"]]}
                            columns={["", ""]} /> */}
                        {/* <Spreadsheet data={inputData} /> */}
                    </Box>
                </Modal>
                <Modal
                    open={(props?.mainscreen?.loading ?? false) || loading}
                    onClose={handleClose}
                    aria-labelledby="child-modal-title"
                    aria-describedby="child-modal-description"
                >
                    <Box sx={{ ...style, display: 'flex', px: 4, pt: 4 }}>
                        <CircularProgress />
                    </Box>
                </Modal>
                <Snackbar
                    autoHideDuration={3000}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    open={toastMessage.show}
                    onClose={() => setToastMessage({ show: false })}
                    message={toastMessage.message}
                    key={"toast"}
                />
            </div>
            <div className="header">
                <Stack direction="row" spacing={1}>
                    <Button onClick={OnSettingsClicked} variant="contained" disableFocusRipple={true} startIcon={<UploadIcon />}>
                        Settings
                        <input type='file' id='file' ref={inputFile} style={{ display: 'none' }} onChange={onFileChange} />
                    </Button>
                    <Button onClick={handleOpen} variant="contained" startIcon={<FilterIcon />}>
                        Create Route Plan
                    </Button>
                    <Button onClick={() => onUpdate(inputData)} variant="contained" startIcon={<UpdateIcon />}>
                        Publish All
                    </Button>
                    <Button onClick={() => onEditClick()} variant="contained" startIcon={<EditIcon />}>
                        Edit Plan
                    </Button>
                </Stack>
            </div>
        </div >
    );
}
const routeData = (state) => { return { mainscreen: state.mainscreen }; };

export default connect(routeData)(Home);