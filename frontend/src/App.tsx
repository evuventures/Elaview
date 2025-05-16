import './App.css';
import Header from './Header';
import { Routes, Route, Link } from 'react-router-dom';
import BrowseSpace from './BrowseSpace';
import ListSpace from './ListSpace';
import SignIn from './SignIn';
import Home from './Home';
import Footer from './Footer';
import billboardImage from '../public/images/billboard1.png';
import profile1 from '../public/images/profile1.png';
import profile2 from '../public/images/profile2.png';
import profile3 from '../public/images/profile3.png';
import profile4 from '../public/images/profile4.png';
import profile5 from '../public/images/profile5.png';
import profile6 from '../public/images/profile6.png';
import profile7 from '../public/images/profile7.png';
import sohoImg from "../public/images/soho.png";
import timesSquareImg from "../public/images/timesSquare.png";
import brooklynImg from "../public/images/brooklyn.png";
import chelseaImg from "../public/images/chelsea.png";

// for displaying the featured spaces
interface SpaceCardProps {
  title: string;
  location: string;
  price: string;
  size: string;
  type: string;
  traffic: string;
  img: string;
  featured: boolean;
}

const SpaceCard = ({
  title,
  location,
  price,
  size,
  type,
  traffic,
  img,
  featured,
}: SpaceCardProps) => {
  return (
    <div className="SpaceCard">
      <div className="SpaceImageContainer">
        <img src={img} alt={title} className="SpaceImage" />
        {featured && <span className="FeaturedBadge">Featured</span>}
      </div>
      <div className="SpaceInfo">
        <h3 className="SpaceTitle">{title}</h3>
        <p className="SpaceLocation">{location}</p>
        <p className="SpacePrice">{price}</p>
        <div className="SpaceMeta">
          <p>Type: {type}</p>
          <p>Size: {size}</p>
          <p>Traffic: {traffic}</p>
        </div>
        <button className="DetailsButton">View Details</button>
      </div>
    </div>
  );
};

function App() {

  // can replace with actual spaces later
  const spaces: SpaceCardProps[] = [
    {
      title: "SoHo Building Wall",
      location: "SoHo",
      price: "$8,500/week",
      size: "40ft × 60ft",
      type: "Wall",
      traffic: "25,000+ daily",
      img: sohoImg,
      featured: true,
    },
    {
      title: "Times Square Window",
      location: "Times Square",
      price: "$12,000/week",
      size: "20ft × 15ft",
      type: "Window",
      traffic: "50,000+ daily",
      img: timesSquareImg,
      featured: true,
    },
    {
      title: "Brooklyn Warehouse Side",
      location: "DUMBO",
      price: "$6,200/week",
      size: "30ft × 50ft",
      type: "Billboard",
      traffic: "15,000+ daily",
      img: brooklynImg,
      featured: false,
    },
    {
      title: "Chelsea Gallery Exterior",
      location: "Chelsea",
      price: "$5,800/week",
      size: "25ft × 35ft",
      type: "Wall",
      traffic: "10,000+ daily",
      img: chelseaImg,
      featured: false,
    },
  ];

  return (
    <>
      <Header />
      <Routes>
        <Route path="/browse" element={<BrowseSpace />} />
        <Route path="/list" element={<ListSpace />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
      {/* <Home /> */}

      <div className = "Home">
        <div className = "HomeLeftSection">
          <h1>Unlock Hidden Advertising Spaces</h1>
          <p>
          Connect landlords with prime advertising real estate to brands
          seeking impactful visibility in cities.
          </p>
          <div className="HomeButton">
            <Link to="/browse" className="NavButton">Find Your Ad Space</Link>
            <Link to="/list" className="NavButton">List Your Property</Link>
          </div>
          <div className = "Reviews">
            <div className = "Avatars">
              <img src={profile1} alt="Profile 1" />
              <img src={profile2} alt="Profile 2" />
              <img src={profile3} alt="Profile 3" />
              <img src={profile4} alt="Profile 4" />
            </div>
            <span>Trusted by <strong>500+</strong> property owners in NYC</span>
          </div>
        </div>
        
        
        <div className="HomeRightSection">
          <img src={billboardImage} alt="Billboard" className="Billboard1" />
          <div className="Card">
            <div className="CardInfo">
              <p className="CardTitle">SoHo Wall Space</p>
              <p className="CardSubtext">30 × 40 ft • High Traffic • $5,000/week</p>
            </div>
            <button className="DetailsButton">View Details</button>
          </div>
        </div>
      </div>

      <div className="FeaturedSpaces">
        <h2 className="FeaturedSpacesTitle">Featured Spaces</h2>
        <p className="FeaturedSpacesSubtitle">
          Discover prime advertising locations across the US.
        </p>
        <div className="SpacesGrid">
          {spaces.map((space, idx) => (
            <SpaceCard key={idx} {...space} />
          ))}
        </div>
        <div className="CenterButton">
          <button className="ViewAllButton">View All Spaces</button>
        </div>
      </div>

      <div className="Container">
        <section className="HowItWorks">
          <h2>How Elaview Works</h2>
          <p className="Subtitle">
            A simple process to connect property owners with advertisers looking for prime NYC locations.
          </p>
          <div className="Steps">
            {[
              { icon: "🏢", title: "List Your Space", desc: "Property owners list their available walls, windows, or other spaces with details and pricing." },
              { icon: "🔍", title: "Discover Spaces", desc: "Advertisers browse and filter spaces by location, size, traffic, and availability." },
              { icon: "🔗", title: "Connect & Book", desc: "Direct communication between property owners and advertisers to finalize deals." },
              { icon: "📈", title: "Track Performance", desc: "Measure campaign effectiveness with our traffic and engagement analytics." }
            ].map((step, idx) => (
              <div className="Step" key={idx}>
                <div className="Icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="Testimonials">
          <h2>What Our Users Say</h2>
          <p className="Subtitle">
            Hear from property owners and advertisers who've transformed their businesses with Elaview.
          </p>
          <div className="Cards">
            {[
              {
                stars: 5,
                quote: "Elaview has transformed how we monetize our building's exterior. We've seen a 40% increase in revenue from previously unused wall space.",
                name: "Sarah Johnson",
                title: "Property Manager, SoHo Heights",
                avatar: profile5
              },
              {
                stars: 5,
                quote: "Finding the perfect advertising location used to take weeks. With Elaview, we secured prime SoHo wall space in just 2 days.",
                name: "Michael Chen",
                title: "Marketing Director, Urban Outfitters",
                avatar: profile6
              },
              {
                stars: 4,
                quote: "Our building facades were just sitting there. Now they're generating significant passive income through Elaview's platform.",
                name: "David Rodriguez",
                title: "Owner, Brooklyn Properties LLC",
                avatar: profile7
              }
            ].map((card, idx) => (
              <div className="TestimonialCard" key={idx}>
                <div className="Stars">{'⭐️'.repeat(card.stars)}{'☆'.repeat(5 - card.stars)}</div>
                <p className="Quote">“{card.quote}”</p>
                <div className="User">
                  <img src={card.avatar} alt={card.name} className="Avatar" />
                  <div>
                    <p className="UserName">{card.name}</p>
                    <p className="UserTitle">{card.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />

    </>
  )
}

export default App
