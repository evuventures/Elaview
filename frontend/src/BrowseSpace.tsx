import { Box, Checkbox, FormControlLabel, ListItem, List, Typography, TextField, IconButton, Stack } from '@mui/material';
import './BrowseSpace.css';
import { Collapse, ListSubheader } from '@mui/material';
import { ExpandLess, ExpandMore, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useState } from 'react';
import { Slider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { CalendarToday } from '@mui/icons-material';
import logo from './assets/mu3.jpg';



const products1 = [
    {
        id: 1,
        name: 'SoHo Building Hall',
        price: '$450',
        img: logo,
        type: 'Wall',
        size: '40ft x 60ft',
        traffic: '25000+ daily',
        Available: 'Immidiately'
    },
    {
        id: 2,
        name: 'SoHo Building Hall',
        price: '$450',
        img: logo,
        type: 'Wall',
        size: '40ft x 60ft',
        traffic: '25000+ daily',
        Available: 'Immidiately'
    },
    {
        id: 3,
        name: 'SoHo Building Hall',
        price: '$450',
        img: logo,
        type: 'Wall',
        size: '40ft x 60ft',
        traffic: '25000+ daily',
        Available: 'Immidiately'
    }, 
    {
        id: 4,
        name: 'SoHo Building Hall',
        price: '$450',
        img: logo,
        type: 'Wall',
        size: '40ft x 60ft',
        traffic: '25000+ daily',
        Available: 'Immidiately'
    },
    {
        id: 5,
        name: 'SoHo Building Hall',
        price: '$450',
        img: logo,
        type: 'Wall',
        size: '40ft x 60ft',
        traffic: '25000+ daily',
        Available: 'Immidiately'
    },
    {
        id: 6,
        name: 'SoHo Building Hall',
        price: '$450',
        img: logo,
        type: 'Wall',
        size: '40ft x 60ft',
        traffic: '25000+ daily',
        Available: 'Immidiately'
    },
    {
        id: 7,
        name: 'SoHo Building Hall',
        price: '$450',
        img: logo,
        type: 'Wall',
        size: '40ft x 60ft',
        traffic: '25000+ daily',
        Available: 'Immidiately'
    },
    {
        id: 8,
        name: 'SoHo Building Hall',
        price: '$450',
        img: logo,
        type: 'Wall',
        size: '40ft x 60ft',
        traffic: '25000+ daily',
        Available: 'Immidiately'
    }
];



function BrowseSpace() {
    const [open, setOpen] = useState(true);
    const [open1, setOpen1] = useState(true);
    const [open2, setOpen2] = useState(true);
    const [open3, setOpen3] = useState(true);
    const [open4, setOpen4] = useState(true);
    const [open5, setOpen5] = useState(true);
    const [open6, setOpen6] = useState(true);
    const [priceRange, setPriceRange] = useState([1000, 15000]); // [min, max]
    const [selectedOption, setSelectedOption] = useState("week");
    const [minWidth, setMinWidth] = useState(0);
    const [minHeight, setMinHeight] = useState(0);
    const [availableFrom, setAvailableFrom] = useState<Date | null>(null);






    return (
        <>

            <Box className='layout'>

                <Box className='sidebar'>

                    <Box className='sidebar-top'>
                        <Box className='filters'>Filters</Box>
                        <button className='reset'>Reset All</button>
                    </Box>


                    <Box sx={{ borderBottom: '1px solid rgb(211, 210, 210)' }}>
                        <ListSubheader onClick={() => setOpen(!open)} sx={{ cursor: 'pointer' }}>

                            <Box className='sidebar-top'>
                                <Box className='sidebar-text'>Location</Box>
                                <Box>
                                    {open ? <ExpandLess /> : <ExpandMore />}
                                </Box>
                            </Box>

                        </ListSubheader>


                        <Collapse in={open}>
                            <List >
                                {["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"].map((location) => (
                                    <ListItem key={location} sx={{ py: 0 }}>
                                        <FormControlLabel control={<Checkbox />} label={<span style={{ fontSize: 'calc(0.9rem + 0.1vw)' }}>{location}</span>} />
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>



                        <ListSubheader onClick={() => setOpen1(!open1)} sx={{ cursor: 'pointer' }}>

                            <Box className='sidebar-top'>
                                <Box className='sidebar-text'>Neighborhoods</Box>
                                <Box>
                                    {open1 ? <ExpandLess /> : <ExpandMore />}
                                </Box>
                            </Box>

                        </ListSubheader>


                        <Collapse in={open1}>
                            <List>
                                {["SoHo", "Times Square", "Chelsea", "DUMBO", "Williamsberg", "Upper East Side"].map((location) => (
                                    <ListItem key={location} sx={{ py: 0 }}>
                                        <FormControlLabel
                                            control={<Checkbox />}
                                            label={<span style={{ fontSize: 'calc(0.9rem + 0.1vw)' }}>{location}</span>} />
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>

                    </Box>


                    <Box sx={{ borderBottom: '1px solid rgb(211, 210, 210)' }}>
                        <ListSubheader onClick={() => setOpen2(!open2)} sx={{ cursor: 'pointer' }}>

                            <Box className='sidebar-top'>
                                <Box className='sidebar-text'>Space Types</Box>
                                <Box>
                                    {open2 ? <ExpandLess /> : <ExpandMore />}
                                </Box>
                            </Box>

                        </ListSubheader>


                        <Collapse in={open2}>
                            <List>
                                {["Wall", "Window", "Queens", "Billboard", "Vehicle", "Storefront", "Rooftop"].map((location) => (
                                    <ListItem key={location} sx={{ py: 0 }}>
                                        <FormControlLabel
                                            control={<Checkbox />}
                                            label={<span style={{ fontSize: 'calc(0.9rem + 0.1vw)' }}>{location}</span>} />
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>

                    </Box>



                    <Box sx={{ py: 2, borderBottom: '1px solid rgb(211, 210, 210)' }}>

                        <ListSubheader onClick={() => setOpen6(!open6)} sx={{ cursor: 'pointer' }}>
                            <Box className='sidebar-top'>
                                <Box className='sidebar-text'>Price Range</Box>
                                <Box>
                                    {open6 ? <ExpandLess /> : <ExpandMore />}
                                </Box>
                            </Box>
                        </ListSubheader>

                        <Collapse in={open6} sx={{ px: 2 }}>
                            <Slider value={priceRange} onChange={(_, newValue) => setPriceRange(newValue)} valueLabelDisplay="off" min={1000} max={15000}
                                step={500} sx={{ color: 'black', '& .MuiSlider-thumb': { backgroundColor: 'black' } }} />

                            {/* Static range markers */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mt: 1,

                            }}>
                                <span style={{ fontSize: 'calc(1rem + 0.1vw)' }}>${priceRange[0]}</span> {/* Current min value */}
                                <span style={{ fontSize: 'calc(1rem + 0.1vw)' }}>${priceRange[1]}</span> {/* Current max value */}
                            </Box>



                            <Box sx={{ mt: 3 }}>
                                <select className="form-select" value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}
                                    style={{ outline: 'none', boxShadow: 'none', border: '1px solid rgb(211, 210, 210)', fontSize: 'calc(1rem + 0.1vw)' }}>
                                    <option value="week">Per Week</option>
                                    <option value="month">Per Month</option>
                                </select>
                            </Box>
                        </Collapse>
                    </Box>


                    <Box sx={{ py: 3, borderBottom: '1px solid rgb(211, 210, 210)' }}>

                        <ListSubheader onClick={() => setOpen5(!open5)} sx={{ cursor: 'pointer' }}>
                            <Box className='sidebar-top'>
                                <Box className='sidebar-text'>Size</Box>
                                <Box>
                                    {open5 ? <ExpandLess /> : <ExpandMore />}
                                </Box>
                            </Box>
                        </ListSubheader>


                        <Collapse in={open5}>


                            <Box className='sidebar-dimensions'>

                                {/* Width Selector */}
                                <Box>
                                    <Typography sx={{ mb: 0.5, fontSize: 'calc(0.9rem + 0.1vw)' }}>Width (ft)</Typography>

                                    <Box sx={{
                                        display: 'flex', alignItems: 'center', width: 'fit-content', border: '1px solid rgb(211, 210, 210)',
                                        padding: '0.3em', borderRadius: '0.4em'
                                    }}>

                                        <TextField value={minWidth} onChange={(e) => setMinWidth(Math.max(1, parseInt(e.target.value) || 1))} variant="outlined"
                                            size="small" sx={{ width: 80, border: 'none', '& fieldset': { border: 'none' } }} />

                                        <Stack sx={{ borderRadius: '0 4px 4px 0', backgroundColor: '#f5f5f5' }}>

                                            <IconButton onClick={() => setMinWidth(minWidth + 1)}
                                                size="small"
                                                sx={{ p: 0, borderRadius: 0, borderBottom: '1px solid #d3d2d2' }}>
                                                <KeyboardArrowUp fontSize="small" />
                                            </IconButton>

                                            <IconButton
                                                onClick={() => setMinWidth(Math.max(1, minWidth - 1))}
                                                size="small"
                                                sx={{ p: 0, borderRadius: 0 }}>
                                                <KeyboardArrowDown fontSize="small" />
                                            </IconButton>
                                        </Stack>

                                    </Box>
                                </Box>


                                {/* Height Selector */}
                                <Box>
                                    <Typography sx={{ mb: 0.5, fontSize: 'calc(0.9rem + 0.1vw)' }}>Height (ft)</Typography>
                                    <Box sx={{
                                        display: 'flex', alignItems: 'center', width: 'fit-content', border: '1px solid rgb(211, 210, 210)',
                                        padding: '0.3em', borderRadius: '0.4em'
                                    }}>
                                        <TextField
                                            value={minHeight}
                                            onChange={(e) => setMinHeight(Math.max(1, parseInt(e.target.value) || 1))}
                                            variant="outlined"
                                            size="small"
                                            sx={{ width: 80, border: 'none', '& fieldset': { border: 'none' } }}
                                        />
                                        <Stack sx={{
                                            backgroundColor: '#f5f5f5'
                                        }}>
                                            <IconButton
                                                onClick={() => setMinHeight(minHeight + 1)}
                                                size="small"
                                                sx={{
                                                    p: 0,
                                                    borderRadius: 0,
                                                    borderBottom: '1px solid #d3d2d2'
                                                }}
                                            >
                                                <KeyboardArrowUp fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => setMinHeight(Math.max(1, minHeight - 1))}
                                                size="small"
                                                sx={{ p: 0, borderRadius: 0 }}
                                            >
                                                <KeyboardArrowDown fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </Box>
                                </Box>
                            </Box>

                        </Collapse>

                    </Box>



                    <Box sx={{ borderBottom: '1px solid rgb(211, 210, 210)' }}>
                        <ListSubheader onClick={() => setOpen3(!open3)} sx={{ cursor: 'pointer' }}>

                            <Box className='sidebar-top'>
                                <Box className='sidebar-text'>Traffic</Box>
                                <Box>
                                    {open3 ? <ExpandLess /> : <ExpandMore />}
                                </Box>
                            </Box>

                        </ListSubheader>


                        <Collapse in={open3}>
                            <List>
                                {["5,000+ daily", "10,000+ daily", "15,000+ daily", "20,000+ daily"].map((location) => (
                                    <ListItem key={location} sx={{ py: 0 }}>
                                        <FormControlLabel
                                            control={<Checkbox />}
                                            label={<span style={{ fontSize: 'calc(0.9rem + 0.1vw)' }}>{location}</span>} />
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>

                    </Box>



                    <Box sx={{ borderBottom: '1px solid rgb(211, 210, 210)' }}>
                        <ListSubheader onClick={() => setOpen4(!open4)} sx={{ cursor: 'pointer' }}>

                            <Box className='sidebar-top'>
                                <Box className='sidebar-text'>Availability</Box>
                                <Box>
                                    {open4 ? <ExpandLess /> : <ExpandMore />}
                                </Box>
                            </Box>

                        </ListSubheader>


                        <Collapse in={open4}>
                            <List>
                                {["Available Now"].map((location) => (
                                    <ListItem key={location} sx={{ py: 0 }}>
                                        <FormControlLabel
                                            control={<Checkbox />}
                                            label={<span style={{ fontSize: 'calc(0.9rem + 0.1vw)' }}>{location}</span>} />
                                    </ListItem>
                                ))}
                            </List>


                            <Box sx={{ px: 2 }}>
                                <Typography sx={{ fontSize: 'calc(0.9rem + 0.1vw)' }}>Available From</Typography>

                                <Box sx={{ mb: 3 }}>

                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker
                                            value={availableFrom}
                                            onChange={(newValue: Date | null) => setAvailableFrom(newValue)}
                                            slots={{
                                                openPickerIcon: CalendarToday,
                                            }}
                                            slotProps={{
                                                textField: {
                                                    size: 'small',
                                                    sx: {
                                                        width: '100%',
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '4px',
                                                            '& fieldset': {
                                                                borderColor: '#d3d2d2',
                                                            },
                                                        },
                                                        '& .MuiInputBase-input': {
                                                            py: 0.5,
                                                            height: 'auto',
                                                        },
                                                    },
                                                },
                                                popper: {
                                                    sx: {
                                                        zIndex: 9999, // Ensure it appears above other elements
                                                    }
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Box>
                            </Box>
                        </Collapse>

                    </Box>


                    <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                        <button>Apply Filters</button>
                    </Box>
                </Box>


                <Box></Box>
                <Box className='main-content'>
                    <Box className='content-heading'>Advertising Spaces in NYC</Box>

                    <Box sx={{ fontSize: 'calc(1rem + 0.5vh)', textAlign: 'left' }}>Showing 3 places matching your criteria </Box>

                    <Box className='cards'>

                        <Box className='car'>
                            {products1.map((product) => {

                                return (
                                    <Box key={product.id} className="card">
                                        <img src={product.img} style={{ maxHeight: '15em', objectFit: 'cover', borderRadius: '0.3em' }} alt={product.name} />

                                        <Box className="card-body" sx={{ textAlign: 'left', borderRadius: '1em',padding:'1em' }}>

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Box sx={{ fontSize: 'calc(0.6em + 0.2vw)', fontWeight: 'bold' }}>{product.name}</Box>

                                                <Box sx={{ fontSize: 'calc(0.7em + 0vw)', fontWeight: 'bold' }}>{product.price}
                                                    <span style={{ color: '#666', fontWeight: '400' }}>/week</span></Box>
                                            </Box>


                                            <Box sx={{ display: 'flex', mt: 2 }}>
                                                <Box sx={{ fontSize: 'calc(0.6em + 0.2vw)', fontWeight: '500' }}><span style={{ color: '#666' }}>Type</span> : {product.type}</Box>

                                                <Box sx={{ fontSize: 'calc(0.7em + 0.1vw)', marginLeft: '5em', fontWeight: '500' }}>
                                                    <span style={{ color: '#666' }}>Size</span>: {product.size}</Box>
                                            </Box>


                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
                                                <i className="bi bi-people-fill"></i>
                                                <Box sx={{ fontSize: 'calc(0.7em + 0.1vw)', fontWeight: '500' }}><span style={{ color: '#666' }}>Traffic</span>: {product.traffic}</Box>
                                            </Box>



                                            <Box sx={{ fontSize: 'calc(0.7em + 0.1vw)', fontWeight: '500' }}><span style={{ color: '#666' }}>Available</span>: {product.Available}</Box>

                                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                                <button style={{ width: '100%', fontSize: 'calc(0.7em + 0.1vw)' }}>View Details</button>
                                            </Box>


                                        </Box>

                                    </Box>

                                );

                            })}

                        </Box>

                    </Box>

                    <Box>
                        <i className="bi bi-arrow-left"></i>
                        <i className="bi bi-arrow-right"></i>
                    </Box>

                </Box>

            </Box>




        </>
    );
}

export default BrowseSpace;

