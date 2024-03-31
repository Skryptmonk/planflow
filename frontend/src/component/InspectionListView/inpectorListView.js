import "./inspectionListView.css";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import "../../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import avatarImage from "../../icons/avatar.png";
import check from "../../icons/svg/check.svg";
import uncheck from "../../icons/svg/uncheck.svg";
import { Droppable } from "react-beautiful-dnd";
import RoutePlanner from "../../helpers/RoutePlanner.js";
import route from "../../icons/svg/route.svg";
import durIcon from "../../icons/svg/distancemeter.svg";
import { styled } from '@mui/material/styles';
import { tooltipClasses } from "@mui/material";
var lastOpenedAccordian = null;

// eslint-disable-next-line import/no-anonymous-default-export
export default (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [visibility, setVisibility] = useState(props.hiddenIndex.indexOf(props.ind) === -1);
  const isHidden = props.isExcludedInspector ? !props.isExcludedInspector : props.hiddenIndex.indexOf(props.ind) === -1;
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


  // const onOpenClicked = (e) => {
  //   if (!props?.isSelected) return;
  //   closeAll();
  //   lastOpenedAccordian = setIsOpen;
  //   setIsOpen(!isOpen);
  //   e.stopPropagation();
  // };

  const closeAll = () => {
    if (lastOpenedAccordian) lastOpenedAccordian(false);
    lastOpenedAccordian = null;
  };

  const onClick = (e) => {
    if (!isHidden || props.isIdleInspector) return;
    closeAll();
    props?.onClick();
    //props?.setZoomLvl(false)
  };

  const onVisibleIconClick = (e) => {
    e.stopPropagation();
    setVisibility(!visibility);

    if (props.isIdleInspector) {
      return;
    }
    if (props.isExcludedInspector) {
      props.addFromExcludedInspectors(props.inspectorData.InspectorId);
      return;
    }
    props?.onVisibleChange(JSON.parse(props.inspectorData.description).InspectorId, !props.isHidden);
    setIsOpen(!isOpen);
    if (props?.isSelected) onClick(false);
    if (visibility == true && !props.isExcludedInspector) {
      props.excludeInspector(props.inspectorData.vehicle, props.inspectorData.steps);
    }
    RoutePlanner.computeStatsAfterChange()
  };


  let duration = Math.round(
    (props.inspectorData.duration +
      props.inspectorData.service +
      props.inspectorData.setup) /
    60
  );
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (props?.onMouseEnter) {
      props?.onMouseEnter();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  let distance = Math.round(props.inspectorData.distance / 100) / 10;
  let inspectionColor = props.inspectorData?.color;

  if (inspectionColor === null || inspectionColor === undefined || inspectionColor === "") {
    inspectionColor = "#F23333"
  }
  return (
    <Droppable droppableId={props.isIdleInspector ? props.inspectorData.InspectorId + "" : props.inspectorData.vehicle + ""} key={props.key}>
      {(evt) => (
        <div
          className={`cardContainer ${props.isSelected ? "isSelected" : ""}`}
          onClick={onClick}
          // onMouseEnter={props?.onMouseEnter}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            color: inspectionColor,
            background: `${inspectionColor}20`,
            border: `1px solid ${props.isSelected || isHovered ? inspectionColor : `${inspectionColor}10`}`,
          }}
          {...evt.droppableProps}
          ref={evt.innerRef}

        >
          <div className="cardContentEl" >
            <div>
              {isHidden && (
                <img
                  alt=""
                  src={check}
                  onClick={onVisibleIconClick}
                  className="checkbox"
                />
              )}
              {!isHidden && (
                <img
                  alt=""
                  src={uncheck}
                  onClick={onVisibleIconClick}
                  className="checkbox"
                />
              )}
            </div>
            <img src={avatarImage} className="avatar" alt="Avatar" />
            <div className="descriptionEl">
              <p className="inspectorName">
                {props.isIdleInspector || props.isExcludedInspector ? props.inspectorData.InspectorName : JSON.parse(props.inspectorData.description).InspectorName}
              </p>
              <div >
                <span className="InspectorLabel" >
                  <span>
                    <img src={route} alt="load again"
                      height={18}
                      width={18} ></img>

                  </span>
                  &nbsp;&nbsp;{distance > 0 ? distance : 0} KM
                </span>
                <span className="InspectorLabel" style={{ marginLeft: "10px" }}>
                  <span>
                    <img src={durIcon} alt="load again"
                      height={18}
                      width={18}

                    ></img>
                  </span>
                  &nbsp;&nbsp;{duration > 0 ? Math.floor(duration / 60) +
                    " H " +
                    duration % 60 +
                    " M" : 0}
                </span>
              </div>
            </div>
          </div>
          <div
            className="inspectEl"
          >
            {props.inspectorData.steps?.filter((e) => e.type === "job")
              .map((e, i) => (
                <div key={i + 1} >
                  <BootstrapTooltip key={i + 1} placement="top" title={JSON.parse(e.description).Address}>
                    <div className="inspectNum"
                      style={{
                        backgroundColor: inspectionColor
                      }}>{i + 1}</div>
                  </BootstrapTooltip>
                  {
                    <hr
                      className="dottedLine"
                      style={{
                        borderTop: "dotted 1px",
                        color: "#000",
                        width: "5px",
                        marginBottom: "5px",
                      }}
                    />
                  }
                </div>
              ))}
          </div>
        </div>
      )}
    </Droppable>
  );
};
