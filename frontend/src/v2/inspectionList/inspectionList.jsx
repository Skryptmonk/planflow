import style from "./inspectionList.module.css";
import { Button, Stack, InputLabel, CircularProgress, Divider, Snackbar, Grid } from "@mui/material";

const InspectionList =  (props) => {

    let dt = [{}, {},{}, {}, {}];
    return (
        <div className={style.listView}>
                <h2>Inspections</h2>
                    <Divider />
                
            {dt.map(d=><InspectionDetailCard data={d} />)}
        </div>
    );
};

function InspectionDetailCard(props)
{
    return (<div className={style.cardContainer}>
        <div className={style.card}>
            <div  className={style["card-body"]}>
                <div className={style["card-mainContent"]}>
                    <div>
                       
                    </div >
                    <div>
                    </div>
                    <div>
                        <div style={{ height: '25px' }}>
                        </div>
                        <div style={{ display: "flex", height: '25px' }}>
                           
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>);
}

export default InspectionList;