import { Box, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { Link, useParams } from 'react-router-dom';
import './styles/ItemDetailPage.css'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { CalendarToday } from '@mui/icons-material';
import { useState } from 'react';
import pic from '../assets/logo.png'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import People from '@mui/icons-material/People';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import WarningIcon from '@mui/icons-material/Warning';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BlockIcon from '@mui/icons-material/Block';
import React from 'react';
import Rating from '@mui/material/Rating';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';




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
  address: string;
  material: string;
  restrictions: string;
  bookingTime: string;
  installation: string;
  permit: string;
}



const products: Product[] = [
  { id: 1, spaceName: 'SoHo Building Wall', neighbourhood: 'SoHo', location: 'Manhattan', price: 14500, img: 'https://oceanoutdoor.s3.eu-west-2.amazonaws.com/website/wp-content/uploads/2024/05/WR-PLS.-Apr-24-2-1920x1281-1.jpg', type: 'Wall', width: '25ft', height: '30ft', traffic: '10,000+ daily', availability: '01/15/2025', address: '123 Broadway, SoHo', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' },
  { id: 2, spaceName: 'Times Square Window', neighbourhood: 'Times Square', location: 'Manhattan', price: 12050, img: 'https://mandoemedia.com/app/uploads/2023/08/M_UltimateGuide_Retail_01.png', type: 'Vehicle', width: '20ft', height: '28ft', traffic: '5,000+ daily', availability: 'Available Now', address: '1560 Broadway, Times Square', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' },
  { id: 3, spaceName: 'Chelsea Gallery Exterior', neighbourhood: 'Chelsea', location: 'Manhattan', price: 1450, img: 'https://assets.simpleviewinc.com/simpleview/image/upload/crm/howardcounty/Listing-Pic---website-960-x-720---2022-04-21T113542.580_FFB9B994-5056-B3A8-499D03E9CDF44E8C-ffb9b5745056b3a_ffb9c4ba-5056-b3a8-4902c7fd236c3842.png', type: 'Wall', width: '25ft', height: '30ft', traffic: '15,000+ daily', availability: '03/10/2025', address: '456 W 23rd St, Chelsea', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' },
  { id: 4, spaceName: 'Brooklyn Warehouse Side', neighbourhood: 'DUMBO', location: 'Brooklyn', price: 11500, img: 'https://houseofmockups.com/cdn/shop/files/HOM-002-017.-Williamsburg-Handpainted-Billboard-Mockup.webp?v=1724180972', type: 'Wall', width: '30ft', height: '40ft', traffic: '5,000+ daily', availability: 'Available Now', address: '45 Water St, DUMBO', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' },
  { id: 5, spaceName: 'Williamsburg Rooftop', neighbourhood: 'Williamsburg', location: 'Brooklyn', price: 11150, img: 'https://static.vecteezy.com/system/resources/previews/044/904/036/non_2x/outdoor-billboard-mockup-free-psd.png', type: 'Billboard', width: '20ft', height: '28ft', traffic: '5,000+ daily', availability: '05/20/2025', address: '210 Bedford Ave, Williamsburg', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' },
  { id: 6, spaceName: 'Upper East Side Storefront', neighbourhood: 'Upper East Side', location: 'Manhattan', price: 11450, img: 'https://patch.com/img/cdn20/users/26226110/20240109/043757/styles/patch_image/public/r0005773___09160919405.jpg', type: 'Vehicle', width: '19ft', height: '21ft', traffic: '15,000+ daily', availability: 'Available Now', address: '1232 Lexington Ave, Upper East Side', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' },
  { id: 7, spaceName: 'SoHo Building Wall', neighbourhood: 'SoHo', location: 'Manhattan', price: 1140, img: 'https://oceanoutdoor.s3.eu-west-2.amazonaws.com/website/wp-content/uploads/2024/05/WR-PLS.-Apr-24-2-1920x1281-1.jpg', type: 'Vehicle', width: '26ft', height: '32ft', traffic: '20,000+ daily', availability: '07/01/2025', address: '456 Spring St, SoHo', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' },
  { id: 8, spaceName: 'Upper East Side Storefront', neighbourhood: 'Upper East Side', location: 'Manhattan', price: 11450, img: 'https://patch.com/img/cdn20/users/26226110/20240109/043757/styles/patch_image/public/r0005773___09160919405.jpg', type: 'Vehicle', width: '19ft', height: '21ft', traffic: '15,000+ daily', availability: 'Available Now', address: '1101 Madison Ave, Upper East Side', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' },
  { id: 9, spaceName: 'Williamsburg Rooftop', neighbourhood: 'Williamsburg', location: 'Brooklyn', price: 13500, img: 'https://static.vecteezy.com/system/resources/previews/044/904/036/non_2x/outdoor-billboard-mockup-free-psd.png', type: 'Wall', width: '22ft', height: '36ft', traffic: '10,000+ daily', availability: '08/08/2025', address: '89 S 6th St, Williamsburg', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' },
  { id: 10, spaceName: 'SoHo Building Wall', neighbourhood: 'SoHo', location: 'Manhattan', price: 14550, img: 'https://oceanoutdoor.s3.eu-west-2.amazonaws.com/website/wp-content/uploads/2024/05/WR-PLS.-Apr-24-2-1920x1281-1.jpg', type: 'Wall', width: '20ft', height: '28ft', traffic: '5,000+ daily', availability: 'Available Now', address: '89 Crosby St, SoHo', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' },
  { id: 11, spaceName: 'Upper East Side Storefront', neighbourhood: 'Upper East Side', location: 'Manhattan', price: 13950, img: 'https://patch.com/img/cdn20/users/26226110/20240109/043757/styles/patch_image/public/r0005773___09160919405.jpg', type: 'Storefront', width: '27ft', height: '38ft', traffic: '10,000+ daily', availability: '10/25/2025', address: '941 Lexington Ave, Upper East Side', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' },
  { id: 12, spaceName: 'Brooklyn Warehouse Side', neighbourhood: 'DUMBO', location: 'Brooklyn', price: 1000, img: 'https://houseofmockups.com/cdn/shop/files/HOM-002-017.-Williamsburg-Handpainted-Billboard-Mockup.webp?v=1724180972', type: 'Storefront', width: '23ft', height: '29ft', traffic: '20,000+ daily', availability: 'Available Now', address: '20 Jay St, DUMBO', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' },
  { id: 13, spaceName: 'Williamsburg Rooftop', neighbourhood: 'Williamsburg', location: 'Brooklyn', price: 1200, img: 'https://static.vecteezy.com/system/resources/previews/044/904/036/non_2x/outdoor-billboard-mockup-free-psd.png', type: 'Billboard', width: '21ft', height: '26ft', traffic: '15,000+ daily', availability: '12/05/2025', address: '164 Wythe Ave, Williamsburg', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' },
  { id: 14, spaceName: 'Chelsea Gallery Exterior', neighbourhood: 'Chelsea', location: 'Manhattan', price: 3450, img: 'https://assets.simpleviewinc.com/simpleview/image/upload/crm/howardcounty/Listing-Pic---website-960-x-720---2022-04-21T113542.580_FFB9B994-5056-B3A8-499D03E9CDF44E8C-ffb9b5745056b3a_ffb9c4ba-5056-b3a8-4902c7fd236c3842.png', type: 'Wall', width: '29ft', height: '34ft', traffic: '20,000+ daily', availability: 'Available Now', address: '508 W 26th St, Chelsea', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' },
  { id: 15, spaceName: 'Times Square Window', neighbourhood: 'Times Square', location: 'Manhattan', price: 8450, img: 'https://mandoemedia.com/app/uploads/2023/08/M_UltimateGuide_Retail_01.png', type: 'Wall', width: '25ft', height: '30ft', traffic: '10,000+ daily', availability: '03/03/2025', address: '7 Times Sq, Times Square', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' },
  { id: 16, spaceName: 'Williamsburg Rooftop', neighbourhood: 'Williamsburg', location: 'Brooklyn', price: 15000, img: 'https://static.vecteezy.com/system/resources/previews/044/904/036/non_2x/outdoor-billboard-mockup-free-psd.png', type: 'Billboard', width: '30ft', height: '40ft', traffic: '15,000+ daily', availability: 'Available Now', address: '33 Kent Ave, Williamsburg', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' },
  { id: 17, spaceName: 'Williamsburg Rooftop', neighbourhood: 'Williamsburg', location: 'Brooklyn', price: 15000, img: 'https://static.vecteezy.com/system/resources/previews/044/904/036/non_2x/outdoor-billboard-mockup-free-psd.png', type: 'Billboard', width: '30ft', height: '40ft', traffic: '15,000+ daily', availability: 'Available Now', address: '77 N 11th St, Williamsburg', material: 'Brick', restrictions: 'No political ads', bookingTime: '2 weeks', installation: 'Provided', permit: 'Required' }
];



interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}


function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}



const itemData = [
  {
    img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e',
    title: 'Breakfast',
    author: '@bkristastucchio',
    featured: true,
  },
  {
    img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d',
    title: 'Burger',
    author: '@rollelflex_graphy726',
  },
  {
    img: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45',
    title: 'Camera',
    author: '@helloimnik',
  },
  {
    img: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c',
    title: 'Coffee',
    author: '@nolanissac',
  },
  {
    img: 'https://images.unsplash.com/photo-1533827432537-70133748f5c8',
    title: 'Hats',
    author: '@hjrc33',
  },
  {
    img: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62',
    title: 'Honey',
    author: '@arwinneil',
    featured: true,
  },
  {
    img: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6',
    title: 'Basketball',
    author: '@tjdragotta',
  },
  {
    img: 'https://images.unsplash.com/photo-1518756131217-31eb79b20e8f',
    title: 'Fern',
    author: '@katie_wasserman',
  },
  {
    img: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25',
    title: 'Mushrooms',
    author: '@silverdalex',
  },
  {
    img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af',
    title: 'Tomato basil',
    author: '@shelleypauls',
  },
  {
    img: 'https://images.unsplash.com/photo-1471357674240-e1a485acb3e1',
    title: 'Sea star',
    author: '@peterlaster',
  },
  {
    img: 'https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
    title: 'Bike',
    author: '@southside_customs',
  },
];




export default function ItemDetailPage() {

  const [value, setValue] = useState(0);
  const [value1, _] = React.useState<number | null>(3);


  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));

  const [startDate, setstartDate] = useState<Date | null>(null);
  const [endDate, setendDate] = useState<Date | null>(null);

  const features = [
    "High visibility from Broadway and Spring St",
    "Unobstructed view from multiple angles",
    "Professional installation available"
  ];


  const features1 = [
    "Illuminated at night",
    "Weather-resistant surface",
    "Traffic analytics provided monthly"
  ];


  const data = [
    { icon: <LocalOfferIcon />, label: 'Type' },
    { icon: <i className="bi bi-arrows-angle-contract"></i>, label: 'Dimensions' },
    { icon: <People />, label: 'Traffic' },
    { icon: <i className="bi bi-type"></i>, label: 'Material' },
    { icon: <WarningIcon />, label: 'Restrictions' },
    { icon: <CalendarTodayIcon />, label: 'Min. Booking' },
    { icon: <i className="bi bi-download"></i>, label: 'Installations' },
    { icon: <BlockIcon />, label: 'Permit Required' },
  ];



  const values = [product?.type, `${product?.width} x ${product?.height}`, product?.traffic, product?.material, product?.restrictions, product?.bookingTime,
  product?.installation, product?.permit,];




  return (

    <Box sx={{ marginTop: '4em', padding: '2em' }}>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link to="/browse" style={{ textDecoration: "none", color: "#1E2A47", fontSize: 'calc(0.8rem + 0.2vw)' }}>← Back to Listings</Link>

        <Box sx={{ display: 'flex' }}>
          <button className='icons'><i className="bi bi-share"></i></button>
          <button className='icons'><i className="bi bi-heart"></i></button>
        </Box>
      </Box>


      <Box className='layout1'>

        <Box className='mainContent'>

          <Box sx={{ fontSize: 'calc(1.2em + 0.2vw)', fontWeight: 'bold' }}>
            {product?.spaceName}
          </Box>

          <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', display: 'flex', gap: '0.5em', color: '#666', fontWeight: 500, alignItems: 'center' }}>
            <i className="bi bi-geo-alt"></i>
            <Box>{product?.address}</Box>
            <Box sx={{ fontSize: 'calc(0.6em + 0.2vw)', color: 'black', fontWeight: 500, border: '1px solid grey', padding: '0.3em', borderRadius: '1em' }}>
              {product?.neighbourhood}</Box>
          </Box>

          <Box sx={{ width: '100%', marginTop: '1em' }}>

            <Box sx={{ width: '100%', height: 400, mb: 2 }}>
              <img src={product?.img} alt={product?.spaceName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>



            <Box sx={{ display: 'flex', gap: 2 }}>
              {[1, 2, 3, 4].map((item) => (
                <Box key={item} sx={{ flex: 1, height: 100 }}>
                  <img src={itemData[item]?.img} alt={itemData[item]?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Box>
          </Box>


          <Box className='sections'>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" variant="fullWidth"
              sx={{
                '& .MuiTabs-indicator':
                {
                  display: 'none', transition: 'none !important', animation: 'none !important'
                },

                '& .MuiTab-root':
                {
                  color: '#666', transition: 'none !important', animation: 'none !important', transform: 'none !important', textTransform: 'capitalize',
                  fontFamily: 'inherit', fontWeight: 600, fontSize: 'calc(0.8em + 0.2vw)',
                  '&.Mui-selected': {
                    color: 'black',
                    backgroundColor: 'white'
                  },
                  '&:focus': {
                    outline: 'none',
                  },
                  '&:focus-visible': {
                    outline: 'none',
                  },

                },

                '& .MuiTabs-scroller':
                {
                  overflow: 'visible !important',
                  transition: 'none !important'
                },
                width: '100%'
              }}>
              <Tab className='details' label="Details" {...a11yProps(0)} disableRipple sx={{ minWidth: 'unset' }} autoFocus disableFocusRipple />
              <Tab className='specifications' label="Specifications" {...a11yProps(1)} disableRipple sx={{ minWidth: 'unset' }} />
              <Tab className='reviews' label="Reviews" {...a11yProps(2)} disableRipple sx={{ minWidth: 'unset' }} />
            </Tabs>
          </Box>

          <CustomTabPanel value={value} index={0}>

            <Box>
              <span style={{ fontSize: 'calc(1em + 0.2vw)', fontWeight: 'bold' }}>
                Description
              </span>

              <p className='detailsText'>
                Prime advertising wall space in the heart of SoHo, one of NYC’s most vibrant shopping districts. This large format wall faces a busy intersection with high foot and vehicle traffic. Perfect for fashion, lifestyle, and luxury brand campaigns.
              </p>
            </Box>


            <Box>
              <Box style={{ fontSize: 'calc(1em + 0.2vw)', fontWeight: 'bold', marginTop: '1em' }}>
                Features
              </Box>

              <Box sx={{ display: 'flex', gap: '5em', width: '100%' }}>

                <Box>
                  {features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: '2em !important' }}>
                        <ArrowForwardIosIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature}
                        sx={{
                          '& .MuiTypography-root': {
                            margin: 0,
                            color: 'black',
                            fontSize: 'calc(0.8em + 0.2vw)',
                            lineHeight: 1.2,
                            fontWeight: 600
                          },
                        }} />
                    </ListItem>
                  ))}
                </Box>

                <Box>
                  {features1.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: '2em !important' }}>
                        <ArrowForwardIosIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature}
                        sx={{
                          '& .MuiTypography-root': {
                            margin: 0,
                            color: 'black',
                            fontSize: 'calc(0.8em + 0.2vw)',
                            lineHeight: 1.2,
                            fontWeight: 600
                          },
                        }} />
                    </ListItem>
                  ))}
                </Box>
              </Box>
            </Box>


            <Box>
              <Box style={{ fontSize: 'calc(1em + 0.2vw)', fontWeight: 'bold', marginTop: '1em' }}>
                Location
              </Box>

              <Box sx={{
                width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center',
                backgroundColor: '#f5f5f5', borderRadius: 2,marginTop:'0.5em' 
              }}>
                <BrokenImageIcon sx={{ fontSize: 48, color: '#ccc'}} />
              </Box>
            </Box>
          </CustomTabPanel>



          <CustomTabPanel value={value} index={1}>
            <span style={{ fontSize: 'calc(1em + 0.2vw)', fontWeight: 'bold' }}>
              Technical Specifications
            </span>


            <Box className='specificationDetails'>

              {data.map((item, index) => {
                const value = values[index];
                return (
                  <>
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                      <ListItemIcon 
                        sx={{
                          color: '#666', minWidth: 'auto', marginRight: '0.5em', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: '24px'
                        }}>
                        {item.icon}
                      </ListItemIcon>

                      <ListItemText primary={item.label}
                        sx={{
                          '& .MuiTypography-root': {
                            margin: 0, color: '#666', fontSize: 'calc(0.8em + 0.2vw)', fontWeight: 600,
                          },
                        }}
                      />
                    </Box>


                    <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', color: 'black', fontWeight: 600, margin: 0 }}>
                      {value}
                    </Box>

                  </>
                );
              })}

            </Box>


            <Box sx={{ marginTop: '1em' }}>
              <span style={{ fontSize: 'calc(1em + 0.2vw)', fontWeight: 'bold' }}>
                Documents
              </span>

              <Box sx={{ marginTop: '0.5em' }}>
                <Box className="mb-3 upload">
                  <label htmlFor="formFile" className="btn"><i className="bi bi-download"></i>
                    <span style={{ marginLeft: '0.3em', fontSize: 'calc(0.8em + 0.2vw)', color: 'black', fontWeight: 500 }}>
                      Upload Technical Specifications (PDF)</span></label>
                  <input type="file" className="d-none" id="formFile" accept="application/pdf" />
                </Box>

                <Box className="mb-3 upload">
                  <label htmlFor="formFile" className="btn"><i className="bi bi-download"></i>
                    <span style={{ marginLeft: '0.3em', fontSize: 'calc(0.8em + 0.2vw)', color: 'black', fontWeight: 500 }}>
                      Traffic Analysis Report (PDF)</span></label>
                  <input type="file" className="d-none" id="formFile" accept="application/pdf" />
                </Box>

              </Box>
            </Box>

          </CustomTabPanel>



          <CustomTabPanel value={value} index={2}>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}>
              <Box sx={{ fontSize: 'calc(1.5em + 0.2vw)', fontWeight: 'bold' }}>4.7</Box>
              <Rating name="read-only" value={value1} readOnly />
              <Box>(3 reviews)</Box>
            </Box>


            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3em' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                <IconButton sx={{ p: 0 }}>
                  <Avatar alt="User" src="/static/images/avatar/2.jpg" sx={{ width: 56, height: 56 }} />
                </IconButton>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ fontSize: 'calc(1em + 0.2vw)', fontWeight: 500, color: 'black' }}>Faraz Naqvi</Box>
                    <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', fontWeight: 500, color: '#666' }}>MarsChettos</Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', marginTop: '0.3em' }}>
                December 2024
              </Box>
            </Box>

            <Box sx={{ marginTop: '1em' }}>
              <Rating name="read-only" value={value1} readOnly />
            </Box>

            <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', marginTop: '0.3em' }}>
              High foot traffic and visibility make this a prime spot for reaching a wide audience.
            </Box>

            <Divider sx={{ my: 2, backgroundColor: 'black' }} />


            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                <IconButton sx={{ p: 0 }}>
                  <Avatar alt="User" src="/static/images/avatar/2.jpg" sx={{ width: 56, height: 56 }} />
                </IconButton>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ fontSize: 'calc(1em + 0.2vw)', fontWeight: 500, color: 'black' }}>Faraz Naqvi</Box>
                    <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', fontWeight: 500, color: '#666' }}>MarsChettos</Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', marginTop: '0.3em' }}>
                December 2024
              </Box>
            </Box>

            <Box sx={{ marginTop: '1em' }}>
              <Rating name="read-only" value={value1} readOnly />
            </Box>

            <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', marginTop: '0.3em' }}>
              High foot traffic and visibility make this a prime spot for reaching a wide audience.
            </Box>

            <Divider sx={{ my: 2, backgroundColor: 'black' }} />


            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                <IconButton sx={{ p: 0 }}>
                  <Avatar alt="User" src="/static/images/avatar/2.jpg" sx={{ width: 56, height: 56 }} />
                </IconButton>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ fontSize: 'calc(1em + 0.2vw)', fontWeight: 500, color: 'black' }}>Faraz Naqvi</Box>
                    <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', fontWeight: 500, color: '#666' }}>MarsChettos</Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', marginTop: '0.3em' }}>
                December 2024
              </Box>
            </Box>

            <Box sx={{ marginTop: '1em' }}>
              <Rating name="read-only" value={value1} readOnly />
            </Box>

            <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', marginTop: '0.3em' }}>
              High foot traffic and visibility make this a prime spot for reaching a wide audience.
            </Box>

          </CustomTabPanel>

        </Box>


        <Box className='sidebaar'>

          <Box className='detailsLeftSideBar1'>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ fontSize: 'calc(1em + 0.2vw)', fontWeight: 'bold' }}>
                ${product?.price}
              </Box>
              <span style={{ color: '#666', fontWeight: 500 }}>/week</span>
            </Box>


            <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', color: '#666', fontWeight: 500 }}>{product?.availability}</Box>


            <Box sx={{ display: 'flex', gap: '1em', marginTop: '2em', flexWrap: 'wrap' }}>

              <Box sx={{ width: '100%' }}>
                <Typography sx={{ fontSize: 'calc(0.9rem + 0.1vw)' }}>Start Date</Typography>

                <Box>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker value={startDate} onChange={(newValue) => setstartDate(newValue)}
                      slots={{ openPickerIcon: CalendarToday }}
                      slotProps={{
                        textField: {
                          size: 'small', sx: {
                            width: '100%',
                            minWidth: 'unset', '& .MuiOutlinedInput-root':
                            {
                              borderRadius: '4px', '& fieldset': { borderColor: '#d3d2d2', },
                            },
                            '& .MuiInputBase-input': { py: 0.5, height: 'auto' },
                          },
                        },

                        popper: { sx: { zIndex: 9999 } }
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Box>


              <Box sx={{ width: '100%' }}>
                <Typography sx={{ fontSize: 'calc(0.9rem + 0.1vw)' }}>End Date</Typography>

                <Box>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker value={endDate} onChange={(newValue) => setendDate(newValue)}
                      slots={{ openPickerIcon: CalendarToday }}
                      slotProps={{
                        textField: {
                          size: 'small', sx: {
                            width: '100%',
                            minWidth: 'unset', '& .MuiOutlinedInput-root':
                            {
                              borderRadius: '4px', '& fieldset': { borderColor: '#d3d2d2', },
                            },
                            '& .MuiInputBase-input': { py: 0.5, height: 'auto' },
                          },
                        },

                        popper: { sx: { zIndex: 9999 } }
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Box>

            </Box>

            <Typography sx={{ fontSize: 'calc(0.9rem + 0.1vw)', marginTop: '1em' }}>Duration</Typography>

            <Box sx={{ display: 'flex', width: '100%', border: '2px solid rgb(211, 210, 210)', borderRadius: '0.3em', padding: '0.5em', gap: '1em' }}>
              <i className="bi bi-clock-fill"></i>
              <Box sx={{ fontWeight: 600, fontSize: 'calc(1rem + 0.1vw)' }}> 2 weeks</Box>
            </Box>


            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em' }}>
              <Box sx={{ color: '#666', fontWeight: 500, fontSize: 'calc(0.9rem + 0.1vw)' }}>${product?.price} x 2 weeks</Box>
              <Box sx={{ fontWeight: 600, fontSize: 'calc(0.9rem + 0.1vw)' }}>$17,000</Box>
            </Box>


            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em' }}>
              <Box sx={{ color: '#666', fontWeight: 500, fontSize: 'calc(0.9rem + 0.1vw)' }}>Installation fee</Box>
              <Box sx={{ fontWeight: 600, fontSize: 'calc(0.9rem + 0.1vw)' }}>$1,700</Box>
            </Box>


            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em' }}>
              <Box sx={{ color: '#666', fontWeight: 500, fontSize: 'calc(0.9rem + 0.1vw)' }}>Service fee</Box>
              <Box sx={{ fontWeight: 600, fontSize: 'calc(0.9rem + 0.1vw)' }}>$1,000</Box>
            </Box>


            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em' }}>
              <Box sx={{ color: 'black', fontWeight: 500, fontSize: 'calc(0.9rem + 0.1vw)' }}>Total</Box>
              <Box sx={{ fontWeight: 600, fontSize: 'calc(0.9rem + 0.1vw)' }}>$19,700</Box>
            </Box>


            <button className='DetailsButton' >Contact Owner</button>

            <Box sx={{ textAlign: 'center', marginTop: '1em', color: '#666', fontWeight: 600, fontSize: 'calc(0.9rem + 0.1vw)' }}>You won't be charged yet</Box>


            <Box className='reportItem'>
              <i className="bi bi-flag" />
              <Link to="/" style={{ borderBottom: '2px solid #666', color: '#666', fontWeight: 600, fontSize: 'calc(0.9rem + 0.1vw)' }}>Report this Listing</Link>
            </Box>


          </Box>



          <Box className='detailsLeftSideBar2'>

            <Box sx={{ fontSize: 'calc(1em + 0.2vw)', fontWeight: 'bold' }}>About the Owner</Box>

            <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', fontWeight: 500, textAlign: 'center', marginTop: '1em' }}>Manhattan Properties LLC</Box>

            <Box sx={{ color: '#666', fontWeight: 500, fontSize: 'calc(0.8rem + 0.1vw)', textAlign: 'center' }}>Member Since 2022</Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em' }}>
              <Box sx={{ color: '#666', fontWeight: 500, fontSize: 'calc(0.9rem + 0.1vw)' }}>Total</Box>
              <Box sx={{ fontWeight: 600, fontSize: 'calc(0.9rem + 0.1vw)' }}>$19,700</Box>
            </Box>


            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em' }}>
              <Box sx={{ color: '#666', fontWeight: 500, fontSize: 'calc(0.9rem + 0.1vw)' }}>Total</Box>
              <Box sx={{ fontWeight: 600, fontSize: 'calc(0.9rem + 0.1vw)' }}>$19,700</Box>
            </Box>

          </Box>



          <Box className='detailsLeftSideBar2'>
            <Box sx={{ fontSize: 'calc(1em + 0.2vw)', fontWeight: 'bold' }}>Similar Spaces</Box>


            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em', alignItems: 'center' }}>

              <Box sx={{ display: 'flex', gap: '0.5em' }}>

                <img src={pic} className='logo1' alt="" />


                <Box sx={{ display: 'flex', flexDirection: 'column' }}>

                  <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', fontWeight: 500, color: 'black' }}>
                    {product?.spaceName}
                  </Box>

                  <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)' }}>
                    {product?.width} x {product?.height}
                  </Box>

                  <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', fontWeight: 500, color: 'black' }}>
                    ${product?.price}
                    <span style={{ color: '#666', fontWeight: 500 }}>/week</span>
                  </Box>

                </Box>

              </Box>


              <Box>
                <i className="bi bi-eye"></i>
              </Box>
            </Box>


            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '2em', alignItems: 'center' }}>

              <Box sx={{ display: 'flex', gap: '0.5em' }}>

                <img src={pic} className='logo1' alt="" />


                <Box sx={{ display: 'flex', flexDirection: 'column' }}>

                  <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', fontWeight: 500, color: 'black' }}>
                    {product?.spaceName}
                  </Box>

                  <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)' }}>
                    {product?.width} x {product?.height}
                  </Box>

                  <Box sx={{ fontSize: 'calc(0.8em + 0.2vw)', fontWeight: 500, color: 'black' }}>
                    ${product?.price}
                    <span style={{ color: '#666', fontWeight: 500 }}>/week</span>
                  </Box>

                </Box>

              </Box>


              <Box>
                <i className="bi bi-eye"></i>
              </Box>

            </Box>


            <button className='spacesviewButton'>View more Similar Spaces</button>

          </Box>

        </Box>

      </Box>
    </Box>
  )
}
