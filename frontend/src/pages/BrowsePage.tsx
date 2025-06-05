import { Box, Checkbox, FormControlLabel, ListItem, List, Typography, TextField, IconButton, Stack } from '@mui/material';
import './styles/BrowsePage.css';
import { Collapse, ListSubheader } from '@mui/material';
import { ExpandLess, ExpandMore, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { Slider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { CalendarToday } from '@mui/icons-material';
import { Link } from 'react-router-dom';




interface Product {
    id: number;
    spaceName: string;
    neighbourhood: string;
    location: string;
    price: number;
    img: string;
    type: string;
    width: string;
    height: string;
    traffic: string;
    availability: string;
}



const products: Product[] = [
    { id: 1, spaceName: 'SoHo Building Wall', neighbourhood: 'SoHo', location: 'Manhattan', price: 14500, img: `https://oceanoutdoor.s3.eu-west-2.amazonaws.com/website/wp-content/uploads/2024/05/WR-PLS.-Apr-24-2-1920x1281-1.jpg`, type: 'Wall', width: '25ft', height: '30ft', traffic: '10,000+ daily', availability: '01/15/2025' },
    { id: 2, spaceName: 'Times Square Window', neighbourhood: 'Times Square', location: 'Manhattan', price: 12050, img: 'https://mandoemedia.com/app/uploads/2023/08/M_UltimateGuide_Retail_01.png', type: 'Vehicle', width: '20ft', height: '28ft', traffic: '5,000+ daily', availability: 'Available Now' },
    { id: 3, spaceName: 'Chelsea Gallery Exterior', neighbourhood: 'Chelsea', location: 'Manhattan', price: 1450, img: 'https://assets.simpleviewinc.com/simpleview/image/upload/crm/howardcounty/Listing-Pic---website-960-x-720---2022-04-21T113542.580_FFB9B994-5056-B3A8-499D03E9CDF44E8C-ffb9b5745056b3a_ffb9c4ba-5056-b3a8-4902c7fd236c3842.png', type: 'Wall', width: '25ft', height: '30ft', traffic: '15,000+ daily', availability: '03/10/2025' },
    { id: 4, spaceName: 'Brooklyn Warehouse Side', neighbourhood: 'DUMBO', location: 'Brooklyn', price: 11500, img: 'https://houseofmockups.com/cdn/shop/files/HOM-002-017.-Williamsburg-Handpainted-Billboard-Mockup.webp?v=1724180972', type: 'Wall', width: '30ft', height: '40ft', traffic: '5,000+ daily', availability: 'Available Now' },
    { id: 5, spaceName: 'Williamsburg Rooftop', neighbourhood: 'Williamsburg', location: 'Brooklyn', price: 11150, img: 'https://static.vecteezy.com/system/resources/previews/044/904/036/non_2x/outdoor-billboard-mockup-free-psd.png', type: 'Billboard', width: '20ft', height: '28ft', traffic: '5,000+ daily', availability: '05/20/2025' },
    { id: 6, spaceName: 'Upper East Side Storefront', neighbourhood: 'Upper East Side', location: 'Manhattan', price: 11450, img: 'https://patch.com/img/cdn20/users/26226110/20240109/043757/styles/patch_image/public/r0005773___09160919405.jpg', type: 'Vehicle', width: '19ft', height: '21ft', traffic: '15,000+ daily', availability: 'Available Now' },
    { id: 7, spaceName: 'SoHo Building Wall', neighbourhood: 'SoHo', location: 'Manhattan', price: 1140, img: 'https://oceanoutdoor.s3.eu-west-2.amazonaws.com/website/wp-content/uploads/2024/05/WR-PLS.-Apr-24-2-1920x1281-1.jpg', type: 'Vehicle', width: '26ft', height: '32ft', traffic: '20,000+ daily', availability: '07/01/2025' },
    { id: 8, spaceName: 'Upper East Side Storefront', neighbourhood: 'Upper East Side', location: 'Manhattan', price: 11450, img: 'https://patch.com/img/cdn20/users/26226110/20240109/043757/styles/patch_image/public/r0005773___09160919405.jpg', type: 'Vehicle', width: '19ft', height: '21ft', traffic: '15,000+ daily', availability: 'Available Now' },
    { id: 9, spaceName: 'Williamsburg Rooftop', neighbourhood: 'Williamsburg', location: 'Brooklyn', price: 13500, img: 'https://static.vecteezy.com/system/resources/previews/044/904/036/non_2x/outdoor-billboard-mockup-free-psd.png', type: 'Wall', width: '22ft', height: '36ft', traffic: '10,000+ daily', availability: '08/08/2025' },
    { id: 10, spaceName: 'SoHo Building Wall', neighbourhood: 'SoHo', location: 'Manhattan', price: 14550, img: 'https://oceanoutdoor.s3.eu-west-2.amazonaws.com/website/wp-content/uploads/2024/05/WR-PLS.-Apr-24-2-1920x1281-1.jpg', type: 'Wall', width: '20ft', height: '28ft', traffic: '5,000+ daily', availability: 'Available Now' },
    { id: 11, spaceName: 'Upper East Side Storefront', neighbourhood: 'Upper East Side', location: 'Manhattan', price: 13950, img: 'https://patch.com/img/cdn20/users/26226110/20240109/043757/styles/patch_image/public/r0005773___09160919405.jpg', type: 'Storefront', width: '27ft', height: '38ft', traffic: '10,000+ daily', availability: '10/25/2025' },
    { id: 12, spaceName: 'Brooklyn Warehouse Side', neighbourhood: 'DUMBO', location: 'Brooklyn', price: 1000, img: 'https://houseofmockups.com/cdn/shop/files/HOM-002-017.-Williamsburg-Handpainted-Billboard-Mockup.webp?v=1724180972', type: 'Storefront', width: '23ft', height: '29ft', traffic: '20,000+ daily', availability: 'Available Now' },
    { id: 13, spaceName: 'Williamsburg Rooftop', neighbourhood: 'Williamsburg', location: 'Brooklyn', price: 1200, img: 'https://static.vecteezy.com/system/resources/previews/044/904/036/non_2x/outdoor-billboard-mockup-free-psd.png', type: 'Billboard', width: '21ft', height: '26ft', traffic: '15,000+ daily', availability: '12/05/2025' },
    { id: 14, spaceName: 'Chelsea Gallery Exterior', neighbourhood: 'Chelsea', location: 'Manhattan', price: 3450, img: 'https://assets.simpleviewinc.com/simpleview/image/upload/crm/howardcounty/Listing-Pic---website-960-x-720---2022-04-21T113542.580_FFB9B994-5056-B3A8-499D03E9CDF44E8C-ffb9b5745056b3a_ffb9c4ba-5056-b3a8-4902c7fd236c3842.png', type: 'Wall', width: '29ft', height: '34ft', traffic: '20,000+ daily', availability: 'Available Now' },
    { id: 15, spaceName: 'Times Square Window', neighbourhood: 'Times Square', location: 'Manhattan', price: 8450, img: 'https://mandoemedia.com/app/uploads/2023/08/M_UltimateGuide_Retail_01.png', type: 'Wall', width: '25ft', height: '30ft', traffic: '10,000+ daily', availability: '03/03/2025' },
    { id: 16, spaceName: 'Williamsburg Rooftop', neighbourhood: 'Williamsburg', location: 'Brooklyn', price: 15000, img: 'https://static.vecteezy.com/system/resources/previews/044/904/036/non_2x/outdoor-billboard-mockup-free-psd.png', type: 'Billboard', width: '30ft', height: '40ft', traffic: '15,000+ daily', availability: 'Available Now' },
    { id: 17, spaceName: 'Williamsburg Rooftop', neighbourhood: 'Williamsburg', location: 'Brooklyn', price: 15000, img: 'https://static.vecteezy.com/system/resources/previews/044/904/036/non_2x/outdoor-billboard-mockup-free-psd.png', type: 'Billboard', width: '30ft', height: '40ft', traffic: '15,000+ daily', availability: 'Available Now' }
];




function BrowseSpace() {

    const [open, setOpen] = useState<boolean>(true);
    const [open1, setOpen1] = useState<boolean>(true);
    const [open2, setOpen2] = useState<boolean>(true);
    const [open3, setOpen3] = useState<boolean>(true);
    const [open4, setOpen4] = useState<boolean>(true);
    const [open5, setOpen5] = useState<boolean>(true);
    const [open6, setOpen6] = useState<boolean>(true);
    const [priceRange, setPriceRange] = useState<number[]>([1000, 15000]);
    const [selectedOption, setSelectedOption] = useState<string>("Per week");
    const [minWidth, setMinWidth] = useState<number>(0);
    const [minHeight, setMinHeight] = useState<number>(0);
    const [calendarDate, setcalendarDate] = useState<Date | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedNeighborhoods, setselectedNeighborhoods] = useState<string[]>([]);
    const [selectedLocations, setselectedLocations] = useState<string[]>([]);
    const [selectedspaceTypes, setselectedspaceTypes] = useState<string[]>([]);
    const [selectedTraffic, setselectedTraffic] = useState<string[]>([]);
    const [selectedAvailability, setselectedAvailability] = useState<string[]>([]);
    const [sortOption, setSortOption] = useState('Recommended');
    const [drawerOpen, setDrawerOpen] = useState(false);


    const toggleDrawer = (open: boolean) => (_: React.KeyboardEvent | React.MouseEvent) => {
        setDrawerOpen(open);
    };



    // const drawerList = (
    //     <Box className="sbSize" sx={{ padding: '1rem' }} role="presentation">
    //         <Box className='e1'>
    //             <Box sx={{ fontSize: 'calc(1rem + 0.8vw)', fontWeight: 'bold' }}>0</Box>
    //             <Box sx={{ fontSize: 'calc(1rem + 0.8vw)', fontWeight: 'bold' }}>Your Bucket</Box>
    //             <Box sx={{ fontSize: 'calc(1rem + 0.8vw)', fontWeight: 'bold' }} className='SBC'>
    //                 Rs 0
    //             </Box>
    //         </Box>

    //         {/* You can add static or new content here if needed */}

    //         <div className='viewB'>
    //             <Link className='zxc' to='/Bucket'>Checkout</Link>
    //         </div>
    //     </Box>
    // );


    const location: string[] = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];
    const neighbourhood: string[] = ["SoHo", "Times Square", "Chelsea", "DUMBO", "Williamsburg", "Upper East Side"];
    const spaceTypes: string[] = ["Wall", "Window", "Queens", "Billboard", "Vehicle", "Storefront", "Rooftop"];
    const traffic: string[] = ["5,000+ daily", "10,000+ daily", "15,000+ daily", "20,000+ daily"]
    const availability: string[] = ["Available Now"]



    const handleCheckboxChang4 = (event: React.ChangeEvent<HTMLInputElement>) => {

        let value = event.target.value;
        let isChecked = event.target.checked;


        if (isChecked) {
            setselectedLocations(([...selectedLocations, value]));
            setCurrentPage(1);
        }

        else {
            setselectedLocations(selectedLocations.filter((item) => item !== value))// won't include unchecked boxes' values
        }
    };



    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;
        let isChecked = event.target.checked;


        if (isChecked) {
            setselectedNeighborhoods(([...selectedNeighborhoods, value]));
            setCurrentPage(1);

        }

        else {
            setselectedNeighborhoods(selectedNeighborhoods.filter((item) => item !== value))// won't include unchecked boxes' values
        }
    }



    const handleCheckboxChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;
        let isChecked = event.target.checked;


        if (isChecked) {
            setselectedspaceTypes(([...selectedspaceTypes, value]));
            setCurrentPage(1);
        }

        else {
            setselectedspaceTypes(selectedspaceTypes.filter((item) => item !== value))
        }
    }



    const handleCheckboxChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;
        let isChecked = event.target.checked;


        if (isChecked) {
            setselectedTraffic(([...selectedTraffic, value]));
            setCurrentPage(1);
        }

        else {
            setselectedTraffic(selectedTraffic.filter((item) => item !== value))// won't include unchecked boxes' values
        }
    }



    const handleCheckboxChang3 = (event: React.ChangeEvent<HTMLInputElement>) => {

        let isChecked = event.target.checked;

        if (isChecked) {
            setselectedAvailability([...selectedAvailability, 'Available Now']);
            setCurrentPage(1);
        }

        else {
            setselectedAvailability(selectedAvailability.filter((item) => item !== 'Available Now'));
        }
    };




    // if checkboxes matches items in the products array and returns a new filtered array
    const filteredItems = products.filter((item) => {
        const locationMatch = selectedLocations.length === 0 || selectedLocations.includes(item.location);
        const neighborhoodMatch = selectedNeighborhoods.length === 0 || selectedNeighborhoods.includes(item.neighbourhood);
        const spacetypeMatch = selectedspaceTypes.length === 0 || selectedspaceTypes.includes(item.type);
        const trafficMatch = selectedTraffic.length === 0 || selectedTraffic.includes(item.traffic);
        const PriceMatch = priceRange[0] !== undefined && priceRange[1] !== undefined &&
            item.price >= priceRange[0] && item.price <= priceRange[1];
        const WidthMatch = minWidth === 0 || parseInt(item.width) === minWidth;
        const HeightMatch = minHeight === 0 || parseInt(item.height) === minHeight;
        const dateMatch = selectedAvailability.includes('Available Now') ? item.availability === 'Available Now' : true;
        const calendardateMatch = calendarDate ? new Date(item.availability).getTime() === calendarDate.getTime() : true;

        return locationMatch && neighborhoodMatch && trafficMatch && spacetypeMatch && PriceMatch && WidthMatch && HeightMatch && dateMatch && calendardateMatch;
    });


    const areFiltersActive = selectedLocations.length > 0 || selectedNeighborhoods.length > 0 || selectedspaceTypes.length > 0 || selectedTraffic.length > 0 ||
        selectedAvailability.length > 0 || priceRange[0] !== 1000 || priceRange[1] !== 15000 || minWidth > 0 || minHeight > 0 || calendarDate !== null;



    const sortedItems = useMemo(() => {
        const itemsCopy = [...filteredItems];

        if (sortOption === 'Newest First') {
            return itemsCopy.sort((a, b) => {
                const dateA = a.availability === 'Available Now' ? 0 : new Date(a.availability).getTime();
                const dateB = b.availability === 'Available Now' ? 0 : new Date(b.availability).getTime();
                return dateA - dateB;
            });
        }

        if (sortOption === 'Oldest') {
            return itemsCopy.sort((a, b) => {
                const dateA = a.availability === 'Available Now' ? 0 : new Date(a.availability).getTime();
                const dateB = b.availability === 'Available Now' ? 0 : new Date(b.availability).getTime();
                return dateB - dateA;
            });
        }

        return itemsCopy;
    }, [filteredItems, sortOption]);





    const itemsPerPage = 8;
    const itemsToDisplay = areFiltersActive ? sortedItems : products;
    const totalPages = Math.ceil(sortedItems.length / itemsPerPage);


    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageItems = sortedItems.slice(startIndex, endIndex);



    const displayedItems: Product[] = currentPageItems;




    const prevButton = () => {
        if (currentPage <= 1) {
            return;
        }
        setCurrentPage(currentPage - 1);
    }


    const nextButton = () => {
        if (currentPage >= totalPages) {
            return;
        }
        setCurrentPage(currentPage + 1);
    }



    let pageNumbers: number[] = [];

    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
    }



    const handleSortChange = (option: string) => {
        setSortOption(option);
    };




    const reset = () => {
        setselectedLocations([]);
        setselectedNeighborhoods([]);
        setselectedspaceTypes([]);
        setselectedTraffic([]);
        setselectedAvailability([]);
        setPriceRange([1000, 15000]);
        setMinWidth(0);
        setMinHeight(0);
        setcalendarDate(null);
    }



    const locationFilter = (i: number) => {
        setselectedLocations(selectedLocations.filter((_, index) => index != i));
    }


    const neighFilter = (i: number) => {
        setselectedNeighborhoods(selectedNeighborhoods.filter((_, index) => index != i));
    }


    const typeFilter = (i: number) => {
        setselectedspaceTypes(selectedspaceTypes.filter((_, index) => index != i));
    }




    const trafficFilter = (i: number) => {
        setselectedTraffic(selectedTraffic.filter((_, index) => index != i));
    }



    const dateFilter = (i: number) => {
        setselectedAvailability(selectedAvailability.filter((_, index) => index != i));
    }


    return (
        <>
            <Box className='layout'>

                <Box className='menu'>

                    <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                        <Box role="presentation" onKeyDown={toggleDrawer(false)}>

                            <Box className='drawer'>

                                <Box className='sidebar-top'>
                                    <Box className='filters'>Filters</Box>
                                    <button onClick={reset} className='reset'>Reset All</button>
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
                                            {location.map((location) => (
                                                <ListItem key={location} sx={{ py: 0 }}>
                                                    <FormControlLabel value={location} checked={selectedLocations.includes(location)}
                                                        control={<Checkbox onChange={handleCheckboxChang4} />}
                                                        label={<span style={{ fontSize: 'calc(1rem + 0.1vw)' }}>{location}</span>} />
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
                                            {neighbourhood.map((location) => (
                                                <ListItem key={location} sx={{ py: 0 }}>
                                                    <FormControlLabel value={location} checked={selectedNeighborhoods.includes(location)}
                                                        control={<Checkbox onChange={handleCheckboxChange} />}
                                                        label={<span style={{ fontSize: 'calc(1rem + 0.1vw)' }}>{location}</span>} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Collapse>

                                </Box>


                                <Box sx={{ borderBottom: '1px solid rgb(211, 210, 210)' }}>
                                    <ListSubheader onClick={() => setOpen2(!open2)} sx={{ cursor: 'pointer' }}>

                                        <Box className='sidebar-top'>
                                            <Box className='sidebar-text'>Space Types</Box>
                                            <Box> {open2 ? <ExpandLess /> : <ExpandMore />}</Box>
                                        </Box>

                                    </ListSubheader>


                                    <Collapse in={open2}>
                                        <List>
                                            {spaceTypes.map((type) => (
                                                <ListItem key={type} sx={{ py: 0 }}>
                                                    <FormControlLabel value={type} checked={selectedspaceTypes.includes(type)}
                                                        control={<Checkbox onChange={handleCheckboxChange1} />}
                                                        label={<span style={{ fontSize: 'calc(1rem + 0.1vw)' }}>{type}</span>} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Collapse>

                                </Box>



                                <Box sx={{ py: 2, borderBottom: '1px solid rgb(211, 210, 210)' }}>

                                    <ListSubheader onClick={() => setOpen6(!open6)} sx={{ cursor: 'pointer' }}>
                                        <Box className='sidebar-top'>
                                            <Box className='sidebar-text'>Price Range</Box>
                                            <Box> {open6 ? <ExpandLess /> : <ExpandMore />}</Box>
                                        </Box>
                                    </ListSubheader>


                                    <Collapse in={open6} sx={{ px: 2 }}>
                                        <Slider value={priceRange} onChange={(_: Event, newValue: number | number[]) => setPriceRange(newValue as number[])} valueLabelDisplay="off" min={1000} max={15000}
                                            step={500} sx={{ color: 'black', '& .MuiSlider-thumb': { backgroundColor: 'black' } }} />


                                        {/* Static range markers */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
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
                                            <Box> {open5 ? <ExpandLess /> : <ExpandMore />}</Box>
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

                                                    <TextField value={minWidth.toString()} onChange={(e) => setMinWidth(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                                                        variant="outlined" size="small" sx={{ width: 80, border: 'none', '& fieldset': { border: 'none' } }} />

                                                    <Stack sx={{ borderRadius: '0 4px 4px 0', backgroundColor: '#f5f5f5' }}>

                                                        <IconButton onClick={() => setMinWidth(minWidth + 1)} size="small"
                                                            sx={{ p: 0, borderRadius: 0, borderBottom: '1px solid #d3d2d2' }}>
                                                            <KeyboardArrowUp fontSize="small" />
                                                        </IconButton>

                                                        <IconButton onClick={() => setMinWidth(Math.max(1, minWidth - 1))} size="small" sx={{ p: 0, borderRadius: 0 }}>
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
                                                    <TextField value={minHeight.toString()} onChange={(e) => setMinHeight(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                                                        variant="outlined" size="small" sx={{ width: 80, border: 'none', '& fieldset': { border: 'none' } }} />

                                                    <Stack sx={{ backgroundColor: '#f5f5f5' }}>
                                                        <IconButton onClick={() => setMinHeight(minHeight + 1)} size="small"
                                                            sx={{ p: 0, borderRadius: 0, borderBottom: '1px solid #d3d2d2' }}>
                                                            <KeyboardArrowUp fontSize="small" />
                                                        </IconButton>

                                                        <IconButton onClick={() => setMinHeight(Math.max(1, minHeight - 1))} size="small" sx={{ p: 0, borderRadius: 0 }}>
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
                                            <Box>{open3 ? <ExpandLess /> : <ExpandMore />}</Box>
                                        </Box>

                                    </ListSubheader>


                                    <Collapse in={open3}>
                                        <List>
                                            {traffic.map((number) => (
                                                <ListItem key={number} sx={{ py: 0 }}>
                                                    <FormControlLabel value={number} checked={selectedTraffic.includes(number)}
                                                        control={<Checkbox onChange={handleCheckboxChange2} />}
                                                        label={<span style={{ fontSize: 'calc(1rem + 0.1vw)' }}>{number}</span>} />
                                                </ListItem>
                                            ))}
                                        </List>

                                    </Collapse>

                                </Box>



                                <Box>

                                    <ListSubheader onClick={() => setOpen4(!open4)} sx={{ cursor: 'pointer' }}>
                                        <Box className='sidebar-top'>
                                            <Box className='sidebar-text'>Availability</Box>
                                            <Box>{open4 ? <ExpandLess /> : <ExpandMore />}</Box>
                                        </Box>

                                    </ListSubheader>


                                    <Collapse in={open4}>
                                        <List>
                                            {availability.map((date) => (
                                                <ListItem key={date} sx={{ py: 0 }}>
                                                    <FormControlLabel value={date} checked={selectedAvailability.includes(date)}
                                                        control={<Checkbox onChange={handleCheckboxChang3} />}
                                                        label={<span style={{ fontSize: 'calc(1rem + 0.1vw)' }}>
                                                            {date}</span>} />
                                                </ListItem>
                                            ))}
                                        </List>


                                        <Box sx={{ px: 2 }}>
                                            <Typography sx={{ fontSize: 'calc(0.9rem + 0.1vw)' }}>Available From</Typography>

                                            <Box sx={{ mb: 3 }}>

                                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <DatePicker value={calendarDate} onChange={(newValue) => setcalendarDate(newValue)}
                                                        slots={{ openPickerIcon: CalendarToday }}
                                                        slotProps={{
                                                            textField: {
                                                                size: 'small', sx: {
                                                                    width: '100%', '& .MuiOutlinedInput-root':
                                                                    {
                                                                        borderRadius: '4px', '& fieldset': { borderColor: '#d3d2d2', },
                                                                    },
                                                                    '& .MuiInputBase-input': { py: 0.5, height: 'auto' },
                                                                },
                                                            },

                                                            popper: { sx: { zIndex: 9999 } }
                                                        }} />
                                                </LocalizationProvider>
                                            </Box>
                                        </Box>
                                    </Collapse>

                                </Box>
                            </Box>
                        </Box>
                    </Drawer>
                </Box>




                <Box className='sidebar'>

                    <Box className='sidebar-top'>
                        <Box className='filters'>Filters</Box>
                        <button onClick={reset} className='reset'>Reset All</button>
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
                                {location.map((location) => (
                                    <ListItem key={location} sx={{ py: 0 }}>
                                        <FormControlLabel value={location} checked={selectedLocations.includes(location)}
                                            control={<Checkbox onChange={handleCheckboxChang4} />}
                                            label={<span style={{ fontSize: 'calc(1rem + 0.1vw)' }}>{location}</span>} />
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
                                {neighbourhood.map((location) => (
                                    <ListItem key={location} sx={{ py: 0 }}>
                                        <FormControlLabel value={location} checked={selectedNeighborhoods.includes(location)}
                                            control={<Checkbox onChange={handleCheckboxChange} />}
                                            label={<span style={{ fontSize: 'calc(1rem + 0.1vw)' }}>{location}</span>} />
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>

                    </Box>


                    <Box sx={{ borderBottom: '1px solid rgb(211, 210, 210)' }}>
                        <ListSubheader onClick={() => setOpen2(!open2)} sx={{ cursor: 'pointer' }}>

                            <Box className='sidebar-top'>
                                <Box className='sidebar-text'>Space Types</Box>
                                <Box> {open2 ? <ExpandLess /> : <ExpandMore />}</Box>
                            </Box>

                        </ListSubheader>


                        <Collapse in={open2}>
                            <List>
                                {spaceTypes.map((type) => (
                                    <ListItem key={type} sx={{ py: 0 }}>
                                        <FormControlLabel value={type} checked={selectedspaceTypes.includes(type)}
                                            control={<Checkbox onChange={handleCheckboxChange1} />}
                                            label={<span style={{ fontSize: 'calc(1rem + 0.1vw)' }}>{type}</span>} />
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>

                    </Box>



                    <Box sx={{ py: 2, borderBottom: '1px solid rgb(211, 210, 210)' }}>

                        <ListSubheader onClick={() => setOpen6(!open6)} sx={{ cursor: 'pointer' }}>
                            <Box className='sidebar-top'>
                                <Box className='sidebar-text'>Price Range</Box>
                                <Box> {open6 ? <ExpandLess /> : <ExpandMore />}</Box>
                            </Box>
                        </ListSubheader>


                        <Collapse in={open6} sx={{ px: 2 }}>
                            <Slider value={priceRange} onChange={(_: Event, newValue: number | number[]) => setPriceRange(newValue as number[])} valueLabelDisplay="off" min={1000} max={15000}
                                step={500} sx={{ color: 'black', '& .MuiSlider-thumb': { backgroundColor: 'black' } }} />


                            {/* Static range markers */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
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
                                <Box> {open5 ? <ExpandLess /> : <ExpandMore />}</Box>
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

                                        <TextField value={minWidth.toString()} onChange={(e) => setMinWidth(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                                            variant="outlined" size="small" sx={{ width: 80, border: 'none', '& fieldset': { border: 'none' } }} />

                                        <Stack sx={{ borderRadius: '0 4px 4px 0', backgroundColor: '#f5f5f5' }}>

                                            <IconButton onClick={() => setMinWidth(minWidth + 1)} size="small"
                                                sx={{ p: 0, borderRadius: 0, borderBottom: '1px solid #d3d2d2' }}>
                                                <KeyboardArrowUp fontSize="small" />
                                            </IconButton>

                                            <IconButton onClick={() => setMinWidth(Math.max(1, minWidth - 1))} size="small" sx={{ p: 0, borderRadius: 0 }}>
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
                                        <TextField value={minHeight.toString()} onChange={(e) => setMinHeight(e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                                            variant="outlined" size="small" sx={{ width: 80, border: 'none', '& fieldset': { border: 'none' } }} />

                                        <Stack sx={{ backgroundColor: '#f5f5f5' }}>
                                            <IconButton onClick={() => setMinHeight(minHeight + 1)} size="small"
                                                sx={{ p: 0, borderRadius: 0, borderBottom: '1px solid #d3d2d2' }}>
                                                <KeyboardArrowUp fontSize="small" />
                                            </IconButton>

                                            <IconButton onClick={() => setMinHeight(Math.max(1, minHeight - 1))} size="small" sx={{ p: 0, borderRadius: 0 }}>
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
                                <Box>{open3 ? <ExpandLess /> : <ExpandMore />}</Box>
                            </Box>

                        </ListSubheader>


                        <Collapse in={open3}>
                            <List>
                                {traffic.map((number) => (
                                    <ListItem key={number} sx={{ py: 0 }}>
                                        <FormControlLabel value={number} checked={selectedTraffic.includes(number)}
                                            control={<Checkbox onChange={handleCheckboxChange2} />}
                                            label={<span style={{ fontSize: 'calc(1rem + 0.1vw)' }}>{number}</span>} />
                                    </ListItem>
                                ))}
                            </List>

                        </Collapse>

                    </Box>



                    <Box>

                        <ListSubheader onClick={() => setOpen4(!open4)} sx={{ cursor: 'pointer' }}>
                            <Box className='sidebar-top'>
                                <Box className='sidebar-text'>Availability</Box>
                                <Box>{open4 ? <ExpandLess /> : <ExpandMore />}</Box>
                            </Box>

                        </ListSubheader>


                        <Collapse in={open4}>
                            <List>
                                {availability.map((date) => (
                                    <ListItem key={date} sx={{ py: 0 }}>
                                        <FormControlLabel value={date} checked={selectedAvailability.includes(date)}
                                            control={<Checkbox onChange={handleCheckboxChang3} />}
                                            label={<span style={{ fontSize: 'calc(1rem + 0.1vw)' }}>
                                                {date}</span>} />
                                    </ListItem>
                                ))}
                            </List>


                            <Box sx={{ px: 2 }}>
                                <Typography sx={{ fontSize: 'calc(0.9rem + 0.1vw)' }}>Available From</Typography>

                                <Box sx={{ mb: 3 }}>

                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DatePicker value={calendarDate} onChange={(newValue) => setcalendarDate(newValue)}
                                            slots={{ openPickerIcon: CalendarToday }}
                                            slotProps={{
                                                textField: {
                                                    size: 'small', sx: {
                                                        width: '100%', '& .MuiOutlinedInput-root':
                                                        {
                                                            borderRadius: '4px', '& fieldset': { borderColor: '#d3d2d2', },
                                                        },
                                                        '& .MuiInputBase-input': { py: 0.5, height: 'auto' },
                                                    },
                                                },

                                                popper: { sx: { zIndex: 9999 } }
                                            }} />
                                    </LocalizationProvider>
                                </Box>
                            </Box>
                        </Collapse>

                    </Box>
                </Box>




                <Box className='main-content'>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center',gap:'0.7em' }}>
                            <i onClick={toggleDrawer(true)} className="bi bi-list drawer" style={{ zIndex: 1200, fontSize: '24px', cursor: 'pointer' }}></i>
                            <Box className='content-heading'>Advertising Spaces in NYC</Box>
                        </Box>



                        <Box className="dropdown show">
                            <button className="btn dropdown-toggle droppy" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                {sortOption}
                            </button>
                            <ul className="dropdown-menu">
                                {['Recommended', 'Newest First', 'Oldest'].map(option => (
                                    <li key={option}>
                                        <a className="dropdown-item" href="#" onClick={e => { e.preventDefault(); handleSortChange(option); }}>
                                            {option}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </Box>
                    </Box>




                    <Box sx={{ display: 'flex', gap: '0.5em', flexWrap: 'wrap', marginTop: '1em' }}>
                        {areFiltersActive && filteredItems.length > 0 && (
                            <>

                                {selectedLocations.map((location, index) => (
                                    <Box key={index} className='selectedFilters'>
                                        <i className="bi bi-geo-alt-fill" style={{ fontSize: '0.8em' }}></i>
                                        <Box sx={{ fontSize: 'calc(0.9em + 0.1vw)', marginLeft: '0.3em' }}>{location}</Box>
                                        <button className='cancelFilters' onClick={() => locationFilter(index)}>
                                            <i className="bi bi-x"></i>
                                        </button>
                                    </Box>
                                ))}

                                {selectedNeighborhoods.map((neighborhood, index) => (
                                    <Box key={`neigh-${index}`} className='selectedFilters'>
                                        <i className="bi bi-map" style={{ fontSize: '0.9em' }}></i>
                                        <Box sx={{ fontSize: 'calc(0.9em + 0.1vw)', marginLeft: '0.3em' }}>{neighborhood}</Box>
                                        <button className='cancelFilters' onClick={() => neighFilter(index)}>
                                            <i className="bi bi-x"></i>
                                        </button>
                                    </Box>
                                ))}

                                {selectedspaceTypes.map((space, index) => (
                                    <Box key={`space-${index}`} className='selectedFilters'>
                                        <i className="bi bi-layout-text-sidebar" style={{ fontSize: '0.9em' }}></i>
                                        <Box sx={{ fontSize: 'calc(0.9em + 0.1vw)', marginLeft: '0.3em' }}>{space}</Box>
                                        <button className='cancelFilters' onClick={() => typeFilter(index)}>
                                            <i className="bi bi-x"></i>
                                        </button>
                                    </Box>
                                ))}

                                {selectedTraffic.map((traffic, index) => (
                                    <Box key={`traffic-${index}`} className='selectedFilters'>
                                        <i className="bi bi-car-front-fill" style={{ fontSize: '0.9em' }}></i>
                                        <Box sx={{ fontSize: 'calc(0.9em + 0.1vw)', marginLeft: '0.3em' }}>{traffic}</Box>
                                        <button className='cancelFilters' onClick={() => trafficFilter(index)}>
                                            <i className="bi bi-x"></i>
                                        </button>
                                    </Box>
                                ))}

                                {selectedAvailability.map((availability, index) => (
                                    <Box key={index} className='selectedFilters'>
                                        <i className="bi bi-calendar-check-fill" style={{ fontSize: '0.9em' }}></i>
                                        <Box sx={{ fontSize: 'calc(0.9em + 0.1vw)', marginLeft: '0.3em' }}>{availability}</Box>
                                        <button className='cancelFilters' onClick={() => dateFilter(index)}>
                                            <i className="bi bi-x"></i>
                                        </button>
                                    </Box>
                                ))}


                                {calendarDate && (
                                    <Box key="calendar-date" className='selectedFilters'>
                                        <i className="bi bi-calendar-check-fill" style={{ fontSize: '0.9em' }}></i>
                                        <Box sx={{ fontSize: 'calc(0.9em + 0.1vw)', marginLeft: '0.3em' }}>

                                            {calendarDate && `${String(calendarDate.getMonth() + 1).padStart(2, '0')}/
                                            ${String(calendarDate.getDate()).padStart(2, '0')}/${calendarDate.getFullYear()}`}
                                        </Box>
                                        <button className='cancelFilters' onClick={() => setcalendarDate(null)}>
                                            <i className="bi bi-x"></i>
                                        </button>
                                    </Box>
                                )}


                                {minWidth > 0 && (
                                    <Box className='selectedFilters'>
                                        <i className="bi bi-arrows-angle-expand" style={{ fontSize: '0.9em' }}></i>
                                        <Box sx={{ fontSize: 'calc(0.9em + 0.1vw)', marginLeft: '0.3em' }}>{minWidth}ft Width</Box>
                                        <button className='cancelFilters' onClick={() => setMinWidth(0)}><i className="bi bi-x"></i></button>
                                    </Box>
                                )}

                                {minHeight > 0 && (
                                    <Box className='selectedFilters'>
                                        <i className="bi bi-arrows-angle-contract" style={{ fontSize: '0.9em' }}></i>
                                        <Box sx={{ fontSize: 'calc(0.9em + 0.1vw)', marginLeft: '0.3em' }}>{minHeight}ft Height</Box>
                                        <button className='cancelFilters' onClick={() => setMinHeight(0)}><i className="bi bi-x"></i></button>
                                    </Box>
                                )}

                                {(priceRange[0] !== 1000 || priceRange[1] !== 15000) && (
                                    <Box className='selectedFilters'>
                                        <i className="bi bi-cash-stack" style={{ fontSize: '0.9em' }}></i>
                                        <Box sx={{ fontSize: 'calc(0.9em + 0.1vw)', marginLeft: '0.3em' }}>${priceRange[0]} - ${priceRange[1]}</Box>
                                        <button className='cancelFilters' onClick={() => setPriceRange([1000, 15000])}><i className="bi bi-x"></i></button>
                                    </Box>
                                )}

                                <button className='reset' onClick={reset}>Clear All</button>
                            </>
                        )}
                    </Box>



                    <Box sx={{ fontSize: 'calc(1rem + 0.2vw)', textAlign: 'left', color: 'rgb(110, 109, 109)', fontWeight: '500', marginTop: '1em' }}>

                        {
                            itemsToDisplay.length === 0 ?
                                (
                                    null
                                )

                                :

                                (
                                    currentPageItems.length > 1 ? `Showing ${currentPageItems.length} spaces matching your criteria` :
                                        `Showing ${currentPageItems.length} space matching your criteria`
                                )
                        }

                    </Box>





                    <Box className='cards'>

                        <Box className='car'>

                            {areFiltersActive && filteredItems.length === 0 ?
                                (
                                    <p style={{ marginTop: '7em', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 'calc(1rem + 1vw)' }}>
                                        No items match your selected filters. Try changing your filters.
                                    </p>
                                )

                                :

                                (
                                    displayedItems.map((product) => {

                                        return (
                                            <Box key={product.id} className="card">
                                                <img src={product.img} style={{ height: '15em', objectFit: 'cover' }}
                                                    alt={product.spaceName} />

                                                <Box className="card-body" sx={{ textAlign: 'left', borderRadius: '1em', padding: '1em' }}>

                                                    <Box sx={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'space-between' }}>
                                                        <Box sx={{ fontSize: 'calc(0.7em + 0.2vw)', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>
                                                            {product.spaceName}
                                                        </Box>

                                                        <Box sx={{ fontSize: 'calc(0.7em + 0.2vw)', fontWeight: 'bold' }}>
                                                            ${product.price}
                                                            <span style={{ color: '#666', fontWeight: 500 }}>/week</span>
                                                        </Box>
                                                    </Box>



                                                    <Box sx={{ display: 'flex', color: '#666', fontWeight: '500', marginTop: '0.2em' }}>
                                                        <Box sx={{ fontSize: 'calc(0.7em + 0.1vw)' }}><i className="bi bi-geo-alt"></i>
                                                            {product.neighbourhood}</Box>
                                                    </Box>


                                                    <Box sx={{ display: 'flex', mt: 2, justifyContent: 'space-between' }}>
                                                        <Box sx={{ fontSize: 'calc(0.7em + 0.1vw)', fontWeight: '500' }}><span style={{ color: '#666' }}>
                                                            Type</span> : {product.type}
                                                        </Box>

                                                        <Box sx={{ fontSize: 'calc(0.7em + 0.1vw)', fontWeight: '500' }}>
                                                            <span style={{ color: '#666' }}>Size</span>: {product.width} x {product.height}
                                                        </Box>
                                                    </Box>


                                                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: '0.2em' }}>
                                                        <i className="bi bi-people-fill"></i>
                                                        <Box sx={{ fontSize: 'calc(0.7em + 0.1vw)', fontWeight: '500' }}><span style={{ color: '#666' }}>
                                                            Traffic</span> : {product.traffic}
                                                        </Box>
                                                    </Box>



                                                    <Box sx={{ mt: 1, fontSize: 'calc(0.7em + 0.1vw)', fontWeight: '500' }}><span style={{ color: '#666' }}>
                                                        Available</span>: {product.availability}
                                                    </Box>

                                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                                        <Link to={`/detailsPage/${product.id}`} style={{ width: '100%', fontSize: 'calc(0.7em + 0.1vw)' }}>
                                                            <button className='DetailsButton' ><i className="bi bi-eye"></i> View Details</button>
                                                        </Link>
                                                    </Box>


                                                </Box>

                                            </Box>

                                        );

                                    })
                                )

                            }

                        </Box>

                    </Box>


                    {
                        itemsToDisplay.length === 0 || totalPages <= 1 ?
                            (
                                null
                            )

                            :

                            (
                                <Box sx={{ mt: 4 }}>
                                    <nav aria-label="Page navigation example">

                                        <ul style={{ display: 'flex', alignItems: 'center' }} className="pagination justify-content-center">

                                            <li className="page-item leftstyle" onClick={prevButton}><i className="bi bi-arrow-left"></i></li>

                                            <li className="page-item">

                                                <Box sx={{ display: 'flex' }}>
                                                    {pageNumbers.map((num) => {

                                                        return (
                                                            <Box key={num} sx={{ padding: '0.2em' }}>
                                                                <Box>
                                                                    <button className={`pageBtn ${currentPage === num ? 'active' : ''}`}
                                                                        onClick={() => setCurrentPage(num)}>{num}</button>
                                                                </Box>
                                                            </Box>

                                                        );

                                                    })}
                                                </Box>
                                            </li>

                                            <li className="page-item rightstyle" onClick={nextButton} ><i className="bi bi-arrow-right"></i></li>
                                        </ul>
                                    </nav>
                                </Box>
                            )
                    }


                </Box>

            </Box>
        </>
    );
}

export default BrowseSpace;

