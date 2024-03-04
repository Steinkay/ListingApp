
import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';


function App() {
  const [authenticated, setAuthenticated] = useState();

  const userId = localStorage.getItem('userId');

  // Create the path using the userId
  const profilePath = `/Profile/${userId}`;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            authenticated ? (
              <>
                <HomePage setAuthenticated={setAuthenticated} />
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
          <Route path="/Profile/:profileId" element={
              <>
              <Menue setAuthenticated={setAuthenticated} />
              <ProfilePage />
              
              </>
          
             }  />

       


        <Route path="/buyers_sellers" element={
            <>
              <Menue setAuthenticated={setAuthenticated} />
              <Buyers_SellersPage />
            </>
          } />
          

        <Route path="/password-reset" element={<ResetPassword />} />

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



  const navigate = useNavigate();


  const handleLogout = () => {
    setAuthenticated(false);
  
    localStorage.removeItem('sessionToken');
  
    navigate('/login');
  };
    const userId = localStorage.getItem('userId');
    const profilePath = `/Profile/${userId}`;
  

  return (
    <div id='MenueContainer'>
       
      <div id='MenueSection'>
        <div id='CompanyLogo'>
        <a href='/listingfeed'><img src={process.env.PUBLIC_URL + '/Web Icons/Home.png'}
 alt='logo' /></a>
        </div>
        <ul id='MenueItemsSection'>
          <a href='/listingfeed'>
            <li>Listings</li>
          </a>
          <a href={`${profilePath}`}>
            <li id='Profile'>Profile</li>
          </a>
           <Link to='/buyers_sellers'>
            <div >Buyers&Sellers</div>
          </Link>
       
        </ul>
      
      <div id="MenuUserDiv" style={{display:'flex', columnGap:'5px'}}>
            <img src=''/>
            <div id='MenuUserName'>{localStorage.getItem('userFullName')}</div>
            <div id='MenueLogout'  onClick={handleLogout}>Logout</div>
 
      </div>
      </div>

     
    </div>
  );
}


function FeedContainer() {
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [listings, setListings] = useState([]);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('');
  const [propertyLocationFilter, setPropertyLocationFilter] = useState('');
  const [siteuser, setSiteuser] = useState([]);
  const loggedInUserId = localStorage.getItem('userId');
  const loggedInUser = siteuser.find((user) => user.Id === parseInt(loggedInUserId, 10));

  useEffect(() => {
    const fetchSiteuserData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/siteuser');
        setSiteuser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchSiteuserData();
  }, []);




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

  const handleFilterButtonClick = () => {
    const filteredListings = listings.filter((listing) => {
      const typeMatches = !propertyTypeFilter || listing.ListingType === propertyTypeFilter;
      const locationMatches = !propertyLocationFilter || listing.ListingLocation === propertyLocationFilter;

      return typeMatches && locationMatches;
    });


    setListings(filteredListings);
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
          <option>Mzuzu</option>
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
        <img className='ListingPoster_Picture' src={`${process.env.PUBLIC_URL}/ProfilePhotos/${loggedInUser.ProfilePicture}`} alt='ListingerPic' />
        </div>
        <div className='ListingPosterDiv'>
          <div className='ListingPosterName' style={{marginTop:'10%'}}>{loggedInUser.FirstName+' '+loggedInUser.LastName}</div>
          <div className='ListingPostDate'></div>
        </div>
       
       <div className='ListingType'>
             <img src={process.env.PUBLIC_URL + '/Web Icons/home_FILL0_wght200_GRAD200_opsz48.png'} style={{marginLeft:'1%'}} height={25} width={25} alt='location'/>
             <p className='type'>{listing.ListingType}</p>
       </div>
       <div className='ListingLocation'>
             <img src={process.env.PUBLIC_URL + '/Web Icons/LocationIcon.jpg'} height={20} width={20} alt='location'/>
             <p className='location'>{listing.ListingLocation}</p>
       </div>

      </div>
      <div className='ListingPicturesDiv' style={{ marginTop: '1%' }}>
        {listing.images.map((imageUrl, index) => (
       
        
              <img src={imageUrl} alt={`Listing Image ${index + 1}`} />
          
        
        ))}
      </div>
      <div className='ListingDescription' style={{ marginTop: '1%' }}>{listing.description}</div>
      <div className='ListingActionsDiv' style={{ marginTop: '1%' }}>
         <div>Contact</div>
      </div>
    </div>
  );
}


  return (
    <div id='FeedContainer'>
      <div id='Welcome'></div>
      <div id='Poster' onClick={handleCreateListingClick}>
        <div id='PosterButton'>
          <div id='UserImageDiv'>
            <img className='LoggedInUserPic' id='UserImage'src={loggedInUser && loggedInUser.ProfilePicture ? `${process.env.PUBLIC_URL}/ProfilePhotos/${loggedInUser.ProfilePicture}` : 'default-image-path.jpg'}
 alt='Photo'/>
          </div>
          <div id='Listing'>{localStorage.getItem('userFullName')}, click to create a Listing...</div>
        </div>
      </div>
      <div>
          <div id='FeedSearchDiv' style={{marginTop:'5%'}}>
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
                    <option>Mzuzu</option>
                    <option>Lilongwe</option>
                    <option>Salima</option>
                    <option>Mangochi</option>
                    <option>Blantyre</option>
                  </select>
                </label>
             </div>
            <button id='FeedSearchButton'  onClick={handleFilterButtonClick} type='submit'>Filter</button>
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



//This Component handles login and sign up process
function Login_SigUp({ setAuthenticated }) {
  const [showLoginForm, setShowLoginForm] = useState(true);
const [licenseVisible, setLicenseVisible] = useState(true); 


const handleUserSignupClick = (hideLicense) => {
  setShowLoginForm(false);
  if (hideLicense) {
    setLicenseVisible(false);
  }
};
  

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
        // Handle error
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
      {showLoginForm ? (
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
          <div className='signup-link' style={{ marginTop: '2%' }}>
            <span>Seller Signup</span> <a style={{ color: '#5c8bf1' }} className='SignUp_link' id='AgentSignUp_link' onClick={() => setShowLoginForm(false)}>Click Here</a>
          </div>
          <div className='signup-link' style={{ marginTop: '2%' }}>
            <span>Buyer Signup</span>{' '} <a style={{ color: '#5c8bf1' }} className='SignUp_link' id='UserSignUp_link' onClick={() => handleUserSignupClick(true)}>Click Here</a>
          </div>
          <div className='signup-link' style={{ marginTop: '2%' }}>
          <div>
             <Link to="/password-reset">Forgot Password?</Link>
          </div>           
          </div>
         </form>
      ) : (
        <SignUpForm />
      )}
    </div>
  );




  function SignUpForm() {

    const handleFileUpload = (files) => {
      // Check if the selected file is an image
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  
      if (files.length > 0 && allowedTypes.includes(files[0].type)) {
        // Handle image upload logic here
        console.log('Selected image:', files[0]);
  
        // You can also set the selected image to be displayed or processed further
        const uploadedImage = URL.createObjectURL(files[0]);
        document.getElementById('UploadedProfilePic').src = uploadedImage;
      } else {
        console.error('Invalid file type. Please select an image.');
      }
    };
    const [license, setLicense] = useState('');


    const handleSignupSubmit = async (event) => {
      event.preventDefault();
    
      const firstName = document.getElementById('SellerSignUpFirstName').value;
      const lastName = document.getElementById('SellerSignUpLastName').value;
      const email = document.getElementById('SellerSignUpEmail').value;
      const password = document.getElementById('SellerSignUpPassword').value;

      const ProfileType = license ? 'Seller' : 'Buyer';


      const form= new FormData();
      form.append('profilePic', document.getElementById('SignUpProfilePicUploader').files[0]);
  
      // Add other form data (firstName, lastName, email, password, etc.) to the formData object if needed
  
      fetch('http://localhost:8080/uploadprofilepic', {
          method: 'POST',
          body: form,
      })
      .then(response => response.json())
      .then(data => {
          console.log(data);
          // Handle the response from the server (success or error)
      })
      .catch(error => {
          console.error('Error uploading profile pic:', error);
          // Handle the error
      });
    
      // Always append the license field, whether it's empty or not
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('license', license);  // Assuming 'license' is defined somewhere in your code
      formData.append('ProfileType', ProfileType);
      formData.append('profilePic', document.getElementById('SignUpProfilePicUploader').files[0]);
    
      try {
        const usersResponse = await fetch('http://localhost:8080/siteuser');
        const users = await usersResponse.json();
    
        // Check if the user with the provided email already exists
        const userExists = users.some((user) => user.Email.toLowerCase() === email.toLowerCase());
    
        if (userExists) {
          // Display error message
          document.getElementById('ErrorOnSignUp').innerText = 'Email already exists';
          return; // Stop further execution
        }
    
        const signupResponse = await fetch('http://localhost:8080/SignUpUser', {
          method: 'POST',
          body: formData,
        });
    
        if (signupResponse.ok) {
          // Successful signup, handle accordingly
          console.log('Signup successful');
        } else {
          console.error('Signup failed');
        }
      } catch (error) {
        console.error('Error during signup:', error);
      }
    };
    const handleProfilePicClick = () => {
      // Trigger the hidden file input
      document.getElementById('SignUpProfilePicUploader').click();
    };


    return (
      <div className='form-container' style={{ backgroundColor: '#e1e4eb', width: '50%' }} encType="multipart/form-data">
        <h2 id='SignUpTitle'>Sign Up</h2>
        <div id='ErrorOnSignUp' ></div>
        <form className='signup-form'>
          <div>
            <label>First Name:</label>
            <input id='SellerSignUpFirstName' type='text'style={{marginLeft:'1%' }}  placeholder='First name' />
          </div>
          <div>
            <label>Last Name:</label>
            <input id='SellerSignUpLastName' type='text'style={{marginLeft:'2%' }}  placeholder='Last name' />
          </div>
          <div>
            <label>Email:</label>
            <input id='SellerSignUpEmail' type='email'style={{marginLeft:'15.5%' }}  placeholder='Enter your email' />
          </div>
          <div>
            <label>Password: </label>
            <input id='SellerSignUpPassword' type='password'  placeholder='Enter your password' style={{marginLeft:'3.5%' }} />
          </div>
          {licenseVisible && (
              <div>
               <label>License: </label>
               <input id='Licence' placeholder='Enter your license' style={{ marginLeft: '9%' }}  value={license}
              onChange={(e) => setLicense(e.target.value)} />
              </div>
          )}
          <div>
            <label>Profile Photo: </label>
            <input id='SignUpProfilePicUploader' type='file' accept='image' placeholder='Profile' style={{display:'none'}} onChange={(e) => handleFileUpload(e.target.files)}/>
            <img onClick={handleProfilePicClick} id='UploadedProfilePic'  src={process.env.PUBLIC_URL + '/Web Icons/Profile Icon.png'}  height={40} width={40} style={{marginLeft:'6%',marginTop:'5%',marginBottom:'2%',cursor:'pointer',borderRadius:'40px 40x 40px 40px' }}/>
          </div>
          <button type='submit' style={{ marginTop:'3%' }} onClick={handleSignupSubmit}>Sign Up</button>
          <a style={{ color: '#5c8bf1', marginLeft:'3%' }} id='SignUp_link'onClick={() => window.location.reload()} >Back to Login</a>
        </form>
      </div>

    );
  }
}



function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async () => {
    try {
      setLoading(true);

      const response = await fetch('http://localhost:8080/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Password reset successful');
      } else {
        setMessage(data.error || 'Password reset failed');
      }
    } catch (error) {
      console.error('Error during password reset request:', error);
      setMessage('An error occurred during the password reset request');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div id='ResetPasswordDiv'>
      <h3>Reset Password</h3>
      <div>
        <label>Email: <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Enter your email' style={{width:'60%'}} /></label>
      </div>
      <button id='PasswordRestButton' onClick={handleResetRequest} disabled={loading}>
        {loading ? 'Resetting...' : 'Reset'}
      </button>
      <p>{message && typeof message === 'string' ? message : ' '}</p>
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

function Buyers_SellersPage() {
  const [siteusers, setSiteusers] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState('');
  const [searchInput, setSearchInput] = useState('');


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/siteuser');
        setSiteusers(response.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
  
    fetchUserData();
  }, []);

  function CreateBuyerSellerDiv() {
 // Filter users based on selected user type
 const filteredUsers = siteusers.filter((user) => {
  const userTypeMatches = selectedUserType === '' || user.ProfileType === selectedUserType;
  const nameMatches =
    user.FirstName.toLowerCase().includes(searchInput.toLowerCase()) ||
    user.LastName.toLowerCase().includes(searchInput.toLowerCase());

  return userTypeMatches && nameMatches;
});


    return (
      <>
        {filteredUsers.map((user) => (
          <div key={user.Id}  className='Buyers_Seller'>
            <div className='Buyers_SellerContents'>
              <div className='Buyers_SellerPhotoDiv'>
                <img
                  className='Buyers_SellerPhoto'
                  src={user.ProfilePicture ? `${process.env.PUBLIC_URL}/ProfilePhotos/${user.ProfilePicture}` : `${process.env.PUBLIC_URL}/ProfilePhotos/Profile Icon.png`}
            
                  alt='Profile'
                />
              </div>
              <div className='Buyers_SellerNameDiv'>
                <h4 className='Buyers_SellerName'>{`${user.FirstName} ${user.LastName}`}</h4>
              </div>
              <div className='Buyers_SellerProfileTypeDiv'>
                <p  className='Buyers_SellerProfileType'>Profile: {user.ProfileType}</p>
              </div>
              <div className='Buyers_SellerLocationDiv'>
                <p className='Buyers_SellerLocation'>Location: {user.Location}</p>
              </div>
              <div><Link to={`/Profile/${user.Id}`}>
  <button className='ViewProfile' id={user.Id}>View Profile</button>
</Link></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };


  return (
    <>
      <div id='Buyers_SellersContainer'>
        <h2>Buyers & Sellers</h2>
        <div id='Buyers_SellersFilter' style={{display:'flex', columnGap:'2%', width:'100%'}}>
            <label>User Type:
              <select id='ViewBuyersorSellers' onChange={(e) => setSelectedUserType(e.target.value)} >
                 <option value=''>All</option>
                 <option value='Buyer'>Buyer</option>
                 <option value='Seller'>Seller</option>
              </select>
            </label>
            <label>District:
              <select id='BuyersorSellersLocation'>
                 <option></option>
                 <option value='Blantyre'>Blantyre</option>
                 <option value='Mangochi'>Mangochi</option>
                 <option value='Salima'>Salima</option>
                 <option value='Lilongwe'>Lilongwe</option>
                 <option value='Mzuzu'>Mzuzu</option>
              </select>
            </label>
            <label  style={{width:'60%'}}>Search by Name:
                <input id='SearchUsers' type='search'value={searchInput} onChange={handleSearchChange} placeholder='Search by name' style={{width:'50%'}}/>
            </label>
               
        </div>
        <div id='Buyers_SellersDiv'>{CreateBuyerSellerDiv()}</div>
      </div>
    </>
  );
}

function ProfilePage({ setAuthenticated }) {
  const [userData, setUserData] = useState(null);
  const loggedInUserId = localStorage.getItem('userId');
  const userIdFromUrl = window.location.href.split('/').pop();
  const [isEditClicked, setIsEditClicked] = useState(false);


  useEffect(() => {
    // Fetch user data from the endpoint using the userId from the URL
    fetch(`http://localhost:8080/siteuser/${userIdFromUrl}`)
      .then(response => response.json())
      .then(data => {
        setUserData(data);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        // Handle error or redirect to an error page if needed
      });
  }, [userIdFromUrl]);

  const handleEditClick = () => {
    setIsEditClicked(true);
  };

  const handleCancelEdit = () => {
    setIsEditClicked(false);
  };

  return (
    <>
      <div className='ProfileContainer' id='SellerProfileContainer'>
        {userData ? (
          <div id='SellerProfileDiv'>
            <div id='SellersInfoDiv'>
              <div id='SellersProfilePictureDiv'>
                <img
                  id='SellersProfilePicture'
                  src={userData.ProfilePicture ? `${process.env.PUBLIC_URL}/ProfilePhotos/${userData.ProfilePicture}` : 'default-image-path.jpg'}
                  alt='Photo'
                />
              </div>
              {isEditClicked ? (
                <EditProfileForm userData={userData} onCancelEdit={handleCancelEdit} />
              ) : (
                <>
                  <button id='EditProfileButton' style={{ marginLeft: '25%' }} onClick={handleEditClick}>
                    Edit
                  </button>
                  <table>
                    <tbody>
                      <tr>
                        <td>Name:</td>
                        <td>{userData.FirstName + ' ' + userData.LastName}</td>
                      </tr>
                      <tr>
                        <td>Profile Type:</td>
                        <td>{userData.ProfileType}</td>
                      </tr>
                      <tr>
                        <td>Phone:</td>
                        <td>{userData.Phone}</td>
                      </tr>
                      <tr>
                        <td>Email:</td>
                        <td>{userData.Email}</td>
                      </tr>
                      <tr>
                        <td>Location:</td>
                        <td>{userData.Location}</td>
                      </tr>
                      <tr>
                        <td>Number of Listings Posted:</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Listings Available:</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
}

function EditProfileForm({ userData }) {
  const [editedData, setEditedData] = useState({
    FirstName: userData.FirstName,
    LastName: userData.LastName,
    ProfileType: userData.ProfileType,
    // Add other fields as needed
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    

  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        First Name*:
        <input
          type="text"
          name="FirstName"
          value={editedData.FirstName}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Last Name*:
        <input
          type="text"
          name="LastName"
          value={editedData.LastName}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label>
        Profile Type:
        <input
          type="text"
          name="ProfileType"
          value={editedData.ProfileType}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
         Phone:
        <input
          type="number"
          name="Phone"
          value={editedData.Phone}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
         Location:
        <input
          type="text"
          name="Location"
          value={editedData.Phone}
          onChange={handleChange}
        />
      </label>
      <br />
      <label>
         About Me:
        <input
          type="text"
          name="About"
          value={editedData.Phone}
          onChange={handleChange}
        />
      </label>
      <br />
      <button id='ProfileSaveChanges' type="submit">Save Changes</button>
    </form>
  );
}


export default App;