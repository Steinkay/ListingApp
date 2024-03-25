
import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';


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
        <Route path="/listings/:listingId" element={
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
          
             }  
          />
          <Route path="/messages/:userId" element={
               <>
                  <Menue setAuthenticated={setAuthenticated} />
                  <MessagePage />
               </>
           }
          />
   
         <Route path="/messages/:userId/:messageRoom" element={
             <>
                <Menue setAuthenticated={setAuthenticated} />
                <ChatRoom userId={localStorage.getItem('userId')} messageRoom='1and22'/>

             </>

         } />


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




function Menue({ setAuthenticated }) {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState([]);
  const userId = localStorage.getItem('userId');
  const profilePath = `/Profile/${userId}`;

  useEffect(() => {
    const fetchUserMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/Messages?userId=${userId}`);
        const unreadMessages = response.data.filter(message => parseInt(message.ReceiverId) === parseInt(userId )&& message.ReadStatus === 'Unread'); 
        setUnreadMessagesCount(unreadMessages.length);
      } catch (error) {
        console.error('Error fetching user messages:', error);
      }
    };

    fetchUserMessages();
  }, [userId]);


  const navigate = useNavigate();

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem('sessionToken');
    navigate('/login');
  };

  return (
    <div id='MenueContainer'>
      <div id='MenueSection'>
        <div id='CompanyLogo'>
          <a href='/listingfeed'><img src={process.env.PUBLIC_URL + '/Web Icons/Home.png'} alt='logo' /></a>
        </div>
        <ul id='MenueItemsSection'>
          <a href='/listingfeed'>
            <li>Listings</li>
          </a>
          <a href={`${profilePath}`}>
            <li id='Profile'>Profile</li>
          </a>
          <Link to='/buyers_sellers'>
            <li >Buyers&Sellers</li>
          </Link>
          <Link to={`/messages/${userId}`}>
            <li >Messages{unreadMessagesCount > 0 && `(${unreadMessagesCount})`}</li>
          </Link>
        </ul>

        <div id="MenuUserDiv" style={{ display: 'flex', columnGap: '5px' }}>
          <img src='' />
          <div id='MenuUserName'>{localStorage.getItem('userFullName')}</div>
          <div id='MenueLogout' onClick={handleLogout}>Logout</div>
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
  
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get('http://localhost:8080/siteuser');
        setSiteuser(userResponse.data);
  
        const listingResponse = await axios.get('http://localhost:8080/listingsmade');
        setListings(listingResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);

  const handleCreateListingClick = () => {
    setShowCreateListing(true);
  };

  const handlePostListing = (newListing) => {
    setListings([...listings, newListing]);
  };


  const handleViewListingClick = (listingId) => {
    navigate(`/listings/${listingId}`);
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
    const [uploadedImagesfiles, setUploadedImagesfiles] = useState([]);
    const [listingDescription, setListingDescription] = useState('');
    const [listingLocation, setlistingLocation] = useState('');
    const [listingType, setlistingType] = useState('');
    const [loading, setLoading] = useState(false);


    const handleCreateListingClose = () => {
      setShowCreateListing(false);
    };

    let ImagesName = [];
    
    const handleImageUpload = (event) => {
      const files = event.target.files;
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setUploadedImagesfiles([...uploadedImagesfiles, ...files]);
      setUploadedImages([...uploadedImages, ...newImages]);
    };

    const handleImageRemove = (index) => {
      const updatedImages = [...uploadedImages];
      updatedImages.splice(index, 1);
      setUploadedImages(updatedImages);

      const updatedFiles = [...uploadedImagesfiles];
      updatedFiles.splice(index, 1);
      setUploadedImagesfiles(updatedFiles);
    };

    const handlePostListingLocal = async (e) => {
      e.preventDefault();

      try {
        const formDataImages = new FormData();
        uploadedImagesfiles.forEach((file, index) => {
          formDataImages.append(`images[${index}]`, file);
        });

        const imagesResponse = await fetch('http://localhost:8080/listingimages', {
          method: 'POST',
          body: formDataImages,
          credentials: 'include',
        });

        const imagesData = await imagesResponse.json();
        console.log('Success uploading images:', imagesData);
        setLoading(false);

        for (let i = 0; i < uploadedImagesfiles.length; i++) {
          ImagesName.push(uploadedImagesfiles[i].name);
        }

        const listingPayload = {
          Lister: localStorage.getItem('userId'),
          ListingId: 'listing' + new Date().getTime() / 1000,
          description: listingDescription,
          images: ImagesName,
          ListingType: listingType,
          ListingLocation: listingLocation,
          ListingDate: new Date().getTime() / 1000,
        };

        const listingResponse = await fetch('http://localhost:8080/PostListing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(listingPayload),
          credentials: 'include',
        });

        const listingData = await listingResponse.json();
        console.log('Success creating listing:', listingData);

        const newListing = {
          ListingType: listingType,
          ListingLocation: listingLocation,
          description: listingDescription,
          Images: ImagesName.map(image => `${process.env.PUBLIC_URL}/ListingPhotos/${image}`),
        };
        
        setListings([...listings, newListing]);

        // Clear state
        setUploadedImages([]);
        setLoading(false);

      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
        // Handle errors if needed
      }
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
        {loading ? 'Posting...' : 'Post'}

        </button>
        
      </div>
     
    </div>
  );
}

function ListingContainer({ listing }) {
    const Lister = siteuser.find((user) => user.Id === parseInt(listing.Lister, 10));

  return (
    <div className='Listing' id={listing.ListingId}>
      <div className='ListingHeader'>
        <div className='ListingPosterLogo_PictureDiv'>
        <img className='ListingPoster_Picture' src={`${process.env.PUBLIC_URL}/ProfilePhotos/${Lister.ProfilePicture}`} alt='ListingerPic' />
        </div>
        <div className='ListingPosterDiv'>
          <div className='ListingPosterName' style={{marginTop:'10%'}}>{Lister.FirstName+' '+Lister.LastName}</div>
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
      {JSON.parse(listing.Images).map((Image, index) => (
  index === 0 && (
    <img
      key={index}
      src={`${process.env.PUBLIC_URL}/ListingPhotos/${Image}`}
      alt={`Listing Image ${index + 1}`}
    />
  )
))}
      </div>
      <div className='ListingDescription' style={{ marginTop: '1%' }}>{listing.ListingDescription}</div>
      <div className='ListingActionsDiv' style={{ marginTop: '1%' }}>
         <div className='ViewListing'  onClick={() => handleViewListingClick(listing.ListingId)}>
          View Listing
        </div>

      </div>
    </div>
  );
}


  return (
    <div id='FeedContainer'>
      {loggedInUser && loggedInUser.ProfileType !== 'Buyer' && (

      <div id='Poster' onClick={handleCreateListingClick}>
        <div id='PosterButton'>
          <div id='UserImageDiv'>
            <img className='LoggedInUserPic' id='UserImage'src={loggedInUser && loggedInUser.ProfilePicture ? `${process.env.PUBLIC_URL}/ProfilePhotos/${loggedInUser.ProfilePicture}` : 'default-image-path.jpg'}
 alt='Photo'/>
          </div>
          <div id='Listing'>{localStorage.getItem('userFullName')}, click to create a Listing...</div>
        </div>
      </div>
          )}
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
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  
      if (files.length > 0 && allowedTypes.includes(files[0].type)) {
        console.log('Selected image:', files[0]);
  
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
      })
      .catch(error => {
          console.error('Error uploading profile pic:', error);
      });
    
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('license', license);  
      formData.append('ProfileType', ProfileType);
      formData.append('profilePic', document.getElementById('SignUpProfilePicUploader').files[0]);
    
      try {
        const usersResponse = await fetch('http://localhost:8080/siteuser');
        const users = await usersResponse.json();
    
    
        const userExists = users.some((user) => user.Email.toLowerCase() === email.toLowerCase());
    
        if (userExists) {
        
          document.getElementById('ErrorOnSignUp').innerText = 'Email already exists';
          return; 
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
  const [message, SetMessageText] = useState('');
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
        SetMessageText(data.message || 'Password reset successful');
      } else {
        SetMessageText(data.error || 'Password reset failed');
      }
    } catch (error) {
      console.error('Error during password reset request:', error);
      SetMessageText('An error occurred during the password reset request');
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



function ViewListing() {
  const listingId = window.location.href.split('/').pop();
  const [listingDetails, setListingDetails] = useState({});
  const [listerDetails, setListerDetails] = useState({});
  const [listingImages, setListingImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Fetch listing data from the endpoint using the listingId from the URL
    fetch(`http://localhost:8080/listingsmade`)
      .then(response => response.json())
      .then(data => {
        const listing = data.find(item => item.ListingId === listingId);
        if (listing) {
          setListingDetails(listing);
          setListingImages(JSON.parse(listing.Images));
        }
      })
      .catch(error => {
        console.error('Error fetching listing data:', error);
        // Handle error or redirect to an error page if needed
      });
  }, [listingId]);

  useEffect(() => {
    // Fetch lister data using the listerId from listingDetails
    fetch(`http://localhost:8080/siteuser`)
      .then(response => response.json())
      .then(data => {
        const lister = data.find(item => item.Id === listingDetails.Lister);
        if (lister) {
          setListerDetails(lister);
        }
      })
      .catch(error => {
        console.error('Error fetching lister data:', error);
        // Handle error or redirect to an error page if needed
      });
  }, [listingDetails]);

  const NextImageFunction = () => {
    setCurrentImageIndex(prevIndex =>
      prevIndex === listingImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const PreviousImageFunction = () => {
    setCurrentImageIndex(prevIndex =>
      prevIndex === 0 ? listingImages.length - 1 : prevIndex - 1
    );
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ];
  
  const listingDate = new Date(listingDetails.ListingDate * 1000);
  const formattedDate = `${months[listingDate.getMonth()]} ${listingDate.getDate()}, ${listingDate.getFullYear()}`;

  return (
    <>
      
      <div id="ListingDetialsContactContainer" style={{marginTop:'6%'}}>
        <div id="ListingDetailsContainerDiv">
          <div id="ListingDetailsContainer">
            <div className="Arrows" id="LeftArrowDiv" onClick={PreviousImageFunction}>
              <img
                id="LeftArrow"
                src={process.env.PUBLIC_URL + '/Web Icons/left-arrow.png'}
                height={20}
                width={20}
                alt="Arrow"
              />
            </div>
            <div id="ListImagesDiv">
              <img
                className="ListingImage"
                src={`${process.env.PUBLIC_URL}/ListingPhotos/${listingImages[currentImageIndex]}`}
                alt="Image"
              />
            </div>
            <div
              className="Arrows"
              id="RightArrowDiv"
              onClick={NextImageFunction}
            >
              <img
                id="RightArrow"
                src={process.env.PUBLIC_URL + '/Web Icons/right-arrow.png'}
                height={20}
                width={20}
                alt="Arrow"
              />
            </div>
          </div>
          <div id="OnViewListingDescription">
            {listingDetails.ListingDescription}
          </div>
        </div>

        <div id="ListingDetailsContactAgentForm">
          <div id="ListingDateTypeLocation">
            <h3>Listing Details</h3>
            <div><b>ListingType:</b>{' ' + listingDetails.ListingType}</div>
            <div><b>Location:</b>{' ' + listingDetails.ListingLocation}</div>
            <div><b>ListingType:</b>{' ' + formattedDate}</div>
          </div>
          <h3 id="ViewListinPageTile">Contact </h3>
          <div id='ListerInformation'>
            <img
              className='Buyers_SellerPhoto'
              src={listerDetails.ProfilePicture ? `${process.env.PUBLIC_URL}/ProfilePhotos/${listerDetails.ProfilePicture}` : `${process.env.PUBLIC_URL}/ProfilePhotos/Profile Icon.png`}
              alt='Profile'
            />
            <div><b>Name:</b>{' ' + listerDetails.FirstName + ' ' + listerDetails.LastName}</div>
            <div><b>Email:</b>{' ' + listerDetails.Email}</div>
            <Link
  to={{
    pathname: '/Messages/' + localStorage.getItem('userId'),
    state: { user: listerDetails }
  }}
>
  <button type='button'>Message</button>
</Link>
          </div>
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

function ListingsByUser({ userId }) {
  const [listings, setListings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch listings data
    fetch(`http://localhost:8080/listingsmade`)
      .then(response => response.json())
      .then(data => {
        // Filter listings by userId
        const filteredListings = data.filter(listing => parseInt(listing.Lister) === parseInt(userId));
        setListings(filteredListings);
      })
      .catch(error => {
        console.error('Error fetching listings data:', error);
        // Handle error or redirect to an error page if needed
      });
  }, [userId]);

  const handleViewListingClick = (listingId) => {
    navigate(`/listings/${listingId}`);
  };

  const truncateDescription = (description, maxLength) => {
    if (description.length > maxLength) {
      return description.substring(0, maxLength) + '...';
    }
    return description;
  };

  return (
    <div className="listings-grid">
      {listings.map(listing => (
        <div key={listing.ListingId} onClick={() => handleViewListingClick(listing.ListingId)} className="listing-item">
          <img
            src={`${process.env.PUBLIC_URL}/ListingPhotos/${JSON.parse(listing.Images)[0]}`}
            alt={`Listing Image 1`}
          />
          <div className="listing-details">
            <p className="listing-description">{truncateDescription(listing.ListingDescription, 50)}</p>
            <p className="listing-location">{listing.ListingLocation}</p>
            <p className="listing-type">{listing.ListingType}</p>
          </div>
        </div>
      ))}
    </div>
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
                <h3></h3>
              </div>
              {isEditClicked ? (
                <EditProfileForm userData={userData} onCancelEdit={handleCancelEdit} />
              ) : (
                <>
                  <button id='EditProfileButton' style={{ marginLeft: '2%' }} onClick={handleEditClick}>
                    Edit Details
                  </button>
                  <button id='EditProfileButton' style={{ marginLeft: '2%' }} onClick=''>
                    Update Photo
                  </button>
                  <table>
                    <tbody>
                      <tr>
                        <td id='ProfileUserName'>Name:</td>
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
            <div id='ListingsByUser'>
               <div><h3>Listings by  {userData.FirstName + ' ' + userData.LastName}</h3></div>
                <ListingsByUser userId={userIdFromUrl} />
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

function ChatRoom({ userId, messageRoom }) {
  // State to store messages
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Make an HTTP GET request to fetch messages based on userId and messageRoom
    axios.get(`http://localhost:8080/messages/${userId}/${messageRoom}`)
      .then(response => {
        // Handle successful response
        console.log('Messages data received:', response.data);
        setMessages(response.data);
        
        // Automatically click the ChatDiv with id matching messageRoom
        const chatDiv = document.getElementById(messageRoom);
        if (chatDiv) {
          chatDiv.click();
        }
      })
      .catch(error => {
        // Handle error
        console.error('Error fetching messages:', error);
      });
  }, [userId, messageRoom]);

  return (
    <MessagePage />
  );
}


function MessagePage() {
  const [users, setUsers] = useState([]);
  const [UserMessages, setUserMessages] = useState([]);
  const userId = localStorage.getItem('userId');
  const [selectedChatUser, setSelectedChatUser] = useState(null); // State to store information about the selected chat user
  const [selectedChatRoomMessages, setSelectedChatRoomMessages] = useState([]);
  const [UsersChatRoom,SetUsersChatRoom] = useState('');
  const [SendTo,SetSendTo] = useState();
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  
  useEffect(() => {
    // Make an HTTP GET request to fetch user data from the server
    axios.get('http://localhost:8080/siteuser')
      .then(response => {
        // Handle successful response
        console.log('User data received:', response.data);
        setUsers(response.data);
      })
      .catch(error => {
        // Handle error
        console.error('Error fetching user data:', error);
      });
  }, []);

  useEffect(() => {
    fetch(`http://localhost:8080/Messages?userId=${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Messages data received:', data);
        const groupedMessages = {};
        data.forEach(message => {
          if (!groupedMessages[message.MessageRoom]) {
            groupedMessages[message.MessageRoom] = [];
          }
          groupedMessages[message.MessageRoom].push(message);
        });
        setUserMessages(groupedMessages);
      })
      .catch(error => {
        console.error('Error fetching messages:', error);
      });
  }, [userId]);




  function Message({ message }) {
    // Find sender details
    const sender = users.find(user => user.Id === message.SenderId);
    const senderProfilePhoto = sender && sender.ProfilePicture ? `/ProfilePhotos/${sender.ProfilePicture}` : '/Profile Icon.png';
    const messageDate = new Date(message.MessageDate).toLocaleString(undefined, {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    return (
      <div className='Message'>

        <div className='Sender_Receiver_Div'>
           <img className='Sender_ReceiverPic' src={senderProfilePhoto} alt='Profile' />

           <div className='Sender_Receiver_Name_MessageDetailsDiv'>
              <div className='Sender_Receiver_Name'>{sender ? `${sender.FirstName} ${sender.LastName}` : ''}</div>
              <div className='MessageDetails'>{message.MessageDetails}</div>

           </div>

        </div>
            <div className='MessageDate'>{messageDate}</div>
        </div>
    );
  }


  const sendMessage = () => {
    const messageData = {
      MessageId: 'Message' + new Date() / 1000 + new Date().getUTCDate(),
      MessageRoom: UsersChatRoom,
      SenderId: userId,
      ReceiverId: SendTo,
      MessageDetails: newMessage,
      MessageDate: new Date().toISOString(),
      ReadStatus: 'Unread',
      Attachments: []
    };
  
    // Make a POST request to send the message data to the backend
    axios
      .post('http://localhost:8080/SendMessages', messageData)
      .then(response => {
        console.log('Message sent successfully:', response.data);
  
        setUserMessages(prevMessages => {
          // Ensure prevMessages[UsersChatRoom] is always an array
          const chatRoomMessages = Array.isArray(prevMessages[UsersChatRoom]) ? prevMessages[UsersChatRoom] : [];
          // Concatenate the new message to the chat room messages
          const updatedChatRoomMessages = [...chatRoomMessages, messageData];
          // Return the updated UserMessages state
          return {
            ...prevMessages,
            [UsersChatRoom]: updatedChatRoomMessages
          };
        });
        setNewMessage('');
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
  };

  // Handler function for sending a message when the send button is clicked
  const ExecuteSendMessage= () => {
    // Check if the new message is not empty
    if (newMessage.trim() !== '') {
      // Call the function to send the message
      sendMessage();
    } else {
      // Handle empty message input
      console.warn('Cannot send an empty message.');
    }
  };

  const handleUserSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.FirstName} ${user.LastName}`;
    return fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleUserClick = (user) => {
    // Check if a chat room already exists between the logged user and the clicked user
    let chatRoom = `${userId}and${user.Id}`;
    const reverseChatRoom = `${user.Id}and${userId}`;
    SetSendTo(user.Id)

    if (!UserMessages[chatRoom] && UserMessages[reverseChatRoom]) {
      chatRoom = reverseChatRoom;
    }
  
    // Set the selected user for display in the "To:" section
    setSelectedChatUser({
      profilePicture: user.ProfilePicture ? `/ProfilePhotos/${user.ProfilePicture}` : '/Profile Icon.png',
      fullName: `${user.FirstName} ${user.LastName}`
    });
  
    // Check if there are messages available for the selected chat room
    const roomMessages = UserMessages[chatRoom];
    if (roomMessages) {
      // If messages exist, set them to be displayed in the messages section
      setSelectedChatRoomMessages(roomMessages);
    } else {
      // If no messages exist, initialize an empty array
      setSelectedChatRoomMessages([]);
    }
  
    SetUsersChatRoom(chatRoom);
    
  };



  function ChatRoom({ chatRoom, messages }) {
    const latestMessage = messages[messages.length - 1];
    const senderId = latestMessage.SenderId;
    const receiverId = latestMessage.ReceiverId;
    const sender = users.find(user => user.Id === senderId);
    const receiver = users.find(user => user.Id === receiverId);
    const receiverProfilePhoto = receiver && receiver.ProfilePicture ? `/ProfilePhotos/${receiver.ProfilePicture}` : '/Profile Icon.png';
    const { UserId, messageRoom } = useParams();

    const messageDetailsClass = latestMessage.ReadStatus === 'Unread' ? 'UnreadMessage' : '';

    const OnChatDivClick = () => {

      let ToUser 
      if(senderId!==userId){
        ToUser =senderId 
        SetSendTo(ToUser)
      }
      
      // Find the user information of the other user involved in the chat
      const otherUser = users.find(user => user.Id === ToUser);
      if (otherUser) {
        // Set the information of the other user to be displayed in the "To:" section
        setSelectedChatUser({
          profilePicture: otherUser.ProfilePicture ? `/ProfilePhotos/${otherUser.ProfilePicture}` : '/Profile Icon.png',
          fullName: `${otherUser.FirstName} ${otherUser.LastName}`
        });
      }

      setSelectedChatRoomMessages(UserMessages[chatRoom] || []);
      SetUsersChatRoom(chatRoom)
      updateReadStatus(chatRoom);

    };


    const updateReadStatus = (messageRoom) => {
      // Make a POST request to update the ReadStatus to 'Read'
      axios.post(`http://localhost:8080/UpdateReadStatus?messageRoom=${messageRoom}&userId=${userId}`)
          .then(response => {
              console.log('ReadStatus updated successfully:', response.data);
          })
          .catch(error => {
              console.error('Error updating ReadStatus:', error);
          });
  };
  let displayName;
  if (receiverId === userId) {
    // Logged-in user is the receiver, display sender's name
    displayName = `${receiver.FirstName} ${receiver.LastName}`;
  } else {
    // Logged-in user is not the receiver, display receiver's name
    displayName = `${sender.FirstName} ${sender.LastName}`;
  }

    
    return (
      <div className='ChatDiv' id={chatRoom} onClick={() => OnChatDivClick()}>
        <div className='ChatDivSender_ReceiverPicDiv'>
          <img  className = 'ChatDivSender_ReceiverPic' src={receiverProfilePhoto} alt='Profile' />
        </div>
        <div className='ChatDivMessageInfoDetailsDiv'>
          <div className='ChatDivSender_Receiver_Div'>
            <div className='ChatDivSender_Receiver_Name'>
              {displayName}
            </div>
            <div className='ChatDivMessageDate'>
                {latestMessage.MessageDate}
            </div>
          </div>
          <div className={`ChatDivMessageDetails ${messageDetailsClass}`}>
        {sender ? `${sender.FirstName} ${sender.LastName}`: ''}: {latestMessage.MessageDetails}
        </div>
        </div>
      </div>
    );
  }

  return (
    <div id='MessageApplication'>
      <div id='LeftSection'>
        <div style={{ display: 'flex', columnGap: '10%' }}>
          <div
            style={{
              padding: '5px',
              cursor: 'pointer',
            }}
            className='LeftSectionChat_Users'
          >
            Chats
          </div>
          <div
            id='Chat_Users'
            style={{
              padding: '5px',
              cursor: 'pointer',
            }}
            className='LeftSectionChat_Users'
          >
             Users:
  <input
    id='SearchUsersToStart'
    type='search'
    placeholder='Search user to chat..'
    value={searchQuery}
    onChange={handleUserSearch}
  />
  {searchQuery && (
   <ul id='ListOfUsers'>
   {filteredUsers.map(user => (
     <li key={user.Id} onClick={() => handleUserClick(user)}>
       <img className='SearchedUserPic' src={user.ProfilePicture ? `${process.env.PUBLIC_URL}/ProfilePhotos/${user.ProfilePicture}` : `${process.env.PUBLIC_URL}/ProfilePhotos/Profile Icon.png`} /> 
       {' '}
       {user.FirstName} {user.LastName}
     </li>
   ))}
 </ul>
     )}
          </div>
        </div>
        {Object.entries(UserMessages).map(([chatRoom, messages]) => (
          <ChatRoom key={chatRoom} chatRoom={chatRoom} messages={messages} />
        ))}
      </div>
      <div id='RightSection'>
        <div >
        {selectedChatUser && (
            <div id='ReceiverInfo'>To:
              <img id='ReceiverPic' src={selectedChatUser.profilePicture} alt='Profile' />
              <div  id='ReceiverName'>{selectedChatUser.fullName}</div>
            </div>
          )}
        </div>
        <div id='MessagesDiv'>
        {selectedChatRoomMessages.map(message => (
            <Message key={message.MessageId} message={message} />
          ))}
        </div>
        <div id='TextAreaDiv'>
          <textarea id='TextArea'  onChange={e => setNewMessage(e.target.value)}></textarea>
          <button onClick={ExecuteSendMessage} type='submit'>Send</button>
        </div>
      </div>
    </div>
  );
}


export default App;