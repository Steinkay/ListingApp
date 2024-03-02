
import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';


function App() {
  const [authenticated, setAuthenticated] = useState();

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            authenticated ? (
              <>
                <HomePage setAuthenticated={setAuthenticated} />
                <Menue setAuthenticated={setAuthenticated} />
              </>
            ) : (
              <Login_SigUp setAuthenticated={setAuthenticated} />
            )
          }
        />
        <Route path="/listingfeed" element={<HomePage setAuthenticated={setAuthenticated} />} />
        <Route path="/login" element={<Login_SigUp setAuthenticated={setAuthenticated} />} />
        <Route path="/listing/:listingId" element={
            <>
              <Menue setAuthenticated={setAuthenticated} />
              <ViewListing />
            </>
          } />
      </Routes>
    </Router>
  );
};

function HomePage({ listings, setAuthenticated }) {
  return (
    <>
      <Menue setAuthenticated={setAuthenticated} />
      <FeedContainer listings={listings} />
    </>
  );
}




function Menue({setAuthenticated }) {
  const [showMenu, setShowMenu] = useState(true);
  const [showSearchInput, setShowSearchInput] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/siteuser');
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
  
    fetchUserData();
  }, []);

  const SearchIconClick = () => {
    setShowMenu(false);
    setShowSearchInput(true);
  };

  const CloseIconClick = () => {
    setShowMenu(true);
    setShowSearchInput(false);
  };
  const navigate = useNavigate();


  const handleLogout = () => {
    setAuthenticated(false);
  
    localStorage.removeItem('sessionToken');
    console.log('Session token removed from localStorage');
  
    navigate('/login');
  };

  return (
    <div id='MenueContainer'>
           {showMenu && (
      <div id='MenueSection'>
        <div id='CompanyLogo'>
          <img src='' alt='logo' />
        </div>
        <ul id='MenueItemsSection'>
          <a href='#'>
            <li>Listings</li>
          </a>
          <a href='#'>
            <li>Profile</li>
          </a>
       
        </ul>
        <div id='SearchIconDiv'>
          <img
            onClick={SearchIconClick}
            id='SearchIcon'
            src={process.env.PUBLIC_URL + '/Web Icons/Search Icon.png'}
            height={20}
            width={20}
            alt='Icon'
          />
        </div>
      <div id="MenuUserDiv" style={{display:'flex', columnGap:'5px'}}>
            <img src=''/>
            <div id='MenuUserName'>{localStorage.getItem('userFullName')}</div>
            <div id='MenueLogout'  onClick={handleLogout}>Logout</div>
 
      </div>
      </div>)}

      {showSearchInput && (
        <div id='SearchInputDiv'>
          <input id='SearchInput' placeholder='Search...' type='text' />
          <img
            src={process.env.PUBLIC_URL + '/Web Icons/Search Icon.png'}
            id='InputSearchIcon'
            height='18px'
            width='18px'
            alt='Search Icon'
          />
          <div>
            <img
              src={
                process.env.PUBLIC_URL +
                '/Web Icons/close_FILL1_wght100_GRAD0_opsz48.png'
              }
              id='SearchInputCloseIcon'
              height='25px'
              width='25px'
              alt='Close'
              onClick={CloseIconClick}
            />
          </div>
        </div>
      )}
    </div>
  );
}


