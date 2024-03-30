import "./inspectionListView.css";
import { useState } from "react";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
import { Divider } from "@mui/material";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TimerIcon from '@mui/icons-material/Timer';
import Tooltip from "@mui/material/Tooltip";
import { tooltipClasses} from "@mui/material";
var lastOpenedAccordian = null;

export default (props) => {
    const [isOpen, setIsOpen] = useState(false);

    const isHidden = props.hiddenIndex.indexOf(props.ind) === -1;

    const onOpenClicked = (e) => {
        if (!props?.isSelected) return;
        closeAll();
        lastOpenedAccordian = setIsOpen;
        setIsOpen(!isOpen);
        e.stopPropagation();
    }

    const closeAll = () => {
        if (lastOpenedAccordian) lastOpenedAccordian(false);
        lastOpenedAccordian = null;
    }

    const onClick = (e) => {
        if (!isHidden) return;
        closeAll();
        props?.onClick();
    }

    const onVisibleIconClick = (e) => {
        e.stopPropagation();
        props?.onVisibleChange(props.ind, !props.isHidden);
        setIsOpen(!isOpen);
        if (props?.isSelected) onClick(false);
    }
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

    let duration = Math.round((props.inspectorData.duration + props.inspectorData.service + props.inspectorData.setup) / 60);
    let distance = Math.round(props.inspectorData.distance / 100) / 10;
    return (
        <div className="card-container" onClick={onClick}>
            <div className="cardd">
            </div>
            <div className={"card" + (props?.isSelected ? " active" : "")}>
                <div className="card-mainContent">
                    <div>
                        {isHidden && <BsEyeFill onClick={onVisibleIconClick} fill="#004d40" />}
                        {!isHidden && <BsEyeSlashFill onClick={onVisibleIconClick} fill="#ff4d40" />}
                    </div >
                    <div>
                        <span className="span inspectionCount" style={{ padding: '5px', backgroundColor: props.inspectorData.color }}>Ins - {props.inspectorData.vehicle} </span>
                    </div>
                    <div>
                        <div style={{ height: '25px' }}>
                            <span>{props.inspectorData.description}</span>
                        </div>
                        <div style={{ display: "flex", height: '25px' }}>
                            <LocalShippingIcon fontSize="small" style={{ color: "lightgrey" }} />&nbsp;<div className="costLbl">{duration} Mins &nbsp;&nbsp;</div><TimerIcon fontSize="small" style={{ color: "lightgrey" }} />&nbsp;<div className="costLbl">{distance} Km</div>
                        </div>
                    </div>
                    <div className="countLbl"><span>{props.inspectorData.amount[0]}</span></div>
                </div>
                <div>
                    <div className="expandHeading" onClick={onOpenClicked}>
                        <BootstrapTooltip placement="right" title="Total Inspections"><span className="span inspectionCount"><BsEyeFill fill="#004d40" />&nbsp;&nbsp;&nbsp;{props.inspectorData.amount[0]} Inspections</span></BootstrapTooltip>
                    </div>
                    {props?.isSelected && (
                        <>
                            <Divider />
                            <div className="cardBody">
                                <ul className="rounded-list">
                                    <li key={props.key}>
                                        <a className="inspectionNames">{props.inspectorData.description}</a>
                                    </li>
                                    {props.inspectorData.steps.filter(e => e.type === "job").map((e, i) =>
                                        <li key={i + 1}>
                                            <a id={i + 1} className="inspectionNames">{e.description}</a>
                                        </li>)}
                                    <li key={props.key}>
                                        <a className="inspectionNames">{props.inspectorData.description}</a>
                                    </li>
                                </ul>
                            </div></>)}
                </div>
            </div>
        </div>
    );
};