import "./inspectionListView.css";
import "../../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../../node_modules/bootstrap/dist/js/bootstrap.bundle.min";
import { RiDragMove2Line } from "react-icons/ri";
import { Stack, Tooltip } from "@mui/material";
import { CgCloseR } from "react-icons/cg";
import { Draggable } from "react-beautiful-dnd";
import { FaHome } from "react-icons/fa";
import moment from "moment";
import { AiOutlineClockCircle } from "react-icons/ai";
import car from "../../icons/svg/car.svg";
import duration from "../../icons/svg/duration.svg";
import drag from "../../icons/svg/drag.svg";
import unassign from "../../icons/svg/unassign.svg";
import { jsx } from "@emotion/react";
import { tooltipClasses } from "@mui/material";
import { styled } from '@mui/material/styles';

// eslint-disable-next-line import/no-anonymous-default-export
export default (props) => {
  const handleDelete = (id) => {
    props.deleteClicked(props.inspectorData.vehicle, id);
  };

  const isUnoptimizedListing = props.isUnoptimizedListing;
  const isPreviousDate = props.previousDate;
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
  var startTime = 540;

  const getStartTime = (
    inspectionColor,
    homeAddress,
    arrival,
    travelDistance,
    travelDuration,
    className,
    previousAddress,
    currentAddress
  ) => {

    if (arrival !== undefined) {
      arrival = arrival;
    } else {
      arrival = 0;
    }

    if (previousAddress === currentAddress) {
      travelDistance = 0;
      travelDuration = 0;
    } else {
      travelDistance = travelDistance;
      travelDuration = travelDuration;
    }

    const time = moment()
      .startOf("day")
      .add(startTime + arrival / 60, "minutes");
    const timeString = time.format("HH:mm");
    const travelKms = Math.round(travelDistance / 100) / 10;
    var distanceString = travelKms + " kms";
    const travelDur = Math.round(travelDuration / 60);
    var durationString = travelDur + " mins";
    return (
      <Stack className={className} direction={"row"} style={{ background: inspectionColor }}>
        <AiOutlineClockCircle size={18} style={{ marginRight: "3px", marginLeft: "5px" }} />
        <span style={{ marginRight: "5px", fontSize: "16px" }}>{timeString}</span>
        {homeAddress.length > 0 ? (
          <span style={{ marginRight: "5px", flex: 1, fontSize: "16px" }}>
            {homeAddress}
          </span>
        ) : null}
        {travelDistance !== 0 && travelDuration !== 0
          ? (
            <div style={{ alignSelf: "center" }}>
              <img style={{ marginLeft: "5px", marginRight: "3px" }} src={car} alt="load again" />
              <span style={{ marginRight: "5px", fontSize: "16px" }}>{distanceString}</span>
              <AiOutlineClockCircle size={18} style={{ marginRight: "3px", marginLeft: "5px" }} />
              <span style={{ marginRight: "5px", fontSize: "16px" }} >{durationString}</span>
            </div>
          ) : null}
      </Stack>
    );
  };

  const getHomeAddress = (arrivalTime, duration, distance) => {
    return (
      <div style={{ margin: "10px", width: "auto", position: "relative" }}>
        <Stack direction={"row"} style={{ alignItems: "center" }}>
          {duration === 0 && <div className="vertical-line-home"></div>}
          <FaHome size={18} color="#FF7A00" />
          <Stack
            direction={"row"}
            className="homeCardContainer"
            alignItems={"flex-start"}
          >
            <div>
              {getStartTime("#FF7A00", JSON.parse(props.inspectorData.description).Address ?? "", arrivalTime, distance, duration, "startTime")}
            </div>
            {/* <span className="homeAddress">
              {JSON.parse(props.inspectorData.description).Address}
            </span> */}
          </Stack>
        </Stack>
      </div>
    );
  };



  if (isUnoptimizedListing) {
    return (
      <div className="descriptionCard">
        <ul className="rounded-list">
          {props.inspectorData.map((e, i) => (
            <Draggable
              draggableId={"-1_" + e.ScheduleId}
              key={e.ScheduleId}
              index={e.ScheduleId}
              isDragDisabled={isPreviousDate}
            >
              {(evt) => (
                <li
                  key={i + 1}
                  {...evt.dragHandleProps}
                  {...evt.draggableProps}
                  ref={evt.innerRef}
                >
                  <a id={i + 1}>
                    <Stack
                      direction={"row"}
                      style={{
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: 40,
                        overflow: "hidden",
                      }}
                    >
                      <BootstrapTooltip
                        key={i + 1}
                        placement="top-start"
                        title={
                          e.latLng == undefined ? "Invalid Address" : e.Address
                        }
                      >
                        <span
                          className="text"
                          style={{
                            height: "20px",
                            display: "inline-block",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            color: e.latLng === undefined ? "red" : "black",
                          }}
                        >
                          {e.Address}
                        </span>
                      </BootstrapTooltip>
                      <Stack
                        direction={"row"}
                        style={{
                          alignItems: "center",
                          display: isPreviousDate ? "none" : "block",
                        }}
                      >
                        <span
                          style={{ marginRight: "15px", marginLeft: "15px" }}
                        >
                          {/* <RiDragMove2Line color="#B22222" size={18} /> */}
                          <img src={drag} alt="load again" height={25} width={25} style={{ float: 'right', position: 'relative', bottom: 10 }} />
                        </span>
                      </Stack>
                    </Stack>
                  </a>
                </li>
              )}
            </Draggable>
          ))}
        </ul>
      </div>
    );
  } else {
    const lastObject =
      props.inspectorData.steps[props.inspectorData.steps.length - 1];
    const lastObjectArrival = lastObject.arrival;
    const firstObject = props.inspectorData.steps[0];
    const firstObjectArrival = firstObject.arrival;
    let inspectionColor = props.inspectorData?.color;

    if (inspectionColor === null || inspectionColor === undefined || inspectionColor === "") {
      inspectionColor = "#1376BC"
    }

    return (
      <div className="descriptionCard">
        <ul>
          {getHomeAddress(firstObjectArrival, 0, 0)}
          {props.inspectorData.steps
            .filter((e) => e.type === "job")
            .map((e, i) => {
              const previous = i > 0 ? JSON.parse(props.inspectorData.steps[i].description).Address : {};
              const previousAddress = i > 0 ? props.inspectorData.steps[i] : null;
              return (
                <li key={e.job} style={{ position: 'relative' }}>
                  <div className="vertical-line"></div>
                  <Draggable
                    draggableId={props.inspectorData.vehicle + "_" + e.job}
                    key={e.job}
                    index={e.job}
                    isDragDisabled={isPreviousDate}
                  >
                    {(evt) => (

                      <li
                        key={i + 1}
                        {...evt.dragHandleProps}
                        {...evt.draggableProps}
                        ref={evt.innerRef}
                      >


                        <Stack direction={"row"} alignItems={"center"}>
                          <div
                            className="rounded-list"
                            style={{ marginRight: "-10px" }}
                          >
                            <a style={{ "--background-color": inspectionColor }} id={i + 1} ></a>
                          </div>
                          {/* <div className="vertical-line"></div> */}
                          <Stack
                            direction={"row"}
                            className="inspectionCardContainer"
                            justifyContent={"space-between"}
                            style={{
                              color: inspectionColor,
                              background: `${inspectionColor}20`,
                              border: `1px solid ${inspectionColor}10`,
                            }}
                          >
                            <Stack
                              direction={"Column"}
                              alignItems={"flex-start"}
                              justifyContent={"space-between"}
                            >
                              <div className="">
                                {getStartTime(
                                  inspectionColor,
                                  "",
                                  e.arrival,
                                  previousAddress !== null ? e.distance - previousAddress.distance : e.distance,
                                  previousAddress !== null ? e.duration - previousAddress.duration : e.duration,
                                  "inspectionStartTime",
                                  previous,
                                  JSON.parse(e.description).Address
                                )}
                              </div>
                              <div
                                className="text"
                                style={{
                                  textOverflow: "ellipsis",
                                  fontWeight: "bold",
                                  fontSize: "16px",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  textAlign: "left",
                                  color: "#1C2025",
                                }}
                              >
                                {JSON.parse(e.description).InspectionCode}
                              </div>
                              <BootstrapTooltip
                                key={i + 1}
                                placement="top-start"
                                title={
                                  JSON.parse(e.description).ContactName != null
                                    ? JSON.parse(e.description).ContactName
                                    : ""
                                }
                              >
                                <span
                                  className="text"
                                  style={{
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    fontSize: "14px",
                                    textAlign: "left",
                                    color: "#1C2025",
                                    fontWeight: 400,
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.color = "#1376BC"; // Hover color
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.color = "#1C2025"; // Revert to the original color when not hovering
                                  }}
                                  onClick={(event) =>
                                    props.descriptionData(
                                      JSON.parse(e.description).ContactName ?? " ",
                                      JSON.parse(e.description).ContactNumber ??
                                      " ",
                                      JSON.parse(e.description).Address ?? " ",
                                      JSON.parse(e.description).InspectionCode ?? " "
                                    )
                                  }
                                >
                                  {JSON.parse(e.description).Address}
                                </span>
                              </BootstrapTooltip>
                            </Stack>
                            <Stack
                              direction={"row"}
                              style={{
                                alignItems: "center",
                                display: isPreviousDate ? "none" : "block",
                              }}
                            >
                              <span
                                style={{ marginRight: "7px", marginLeft: "15px" }}
                              >
                                <img
                                  src={drag}
                                  alt="load again"
                                  height={25}
                                  width={25}
                                />
                              </span>
                              <span
                                style={{ marginRight: "2px" }}
                                onClick={() => handleDelete(e.id)}
                              >
                                <img
                                  src={unassign}
                                  alt="load again"
                                  height={25}
                                  width={25}
                                />
                              </span>
                            </Stack>
                          </Stack>
                        </Stack>
                      </li>
                    )}
                  </Draggable>
                </li>
              )
            })}
          {getHomeAddress(lastObjectArrival, 10, 0)}
        </ul>
      </div>
    );
  }
};
