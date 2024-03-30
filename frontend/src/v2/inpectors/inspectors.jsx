import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Button, Divider, Grid, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import MUIDataTable from 'mui-datatables';

function Inspectors(props) {
    const [value, setValue] = useState({});
    const columns = ["Inspector Name", "Address", "Localidate", "Postal"];

    const data = [
        ["João Machado", "Avenida Defensores Chaves, 13", "Lisboa", "1000-109"],
        ["Rafael Moreira", "	Avenida Joao Crisostomo, 13", "	Lisboa", "	1000-177"],
        ["João Araújo	Avenida", " Fontes Pereira Melo, 29	", "Lisboa	", "1050-117"],
        ["Pedro Sarabando	Rua ", "Aviador Placido Abreu, 4", "	Lisboa	", "1070-016"],
        ["Daniela Fernandes	", "Rua dos Correeiros, 22-34", "	Lisboa	", "1100-166"],
        ["Fernando Emídio	Rua ", "Portas Santo Antao, 117", "	Lisboa	", "1150-266"],
        ["Sérgio Belchior	Rua", " Damasceno Monteiro, 37", "	Lisboa	", "1170-110"],
        ["Rafael Moreira", "	Avenida Joao Crisostomo, 13", "	Lisboa", "	1000-177"],
    ];


    var options = {
        filterType: 'switch',
        tableBodyHeight: "250px",
        elevation: 10,
        print: false
    };
    return (
        <div>
            <div className="header" style={{ marginBottom: "5px", paddingTop: "5px" }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Date"
                        value={value}
                        onChange={(newValue) => {
                            setValue(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </LocalizationProvider>
            </div>
            {/* <Divider /> */}
            <div className="gridContainer">
                <div style={{ height: "375px", overflow: "auto", padding: "10px" }} >
                    <MUIDataTable
                        title={"Inspectors"}
                        data={data}
                        columns={columns}
                        options={options}
                    />
                </div>
            </div>
        </div>
    );
}

export default Inspectors;