function FeedContainer() {
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [listings, setListings] = useState([]);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [propertyLocationFilter, setPropertyLocationFilter] = useState('');


  const handleCreateListingClick = () => {
    setShowCreateListing(true);
  };

  const handlePostListing = (newListing) => {
    setListings([...listings, newListing]);
  };

  const handlePropertyTypeChange = (event) => {
    setPropertyTypeFilter(event.currentTarget.value);
  };

  const handlePropertyLocationChange = (event) => {
    setPropertyLocationFilter(event.currentTarget.value);
  };

  // Apply filtering based on propertyTypeFilter and propertyLocationFilter
  const handleFilterButtonClick = () => {
    const filteredListings = listings.filter((listing) => {
      const typeMatches = !propertyTypeFilter || listing.ListingType === propertyTypeFilter;
      const locationMatches = !propertyLocationFilter || listing.ListingLocation === propertyLocationFilter;

      return typeMatches && locationMatches;
    });


    // Update the displayed listings
    setListings(filteredListings);
  };

   // Clear filters and display all listings
     const handleClearFilterButtonClick = () => {
      setPropertyTypeFilter('');
      setPropertyLocationFilter('');
      setListings(listings);
    };
  

  function CreateListingContainer() {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [listingDescription, setListingDescription] = useState('');
  const [listingLocation, setlistingLocation] = useState('');
  const [listingType, setlistingType] = useState('');


  const handleCreateListingClose = () => {
    setShowCreateListing(false);
  };

  const handleImageUpload = (event) => {
    const files = event.target.files;
    const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const handleImageRemove = (index) => {
    const updatedImages = [...uploadedImages];
    updatedImages.splice(index, 1);
    setUploadedImages(updatedImages);
  };

  const handlePostListingLocal = () => {
    const newListing = {
      Lister: localStorage.getItem('userId'),
      ListingId: 'Listing'+new Date()/1000,
      description: listingDescription,
      images: uploadedImages,
      ListingType: listingType,
      ListingLocation: listingLocation,
      ListingDate: new Date()/1000,
      
    };

  handlePostListing(newListing);

  fetch('http://localhost:8080/PostListing', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(newListing),
    credentials: 'include',
})
    .then((response) => response.json())
    .then((data) => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });


  setUploadedImages([]);
  setListingDescription('');
  setlistingLocation('');
  setlistingType('');
  setShowCreateListing(false);
  };

  return (
    <div id='CreateListingContainer' className={showCreateListing ? 'show' : 'hide'}>
      <div id='CreateListingTitleAndCloseIconSection'>
        <h3 id='CreateListingTitleDiv'>Create a Listing</h3>
     
        <div id='CloseIconDiv'>
          <img
            src={process.env.PUBLIC_URL + '/Web Icons/close_FILL1_wght100_GRAD0_opsz48.png'}
            id='CreateListingContainer_CloseIcon'
            height='25px'
            width='25px'
            alt='Close'
            onClick={handleCreateListingClose}
          />
        </div>
      </div>
      <div id='PropertyTypeDiv'>
        <select id='PropertyType' style={{marginLeft:'2%'}} onBlur={(e) => setlistingType(e.currentTarget.value)}
>
          <option>Residential</option>
          <option>Commercial</option>
        </select>
        <select id='PropertyLocation' style={{ marginLeft: '2%'}} onBlur={(e) => setlistingLocation(e.currentTarget.value)}>
          <option>Mzuze</option>
          <option>Lilongwe</option>
          <option>Salima</option>
          <option>Mangochi</option>
          <option>Blantyre</option>
        </select>
      </div>
      <div id='ListingDescriptionAndImagesDiv'>
        <div
          id='ListingDescription'
          contentEditable='true'
          onBlur={(e) => setListingDescription(e.currentTarget.innerHTML)}
          placeholder='Enter your listing description...'
        ></div>
      </div>
      <div id='UploadPicsDiv'>
        <div id='UploadIconDiv'>
          <label htmlFor='imageInput'>
            <img
              id='UploadIcon'
              src={process.env.PUBLIC_URL + '/Web Icons/photo.png'}
              alt='Upload Icon'
              height='25px'
              width='25px'
            />
          </label>
          <input
            type='file'
            id='imageInput'
            accept='image/*'
            multiple
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>
        <div id='UploadedPicsDiv'>
          {uploadedImages.map((imageUrl, index) => (
            <div key={imageUrl} className='uploaded-image-container'>
              <img
                src={process.env.PUBLIC_URL + '/Web Icons/close_FILL1_wght100_GRAD0_opsz48.png'}
                alt='Remove Image'
                className='remove-image-icon'
                style={{ height: '20px', width: '20px' }}
                onClick={() => handleImageRemove(index)}
              />
              <img
                src={imageUrl}
                alt={`Uploaded Image ${index + 1}`}
                style={{ maxWidth: '60px', maxHeight: '60px' }}
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <button id='PostListingButton' onClick={handlePostListingLocal}>
          Post
        </button>
      </div>
    </div>
  );
}

function ListingContainer({ listing }) {
  
  return (
    <div className='Listing' id={('Listing'+new Date().getTime() / 1000).toString()}>
      <div className='ListingHeader'>
        <div className='ListingPosterLogo_PictureDiv'>
          <img className='ListingPosterLogo_Picture' src='' alt='Listing Logo' />
        </div>
        <div className='ListingPosterDiv'>
          <div className='ListingPosterName'></div>
          <div className='ListingPostDate'></div>
        </div>
       
       <div className='ListingType'>
             <img src={process.env.PUBLIC_URL + '/Web Icons/LocationIcon.jpg'} height={20} width={20} alt='location'/>
             <p className='type'>{listing.ListingType}</p>
       </div>
       <div className='ListingLocation'>
             <img src={process.env.PUBLIC_URL + '/Web Icons/LocationIcon.jpg'} height={20} width={20} alt='location'/>
             <p className='location'>{listing.ListingLocation}</p>
       </div>

      </div>
      <div className='ListingPicturesDiv' style={{ marginTop: '1%' }}>
        {listing.images.map((imageUrl, index) => (
          index < 2 && (
            <div key={index} className='uploaded-image-container' style={{ position: 'relative' }}>
              {index === 1 && listing.images.length > 2 && (
                <div
                  className="overlay-div"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    top: 0,
                    width: '25%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    cursor:'pointer'
                  }}
                >
                  +{listing.images.length - 2}
                </div>
              )}
              <img src={imageUrl} alt={`Listing Image ${index + 1}`} />
            </div>
          )
        ))}
      </div>
      <div className='ListingDescription' style={{ marginTop: '1%' }}>{listing.description}</div>
      <div className='ListingActionsDiv' style={{ marginTop: '1%' }}>
        <Link to={`/listing/${listing.ListingId}`} className='ViewListing'>
          View Listing
        </Link>
      </div>
    </div>
  );
}

  return (
    <div id='FeedContainer'>
      <div id='Welcome'></div>
      <div id='Poster' onClick={handleCreateListingClick}>
        <div id='PosterButton'>
          <div>
            <img className='LoggedInUserPic' id='UserImage' src='' alt='User' />
          </div>
          <div id='Listing'>Click to create a Listing...</div>
        </div>
      </div>
      <div id='FilteringDiv'>
        <div className='AllistingsDiv'>
          <div style={{backgroundColor:'#e6e4e4',cursor:'pointer'}}>All listings</div>
          <div></div>
        </div>
        <div>
          <div style={{backgroundColor:'#e6e4e4', cursor:'pointer'}}>My listings</div>
        </div>
      </div>
      <div>
          <div id='FeedSearchDiv'>
              <div>
                 <label>Propert Type:   
                    <select onChange={handlePropertyTypeChange}>
                       <option>---</option>
                       <option>Residential</option>
                       <option>Commercial</option>
                    </select>
                 </label> 
              </div>
              <div>
               <label>District:
                  <select onChange={handlePropertyLocationChange}>
                    <option>---</option>
                    <option>Mzuze</option>
                    <option>Lilongwe</option>
                    <option>Salima</option>
                    <option>Mangochi</option>
                    <option>Blantyre</option>
                  </select>
                </label>
             </div>
            <button id='FeedSearchButton'  onClick={handleFilterButtonClick} type='submit'>Filter</button>
            <button id='ClearFilterButton' onClick={handleClearFilterButtonClick} type='button'>Clear Filter</button>
          </div>
      </div>
      <div id='SearchResults'></div>
      {showCreateListing && <CreateListingContainer />}
      <div id='ListingsMade'>
        {listings.map((listing, index) => (
          <ListingContainer key={index} listing={listing} />
        ))}
      </div>
    </div>
  );
}

