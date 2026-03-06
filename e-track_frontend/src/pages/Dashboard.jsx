import { useUser, UserButton } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { FiMapPin, FiCamera, FiSend, FiShield, FiLoader, FiCheckCircle, FiAlertTriangle, FiMenu, FiX, FiArrowLeft } from 'react-icons/fi';
import { useState } from "react";
import imageCompression from 'browser-image-compression';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DashboardPage = () => {
    const { user, isLoaded } = useUser();    
    const [location, setLocation] = useState({ lat: null, lon: null });
    const [locationStatus, setLocationStatus] = useState('idle'); // idle, fetching, success, error
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportStatus, setReportStatus] = useState('');
    const [severity, setSeverity] = useState('low'); // Default to 'low'

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setReportStatus('');
        try {
            let imageUrl = '';
            // Step 1: If there's a photo, upload it first.
            if (photo) {
                const formData = new FormData();
                formData.append('image', photo);

                const uploadResponse = await fetch(`${API_BASE_URL}/api/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Image upload failed.');
                }

                const uploadResult = await uploadResponse.json();
                imageUrl = uploadResult.imageUrl;
            }

            // Step 2: Submit the report with the image URL.
            const response = await fetch(`${API_BASE_URL}/api/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    latitude: location.lat,
                    longitude: location.lon,
                    description: description,
                    imageUrl: imageUrl, // Send the URL to the database
                    severity: severity,
                }),
            });

            if (!response.ok) {
                throw new Error('Report submission failed.');
            }

            setReportStatus('Report submitted successfully!');
            // Clear the form only on success
            setLocation({ lat: null, lon: null });
            setLocationStatus('idle');
            setDescription('');
            setPhoto(null);
            e.target.reset();
            setSeverity('low'); // Reset severity to default
        } catch (error) {
            setReportStatus(`Error: ${error.message}`);
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };
    console.log("API URL:", import.meta.env.VITE_API_URL);
    const handleImageChange = async (event) => {
        const imageFile = event.target.files[0];
        if (!imageFile) {
            return;
        }

        console.log(`Original file size: ${(imageFile.size / 1024).toFixed(2)} KB`);

        const options = {
            maxSizeMB: 0.1, // Target max size of 100KB
            maxWidthOrHeight: 1920, // Max width/height
            useWebWorker: true,
        };

        try {
            const compressedFile = await imageCompression(imageFile, options);
            console.log(`Compressed file size: ${(compressedFile.size / 1024).toFixed(2)} KB`);
            setPhoto(compressedFile); // Set the compressed file to state
        } catch (error) {
            console.error('Image compression error:', error);
            // Fallback to the original file if compression fails
            setPhoto(imageFile);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('error');
            return;
        }

        setLocationStatus('fetching');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
                setLocationStatus('success');
            },
            () => {
                setLocationStatus('error');
            }
        );
    };

    // The AuthWrapper handles role checking. This page should only be seen by citizens.
    // We add a simple loading state while Clerk initializes.
    if (!isLoaded || !user) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-6">
                    <div className="py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-4 md:space-x-8">
                            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-green-600" aria-label="Go back">
                                <FiArrowLeft size={24} />
                            </button>
                            <div className="flex items-center space-x-8">
                                <Link to="/" className="text-xl font-bold text-gray-800 flex items-center">
                                    <FiShield className="mr-2 text-green-600" />
                                    eWasteTrack
                                </Link>
                                <nav className="hidden md:flex items-center space-x-6">
                                    <Link to="/" className="text-gray-600 hover:text-green-600">Home</Link>
                                    <Link to="#" className="text-gray-600 hover:text-green-600">My Reports</Link>
                                </nav>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="hidden md:block">
                                <UserButton afterSignOutUrl="/" />
                            </div>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden ml-4 text-gray-800 hover:text-green-600 focus:outline-none">
                                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                            </button>
                        </div>
                    </div>
                    {isMenuOpen && (
                        <nav className="md:hidden pb-4 space-y-2">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Home</Link>
                            <Link to="#" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">My Reports</Link>
                            <div className="border-t border-gray-200 pt-4 mt-4 flex items-center px-4">
                                <span className="text-sm text-gray-500 mr-4">Profile:</span>
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        </nav>
                    )}
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800">Welcome, {user?.firstName || 'User'}!</h1>
                    <p className="mt-2 text-xl text-gray-600">Help us by reporting informal e-waste activity.</p>
                </div>

                {/* Main Citizen Dashboard Content */}
                <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Create a New Report</h2>
                    <form onSubmit={handleReportSubmit} className="space-y-6">
                        {/* Location Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Step 1: Pinpoint Location</label>
                            <button type="button" onClick={handleGetLocation} disabled={locationStatus === 'fetching'} className="w-full flex items-center justify-center p-3 border-2 border-dashed rounded-md text-gray-600 hover:bg-gray-50 hover:border-green-500 transition-colors disabled:cursor-not-allowed">
                                {locationStatus === 'idle' && <><FiMapPin className="mr-2" /> Get Current Location</>}
                                {locationStatus === 'fetching' && <><FiLoader className="mr-2 animate-spin" /> Fetching Location...</>}
                                {locationStatus === 'success' && <><FiCheckCircle className="mr-2 text-green-500" /> Location Captured!</>}
                                {locationStatus === 'error' && <><FiAlertTriangle className="mr-2 text-red-500" /> Failed to get location. Try again.</>}
                            </button>
                            {locationStatus === 'success' && (
                                <div className="text-center text-sm text-gray-500 mt-2">
                                    Lat: {location.lat.toFixed(5)}, Lon: {location.lon.toFixed(5)}
                                </div>
                            )}
                        </div>

                        {/* Description Section */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Step 2: Describe the Activity</label>
                            <textarea id="description" placeholder="e.g., 'Burning wires in an open field...'" value={description} onChange={(e) => setDescription(e.target.value)} rows="4" className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"></textarea>
                        </div>

                        {/* Severity Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Severity (Optional)</label>
                            <div className="flex justify-around p-2 bg-gray-50 rounded-lg border border-gray-200">
                                {['low', 'medium', 'high'].map((level) => (
                                    <label key={level} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="severity"
                                            value={level}
                                            checked={severity === level}
                                            onChange={(e) => setSeverity(e.target.value)}
                                            className="form-radio h-4 w-4 text-green-600"
                                        />
                                        <span className="capitalize text-gray-700">{level}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Photo Upload Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Step 3: Add a Photo (Optional)</label>
                            <div className="flex items-center space-x-4 p-3 border border-dashed rounded-md">
                                <FiCamera className="text-gray-500" size={24}/>
                                <label htmlFor="photo-upload" className="text-sm text-gray-600 cursor-pointer hover:text-green-600">
                                {photo ? `Selected: ${photo.name} (${(photo.size / 1024).toFixed(1)} KB)` : 'Upload or Take a Photo'}

                                </label>
                                <input id="photo-upload" type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="sr-only" />

                            </div>
                        </div>

                        <button type="submit" disabled={isSubmitting || locationStatus !== 'success'} className="w-full flex justify-center items-center bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            <FiSend className="mr-2" />
                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                        {reportStatus && <p className="text-center text-green-600 mt-4">{reportStatus}</p>}
                    </form>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
