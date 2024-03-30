import { Divider } from '@mui/material';
import { useState } from 'react';
import MUIDataTable from "mui-datatables";

function Inspections(props) {
    const [value, setValue] = useState({});

    const columns = ["Address", "Location", "Postal"];

    const data = [
        ["Rua Penha Franca,243", "Lisboa", "1170-304"],
        ["Largo Castro Soromenho, 3", "Lisboa", "1800-054"],
        ["Avenida do Brasil, 15", "Lisboa", "1700-062"],
        ["Rua Almeida e Sousa, 40", "Lisboa", "1350-007"],
        ["Rua Cidade Cadiz, 19", "Lisboa", "1500-156"],
        ["Rua Barao Sabrosa, 159", "Lisboa", "1900-088"],
        ["Rua Vitoria, 88", "Lisboa", "1100-619"],
        ["Rua Vigias, 4", "Lisboa", "1990-506"],
        ["Largo Castro Soromenho, 3", "Lisboa", "1800-054"],
        ["Avenida do Brasil, 15", "Lisboa", "1700-062"],
    ];

    var options = {
        filterType: 'switch',
        tableBodyHeight:"305px",
        elevation :10,
        print:false
    };
    return (
        <div style={{ paddingTop: "10px" }}>
            <Divider />
            <div className="gridContainer">
                <div style={{ height: "430px", overflow:"auto", padding:"10px"}} >
                <MUIDataTable 
                    style={{maxHeight:"100px"}}
                    title={"Inspections"}
                    data={data}
                    columns={columns}
                    options={options}
                /></div>
                {/* <TableContainer component={Paper} >
                    <Table stickyHeader aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>&nbsp;</TableCell>
                                <TableCell>Address&nbsp;&nbsp;</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Postal&nbsp;</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody >
                            {rows.map((row) => (
                                <TableRow
                                    key={row.name}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        <CheckBox defaultChecked />
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        {row.name}
                                    </TableCell>
                                    <TableCell>{row.calories}</TableCell>
                                    <TableCell>{row.fat}</TableCell>
                                    <TableCell>{row.carbs}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer> */}
            </div>
        </div>
    );
}

export default Inspections;