function Login_SigUp({ setAuthenticated }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [Users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/siteuser');
        setUsers(response.data);
        console.log('siteuser:', response.data);
      } catch (error) {
     
      }
    };
  
    fetchUsers();
  }, []); 


  const handleLoginSubmit = async (event) => {
    event.preventDefault();
  
    try {
      if (loading) {
        setError('Fetching Users data. Please wait.');
        return;
      }
  
      const matchingAgent = Users.find(
        (agent) =>
          agent.Email.trim().toLowerCase() === credentials.email.trim().toLowerCase() &&
          agent.Password === credentials.password
          
      );
  
      if (matchingAgent) {
       
        const userId = matchingAgent.Id;
        const fullName = `${matchingAgent.FirstName} ${matchingAgent.LastName}`;

        localStorage.setItem('userId', userId);
        localStorage.setItem('userFullName', fullName);

        setAuthenticated(true);
  
        localStorage.setItem('sessionToken', matchingAgent.sessionToken);
        setError(null);
  
        window.location.href = 'http://localhost:3000/listingfeed';
      } else {
        setError('Please review your login credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('An error occurred during login');
    }
  };
  

  return (
    <div className='form-container' style={{ backgroundColor: '#e1e4eb', width: '30%', marginLeft: '35%', marginTop: '10%' }}>
      <form className='login-form' style={{ marginLeft: '2%' }} onSubmit={handleLoginSubmit}>
        <h2>Login</h2>
        {error && (
          <div id='ValidationErrorText' style={{ color: 'red', marginBottom: '10px' }}>
            {error}
          </div>
        )}
        <div style={{ marginTop: '2%' }}>
          <label>Email:</label>
          <input
            style={{ marginLeft: '6%', width: '60%' }}
            type='email'
            placeholder='Enter your email'
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          />
        </div>
        <div style={{ marginTop: '2%' }}>
          <label>Password: </label>
          <input
            type='password'
            placeholder='Enter your password'
            style={{ width: '60%' }}
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />
        </div>
        <button style={{ marginTop: '2%' }} type='submit' disabled={loading}>
          {loading ? 'Please wait...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
function ViewListingPage({ setAuthenticated }) {
  return (
    <>
      <Menue setAuthenticated={setAuthenticated} />
      <ViewListing />
    </>
  );
}

function ViewListing() {
  
  return (
    <>
      <div id='ListingDetialsContactContainer'>
        <div id='ListingDetailsContainer'>
          <div className='Arrows' id='LeftArrowDiv'><img id='LeftArrow' src={process.env.PUBLIC_URL + '/Web Icons/left-arrow.png'} height={20}width={20} alt='Arrow' />
          </div>
          <div id='ListImagesDiv'></div>
          <div className='Arrows' id='RightArrowDiv'><img id='RightArrow' src={process.env.PUBLIC_URL + '/Web Icons/right-arrow.png'} height={20}width={20} alt='Arrow' />
          </div>
          <div id='OnViewListingDescription'></div>
        </div>
        <div id='ListingDetailsContactAgentForm'>
          <div id='ListingDateTypeLocation'>
              <h3>Listing Details</h3>
              <label>ListingType:</label>
              <div id="OnViewListingType"></div>
              <label>Location:</label>
              <div id="OnViewListingLocation"></div>
              <label>Date:</label>
              <div id="OnViewListingDate" ></div>
          </div>
          <h3>Contact Seller</h3>
          <form>
            <label>Email:</label><input type="email" placeholder=''/>
            <label>Message:</label><input type="text" placeholder=''/>
          </form>
          <button>Send</button>
        </div>
      </div>
    </>
  );
}


export default App;